// Global constants for the Verifiable Claims Directory

export const SUGGEST_ENTRY_URL =
  'mailto:kondratevakate@gmail.com?subject=HealthAI%20Atlas%20%E2%80%94%20Suggest%20entry&body=Entry%20name%3A%0AURL%3A%0AWhy%20it%20matters%3A';
export const SUGGEST_CORRECTION_URL =
  'mailto:kondratevakate@gmail.com?subject=HealthAI%20Atlas%20%E2%80%94%20Suggest%20correction&body=Which%20entry%3A%0AWhat%27s%20wrong%3A%0ACorrect%20information%3A';

// Atlas Notes — editorial companion newsletter on LinkedIn.
// The directory (this site) holds structured, cited records.
// Atlas Notes holds the long-form analysis and author voice that ties them together.
export const ATLAS_NOTES_SUBSCRIBE_URL =
  'https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7451945270583390208';

// Support via Manifund — fiscal sponsorship platform for AI-ecosystem
// projects. Manifund's 501(c)(3) receives funds and pays out as grants, which
// means the Atlas does NOT need its own legal entity, payment processor, or
// US/EU tax residency. This is the structurally correct channel for a
// solo-researcher project in a non-supported jurisdiction (UAE).
//
// Currently points to Manifund's project search — update to the specific
// project URL once the Atlas project page is published on Manifund.
export const MANIFUND_PROJECT_URL = 'https://manifund.org/';

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
