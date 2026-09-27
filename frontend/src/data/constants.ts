// Global constants for the Verifiable Claims Directory

// Public Airtable form — used for all "suggest entry / correction" CTAs.
// Avoids exposing a personal mailto: in HTML hrefs and keeps submissions in
// one place. Same form covers entries and corrections; submitter picks intent.
export const SUGGEST_ENTRY_URL = 'https://airtable.com/shrkedcsqRIdT60o3';
export const SUGGEST_CORRECTION_URL = 'https://airtable.com/shrkedcsqRIdT60o3';

// Atlas Notes — editorial companion newsletter on LinkedIn.
// The directory (this site) holds structured, cited records.
// Atlas Notes holds the long-form analysis and author voice that ties them together.
export const ATLAS_NOTES_SUBSCRIBE_URL =
  'https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7451945270583390208';

// Zero-Trust canonical store — the Airtable base where every player /
// claim / source row is verified and held. The frontend TS data files
// are derived from this base via scripts/zerotrust/from_airtable.py.
// Linking out from country / domain pages gives readers direct access
// to the primary-evidence provenance layer (every row carries a `src`
// URL on the issuer's domain plus a `verifiedAt` stamp).
//
// Currently points to the base homepage; if a public shared view is
// later published, swap this URL for the view URL.
export const AIRTABLE_PROVENANCE_URL = 'https://airtable.com/appiYen6pEW5tSVrn';

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
