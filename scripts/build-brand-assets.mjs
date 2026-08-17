/**
 * Regenerates the derived brand assets in public/brand/ from public/logo.png.
 *
 * The source logo is a 2172x724 canvas with ~9% transparent margin around
 * 1925x593 of artwork, which made the logo float inside whatever height it was
 * given and forced every page to download 753 KB for a 40px-tall header image.
 * This trims to the measured artwork bounds and emits right-sized files:
 *
 *   rhydm-logo.png   1200x370   full lockup (was 753 KB -> 75 KB)
 *   rhydm-mark.png   256x256    emblem only, square canvas
 *   icon-{32,96,192,512}.png    favicons (replaced a 2.1 MB embedded-raster SVG)
 *
 * Run: node scripts/build-brand-assets.mjs
 * Requires `sharp`, which is present transitively via Next's image optimizer.
 * Re-run only when public/logo.png itself changes.
 */
import sharp from "sharp";
import { statSync } from "node:fs";

const SRC = "public/logo.png";
// Measured alpha bounds of the source artwork (2172x724 canvas):
const ART = { left: 129, top: 65, width: 1925, height: 593 };   // full lockup
const MARK = { left: 129, top: 65, width: 666, height: 593 };   // emblem only

const size = (p) => `${(statSync(p).size / 1024).toFixed(1)} KB`;

// 1. Full lockup, trimmed of its transparent margin. 1200px wide covers the
//    largest on-screen use (h-20 => ~260px) at 4x, so it stays crisp on retina.
await sharp(SRC)
  .extract(ART)
  .resize({ width: 1200, withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: true, quality: 92 })
  .toFile("public/brand/rhydm-logo.png");

// 2. Emblem only, centred on a square transparent canvas so it can sit in a
//    square slot (mobile navbar, favicons, avatars) without distortion.
const markBuf = await sharp(SRC).extract(MARK).png().toBuffer();
const SQ = 666;
await sharp({
  create: { width: SQ, height: SQ, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: markBuf, left: Math.round((SQ - MARK.width) / 2), top: Math.round((SQ - MARK.height) / 2) }])
  .png()
  .toFile("scratch/mark-square.png");

await sharp("scratch/mark-square.png")
  .resize(256, 256)
  .png({ compressionLevel: 9, palette: true, quality: 92 })
  .toFile("public/brand/rhydm-mark.png");

// 3. Favicons from the same emblem (replaces the 2.1 MB embedded-raster SVG).
for (const px of [32, 96, 192, 512]) {
  await sharp("scratch/mark-square.png")
    .resize(px, px)
    .png({ compressionLevel: 9, palette: true, quality: 92 })
    .toFile(`public/brand/icon-${px}.png`);
}

for (const f of [
  "public/brand/rhydm-logo.png",
  "public/brand/rhydm-mark.png",
  "public/brand/icon-32.png",
  "public/brand/icon-96.png",
  "public/brand/icon-192.png",
  "public/brand/icon-512.png",
]) console.log(size(f).padStart(9), f);

const m = await sharp("public/brand/rhydm-logo.png").metadata();
console.log("lockup:", m.width + "x" + m.height, "aspect", (m.width / m.height).toFixed(3));
