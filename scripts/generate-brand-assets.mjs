/**
 * Generates the static brand assets: the Open Graph card, the apple touch icon
 * and favicon.ico.
 *
 *   node scripts/generate-brand-assets.mjs
 *
 * Why a committed generator and committed output, rather than next/og
 * rendering the card per request:
 *
 *  - The card is IDENTICAL on every route that uses it. Rendering it at request
 *    time buys nothing and puts a Satori render on the critical path of every
 *    social-crawler fetch, several of which time out aggressively.
 *  - `ImageResponse` needs the font BINARY at render time, which on Vercel means
 *    either committing a .ttf anyway or fetching Google Fonts during a request.
 *    Phase 6 spent real effort on bytes; this reintroduces a network hop for a
 *    picture that never changes.
 *  - Committed PNGs are diffable in review and cannot break in production, which
 *    matters for the one asset nobody sees until it is already on Twitter.
 *
 * The tradeoff is that the card does not track content/site.ts automatically —
 * change the name or tagline and this must be re-run. That is why the copy is
 * read from the real content module below instead of being retyped here: the
 * script cannot drift silently, it can only be stale, and a stale run is
 * visible the moment you look at the file.
 *
 * Requires the Playwright chromium browser that the e2e suite already installs.
 */
import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* Kept in sync with styles/globals.css. */
const INK = "#0a0b0d";
const FG = "#e9eaec";
const FG_MUTED = "#9ba0a8";
const EMBER = "#f75a2c";

/*
 * Read from the content layer rather than duplicating the strings. content/ is
 * TypeScript, so pull the literals out with a regex instead of standing up a
 * transpiler for three fields.
 */
async function readSiteMeta() {
  const source = await fs.readFile(path.join(ROOT, "content/site.ts"), "utf8");
  const field = (key) => {
    const match = source.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    if (!match) throw new Error(`content/site.ts: could not read "${key}"`);
    return match[1].replace(/\\"/g, '"');
  };
  return { name: field("name"), title: field("title"), tagline: field("tagline") };
}

function ogHtml({ name, title, tagline }, domain) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,700;125,800&family=Geist+Mono:wght@400&display=block" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    background: ${INK};
    color: ${FG};
    font-family: "Archivo", system-ui, sans-serif;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 72px 80px;
  }
  /* The ember bloom, echoing the cursor-proximity glow in the WebGL layer. */
  .glow {
    position: absolute;
    width: 900px; height: 900px;
    right: -220px; top: -420px;
    background: radial-gradient(circle, rgba(247,90,44,0.28) 0%, rgba(247,90,44,0.09) 38%, rgba(247,90,44,0) 68%);
    pointer-events: none;
  }
  /* Hairline grid: the same 12-column rhythm the page lays out on. */
  .grid { position: absolute; inset: 0; display: flex; justify-content: space-between; padding: 0 80px; }
  .grid span { width: 1px; background: rgba(233,234,236,0.045); }
  .top {
    position: absolute; top: 64px; left: 80px; right: 80px;
    display: flex; justify-content: space-between; align-items: center;
    font-family: "Geist Mono", monospace;
    font-size: 20px; letter-spacing: 0.08em; text-transform: uppercase;
    color: ${FG_MUTED};
  }
  .mark {
    display: inline-flex; align-items: center; justify-content: center;
    width: 44px; height: 44px; background: ${EMBER}; color: ${INK};
    font-family: "Archivo", sans-serif; font-weight: 800; font-size: 26px;
    letter-spacing: 0; line-height: 1;
  }
  h1 {
    font-size: 132px; font-weight: 800; line-height: 0.92;
    letter-spacing: -0.03em; text-transform: uppercase;
    font-stretch: 125%; position: relative;
  }
  .rule { width: 88px; height: 4px; background: ${EMBER}; margin: 34px 0 26px; position: relative; }
  .role { font-size: 34px; font-weight: 700; letter-spacing: -0.01em; position: relative; }
  .tagline {
    font-size: 26px; line-height: 1.45; color: ${FG_MUTED};
    max-width: 34ch; margin-top: 12px; position: relative;
  }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="grid"><span></span><span></span><span></span><span></span><span></span></div>
  <div class="top">
    <span class="mark">V</span>
    <span>${domain}</span>
  </div>
  <h1>${name}</h1>
  <div class="rule"></div>
  <div class="role">${title}</div>
  <div class="tagline">${tagline}</div>
</body>
</html>`;
}

/*
 * The favicon mark. Drawn as a PATH, not as text in a font: a favicon is
 * rasterised by the browser in a context where a webfont is not guaranteed to
 * have loaded, and a fallback face would change the glyph's weight and width.
 * Sharp corners, no radius — the shape rule in globals.css says surfaces are
 * sharp and only interactive controls are pill.
 */
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" fill="${EMBER}"/>
  <path d="M6.5 8 L16 25 L25.5 8 L20.6 8 L16 16.6 L11.4 8 Z" fill="${INK}"/>
</svg>
`;

/*
 * The raster icons are drawn here rather than screenshotted, for a reason that
 * is not stylistic: Chromium encodes a fully opaque screenshot as PNG colour
 * type 2 (RGB, no alpha) no matter what is asked of it — `omitBackground` does
 * not change it, verified. Next.js decodes app/favicon.ico at build time and
 * rejects a non-RGBA payload outright ("The PNG is not in RGBA format"), which
 * fails the build. Rasterising gives direct control of the channel layout, and
 * the mark is six points and two colours — well under the complexity where
 * pulling in a browser to draw it earns its keep.
 */
const MARK_POLYGON = [
  [6.5, 8],
  [16, 25],
  [25.5, 8],
  [20.6, 8],
  [16, 16.6],
  [11.4, 8],
];

const hex = (value) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));

function insidePolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * RGBA pixels for the mark at `size`: an ember tile with the ink V knocked out.
 *
 * 4x4 supersampling per pixel, because the V's diagonals are the whole shape —
 * aliased at 16px they turn into a visible staircase, which is exactly the size
 * the favicon is actually seen at.
 */
function renderMark(size) {
  const [er, eg, eb] = hex(EMBER);
  const [ir, ig, ib] = hex(INK);
  const SAMPLES = 4;
  const scale = 32 / size;
  const pixels = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let hits = 0;
      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const px = (x + (sx + 0.5) / SAMPLES) * scale;
          const py = (y + (sy + 0.5) / SAMPLES) * scale;
          if (insidePolygon(px, py, MARK_POLYGON)) hits++;
        }
      }
      const t = hits / (SAMPLES * SAMPLES);
      const offset = (y * size + x) * 4;
      pixels[offset] = Math.round(er + (ir - er) * t);
      pixels[offset + 1] = Math.round(eg + (ig - eg) * t);
      pixels[offset + 2] = Math.round(eb + (ib - eb) * t);
      // Fully opaque throughout: the tile IS the icon, there is no cutout.
      pixels[offset + 3] = 255;
    }
  }
  return pixels;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

/** Minimal PNG writer: 8-bit RGBA, no interlace, filter 0 on every scanline. */
function encodePng(size, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // colour type 6 = truecolour with alpha
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter method
  ihdr.writeUInt8(0, 12); // interlace

  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter type: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const markPng = (size) => encodePng(size, renderMark(size));

/**
 * Wraps a PNG in an ICO container.
 *
 * The ICO format allows a directory entry's payload to be a whole PNG file
 * rather than a raw DIB, which every browser in use has supported for well over
 * a decade. That makes this a header plus a copy — no bitmap encoder, no
 * dependency, and no native build step on Windows.
 */
function pngToIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(entries.length, 4);

  let offset = 6 + entries.length * 16;
  const directory = [];
  for (const { size, png } of entries) {
    const entry = Buffer.alloc(16);
    // 256 is encoded as 0; every size here is smaller, but keep the rule honest.
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    directory.push(entry);
    offset += png.length;
  }

  return Buffer.concat([header, ...directory, ...entries.map((e) => e.png)]);
}

const meta = await readSiteMeta();
const domain = (process.env.NEXT_PUBLIC_SITE_URL ?? "quanva-portfolio.vercel.app")
  .replace(/^https?:\/\//, "")
  .replace(/\/+$/, "");

const browser = await chromium.launch();
const written = [];

async function shoot({ html, width, height, deviceScaleFactor = 1, waitForFonts = false }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor });
  await page.setContent(html, { waitUntil: "networkidle" });
  if (waitForFonts) await page.evaluate(() => document.fonts.ready);
  const buffer = await page.screenshot({ type: "png" });
  await page.close();
  return buffer;
}

// --- Open Graph / Twitter card -------------------------------------------
const og = await shoot({
  html: ogHtml(meta, domain),
  width: 1200,
  height: 630,
  waitForFonts: true,
});
await fs.writeFile(path.join(ROOT, "public/og.png"), og);
written.push(["public/og.png", og.length]);

// --- Vector favicon -------------------------------------------------------
await fs.writeFile(path.join(ROOT, "app/icon.svg"), ICON_SVG);
written.push(["app/icon.svg", Buffer.byteLength(ICON_SVG)]);

// --- Apple touch icon -----------------------------------------------------
// 180x180 and opaque: iOS composites no transparency and adds its own corner
// radius, so the artwork must bleed to the edges.
const apple = markPng(180);
await fs.writeFile(path.join(ROOT, "app/apple-icon.png"), apple);
written.push(["app/apple-icon.png", apple.length]);

// --- favicon.ico ----------------------------------------------------------
// Still worth shipping alongside icon.svg: it is what a bare /favicon.ico
// request gets, which is what many feed readers, chat unfurlers and older
// browsers ask for without ever parsing the document head.
const ico = pngToIco([16, 32, 48].map((size) => ({ size, png: markPng(size) })));
await fs.writeFile(path.join(ROOT, "app/favicon.ico"), ico);
written.push(["app/favicon.ico", ico.length]);

await browser.close();

for (const [file, bytes] of written) {
  console.log(`${file.padEnd(24)} ${(bytes / 1024).toFixed(1)} kB`);
}
