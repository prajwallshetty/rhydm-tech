/**
 * Tap-target audit: at a mobile viewport, finds visible interactive elements
 * smaller than 44×44 CSS px (WCAG 2.5.8 / Apple HIG minimum). Reports the
 * distinct offenders per route so fixes can target components, not symptoms.
 *
 * Usage: node scripts/tap-target-audit.mjs [route ...]
 */
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:3000";
const MIN = 40; // hard floor we enforce; 44 is the ideal
const WIDTH = 375;

const ROUTES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/", "/disposal", "/refurbished", "/refurbished/shop", "/refurbished/cart", "/refurbished/deals"];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
let total = 0;

for (const route of ROUTES) {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: 900 });
  await page.goto(BASE + route, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 800));

  const offenders = await page.evaluate((min) => {
    const seen = new Map();
    const els = document.querySelectorAll("a, button, [role=button], input, select");
    for (const el of els) {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (rect.width === 0 || rect.height === 0) continue; // hidden
      if (style.visibility === "hidden" || style.display === "none") continue;
      if (rect.width >= min && rect.height >= min) continue;
      // Inline text links inside paragraphs get a pass — WCAG exempts them.
      if (el.tagName === "A" && style.display === "inline") continue;

      const key = `${el.tagName.toLowerCase()}|${(el.getAttribute("class") ?? "").slice(0, 70)}`;
      const entry = seen.get(key) ?? {
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute("class") ?? "").slice(0, 70),
        label: (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 30),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
        count: 0,
      };
      entry.count += 1;
      seen.set(key, entry);
    }
    return Array.from(seen.values()).sort((a, b) => a.h - b.h);
  }, MIN);

  console.log(`\n=== ${route} @${WIDTH} — ${offenders.length} distinct offender(s) ===`);
  for (const o of offenders) {
    total += o.count;
    console.log(`  ${o.w}x${o.h} ×${o.count}  <${o.tag}> "${o.label}"  ${o.cls}`);
  }
  await page.close();
}

await browser.close();
console.log(`\n${total} undersized tap targets total`);
