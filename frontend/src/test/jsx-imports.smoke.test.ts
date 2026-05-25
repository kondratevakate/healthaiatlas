// jsx-imports.smoke.test.ts ─────────────────────────────────────────────────
//
// Catches a runtime crash class that TypeScript does NOT catch reliably:
//
//   <ExternalLink className="…" />   ← JSX use of an identifier
//   // ...but no `import { ExternalLink } from 'lucide-react'` in this file
//
// Why TypeScript misses it: when many files import from the same wide
// namespace (e.g. lucide-react re-exports ~1000 icons), TS often resolves
// the symbol via ambient module declarations and doesn't flag the
// per-file missing import. The result is a blank page in production with
// a "Element type is invalid: expected a string … but got: undefined"
// in the browser console.
//
// This test does a STATIC scan of every .tsx file under SCAN_ROOTS and
// asserts: every JSX component name used in a file is also declared in
// that file (via import, default import, namespace import, or local
// const/function/class). 100% portable — no JSDOM, no React renderer,
// no provider stack needed. Just `fs` + regex.
//
// PORTABILITY NOTE: drop this file into any React/TS project under a
// vitest setup. Adjust SCAN_ROOTS, EXTENSIONS, REACT_BUILTINS, and the
// IGNORED_NAMES allow-list to taste. Everything else is generic.
// ────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// ── Configuration ──────────────────────────────────────────────────────────

const PROJECT_ROOT = join(__dirname, '..');

/** Directories (under src/) whose .tsx files we audit. */
const SCAN_ROOTS = ['pages', 'components'];

/** Extensions that contain JSX. */
const EXTENSIONS = ['.tsx', '.jsx'];

/** React built-ins available globally — never need to be imported. */
const REACT_BUILTINS = new Set(['Fragment', 'Suspense', 'StrictMode', 'Profiler']);

/** Names we allow without proof-of-declaration. Add project-wide pseudo-
 *  components here (e.g. styled-component literals, codegen output). */
const IGNORED_NAMES = new Set<string>([]);

// ── File walking ───────────────────────────────────────────────────────────

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) yield* walk(full);
    else if (EXTENSIONS.some((ext) => full.endsWith(ext))) yield full;
  }
}

// ── Symbol extraction ──────────────────────────────────────────────────────

/** Match all JSX opening tags whose name starts with uppercase.
 *  Captures the name before `.` so `<motion.div>` → `motion`.
 *
 *  KEY DISTINCTION from TS generics:
 *    `forwardRef<HTMLDivElement>(...)`  ← TS generic, char before `<` is `f` (word)
 *    `return <Component foo={1} />`     ← JSX,        char before `<` is ` ` (space)
 *
 *  The negative lookbehind `(?<![\w<])` requires the char before `<` to be
 *  neither a word char nor another `<` (which would be a nested-generic open).
 *  This filters out generics reliably without enumerating every DOM type.
 *
 *  Trailing `[\s/>]` requires JSX syntax to follow the name — whitespace
 *  (attributes), `/` (self-close), or `>` (no attrs). Generics use `,`/`|`/etc.
 */
const JSX_USE_RE = /(?<![\w<])<([A-Z][A-Za-z0-9_]*)(?:\.[A-Za-z0-9_]+)?[\s/>]/g;

/** Match the contents of `import { ... }` blocks. */
const NAMED_IMPORT_RE = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g;

/** Match `import Default from '…'` (no braces). Also handles
 *  `import Default, { Named } from '…'` — captures Default only. */
const DEFAULT_IMPORT_RE = /import\s+(?:type\s+)?([A-Z][A-Za-z0-9_]*)\s*(?:,\s*\{[^}]*\})?\s+from\s+['"][^'"]+['"]/g;

/** Match `import * as Namespace from '…'`. */
const NAMESPACE_IMPORT_RE = /import\s+\*\s+as\s+([A-Z][A-Za-z0-9_]*)\s+from\s+['"][^'"]+['"]/g;

/** Match local declarations: const/let/var/function/class Foo … */
const LOCAL_DECL_RE = /(?:^|\n)\s*(?:export\s+)?(?:const|let|var|function|class)\s+([A-Z][A-Za-z0-9_]*)/g;

/** Match destructure-renames where a property is renamed to a capitalized
 *  local binding. Classic React pattern: `({ icon: Icon }) => <Icon/>` —
 *  `Icon` becomes a local binding that's used as a JSX element.
 *  Captures the right-hand side of `: Capital` when followed by destructure
 *  context (`,` `}` `)` `=` for default values). */
const DESTRUCTURE_RENAME_RE = /:\s*([A-Z][A-Za-z0-9_]*)\s*[,}\)=]/g;

/** Build the set of identifiers usable in this file. */
function collectDeclared(content: string): Set<string> {
  const declared = new Set<string>(REACT_BUILTINS);

  // Named imports: `{ Foo, Bar as Baz, type T }`
  for (const m of content.matchAll(NAMED_IMPORT_RE)) {
    for (const raw of m[1].split(',')) {
      const seg = raw.trim().replace(/^type\s+/, '');
      if (!seg) continue;
      const asMatch = seg.match(/^(\w+)\s+as\s+(\w+)$/);
      declared.add(asMatch ? asMatch[2] : seg);
    }
  }

  // Default imports
  for (const m of content.matchAll(DEFAULT_IMPORT_RE)) declared.add(m[1]);

  // Namespace imports
  for (const m of content.matchAll(NAMESPACE_IMPORT_RE)) declared.add(m[1]);

  // Local declarations (const Foo = ..., function Foo() {}, class Foo {})
  for (const m of content.matchAll(LOCAL_DECL_RE)) declared.add(m[1]);

  // Destructure-renames: `{ icon: Icon }` — `Icon` becomes a local binding.
  for (const m of content.matchAll(DESTRUCTURE_RENAME_RE)) declared.add(m[1]);

  return declared;
}

/** Collect all JSX usages of capitalized component names. */
function collectJsxUsages(content: string): Set<string> {
  const used = new Set<string>();
  for (const m of content.matchAll(JSX_USE_RE)) used.add(m[1]);
  return used;
}

// ── The test ───────────────────────────────────────────────────────────────

describe('jsx-imports smoke', () => {
  const files: string[] = [];
  for (const root of SCAN_ROOTS) {
    const full = join(PROJECT_ROOT, root);
    try {
      for (const f of walk(full)) files.push(f);
    } catch {
      // Root doesn't exist — skip silently so the test is portable.
    }
  }

  if (files.length === 0) {
    it.skip('no .tsx files to scan', () => {});
    return;
  }

  for (const file of files) {
    const rel = file.slice(PROJECT_ROOT.length + 1).replace(/\\/g, '/');
    it(`every JSX name in ${rel} is declared in the file`, () => {
      const content = readFileSync(file, 'utf8');
      const declared = collectDeclared(content);
      const used = collectJsxUsages(content);

      const undeclared = [...used].filter(
        (name) => !declared.has(name) && !IGNORED_NAMES.has(name),
      );

      // Friendly assertion: list every missing import on a separate line.
      expect(
        undeclared,
        `${rel} uses these JSX names without importing or declaring them:\n  ${undeclared.join('\n  ')}\n\n` +
          `Likely cause: an import was removed but the JSX usage stayed. ` +
          `TypeScript may not catch this when the symbol exists in another file's namespace.`,
      ).toEqual([]);
    });
  }
});
