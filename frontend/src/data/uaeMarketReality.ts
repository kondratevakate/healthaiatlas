// UAE Founder Reality Map — synthesis from research brief Section 6.
//
// Purpose: tell a UAE healthcare-AI founder the system they're walking into.
// The US tab argues "which spoke kills you"; UAE argues "the floor is too low
// for any spoke to matter at venture scale." Five facts, primary-sourced.
//
// Compliance: every entry has a `src` URL. Secondary sources (consultant
// market-size reports, MENA VC trackers) are flagged via `tier: 'secondary'`
// — the UI renders them with a muted `(secondary)` tag so the epistemic
// status is visible to the reader.

export type Confidence = 'official' | 'observed' | 'inference';
export type SourceTier = 'primary' | 'secondary';

// ─── 1. Headline Contrast — US vs UAE on a shared frame ─────────────────

export interface ContrastRow {
  id: string;
  metric: string;
  us: string;
  uae: string;
  ratio: string;
  note?: string;
  src: string;
  tier: SourceTier;
  confidence: Confidence;
}

export const UAE_CONTRAST: ContrastRow[] = [
  {
    id: 'market-size-2024',
    metric: 'Healthcare AI market size, 2024',
    us: '$17.5 bn (NA share, ~44.5% global)',
    uae: '$17–39 m (consultant range)',
    ratio: '~450×',
    note: 'Order-of-magnitude ratio holds across all analyst sources; absolute numbers vary 2× between vendors.',
    src: 'https://www.fortunebusinessinsights.com/industry-reports/artificial-intelligence-in-healthcare-market-100534',
    tier: 'secondary',
    confidence: 'observed',
  },
  {
    id: 'global-share',
    metric: 'Share of global healthcare AI market',
    us: '44.5%',
    uae: '0.1%',
    ratio: '~450×',
    src: 'https://www.grandviewresearch.com/horizon/outlook/ai-in-healthcare-market/uae',
    tier: 'secondary',
    confidence: 'observed',
  },
  {
    id: 'healthtech-vc-2020',
    metric: 'Healthtech VC raised, 2020',
    us: '~$14.1 bn (Rock Health)',
    uae: '$70 m MENA-wide',
    ratio: '~200×',
    note: '69% of MENA 2020 healthcare funding went to two startups — concentration, not depth.',
    src: 'https://magnitt.com/news/altibbi-44m-series-b-53320',
    tier: 'secondary',
    confidence: 'observed',
  },
  {
    id: 'hub71-cohort-15-international',
    metric: 'Flagship accelerator latest cohort, share of foreign-HQ startups',
    us: 'n/a (YC-equivalent metric)',
    uae: '80% non-UAE (Hub71 Cohort 15)',
    ratio: '—',
    note: '17 of 21 startups in Cohort 15 (Sep 2024) were founded in US/UK/France/Germany. Pattern is soft-landing, not launchpad.',
    src: 'https://www.hub71.com/index.php/latest-news/press-release/hub71-welcomes-21-startups-in-15th-cohort-to-abu-dhabi-that-have-raised-over-usd-130-million-in-funding',
    tier: 'primary',
    confidence: 'official',
  },
  {
    id: 'major-contracts-uae-startups',
    metric: 'Major UAE healthcare AI infrastructure contracts won by UAE-founded startups',
    us: '—',
    uae: '0 of 12 documented',
    ratio: '0%',
    note: 'EHR, HIE, AI privacy, AI fraud-detection, Azure migration — all to US/EU vendors (Cerner, Oracle, Epic, InterSystems, Imprivata, Capgemini, GE, Microsoft).',
    src: 'https://dha.gov.ae/en/media/news/970',
    tier: 'primary',
    confidence: 'observed',
  },
  {
    id: 'data-residency-veto',
    metric: 'Data-residency veto on global cloud training (Federal Law No. 2 of 2019 + PDPL 2021)',
    us: 'Does not exist',
    uae: 'Binding',
    ratio: 'binary',
    note: 'UAE patient data cannot flow to global cloud training infrastructure without per-case authority approval. US-trained competitors can deploy in UAE under telemedicine/research exceptions; UAE-founded startups cannot benefit from US-style data scaling.',
    src: 'https://u.ae/en/about-the-uae/digital-uae/data/data-protection-laws',
    tier: 'primary',
    confidence: 'official',
  },
];

// ─── 2. Procurement reality — 12 contracts, 0 to UAE-founded vendors ────

export interface ProcurementContract {
  id: string;
  customer: string;
  product: string;
  vendor: string;
  vendorHq: string;
  year: number;
  src: string;
  tier: SourceTier;
}

export const UAE_PROCUREMENT: ProcurementContract[] = [
  {
    id: 'mohap-cerner',
    customer: 'MOHAP / Northern Emirates public hospitals',
    product: 'EHR',
    vendor: 'Cerner (now Oracle Health)',
    vendorHq: 'US',
    year: 2010,
    src: 'https://www.healthcareitnews.com/news/intersystems-epic-land-more-global-business-any-other-ehr-vendors',
    tier: 'secondary',
  },
  {
    id: 'menaa-epic',
    customer: 'Largest private hospital in MENA (~400 beds)',
    product: 'EHR',
    vendor: 'Epic',
    vendorHq: 'US',
    year: 2018,
    src: 'https://www.healthcareitnews.com/news/intersystems-epic-land-more-global-business-any-other-ehr-vendors',
    tier: 'secondary',
  },
  {
    id: 'malaffi-intersystems',
    customer: 'Malaffi (Abu Dhabi HIE)',
    product: 'HIE platform — HealthShare',
    vendor: 'InterSystems',
    vendorHq: 'US',
    year: 2019,
    src: 'https://www.healthcareitnews.com/news/intersystems-epic-land-more-global-business-any-other-ehr-vendors',
    tier: 'secondary',
  },
  {
    id: 'nabidh-launch',
    customer: 'DHA / NABIDH approved EMRs',
    product: 'EMR integration (Cerner, Epic, InterSystems TrakCare, HealthConnect)',
    vendor: 'Cerner / Epic / InterSystems / HealthConnect',
    vendorHq: 'US (3 of 4)',
    year: 2020,
    src: 'https://dha.gov.ae/en/media/news/970',
    tier: 'primary',
  },
  {
    id: 'nabidh-kyndryl',
    customer: 'DHA / NABIDH',
    product: 'Managed infrastructure',
    vendor: 'Kyndryl',
    vendorHq: 'US (IBM spinoff)',
    year: 2024,
    src: 'https://dha.gov.ae/en/media/news/970',
    tier: 'secondary',
  },
  {
    id: 'nabidh-imprivata',
    customer: 'DHA / NABIDH',
    product: 'AI Patient Privacy Intelligence module',
    vendor: 'Imprivata',
    vendorHq: 'US',
    year: 2025,
    src: 'https://dha.gov.ae/en/media/news/970',
    tier: 'primary',
  },
  {
    id: 'doh-capgemini',
    customer: 'DOH-AD',
    product: 'AI anomaly detection / fraud + workflow',
    vendor: 'Capgemini',
    vendorHq: 'France',
    year: 2025,
    src: 'https://www.doh.gov.ae/en/news/doh-signs-three-strategic-mous-to-advance-ai-and-innovation-in-healthcare',
    tier: 'primary',
  },
  {
    id: 'cca-oracle-g42',
    customer: 'Cleveland Clinic Abu Dhabi + G42',
    product: 'Global AI healthcare delivery platform',
    vendor: 'Oracle',
    vendorHq: 'US',
    year: 2025,
    src: 'https://www.doh.gov.ae/en/news/doh-signs-three-strategic-mous-to-advance-ai-and-innovation-in-healthcare',
    tier: 'secondary',
  },
  {
    id: 'm42-ge',
    customer: 'M42',
    product: 'AI diagnostics partnership',
    vendor: 'GE HealthCare',
    vendorHq: 'US',
    year: 2025,
    src: 'https://investor.gehealthcare.com/news-releases',
    tier: 'secondary',
  },
  {
    id: 'dha-agfa',
    customer: 'DHA',
    product: 'Chest X-ray TB AI screening',
    vendor: 'Agfa Healthcare',
    vendorHq: 'Belgium',
    year: 2018,
    src: 'https://dha.gov.ae/en/media/news/968',
    tier: 'secondary',
  },
  {
    id: 'g42-microsoft',
    customer: 'G42',
    product: '$1.5 bn investment + Azure migration commitment',
    vendor: 'Microsoft',
    vendorHq: 'US',
    year: 2024,
    src: 'https://news.microsoft.com/2024/04/15/microsoft-invests-1-5-billion-in-abu-dhabis-g42-to-accelerate-ai-development-and-global-expansion/',
    tier: 'primary',
  },
  {
    id: 'intersystems-uae-group',
    customer: 'Small UAE hospital group',
    product: 'EHR',
    vendor: 'InterSystems',
    vendorHq: 'US',
    year: 2020,
    src: 'https://www.healthcareitnews.com/news/intersystems-epic-land-more-global-business-any-other-ehr-vendors',
    tier: 'secondary',
  },
];

// ─── 3. Accelerator inventory — 6 programs, the soft-landing pattern ────

export interface AcceleratorProgram {
  id: string;
  name: string;
  owner: string;
  since: number;
  oneLiner: string;
  graduates?: string;
  pattern: 'soft-landing' | 'launchpad' | 'research' | 'sovereign-grant' | 'sandbox';
  src: string;
  tier: SourceTier;
  confidence: Confidence;
}

export const UAE_ACCELERATORS: AcceleratorProgram[] = [
  {
    id: 'hub71',
    name: 'Hub71',
    owner: 'Mubadala / Abu Dhabi Government',
    since: 2019,
    oneLiner: 'Soft-landing for international startups, not UAE-founded launchpad. Cohort 15 (Sep 2024): 80% non-UAE; 17 of 21 founded in US/UK/France/Germany.',
    graduates: '~243–300 startups across 15+ cohorts; AED 9 bn (~$2.45 bn) raised — mostly pre-Hub71 funding for international relocators.',
    pattern: 'soft-landing',
    src: 'https://www.hub71.com/index.php/latest-news/press-release/hub71-welcomes-21-startups-in-15th-cohort-to-abu-dhabi-that-have-raised-over-usd-130-million-in-funding',
    tier: 'primary',
    confidence: 'official',
  },
  {
    id: 'plug-and-play-adgm',
    name: 'Plug and Play ADGM',
    owner: 'Plug and Play (Silicon Valley) + ADGM',
    since: 2018,
    oneLiner: 'Procurement matchmaking — connects international startups to UAE corporate partners (DOH, Daman, Etisalat, Philips). First MENA healthtech accelerator (track launched 2019).',
    graduates: 'First full healthtech cohort (2020): contacted 120+ startups, accelerated 8. Stated 2-year target was 24–36 global health startups landed in Abu Dhabi.',
    pattern: 'soft-landing',
    src: 'https://www.prnewswire.com/news-releases/department-of-health-partners-with-plug-and-play-to-support-healthcare-startups-300934493.html',
    tier: 'primary',
    confidence: 'official',
  },
  {
    id: 'startad-healthx',
    name: 'startAD HealthX',
    owner: 'NYU Abu Dhabi + DOH-AD',
    since: 2024,
    oneLiner: 'Research-translational, not venture-driven. Strongest concentration of genuinely AI-native cohort companies of any UAE program. Too new to assess outcomes.',
    graduates: 'Cohort 2 (Nov 2025): BioTwin, Corealis, Mashyah, MelanoTech Labs, Astrek, GenEmbryomics, Qritive, Pioneera Bio — none yet in disclosed Series A.',
    pattern: 'research',
    src: 'https://www.doh.gov.ae/en/news/startad-and-doh-launch-healthx-to-advance-abu-dhabi-as-global-biotech-and-life-sciences-hub',
    tier: 'primary',
    confidence: 'official',
  },
  {
    id: 'dha-health-data-sandbox',
    name: 'DHA Health Data Sandbox',
    owner: 'DHA + Dubai Health + DFF + Digital Dubai',
    since: 2023,
    oneLiner: 'Access to de-identified NABIDH data + DHA regulatory sandbox engagement. Marketing exists; published graduate cohort does not.',
    graduates: 'Status: open for applications. Zero publicly disclosed graduates, zero published alumni list, zero deployment cases.',
    pattern: 'sandbox',
    src: 'https://prod.sandboxdubai.gov.ae/health-data-sandbox',
    tier: 'primary',
    confidence: 'inference',
  },
  {
    id: 'adio-helm',
    name: 'ADIO HELM Cluster',
    owner: 'Abu Dhabi Investment Office',
    since: 2019,
    oneLiner: 'Sovereign LP/grantor for life-sciences relocations and expansions. Investment incentive frame, not cohort accelerator. Founding partner of Hub71+ Life Sciences (Oct 2025).',
    graduates: 'Investments published individually (e.g. Anjal Z early-childhood AED 15m). HELM-specific company list not centralised.',
    pattern: 'sovereign-grant',
    src: 'https://www.hub71.com/latest-news/press-release/abu-dhabi-launches-hub71-plus-life-sciences-to-accelerate-innovation-in-biotech-medtech-and-digital-health',
    tier: 'primary',
    confidence: 'observed',
  },
  {
    id: 'mbzuai',
    name: 'MBZUAI',
    owner: 'Government of Abu Dhabi (graduate research university)',
    since: 2020,
    oneLiner: 'Research-pull arm. Equivalent to Stanford/MIT in role, not Y Combinator. Talent pipeline + DOH-AD AI/multiomics partnership (Oct 2025).',
    graduates: 'Spinout count and IP commercialisation pipeline not publicly aggregated. Counter-evidence to the "no UAE-founded health AI startups" thesis would live here if it exists.',
    pattern: 'research',
    src: 'https://www.doh.gov.ae/en/news/doh-signs-three-strategic-mous-to-advance-ai-and-innovation-in-healthcare',
    tier: 'primary',
    confidence: 'observed',
  },
];

// ─── 4. Founder Takeaways — 5 synthesised diagnostics ────────────────────

export interface FounderTakeaway {
  id: string;
  title: string;
  body: string;
}

export const UAE_FOUNDER_TAKEAWAYS: FounderTakeaway[] = [
  {
    id: 'tam-too-small',
    title: 'UAE-only TAM is structurally non-VC-fundable',
    body: 'UAE healthcare AI is $39m in 2024 and projected $338m by 2033. Even capturing 20% market share at peak is a $70m revenue ceiling — a small cash-flow business, not a venture-scale outcome.',
  },
  {
    id: 'pilots-not-production',
    title: 'Pilot grants are real; production contracts are not',
    body: 'UAE government and corporate buyers fund pilots in the AED 200k–1m range (Hub71 SAFE, DHA Sandbox access, ADIO HELM grants, DOH-AD pilot opportunities). The same buyers route 7- and 8-figure production contracts exclusively to US/European vendors.',
  },
  {
    id: 'accelerator-soft-landing',
    title: 'Accelerators are soft-landings, not launchpads',
    body: 'Hub71 Cohort 15 is the cleanest evidence: 80% international, 17 of 21 founded in US/UK/France/Germany. The "Hub71 success" framing is about Abu Dhabi attracting foreign companies, not producing global scaleups. A UAE-founded startup looking for a launchpad is using the wrong instrument.',
  },
  {
    id: 'capital-is-sovereign',
    title: 'The capital concentration is sovereign, not venture',
    body: '$1.5 bn (Microsoft → G42) and $986 m (PureHealth IPO) are the headline UAE healthcare AI numbers in the last two years — both via sovereign vehicles. MENA-wide healthtech VC for 2024 is under $200 m total. There is no UAE Series A market for healthcare AI in any meaningful sense.',
  },
  {
    id: 'data-residency-cuts-locally',
    title: 'The data-residency veto compounds the problem',
    body: 'UAE patient data cannot flow to global cloud training without per-case authority approval. US-trained competitors can deploy in UAE under telemedicine/research exceptions; UAE-founded startups cannot benefit from US-style data scaling. The regulation cuts against local startups specifically.',
  },
];
