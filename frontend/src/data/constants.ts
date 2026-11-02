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

// ── Una chat intake (roadmap F0) ────────────────────────────────────────────
// The intake talks to a Cloudflare Worker that holds the model key and the
// abuse caps. The URL is PUBLIC on purpose: the browser calls it directly, so
// it ships in the bundle. No key, token or secret of any kind may ever live
// here, in a VITE_ variable, or anywhere else in frontend code — the worker is
// the only place credentials are allowed to exist.
// VITE_UNA_CHAT_ENDPOINT exists purely to point a build at another deployment
// of the same worker; it holds a URL, never a credential.
export const UNA_CHAT_ENDPOINT =
  (import.meta.env.VITE_UNA_CHAT_ENDPOINT as string | undefined) ??
  'https://insights-proxy.kondratevakate.workers.dev/';

// Client-side mirrors of the worker's caps. They are UX limits, not security
// limits — the worker enforces the real ones.
export const UNA_CHAT_MAX_CHARS = 1500; // worker rejects longer messages
export const UNA_CHAT_MAX_TURNS = 6; // worker allows 6 turns + 1 assessment
export const UNA_CHAT_MAX_MESSAGES = 12; // worker reads at most 12 messages
export const UNA_CHAT_TIMEOUT_MS = 45_000; // abort a hung request, never hang the UI


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
