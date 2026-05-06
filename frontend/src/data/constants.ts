// Global constants for the Verifiable Claims Directory

export const SUGGEST_ENTRY_URL = 'https://forms.gle/placeholder-suggest-entry';
export const SUGGEST_CORRECTION_URL = 'https://forms.gle/placeholder-suggest-correction';

// Per-section "last updated" dates (ISO format)
export const LAST_UPDATED: Record<string, string> = {
  directory: '2026-04-22',
  discovery: '2026-05-06',
  context: '2026-05-04',
  claims: '2026-04-22',
  oncology: '2026-04-22',
  'process-mining': '2026-04-22',
  'medical-tourism': '2026-04-22',
  'ai-life-sciences': '2026-05-03',
};

// Fixed ordering for cross-hub navigation ("See also" strips).
export const HUB_DOMAIN_IDS = [
  'oncology',
  'process-mining',
  'medical-tourism',
  'ai-life-sciences',
] as const;
