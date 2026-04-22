// Global constants for the Verifiable Claims Directory

export const SUGGEST_ENTRY_URL = 'https://forms.gle/placeholder-suggest-entry';
export const SUGGEST_CORRECTION_URL = 'https://forms.gle/placeholder-suggest-correction';

// Per-section "last updated" dates (ISO format)
export const LAST_UPDATED: Record<string, string> = {
  directory: '2026-02-24',
  newsfeed: '2026-02-24',
  discovery: '2026-02-24',
  context: '2026-02-24',
  claims: '2026-02-24',
  oncology: '2026-02-24',
  'process-mining': '2026-02-24',
  'medical-tourism': '2026-02-24',
};

// Fixed ordering for cross-hub navigation ("See also" strips).
export const HUB_DOMAIN_IDS = [
  'oncology',
  'process-mining',
  'medical-tourism',
] as const;
