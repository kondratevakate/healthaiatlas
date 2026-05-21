// page-render.smoke.test.tsx ────────────────────────────────────────────────
//
// Mount-time crash detector for every page module. Catches the runtime-only
// error class that TypeScript misses:
//
//   "Element type is invalid: expected a string ... but got: undefined.
//    You likely forgot to export your component from the file it's defined
//    in, or you might have mixed up default and named imports."
//
// This is the *exact* error the browser console shows when you remove an
// import like `ExternalLink` from a file while leaving the JSX usage in
// place. The static `jsx-imports.smoke.test.ts` catches it cheaply via
// regex; this test catches it definitively by actually rendering.
//
// Strategy
// --------
// 1. Glob every `src/pages/*.tsx` (one component per file, default export).
// 2. Import each one dynamically inside a vitest `it()` block.
// 3. Render it inside a minimal provider stack (MemoryRouter + Suspense).
// 4. Assert no error was thrown.
//
// We use *MemoryRouter*, not BrowserRouter, so the test doesn't touch
// window history and can run in parallel.
//
// PORTABILITY NOTES
// -----------------
// To carry this to another React project:
//   - Adjust PAGES_GLOB to match your routes directory.
//   - Update the provider wrapper to your app's actual provider chain.
//     If you have a typed AppProviders component, import it directly.
//   - If your pages depend on auth / fetch / etc., either mock those
//     hooks with `vi.mock` at the top of this file or add the providers
//     to AllProviders below.
// ────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Suspense, type PropsWithChildren } from 'react';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

// ── JSDOM polyfills ────────────────────────────────────────────────────────
//
// JSDOM ships without IntersectionObserver / ResizeObserver, which break any
// component that uses framer-motion's `whileInView` or shadcn's resize-aware
// primitives. We stub them inline so this test file remains drop-in portable
// (no edits to setup.ts required).

beforeAll(() => {
  class StubObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  if (typeof window !== 'undefined') {
    if (!('IntersectionObserver' in window)) {
      (window as unknown as { IntersectionObserver: typeof StubObserver }).IntersectionObserver = StubObserver;
    }
    if (!('ResizeObserver' in window)) {
      (window as unknown as { ResizeObserver: typeof StubObserver }).ResizeObserver = StubObserver;
    }
  }
});

// ── Configuration ──────────────────────────────────────────────────────────

const PAGES_DIR = join(__dirname, '..', 'pages');

/** Pages we skip — typically: pages with route params we can't synthesize
 *  here, or pages that require live auth/network we don't want to mock. */
const SKIP = new Set<string>([
  // Examples — adjust to your project:
  'Share.tsx',        // needs :id param to be meaningful
  'PersonaPage.tsx',  // dispatches on route — handled by its parents
  'NotFound.tsx',     // trivially renders, not worth a test slot
]);

// ── Provider stack ─────────────────────────────────────────────────────────
//
// LanguageContext and AuthContext are mocked to keep this test independent
// of those modules' implementation. Real providers are exercised by the
// component-specific tests (e.g. AuthContext.test.tsx).

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: () => {},
    t: (key: string) => key,
  }),
  LanguageProvider: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock('@/components/auth', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@/components/auth');
  return {
    ...actual,
    useAuth: () => ({ user: null, signIn: () => {}, signOut: () => {} }),
    AuthProvider: ({ children }: PropsWithChildren) => <>{children}</>,
  };
});

function AllProviders({ children }: PropsWithChildren) {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Suspense fallback={<div>loading</div>}>{children}</Suspense>
    </MemoryRouter>
  );
}

// ── The test ───────────────────────────────────────────────────────────────

describe('page-render smoke', () => {
  let pageFiles: string[] = [];
  try {
    pageFiles = readdirSync(PAGES_DIR)
      .filter((f) => f.endsWith('.tsx'))
      .filter((f) => !SKIP.has(f));
  } catch {
    // Pages dir doesn't exist — skip silently for portability.
  }

  if (pageFiles.length === 0) {
    it.skip('no pages to render', () => {});
    return;
  }

  for (const file of pageFiles) {
    const name = file.replace(/\.tsx$/, '');
    it(`${name} mounts without throwing`, async () => {
      // Dynamic import so a syntax/module-resolution error in one page
      // doesn't blow up the whole test file at load time.
      const mod = await import(`../pages/${name}.tsx`);
      const PageComponent = (mod.default ?? mod[name]) as React.ComponentType;

      expect(PageComponent, `${file} must have a default or named export`).toBeTruthy();

      // Capture and surface any error that React would normally log to
      // the console — this is where "Element type is invalid" lands.
      const consoleErrors: string[] = [];
      const errSpy = vi.spyOn(console, 'error').mockImplementation((msg: unknown) => {
        consoleErrors.push(String(msg));
      });

      try {
        render(
          <AllProviders>
            <PageComponent />
          </AllProviders>,
        );

        // React 18 logs the "Element type is invalid" error before throwing.
        // The throw is caught by the test render-error boundary, but the
        // console.error message is the proof.
        const fatalErrors = consoleErrors.filter(
          (m) =>
            m.includes('Element type is invalid') ||
            m.includes('Objects are not valid as a React child') ||
            m.includes('but got: undefined'),
        );
        expect(
          fatalErrors,
          `${file} threw a fatal render error:\n${fatalErrors.join('\n')}`,
        ).toEqual([]);
      } finally {
        errSpy.mockRestore();
        cleanup();
      }
    });
  }
});
