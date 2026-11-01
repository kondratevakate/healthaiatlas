// lead-tracking.test.ts ─────────────────────────────────────────────────────
//
// Every lead CTA on the site must reach GA4 as `generate_lead`, and ordinary
// links must not. Also checks that the lead URLs actually used on the site
// (constants + Contact/About pages) are recognised, so changing a URL can't
// silently stop lead tracking.
// ────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { classifyLeadHref, installLeadTracking } from '@/lib/leadTracking';
import { SUGGEST_ENTRY_URL, ATLAS_NOTES_SUBSCRIBE_URL } from '@/data/constants';

describe('classifyLeadHref', () => {
  it.each([
    [ATLAS_NOTES_SUBSCRIBE_URL, 'newsletter'],
    [SUGGEST_ENTRY_URL, 'linkedin'],
    ['https://linkedin.com/in/kondratevakate', 'linkedin'],
    ['https://www.linkedin.com/in/kondratevakate', 'linkedin'],
    ['mailto:hello@example.com', 'email'],
  ])('%s -> %s', (href, method) => {
    expect(classifyLeadHref(href)).toBe(method);
  });

  it.each([
    '/about',
    '#contact',
    'https://github.com/kondratevakate',
    'https://www.pathai.com/resources',
    'https://airtable.com/app123/tbl456',
    'https://airtable.com/shrkedcsqRIdT60o3',
    'https://notlinkedin.com/in/x',
    'not a url',
  ])('%s is not a lead', (href) => {
    expect(classifyLeadHref(href)).toBeNull();
  });
});

describe('installLeadTracking', () => {
  let gtag: ReturnType<typeof vi.fn>;
  let uninstall: () => void;

  beforeEach(() => {
    gtag = vi.fn();
    (window as unknown as { gtag: unknown }).gtag = gtag;
    uninstall = installLeadTracking();
  });

  afterEach(() => {
    uninstall();
    document.body.innerHTML = '';
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  const click = (html: string, selector = 'span') => {
    document.body.innerHTML = html;
    const el = document.querySelector(selector)!;
    // Stop default so jsdom doesn't try to navigate.
    document.addEventListener('click', (e) => e.preventDefault(), { once: true });
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  };

  it('sends generate_lead for a click inside a lead link', () => {
    click(`<a href="${ATLAS_NOTES_SUBSCRIBE_URL}"><span>Subscribe</span></a>`);
    expect(gtag).toHaveBeenCalledWith(
      'event',
      'generate_lead',
      expect.objectContaining({ lead_method: 'newsletter', link_url: ATLAS_NOTES_SUBSCRIBE_URL }),
    );
  });

  it('ignores ordinary links', () => {
    click('<a href="/directory"><span>Directory</span></a>');
    expect(gtag).not.toHaveBeenCalled();
  });

  it('does nothing when GA is not loaded', () => {
    delete (window as unknown as { gtag?: unknown }).gtag;
    expect(() => click(`<a href="${SUGGEST_ENTRY_URL}"><span>Form</span></a>`)).not.toThrow();
  });

  it('stops reporting after uninstall', () => {
    uninstall();
    click(`<a href="${SUGGEST_ENTRY_URL}"><span>Form</span></a>`);
    expect(gtag).not.toHaveBeenCalled();
    uninstall = () => {};
  });
});
