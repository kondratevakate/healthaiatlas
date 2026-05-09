// Comparative Matrix — US / EU / Switzerland / UAE side-by-side.
//
// Source: EU + Switzerland research brief Section 7.8 ("Visual contrast across
// all four tabs"). Founder-relevant compare numbers that change between tabs.
//
// Compliance: every row has at least one src URL. Where the cell is a
// composite of multiple primary sources, the most authoritative one is cited;
// individual region tabs have the full source breakdown.

import type { SourceTier } from './euMarketReality';

export type Region = 'us' | 'eu' | 'ch' | 'uae' | 'uk';

export interface CompareCell {
  text: string;          // human-readable cell content
  ratio?: string;        // optional small "vs US" annotation, e.g. "0.2×"
}

export interface CompareRow {
  id: string;
  metric: string;
  intent: string;        // one-line "what this row tells the founder"
  values: Record<Region, CompareCell>;
  src: string;           // primary source for the canonical claim
  tier: SourceTier;
}

export const REGION_LABELS: Record<Region, string> = {
  us: 'US',
  eu: 'EU',
  ch: 'Switzerland',
  uae: 'UAE',
  uk: 'UK',
};

export const REGION_FLAGS: Record<Region, string> = {
  us: '🇺🇸',
  eu: '🇪🇺',
  ch: '🇨🇭',
  uae: '🇦🇪',
  uk: '🇬🇧',
};

export const REGION_ACCENTS: Record<Region, string> = {
  us: 'hsl(14 90% 55%)',     // coral (matches US "We are here" stamp)
  eu: 'hsl(220 70% 50%)',    // EU blue
  ch: 'hsl(0 75% 45%)',      // Swiss red (matches SwissAnimal panel)
  uae: 'hsl(155 50% 38%)',   // UAE green
  uk: 'hsl(220 80% 35%)',    // UK navy (deeper than EU blue, distinct from Swiss red)
};

export const COMPARE_ROWS: CompareRow[] = [
  {
    id: 'market-size',
    metric: 'Healthcare AI market size, 2024–2025',
    intent: 'The denominator before any other decision. Order-of-magnitude only — analyst estimates vary 2× between vendors.',
    values: {
      us: { text: '~$17.5 bn (NA share, ~44.5% global)', ratio: '1×' },
      eu: { text: '~$5–8 bn (estimated)', ratio: '~0.3–0.5×' },
      ch: { text: '~$200–400 m (estimated)', ratio: '~0.02×' },
      uae: { text: '$17–39 m (consultant range)', ratio: '~0.002×' },
      uk: { text: '~$2–4 bn estimated; Q3 2025 $409m UK-only', ratio: '~0.15×' },
    },
    src: 'https://www.fortunebusinessinsights.com/industry-reports/artificial-intelligence-in-healthcare-market-100534',
    tier: 'secondary',
  },
  {
    id: 'digital-health-vc',
    metric: 'Digital-health VC raised (annual)',
    intent: 'Venture-capital availability sets the burn-rate ceiling. Same order of magnitude vs US is fundable; an order of magnitude smaller is not.',
    values: {
      us: { text: '~$10–14 bn (Rock Health)', ratio: '1×' },
      eu: { text: '~$3–4 bn across ~200+ deals (Galen Growth)', ratio: '~0.3×' },
      ch: { text: '~$200–500 m (estimated)', ratio: '~0.03×' },
      uae: { text: '<$50 m UAE-only; <$200 m MENA-wide', ratio: '~0.01×' },
      uk: { text: '~$1–1.5 bn/yr UK run-rate; $409m Q3 2025 alone', ratio: '~0.1×' },
    },
    src: 'https://rockhealth.com/insights/',
    tier: 'secondary',
  },
  {
    id: 'reg-layers',
    metric: 'Major regulatory layers a healthcare-AI startup must navigate',
    intent: 'Every additional layer adds review time, evidence demand, and lawyer cost. EU has the most; UAE has overlapping authorities; Switzerland is institutionally separate from EU.',
    values: {
      us: { text: 'FDA + CMS + AMA/CPT + payers', ratio: '4 layers' },
      eu: { text: 'EMA/EC + AI Act + EHDS + HTAR + MDR/IVDR + national HTA', ratio: '6 layers' },
      ch: { text: 'Swissmedic + FOPH + Health2030 (separate from EU)', ratio: '3 layers, parallel' },
      uae: { text: 'MOHAP + DOH-AD + DHA + PDPL + Federal Law 2/2019', ratio: '5 layers, fragmented' },
      uk: { text: 'MHRA + NICE + NHS DTAC + ICB-level + four-nation', ratio: '5 layers, four-nation' },
    },
    src: 'https://health.ec.europa.eu/ehealth-digital-health-and-care/artificial-intelligence-healthcare_en',
    tier: 'primary',
  },
  {
    id: 'payer-architecture',
    metric: 'Payer architecture',
    intent: 'Single-payer vs fragmented changes who you actually sell to. Fragmented = many separate go-to-market motions per region/plan/country.',
    values: {
      us: { text: 'Fragmented (CMS + commercial + Medicare Advantage + PBMs)', ratio: '—' },
      eu: { text: 'Fragmented (27 national systems)', ratio: '—' },
      ch: { text: 'National (federal + cantonal)', ratio: '—' },
      uae: { text: 'Fragmented (Daman, Thiqa, Dubai Mandatory, private)', ratio: '—' },
      uk: { text: 'NHS dominant + four-nation (England/Scotland/Wales/NI) + 42 ICBs', ratio: '—' },
    },
    src: 'https://www.kff.org/medicare/issue-brief/medicare-advantage-in-2024-enrollment-update-and-key-trends/',
    tier: 'secondary',
  },
  {
    id: 'local-procurement',
    metric: 'Production-scale procurement won by local healthcare-AI startups',
    intent: 'Where do the actual 7- and 8-figure contracts go? If they always flow to non-local vendors, sovereign-pilot grants are not a sustainable revenue path for local startups.',
    values: {
      us: { text: 'Many — broad domestic vendor base', ratio: 'high' },
      eu: { text: 'Few (mostly via consolidation/exit — RadNet rolled up Aidence/Quantib/Kheiron/Gleamer)', ratio: 'medium' },
      ch: { text: 'Very few', ratio: 'low' },
      uae: { text: '0 of 12 documented contracts (Section 6.4)', ratio: 'zero' },
      uk: { text: 'Brainomix 107/107 stroke centres; Annalise 40+ Trusts; Skin Analytics DERM (NICE EVA)', ratio: 'medium-high' },
    },
    src: 'https://deephealth.com/press-releases/radnets-wholly-owned-subsidiary-deephealth-completes-acquisition-of-icad/',
    tier: 'primary',
  },
  {
    id: 'trial-cost',
    metric: 'Clinical-trial cost (relative to US baseline)',
    intent: 'How expensive is evidence generation? CEE is operational arbitrage inside EMA regime, not weaker regulation. Switzerland is the opposite — expensive credibility.',
    values: {
      us: { text: '100% (baseline)', ratio: '1×' },
      eu: { text: 'Western: 60–80%; CEE: 50–70%', ratio: '0.5–0.8×' },
      ch: { text: '90–110% (high)', ratio: '~1×' },
      uae: { text: 'limited trial market', ratio: 'n/a' },
      uk: { text: 'NHS sites comparable to Western EU', ratio: '~0.7–0.9×' },
    },
    src: 'https://www.sofpromed.com/ultimate-guide-clinical-trial-costs',
    tier: 'secondary',
  },
  {
    id: 'green-lane',
    metric: 'Strongest AI-health lane for founders (where founders actually win)',
    intent: 'Different markets reward different product shapes. The US "workflow SaaS" thesis does not transfer to EU; the EU "pharma-AI" thesis does not transfer to UAE.',
    values: {
      us: { text: 'Workflow + EHR-integrated SaaS + radiology AI (Abridge/Nuance/Viz.ai/HeartFlow pattern)' },
      eu: { text: 'Pharma AI, drug discovery, oncology imaging, neurodegeneration, RWE (Isomorphic/InstaDeep pattern)' },
      ch: { text: 'Pharma partnership, ATMP, neurodegeneration biomarkers (Roche/Novartis BD)' },
      uae: { text: 'Soft-landing for foreign companies (Hub71 pattern); UAE-founded scaleups not yet observed' },
      uk: { text: 'Drug discovery (Isomorphic/BenevolentAI legacy/Healx) + NHS workflow (Cera) + diagnostic imaging (Brainomix/DERM/Annalise)' },
    },
    src: 'https://www.isomorphiclabs.com/articles/isomorphic-labs-announces-600m-external-investment-round',
    tier: 'primary',
  },
  {
    id: 'realistic-exit',
    metric: 'Realistic exit channel',
    intent: 'IPO-vs-acquisition determines which capital structure the company can sustain. If the realistic exit is a $50M strategic buyout, a $1B+ valuation round is a trap.',
    values: {
      us: { text: 'IPO + strategic acquisition (Tempus IPO 2024 + Microsoft-Nuance $19.7bn template)' },
      eu: { text: 'Strategic acquisition (pharma + medtech), rare IPO' },
      ch: { text: 'Strategic acquisition (Roche / Novartis BD)' },
      uae: { text: 'Acquisition by sovereign-aligned operator (rare)' },
      uk: { text: 'Acquisition by US/global (Recursion–Exscientia template); IPO closed post-Babylon/BenevolentAI delist' },
    },
    src: 'https://news.microsoft.com/source/2022/03/04/microsoft-completes-acquisition-of-nuance-ushering-in-new-era-of-outcomes-based-ai/',
    tier: 'primary',
  },
];

// One-line headline diagnostics per region — what the page argues.
export const REGION_HEADLINE: Record<Region, string> = {
  us: 'Which spoke kills you. The four-way collision is the page; pharma-pull and pathway choice (NCD-CED / NTAP / TCET / Cat I CPT) are the levers.',
  eu: 'The regulatory grammar is the moat AND the wall. Pharma-AI is the green lane; generic radiology AI is being consolidated.',
  ch: 'Expensive credibility, not cheap evidence. Use for pharma BD + ATMP + neurodegeneration; do not use for first-launch volume.',
  uae: 'The floor is too low for venture scale. Pilots are real; production contracts are not.',
  uk: 'Three layers (MHRA / NICE / NHS) on different timelines. NHS as buyer is real but four-nation. IPO route closed post-Babylon/BenevolentAI delist (Mar 2025).',
};
