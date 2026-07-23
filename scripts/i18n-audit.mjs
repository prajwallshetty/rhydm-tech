/**
 * i18n audit: finds hardcoded user-facing strings in public-site code —
 * JSX text nodes and translatable string props (placeholder, aria-label,
 * title, alt) that contain real words. Heuristic by design; the point is a
 * countable, re-runnable inventory, not perfection.
 *
 * Usage: node scripts/i18n-audit.mjs [--verbose]
 */
import fs from "node:fs";
import path from "node:path";

const ROOTS = [
  "app/(site)",
  "components/store",
  "components/disposal",
  "components/gateway",
  "components/layout",
  "components/ui",
  "components/motion",
];

// Text that looks like a sentence/label: ≥1 word of 3+ letters.
const WORDS = /[A-Za-zÄÖÜäöüß]{3,}/;
// Obvious non-copy: URLs, code-ish, single CSS-ish tokens.
const IGNORE = /^[\s\d.,:;·—–\-+%$€()\[\]/#&×→↓]*$|^https?:|^\/|^[a-z-]+$|^\d/;

const findings = [];
function scanFile(file) {
  const src = fs.readFileSync(file, "utf8");
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    // JSX text nodes: >Visible text<
    for (const m of line.matchAll(/>([^<>{}`]+)</g)) {
      const text = m[1].trim();
      if (text && WORDS.test(text) && !IGNORE.test(text)) {
        findings.push({ file, line: i + 1, kind: "text", text: text.slice(0, 60) });
      }
    }

    // A bare prose line counts only when it sits directly inside JSX: the
    // previous line must open a tag (`>`), and the line itself must read like
    // copy — two or more words and no code punctuation (`:` `"` `(` `=` `;` …)
    // that would betray a TS type, object literal, or statement. Comments
    // never count.
    const trimmed = line.trim();
    const prev = (lines[i - 1] ?? "").trim();
    const isComment = /^(\/\/|\/\*|\*|\{\/\*)/.test(trimmed);
    const looksLikeCode = /[<>{}=:"'`()[\];]/.test(trimmed) || /,\s*$/.test(trimmed) || /=>/.test(trimmed);
    const multiWord = /\S\s+\S/.test(trimmed);
    if (
      trimmed &&
      !isComment &&
      !looksLikeCode &&
      multiWord &&
      WORDS.test(trimmed) &&
      !IGNORE.test(trimmed) &&
      prev.endsWith(">")
    ) {
      findings.push({ file, line: i + 1, kind: "text", text: trimmed.slice(0, 60) });
    }

    // Translatable props with string literals.
    for (const m of line.matchAll(/(placeholder|aria-label|title|alt)="([^"]+)"/g)) {
      const text = m[2].trim();
      if (text && WORDS.test(text) && !IGNORE.test(text)) {
        findings.push({ file, line: i + 1, kind: m[1], text: text.slice(0, 60) });
      }
    }
  });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith(".tsx")) scanFile(p);
  }
}
ROOTS.forEach((root) => fs.existsSync(root) && walk(root));

const byFile = new Map();
for (const f of findings) {
  byFile.set(f.file, (byFile.get(f.file) ?? 0) + 1);
}
const sorted = [...byFile.entries()].sort((a, b) => b[1] - a[1]);

if (process.argv.includes("--verbose")) {
  for (const f of findings) console.log(`${f.file}:${f.line} [${f.kind}] ${f.text}`);
} else {
  for (const [file, count] of sorted) console.log(String(count).padStart(4), file);
}
console.log(`\nTOTAL: ${findings.length} hardcoded strings in ${byFile.size} files`);
