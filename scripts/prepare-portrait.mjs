/**
 * Cuts the portrait out of its studio background and writes public/media/portrait.png.
 *
 *   node scripts/prepare-portrait.mjs
 *
 * WHY A CUTOUT AND NOT THE PHOTO
 *
 * design/source/F2.jpg is a studio shot on a flat light-grey ground. The page it
 * lands on is `--color-ink` #0a0b0d. Dropped in whole, the grey rectangle is the
 * brightest thing on the screen, sitting beside display type that is deliberately
 * the second brightest — it reads as a photo pasted onto a website rather than
 * part of one. Knocking the ground out lets the navy shoulders fall away into the
 * page and leaves the face carrying the composition, which is the effect the hero
 * is built around.
 *
 * HOW THE MATTE IS BUILT
 *
 * Not a colour threshold. A threshold keys out every pixel resembling the
 * background — including the light catch on the cheek and the highlight in the
 * hair — punching holes through the subject. This does a flood fill from the
 * image border instead: a pixel is background only if it is within tolerance of
 * the sampled ground colour AND connected to the edge of the frame. Anything
 * enclosed by the subject stays, whatever colour it is.
 *
 * The matte is then blurred slightly and its contrast stretched, which feathers
 * the hair edge instead of leaving the stairstepped rim a hard mask produces.
 *
 * Finally the bottom of the frame is faded to transparent. Navy on near-black is
 * a low-contrast edge, so a hard cut across the shoulders reads as the figure
 * being sliced off in mid-air; a gradient lets it resolve into the page.
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "design", "source", "F2.jpg");
const OUT = path.join(ROOT, "public", "media", "portrait.png");

/**
 * Colour distance at which a pixel counts as backdrop for the FILL, in RGB.
 *
 * The edge of a photographed subject is a band tens of pixels wide — antialiasing,
 * depth of field, and the studio's own fill light — so no single threshold splits
 * it cleanly. Two earlier attempts proved that from both sides: at 36 a stepped
 * grey fringe survived down the lit side of the face, and at 52 the fill chewed a
 * notch out of the cheek.
 *
 * A colour ramp inside the fill region did not fix it either. It just moved the
 * artefact: pixels that were backdrop but sat far enough from the sampled colour
 * came out fully opaque, painting a grey halo around the whole head.
 *
 * So opacity is decided GEOMETRICALLY instead. The fill stays binary and only has
 * to be roughly right; the edge is then choked inward by a couple of pixels to
 * swallow any fringe it left, and feathered to kill the stairsteps. Where a pixel
 * sits in the transition band matters, not what colour it happens to be.
 */
const FILL_TOLERANCE = Number(process.env.PORTRAIT_FILL ?? 46);

/**
 * Pixels the subject edge is pulled inward before feathering.
 *
 * This is what removes the fringe the binary fill leaves behind: rather than
 * chasing a tolerance that reaches every last backdrop pixel — which is the
 * tolerance that also reaches into the cheek — accept an under-reaching fill and
 * shave the boundary. Costs a hair of the silhouette, which at any size this
 * renders is invisible; a grey outline is not.
 */
const CHOKE = Number(process.env.PORTRAIT_CHOKE ?? 2);

/** Feathering applied to the matte before compositing, in pixels at source scale. */
const MATTE_BLUR = Number(process.env.PORTRAIT_FEATHER ?? 2.4);

/** Fraction of the image height over which the bottom fades out. */
const FADE_HEIGHT = 0.22;

async function main() {
  try {
    await fs.access(SRC);
  } catch {
    console.error(
      `\nMissing ${path.relative(ROOT, SRC)}.\n\n` +
        `design/source/ is gitignored — see scripts/prepare-project-media.mjs.\n` +
        `The committed artefact is public/media/portrait.png; you only need the\n` +
        `source to regenerate it.\n`,
    );
    process.exit(1);
  }

  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  /*
   * Sample the ground from the TOP HALF of the left and right edges, and take
   * the median.
   *
   * Not the four corners, which is what this did first and got wrong: the
   * subject's shoulders reach the bottom edge of this frame, so the bottom-left
   * corner is skin and cloth at rgb(85,55,45), not backdrop. Averaging that in
   * dragged the reference colour brown and the flood fill stalled after
   * claiming a fifth of the frame.
   *
   * Median rather than mean for the same reason at smaller scale — one stray
   * dark pixel on an edge cannot move a median.
   *
   * The backdrop also carries a vertical gradient, measured rgb(111,120,135) at
   * the top to about rgb(142,146,155) two-thirds down. That spread is a distance
   * of roughly 39, which TOLERANCE has to cover from a mid-point sample.
   */
  const samples = [];
  for (let y = 2; y < Math.round(height * 0.6); y += 4) {
    for (const x of [2, 3, width - 4, width - 3]) {
      const i = (y * width + x) * channels;
      samples.push([data[i], data[i + 1], data[i + 2]]);
    }
  }
  const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };
  const br = median(samples.map((s) => s[0]));
  const bg = median(samples.map((s) => s[1]));
  const bb = median(samples.map((s) => s[2]));

  const near = (i) => {
    const dr = data[i] - br;
    const dg = data[i + 1] - bg;
    const db = data[i + 2] - bb;
    return Math.sqrt(dr * dr + dg * dg + db * db) <= FILL_TOLERANCE;
  };

  /*
   * Flood fill from every border pixel. Iterative with an explicit stack — a
   * recursive fill blows the call stack on an image this size.
   */
  const isBackground = new Uint8Array(width * height);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (isBackground[p]) return;
    if (!near(p * channels)) return;
    isBackground[p] = 1;
    stack.push(p);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (stack.length > 0) {
    const p = stack.pop();
    const x = p % width;
    const y = (p - x) / width;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  /*
   * Choke: grow the background by CHOKE pixels, which pulls the subject edge in
   * by the same amount. Separable — a horizontal pass then a vertical one — so
   * the cost is linear in the radius rather than quadratic.
   */
  const grown = Uint8Array.from(isBackground);
  const horizontal = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let hit = 0;
      for (let d = -CHOKE; d <= CHOKE && !hit; d++) {
        const nx = x + d;
        if (nx >= 0 && nx < width && grown[y * width + nx]) hit = 1;
      }
      horizontal[y * width + x] = hit;
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let hit = 0;
      for (let d = -CHOKE; d <= CHOKE && !hit; d++) {
        const ny = y + d;
        if (ny >= 0 && ny < height && horizontal[ny * width + x]) hit = 1;
      }
      grown[y * width + x] = hit;
    }
  }

  let backgroundPixels = 0;
  const matte = Buffer.alloc(width * height);
  for (let p = 0; p < width * height; p++) {
    if (grown[p]) backgroundPixels++;
    matte[p] = grown[p] ? 0 : 255;
  }

  const coverage = backgroundPixels / (width * height);
  /*
   * A sanity gate, not decoration. If the tolerance is ever retuned badly the
   * fill either escapes through the hair and eats the subject, or fails to leave
   * the border at all — both produce a plausible-looking file. On this framing
   * the ground is roughly half the frame, so anything far outside that band means
   * the matte is wrong and should not be silently written.
   */
  if (coverage < 0.2 || coverage > 0.8) {
    throw new Error(
      `Matte looks wrong: the flood fill claimed ${(coverage * 100).toFixed(1)}% of the ` +
        `frame as background. Expected roughly 20-80% for this framing. Re-check ` +
        `TOLERANCE (currently ${TOLERANCE}) against the current source.`,
    );
  }

  /*
   * Feather, then stretch contrast back so the interior stays fully opaque.
   *
   * `.toColourspace("b-w")` is load-bearing: `.linear()` promotes a raw
   * single-channel input to THREE channels, and the resulting buffer — exactly
   * 3x the expected length — was silently accepted downstream and read with the
   * wrong stride, which rendered the portrait as horizontal scanlines. The
   * assertion below is what turns that class of mistake into a crash.
   */
  const feathered = await sharp(matte, { raw: { width, height, channels: 1 } })
    .blur(MATTE_BLUR)
    .toColourspace("b-w")
    .raw()
    .toBuffer();

  if (feathered.length !== width * height) {
    throw new Error(
      `Matte buffer is ${feathered.length} bytes, expected ${width * height} ` +
        `(${width}x${height}x1). A sharp operation changed the channel count.`,
    );
  }

  /* Fade the bottom edge out so the shoulders dissolve rather than being cut. */
  const fadeStart = Math.round(height * (1 - FADE_HEIGHT));
  for (let y = fadeStart; y < height; y++) {
    const t = (y - fadeStart) / (height - fadeStart);
    /* smoothstep, so the fade has no visible start line */
    const k = 1 - t * t * (3 - 2 * t);
    for (let x = 0; x < width; x++) {
      const p = y * width + x;
      feathered[p] = Math.round(feathered[p] * k);
    }
  }

  /*
   * Assemble RGBA by hand rather than via joinChannel. One explicit loop over a
   * buffer whose length is asserted above beats a pipeline whose channel count
   * can change under it — and this step is where that failure was invisible.
   */
  const rgba = Buffer.alloc(width * height * 4);
  for (let p = 0; p < width * height; p++) {
    const src = p * channels;
    const dst = p * 4;
    rgba[dst] = data[src];
    rgba[dst + 1] = data[src + 1];
    rgba[dst + 2] = data[src + 2];
    rgba[dst + 3] = feathered[p];
  }

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  const result = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .resize({ width: 1000, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: false })
    .toFile(OUT);

  console.log(
    `\nwrote public/media/portrait.png  ${result.width}x${result.height}  ` +
      `${(result.size / 1024).toFixed(0)} KB\n` +
      `  ground sampled at rgb(${br.toFixed(0)},${bg.toFixed(0)},${bb.toFixed(0)})\n` +
      `  matte: ${(coverage * 100).toFixed(1)}% background\n\n` +
      `Put ${result.width}x${result.height} into content/site.ts — next/image needs\n` +
      `the intrinsic size to reserve space.\n`,
  );
}

await main();
