/**
 * Builds every project image in public/media/ from the sources in design/source/.
 *
 *   node scripts/prepare-project-media.mjs
 *
 * WHY THE SOURCES ARE NOT COMMITTED
 *
 * design/source/ is gitignored (see .gitignore and scripts/check-public-assets.mjs).
 * One of the sources — the Tamda dispatch console — contains real customer PII
 * and must never enter the repository, and the rest are large originals with no
 * business being served. So this script CANNOT run in CI: the committed artefact
 * is its OUTPUT, under public/media/, and this file exists to record exactly how
 * that output was produced and from what.
 *
 * Same tradeoff, and same reasoning, as scripts/generate-brand-assets.mjs: a
 * committed generator plus committed output beats regenerating at request time.
 *
 * PROVENANCE, per project — this is the part that matters:
 *
 *  - panda-erp   REAL SCREENSHOTS. Panda is Dan Solutions' own product and they
 *                publish these on their own marketing site (panda.vn). Checked
 *                for personal data: they carry table codes, dish names, timers
 *                and order UUIDs, and no customer or staff identity.
 *  - skyline     REAL SCREENSHOTS from the publisher's own Google Play listing
 *                (vn.edu.skylineschool.econnect). The home screen greets a named
 *                SCHOOLCHILD, so this script redacts that name and class before
 *                the image is written. See redactSkylineHome().
 *  - tamda       ORIGINAL MOCKUP, rasterised from scripts/mockups/. There is no
 *                publishable screenshot of this product and there never will be.
 *  - comzone     The author's own capstone; unrestricted.
 *
 * Anything added here needs the same audit: open the file, look at every string
 * in it, and only then decide it can be published.
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { chromium } from "@playwright/test";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "design", "source");
const OUT = path.join(ROOT, "public", "media");

/** Wide frames render at 21:9 and 16:9; nothing on the page needs more than this. */
const WIDE_WIDTH = 1600;
/** Phone screenshots are tall; cap the long edge instead of the short one. */
const PHONE_HEIGHT = 1400;

/**
 * The greeting block on the Skyline home screen, as fractions of the image.
 *
 * MEASURED, not estimated. A first pass at this eyeballed the two boxes, and
 * they overlapped: the name box was tall enough to cover both lines, then the
 * class box repainted the middle of it and wiped out half the replacement text,
 * leaving the tail of the REAL name legible underneath. A redaction that half
 * works is worse than none, because it looks finished.
 *
 * The numbers below come from scanning design/source/skyline/home.png for rows
 * brighter than the header's teal (0,161,156) in the left 520px, which isolates
 * the two text bands from the refresh icon on the right:
 *
 *   name  y 153-192, x 44-464   ("Xin chào, <child>")
 *   class y 221-242, x 46-199   ("Lớp <class>")
 *   date  y 273-299             (left alone — a date is not identifying)
 *
 * Fractions rather than pixels so the same constants hold for the other Play
 * Store rendition of this screen. Re-measure if the listing screenshot changes.
 */
const SKYLINE_REDACTIONS = [
  {
    text: "Xin chào, Phụ huynh",
    top: 0.0617,
    bottom: 0.0821,
    right: 0.47,
    fontScale: 0.0146,
    weight: 700,
    alpha: 1,
  },
  {
    text: "Lớp mẫu",
    top: 0.09,
    bottom: 0.1029,
    right: 0.24,
    fontScale: 0.0108,
    weight: 400,
    alpha: 0.85,
  },
];

/** Left inset of the header text, matching the original layout. */
const SKYLINE_TEXT_X = 0.0407;

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

/**
 * Paints invented placeholder text over the real child's name and class.
 *
 * Done in Chromium rather than with sharp's SVG compositing for one reason:
 * the replacement text is Vietnamese with diacritics, and sharp renders SVG
 * text through whatever fonts the host happens to expose — which on a Windows
 * or a minimal CI image silently drops marks and produces "Xin cho". Chromium
 * has the shaping and the fallback chain, so the redaction either looks right
 * or fails loudly.
 *
 * A solid box would also work and would be uglier; the point of the image is to
 * show a real product surface, and a black bar across the header reads as
 * something being hidden rather than as something being anonymised.
 */
/**
 * Fails the build if the declared boxes do not actually cover the text.
 *
 * The boxes are fixed constants measured against one specific listing
 * screenshot. If that screenshot is ever re-downloaded and the child's name is
 * longer, or the header spacing shifts, the boxes would silently cover only
 * part of it — and the failure mode of a partial redaction is a published image
 * with a real child's name still readable in it.
 *
 * So: find every text band in the header's left region (the greeting, not the
 * refresh icon), and assert each one is fully inside a declared box. Bands are
 * detected as rows containing pixels brighter than the header teal.
 */
async function assertRedactionCovers(inputPath) {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  /* The date line sits below the greeting and is not identifying; the scan
     stops above it. 0.11 is between the class band and the date band. */
  const scanBottom = Math.round(height * 0.11);
  const scanRight = Math.round(width * 0.48);

  const bands = [];
  let current = null;
  for (let y = 0; y < scanBottom; y++) {
    let hits = 0;
    let maxX = -1;
    for (let x = 0; x < scanRight; x++) {
      const i = (y * width + x) * channels;
      if (data[i] > 90 && data[i + 1] > 150 && data[i + 2] > 150) {
        hits++;
        if (x > maxX) maxX = x;
      }
    }
    if (hits > 3) {
      if (!current) current = { y0: y, y1: y, maxX };
      else {
        current.y1 = y;
        current.maxX = Math.max(current.maxX, maxX);
      }
    } else if (current) {
      bands.push(current);
      current = null;
    }
  }
  if (current) bands.push(current);

  for (const band of bands) {
    const covered = SKYLINE_REDACTIONS.some(
      (box) =>
        band.y0 >= box.top * height &&
        band.y1 <= box.bottom * height &&
        band.maxX <= box.right * width,
    );
    if (!covered) {
      throw new Error(
        `Skyline redaction does not cover a text band at y ${band.y0}-${band.y1}, ` +
          `x up to ${band.maxX} (fractions: top ${(band.y0 / height).toFixed(4)}, ` +
          `bottom ${(band.y1 / height).toFixed(4)}, right ${(band.maxX / width).toFixed(4)}).\n` +
          `That band may contain a real child's name. Re-measure SKYLINE_REDACTIONS ` +
          `against the current source before publishing this image.`,
      );
    }
  }

  return bands.length;
}

async function redactSkylineHome(inputPath, outputPath) {
  const covered = await assertRedactionCovers(inputPath);
  console.log(`  skyline: ${covered} header text band(s), all inside a redaction box`);

  const { width, height } = await sharp(inputPath).metadata();
  const dataUrl = `data:image/png;base64,${(await fs.readFile(inputPath)).toString("base64")}`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

  const redacted = await page.evaluate(
    async ({ dataUrl, width, height, bands, textX }) => {
      const img = new Image();
      img.src = dataUrl;
      await img.decode();

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      /*
       * Sample the header's own colour so the patch cannot mismatch it.
       *
       * (0.75w, 0.075h) is chosen, not arbitrary: it sits inside the teal
       * header, to the RIGHT of the greeting text and to the LEFT of the
       * refresh icon. A first attempt sampled at 0.03h and landed in the black
       * status bar above the header, which painted the redaction in near-black
       * over teal — legible, obviously wrong, and exactly the kind of thing
       * that ships if nobody opens the output file.
       */
      const probe = ctx.getImageData(
        Math.round(width * 0.75),
        Math.round(height * 0.075),
        1,
        1,
      ).data;
      const headerColor = `rgb(${probe[0]},${probe[1]},${probe[2]})`;

      for (const band of bands) {
        const top = band.top * height;
        const bottom = band.bottom * height;
        ctx.fillStyle = headerColor;
        ctx.fillRect(0, top, band.right * width, bottom - top);

        ctx.fillStyle = `rgba(255,255,255,${band.alpha})`;
        ctx.font = `${band.weight} ${Math.round(height * band.fontScale)}px "Segoe UI", Roboto, system-ui, sans-serif`;
        ctx.textBaseline = "middle";
        ctx.fillText(band.text, width * textX, (top + bottom) / 2);
      }

      return canvas.toDataURL("image/png");
    },
    { dataUrl, width, height, bands: SKYLINE_REDACTIONS, textX: SKYLINE_TEXT_X },
  );

  await browser.close();
  await fs.writeFile(outputPath, Buffer.from(redacted.split(",")[1], "base64"));
}

/** Rasterises an HTML mockup at its own declared body size. */
async function renderMockup(htmlPath, outputPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1680, height: 720 },
    deviceScaleFactor: 2,
  });
  await page.goto(`file://${htmlPath.split(path.sep).join("/")}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: outputPath });
  await browser.close();
}

async function encodeWide(inputPath, outName) {
  const target = path.join(OUT, outName);
  const info = await sharp(inputPath)
    .resize({ width: WIDE_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(target);
  return { file: outName, width: info.width, height: info.height, bytes: info.size };
}

async function encodePhone(inputPath, outName) {
  const target = path.join(OUT, outName);
  const info = await sharp(inputPath)
    .resize({ height: PHONE_HEIGHT, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(target);
  return { file: outName, width: info.width, height: info.height, bytes: info.size };
}

async function main() {
  if (!(await exists(SOURCE))) {
    console.error(
      `\nMissing ${path.relative(ROOT, SOURCE)}.\n\n` +
        `It is gitignored on purpose — see the header of this file. The committed\n` +
        `artefacts are the images already in public/media/; you only need the\n` +
        `sources to REGENERATE them.\n`,
    );
    process.exit(1);
  }

  await fs.mkdir(OUT, { recursive: true });
  const tmp = path.join(OUT, ".tmp");
  await fs.mkdir(tmp, { recursive: true });
  const written = [];

  /* ---- Panda ERP: publisher's own marketing screenshots ---- */
  const panda = [
    ["panda-erp/pos-order-entry.jpg", "panda-erp-pos-order-entry.webp"],
    ["panda-erp/pos-table-management.jpg", "panda-erp-pos-tables.webp"],
    ["panda-erp/kds-orders-by-table.jpg", "panda-erp-kds.webp"],
  ];
  for (const [src, out] of panda) {
    const file = path.join(SOURCE, src);
    if (!(await exists(file))) {
      console.warn(`  skip ${out} (missing ${src})`);
      continue;
    }
    written.push(await encodeWide(file, out));
  }

  const pandaMobile = path.join(SOURCE, "panda-erp/mobile-dashboard.png");
  if (await exists(pandaMobile)) {
    written.push(await encodePhone(pandaMobile, "panda-erp-mobile-dashboard.webp"));
  }

  /* ---- Skyline: Play Store listing, home screen redacted ---- */
  const skylineHome = path.join(SOURCE, "skyline/home.png");
  if (await exists(skylineHome)) {
    const staged = path.join(tmp, "skyline-home-redacted.png");
    await redactSkylineHome(skylineHome, staged);
    written.push(await encodePhone(staged, "skyline-home.webp"));
  }
  for (const [src, out] of [
    ["skyline/feature-picker.png", "skyline-feature-picker.webp"],
    ["skyline/login.png", "skyline-login.webp"],
  ]) {
    const file = path.join(SOURCE, src);
    if (!(await exists(file))) {
      console.warn(`  skip ${out} (missing ${src})`);
      continue;
    }
    written.push(await encodePhone(file, out));
  }

  /* ---- Tamda Express: original mockup, no source screenshot exists ---- */
  const mockupHtml = path.join(ROOT, "scripts", "mockups", "tamda-dispatch.html");
  if (await exists(mockupHtml)) {
    const staged = path.join(tmp, "tamda-dispatch.png");
    await renderMockup(mockupHtml, staged);
    written.push(await encodeWide(staged, "tamda-dispatch.webp"));
  }

  /* ---- Comzone: the author's own capstone ---- */
  const comzoneDir = path.join(SOURCE, "comzone");
  if (await exists(comzoneDir)) {
    const files = (await fs.readdir(comzoneDir))
      .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
      .sort();
    for (const [i, f] of files.entries()) {
      const out = `comzone-${String(i + 1).padStart(2, "0")}.webp`;
      written.push(await encodeWide(path.join(comzoneDir, f), out));
    }
    if (files.length === 0) console.warn("  skip comzone (design/source/comzone/ is empty)");
  } else {
    console.warn("  skip comzone (no design/source/comzone/ — drop the Figma exports there)");
  }

  await fs.rm(tmp, { recursive: true, force: true });

  console.log(`\nwrote ${written.length} images to public/media/\n`);
  for (const w of written) {
    console.log(`  ${w.file.padEnd(34)} ${w.width}x${w.height}  ${(w.bytes / 1024).toFixed(0)} KB`);
  }
  console.log(
    `\nDimensions above go into content/projects.ts — next/image needs them to\n` +
      `reserve space, and a wrong pair causes layout shift rather than an error.\n`,
  );
}

await main();
