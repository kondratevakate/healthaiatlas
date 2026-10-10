// Fails the build when the JS that the landing page needs grows past budget.
// Reads dist/index.html, follows the entry <script> and its modulepreload
// links, and sums their gzipped size. Run after `npm run build`.
//
// The Oct 2026 build shipped one 2.2 MB bundle (650 KB gzipped) for every
// page; after code splitting the landing needs ~200 KB gzipped.

import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BUDGET_KB = Number(process.env.BUNDLE_BUDGET_KB ?? 260);
const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const html = readFileSync(join(dist, "index.html"), "utf8");

const files = [
  ...html.matchAll(/<script[^>]+type="module"[^>]+src="\/([^"]+\.js)"/g),
  ...html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="\/([^"]+\.js)"/g),
].map((m) => m[1]);

if (files.length === 0) {
  console.error("check-bundle-size: no entry script found in dist/index.html");
  process.exit(1);
}

let totalKb = 0;
for (const f of new Set(files)) {
  const kb = gzipSync(readFileSync(join(dist, f))).length / 1024;
  totalKb += kb;
  console.log(`${f}: ${kb.toFixed(1)} KB gzipped`);
}
console.log(`landing JS total: ${totalKb.toFixed(1)} KB gzipped (budget ${BUDGET_KB} KB)`);

if (totalKb > BUDGET_KB) {
  console.error(
    `Landing JS is over budget by ${(totalKb - BUDGET_KB).toFixed(1)} KB. ` +
      "Lazy-load the heavy page or data you just added (see App.tsx), or raise " +
      "BUDGET_KB with a written reason.",
  );
  process.exit(1);
}
