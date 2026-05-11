// Global constants for the Verifiable Claims Directory

export const SUGGEST_ENTRY_URL =
  'mailto:kondratevakate@gmail.com?subject=HealthAI%20Atlas%20%E2%80%94%20Suggest%20entry&body=Entry%20name%3A%0AURL%3A%0AWhy%20it%20matters%3A';
export const SUGGEST_CORRECTION_URL =
  'mailto:kondratevakate@gmail.com?subject=HealthAI%20Atlas%20%E2%80%94%20Suggest%20correction&body=Which%20entry%3A%0AWhat%27s%20wrong%3A%0ACorrect%20information%3A';

// Per-section "last updated" dates (ISO format)
export const LAST_UPDATED: Record<string, string> = {
  directory: '2026-04-22',
  discovery: '2026-05-06',
  context: '2026-05-04',
  claims: '2026-04-22',
  oncology: '2026-04-22',
  'process-mining': '2026-04-22',
  'medical-tourism': '2026-04-22',
  'ai-life-sciences': '2026-05-08',
};

// Fixed ordering for cross-hub navigation ("See also" strips).
export const HUB_DOMAIN_IDS = [
  'oncology',
  'process-mining',
  'medical-tourism',
  'ai-life-sciences',
] as const;
