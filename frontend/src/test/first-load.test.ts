// first-load.test.ts ────────────────────────────────────────────────────────
//
// Guards the things that decide how long a visitor stares at the loader:
//   • only the landing page ships in the main bundle; every other page is a
//     lazy chunk (App.tsx);
//   • no render-blocking third-party CSS (e.g. Google Fonts @import) in
//     index.css; fonts are self-hosted via @fontsource (src/fonts.ts);
//   • nginx gzips JS and CSS (stock Ubuntu nginx only gzips HTML);
//   • the boot loader is styled from <head> and sits outside #root, so it
//     paints on the first frame and React can fade it out.
// ────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FRONTEND = join(__dirname, '..', '..');
const read = (...p: string[]) => readFileSync(join(FRONTEND, ...p), 'utf8');

describe('first load stays light', () => {
  it('App.tsx eagerly imports only the landing page', () => {
    const app = read('src', 'App.tsx');
    const eager = [...app.matchAll(/^import (\w+) from "\.\/pages\/(\w+)";/gm)].map((m) => m[2]);
    expect(eager).toEqual(['Index']);
    expect(app).toMatch(/lazy\(\(\) => import\("\.\/pages\/Discovery"\)\)/);
    expect(app).toMatch(/<Suspense fallback=/);
  });

  it('index.css has no remote @import (fonts are self-hosted)', () => {
    const css = read('src', 'index.css');
    expect(css).not.toMatch(/@import\s+url\(\s*['"]?https?:/);
    const fonts = read('src', 'fonts.ts');
    for (const family of ['space-grotesk', 'lora', 'space-mono', 'ibm-plex-sans-arabic']) {
      expect(fonts).toContain(`@fontsource/${family}/`);
    }
  });

  it('nginx gzips JavaScript and CSS', () => {
    const nginx = readFileSync(join(FRONTEND, '..', 'ansible', 'templates', 'healthaiatlas.nginx.j2'), 'utf8');
    expect(nginx).toMatch(/^\s*gzip on;/m);
    const types = nginx.match(/gzip_types([^;]+);/);
    expect(types).not.toBeNull();
    expect(types![1]).toContain('application/javascript');
    expect(types![1]).toContain('text/css');
  });

  it('boot loader is styled in <head> and lives outside #root', () => {
    const html = read('index.html');
    const head = html.slice(0, html.indexOf('</head>'));
    expect(head).toContain('#boot-loader');
    expect(html).toMatch(/<div id="boot-loader"[\s\S]*?<\/div>\s*<\/div>\s*<div id="root"><\/div>/);
  });
});
