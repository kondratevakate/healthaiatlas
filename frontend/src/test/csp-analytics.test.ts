// csp-analytics.test.ts ─────────────────────────────────────────────────────
//
// index.html loads third-party analytics scripts (GA, Cloudflare Web
// Analytics). nginx sends a strict Content-Security-Policy, so every script
// host index.html loads must be allowed in script-src, and every host the
// beacons report to must be allowed in connect-src. Otherwise the counter
// silently records nothing in production while working fine in `vite dev`.
// ────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..', '..', '..');
const INDEX_HTML = readFileSync(join(ROOT, 'frontend', 'index.html'), 'utf8');
const NGINX = readFileSync(join(ROOT, 'ansible', 'templates', 'healthaiatlas.nginx.j2'), 'utf8');

function cspDirective(name: string): string[] {
  const csp = NGINX.match(/Content-Security-Policy "([^"]+)"/);
  expect(csp, 'CSP header not found in nginx template').not.toBeNull();
  const directive = csp![1].split(';').map((d) => d.trim()).find((d) => d.startsWith(`${name} `));
  expect(directive, `${name} missing from CSP`).toBeDefined();
  return directive!.split(/\s+/).slice(1);
}

describe('analytics scripts are allowed by the nginx CSP', () => {
  it('every https script host in index.html is in script-src', () => {
    const hosts = [...INDEX_HTML.matchAll(/\.src\s*=\s*"(https:\/\/[^/"]+)/g)].map((m) => m[1]);
    expect(hosts).toContain('https://static.cloudflareinsights.com');
    expect(hosts).toContain('https://www.googletagmanager.com');
    const allowed = cspDirective('script-src');
    expect(hosts.filter((h) => !allowed.includes(h))).toEqual([]);
  });

  it('beacon endpoints are in connect-src', () => {
    const allowed = cspDirective('connect-src');
    expect(allowed).toContain('https://www.google-analytics.com');
    expect(allowed).toContain('https://cloudflareinsights.com');
  });

  it('Cloudflare beacon only loads when the build token is set', () => {
    expect(INDEX_HTML).toContain('%VITE_CF_BEACON_TOKEN%');
    expect(INDEX_HTML).toMatch(/if \(!token \|\| token\.indexOf\("VITE_CF_BEACON_TOKEN"\) !== -1\) return;/);
  });
});
