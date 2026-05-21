// Visual + behavioural smoke for the 5 persona landing pages.
//
// For each of /patient, /doctor, /business, /startup, /leader:
//  - navigate
//  - assert the page didn't redirect away (= route exists)
//  - assert the H1 contains the expected persona title text (not a
//    translation-key literal like "persona.patient.title")
//  - assert the "Composite — not a real individual" disclosure renders
//  - capture full-page console errors
//  - screenshot to .tmp/persona-<id>.png
//
// Exits non-zero if anything fails. Run after `npm run dev` is listening.

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = resolve(__dirname, '..', '.tmp');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const BASE = 'http://localhost:8080';
const PERSONAS = [
  { id: 'patient', expectedTitle: 'The Patient' },
  { id: 'doctor', expectedTitle: 'The Clinician' },
  { id: 'business', expectedTitle: 'The Business' },
  { id: 'startup', expectedTitle: 'The Founder' },
  { id: 'leader', expectedTitle: 'The Strategist' },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

let failed = 0;
const summary = [];

for (const persona of PERSONAS) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });

  const url = `${BASE}/${persona.id}`;
  await page.goto(url, { waitUntil: 'networkidle' });

  const finalUrl = page.url();
  const h1Text = (await page.locator('h1').first().textContent())?.trim() ?? '';
  const bodyHasDisclosure = await page
    .getByText('Composite — not a real individual')
    .count();
  const screenshotPath = resolve(SCREENSHOT_DIR, `persona-${persona.id}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const issues = [];
  if (!finalUrl.endsWith(`/${persona.id}`)) {
    issues.push(`redirected to ${finalUrl}`);
  }
  if (!h1Text.includes(persona.expectedTitle)) {
    issues.push(`h1="${h1Text}" missing expected "${persona.expectedTitle}"`);
  }
  if (h1Text.startsWith('persona.')) {
    issues.push(`h1 rendered translation-key literal: "${h1Text}"`);
  }
  if (bodyHasDisclosure === 0) {
    issues.push('disclosure missing');
  }
  if (errors.length > 0) {
    issues.push(`runtime errors: ${errors.join(' | ')}`);
  }

  const status = issues.length === 0 ? 'OK' : 'FAIL';
  summary.push({ id: persona.id, status, issues, h1: h1Text, screenshot: screenshotPath });
  if (status === 'FAIL') failed++;
  await page.close();
}

await browser.close();

console.log('\n=== Persona smoke results ===');
for (const s of summary) {
  console.log(`[${s.status}] /${s.id}  h1="${s.h1}"`);
  for (const issue of s.issues) console.log(`       - ${issue}`);
  console.log(`       screenshot: ${s.screenshot}`);
}
console.log(`\n${summary.length - failed}/${summary.length} passed`);

process.exit(failed === 0 ? 0 : 1);
