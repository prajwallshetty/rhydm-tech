/**
 * Responsive audit harness.
 *
 * Renders each route at each viewport width in headless Chrome and reports
 * horizontal overflow — the page-level symptom (scrollWidth > innerWidth)
 * plus the specific elements that extend past the right edge, so fixes
 * target the real offender instead of guessing from class names.
 *
 * Usage:  node scripts/responsive-audit.mjs [route ...]
 * Env:    AUDIT_WIDTHS=320,375,768   AUDIT_SHOTS=1 (save screenshots)
 *         CHROME_PATH=/path/to/chrome  (override browser autodetection)
 *         AUDIT_BASE=http://localhost:3000
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** First Chrome/Edge that actually exists on this machine. */
function resolveBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  const { LOCALAPPDATA, PROGRAMFILES, "PROGRAMFILES(X86)": PROGRAMFILES_X86 } = process.env;
  const candidates = {
    darwin: [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ],
    // path.join, not backslash literals — `\G` and friends are not valid
    // escapes in a template literal and silently collapse to `G`.
    win32: [
      path.join(PROGRAMFILES ?? "", "Google/Chrome/Application/chrome.exe"),
      path.join(PROGRAMFILES_X86 ?? "", "Google/Chrome/Application/chrome.exe"),
      path.join(LOCALAPPDATA ?? "", "Google/Chrome/Application/chrome.exe"),
      path.join(PROGRAMFILES_X86 ?? "", "Microsoft/Edge/Application/msedge.exe"),
      path.join(PROGRAMFILES ?? "", "Microsoft/Edge/Application/msedge.exe"),
    ],
    linux: [
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
      "/usr/bin/microsoft-edge",
    ],
  }[process.platform] ?? [];

  const found = candidates.find((p) => p && fs.existsSync(p));
  if (!found) {
    console.error(
      `No Chrome/Edge found for platform ${process.platform}.
` +
        "Set CHROME_PATH to the browser executable and re-run.",
    );
    process.exit(2);
  }
  return found;
}

const CHROME = resolveBrowser();
const BASE = process.env.AUDIT_BASE ?? "http://localhost:3000";

const ROUTES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      "/",
      "/disposal",
      "/disposal/services",
      "/disposal/process",
      "/disposal/contact",
      "/refurbished",
      "/refurbished/shop",
      "/refurbished/deals",
      "/refurbished/cart",
      "/refurbished/checkout",
      "/refurbished/wishlist",
    ];

const WIDTHS = (process.env.AUDIT_WIDTHS ?? "320,375,414,768,1024,1440")
  .split(",")
  .map(Number);

const SHOTS = process.env.AUDIT_SHOTS === "1";
const SHOT_DIR = path.join(os.tmpdir(), "responsive-shots");
if (SHOTS) fs.mkdirSync(SHOT_DIR, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
});

let failures = 0;

for (const route of ROUTES) {
  for (const width of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900 });

    try {
      await page.goto(BASE + route, { waitUntil: "networkidle2", timeout: 45000 });
      // Let entrance animations and lazy content settle.
      await new Promise((r) => setTimeout(r, 800));

      const result = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const overflow = document.documentElement.scrollWidth - docWidth;

        // Find the widest offending elements (right edge past viewport).
        const offenders = [];
        for (const el of document.querySelectorAll("body *")) {
          const rect = el.getBoundingClientRect();
          if (rect.right > docWidth + 1 && rect.width > 24) {
            offenders.push({
              tag: el.tagName.toLowerCase(),
              cls: (el.getAttribute("class") ?? "").slice(0, 90),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            });
          }
        }
        // Widest first; overlapping ancestors dominate, keep top few.
        offenders.sort((a, b) => b.right - a.right);
        return { overflow, offenders: offenders.slice(0, 4) };
      });

      if (result.overflow > 1) {
        failures += 1;
        console.log(`FAIL  ${route} @${width}  +${result.overflow}px`);
        for (const o of result.offenders) {
          console.log(`      <${o.tag}> right=${o.right} w=${o.width} ${o.cls}`);
        }
        if (SHOTS) {
          await page.screenshot({
            path: path.join(SHOT_DIR, `${route.replaceAll("/", "_") || "root"}-${width}.png`),
            fullPage: false,
          });
        }
      } else {
        console.log(`ok    ${route} @${width}`);
      }
    } catch (err) {
      failures += 1;
      console.log(`ERR   ${route} @${width}  ${String(err).slice(0, 100)}`);
    } finally {
      await page.close();
    }
  }
}

await browser.close();
console.log(failures === 0 ? "\nALL CLEAN" : `\n${failures} failing combos`);
process.exit(failures === 0 ? 0 : 1);
