/**
 * Generates the 1200x630 Open Graph / Twitter sharing image.
 *
 * Before this existed, every share preview reused the 3.24:1 logo lockup as
 * og:image. Facebook, LinkedIn, WhatsApp and X all expect ~1.91:1 and crop or
 * letterbox anything else, so the brand name arrived mangled. This composites
 * the same canonical lockup onto a correctly proportioned brand canvas.
 *
 * Run: node scripts/build-og-image.mjs
 * Re-run only when public/brand/rhydm-logo.png changes.
 */
import sharp from "sharp";
import { statSync } from "node:fs";

const W = 1200;
const H = 630;
const OUT = "public/brand/rhydm-tech-og.png";

const LOGO_W = 620;
const logo = await sharp("public/brand/rhydm-logo.png")
  .resize({ width: LOGO_W })
  .toBuffer();
const logoMeta = await sharp(logo).metadata();

// Text is baked in as SVG rather than drawn, so the file needs no font at
// render time and looks identical on every scraper.
const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="${H - 10}" width="${W}" height="10" fill="#16A34A"/>
  <text x="${W / 2}" y="392" text-anchor="middle"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="34" font-weight="700" fill="#0f172a">
    IT Asset Disposal &#183; Secure Data Destruction &#183; Refurbished IT
  </text>
  <text x="${W / 2}" y="447" text-anchor="middle"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="26" font-weight="400" fill="#64748b">
    Rhydm Tech &#183; Rhydm Technologies &#183; Berlin, Germany
  </text>
  <text x="${W / 2}" y="527" text-anchor="middle"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="24" font-weight="600" fill="#16A34A" letter-spacing="2">
    rhydm-tech.com
  </text>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([
    {
      input: logo,
      left: Math.round((W - LOGO_W) / 2),
      top: Math.round(288 - logoMeta.height),
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const m = await sharp(OUT).metadata();
console.log(
  `${OUT} -> ${m.width}x${m.height}  ${(statSync(OUT).size / 1024).toFixed(1)} KB`,
);
