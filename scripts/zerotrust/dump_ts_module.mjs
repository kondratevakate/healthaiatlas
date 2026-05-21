// Dump a TypeScript module's exports as JSON to stdout.
//
// Usage:
//   node --experimental-strip-types scripts/zerotrust/dump_ts_module.mjs <path-to-ts-file>
//
// Prints {"<exportName>": <value>, ...} for every named export that is
// JSON-serializable. Use this from Python zerotrust extractors to read
// frontend data files (oncology, processMining, ...) without parsing TS.
//
// Requires Node 22.6+ (which supports --experimental-strip-types for .ts
// files). The frontend's TS data files use only plain literals, so type
// stripping is safe.

import { pathToFileURL } from 'node:url';
import { resolve, isAbsolute } from 'node:path';

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: dump_ts_module.mjs <path-to-ts-file>');
  process.exit(2);
}

const abs = isAbsolute(arg) ? arg : resolve(process.cwd(), arg);
const url = pathToFileURL(abs).href;
const mod = await import(url);

const out = {};
for (const [name, value] of Object.entries(mod)) {
  if (name === 'default') continue;
  // Skip functions and other non-serializable values.
  if (typeof value === 'function') continue;
  out[name] = value;
}
process.stdout.write(JSON.stringify(out));
