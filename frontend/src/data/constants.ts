// Global constants for the Verifiable Claims Directory

// Primary contact channel. Every "suggest entry / correction / get in touch"
// CTA points here. The Airtable form that used to collect submissions was
// closed in October 2026; airtable-links.test.ts keeps dead links out.
export const CONTACT_LINKEDIN_URL = 'https://www.linkedin.com/in/kondratevakate/';
export const SUGGEST_ENTRY_URL = CONTACT_LINKEDIN_URL;
export const SUGGEST_CORRECTION_URL = CONTACT_LINKEDIN_URL;

// Atlas Notes — editorial companion newsletter on LinkedIn.
// The directory (this site) holds structured, cited records.
// Atlas Notes holds the long-form analysis and author voice that ties them together.
export const ATLAS_NOTES_SUBSCRIBE_URL =
  'https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7451945270583390208';


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
  biosecurity: '2026-09-13',
  // Last commit that changed the underlying data file — bump when the
  // listing is re-verified, not when UI code around it changes.
  jobs: '2026-05-26',
  'open-calls': '2026-09-13',
};

// Fixed ordering for cross-hub navigation ("See also" strips).
export const HUB_DOMAIN_IDS = [
  'oncology',
  'process-mining',
  'medical-tourism',
  'ai-life-sciences',
  'biosecurity',
] as const;
