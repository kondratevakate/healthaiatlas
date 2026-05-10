import { test, expect } from '@playwright/test';

const ROUTES = [
  '/',
  '/directory',
  '/directory?domain=medical-tourism',
  '/directory?domain=oncology',
  '/directory?domain=ai-life-sciences',
  '/directory?domain=process-mining',
  '/context/uk',
  '/context/uae',
  '/context/eu',
  '/context/us',
];

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';

test.describe('mobile 375px no horizontal overflow', () => {
  for (const route of ROUTES) {
    test(`${route} fits in 375px viewport`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(() => {
        const el = document.documentElement;
        return el.scrollWidth - el.clientWidth;
      });
      expect(overflow, `${route} overflows by ${overflow}px at 375px`).toBeLessThanOrEqual(1);
    });
  }
});
