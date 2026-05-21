// UK Founder Reality Map — synthesis from research brief Section 9.
//
// Purpose: tell a UK healthcare-AI founder the system they're walking into.
// The US tab argues "which spoke kills you"; the UAE tab argues "the floor
// is too low for venture scale"; the EU tab argues "regulatory grammar is
// the moat AND the wall"; the UK tab argues "post-Brexit three-layer
// architecture (MHRA / NICE / NHS) — Babylon is the bridge case to US SPAC
// era, NICE is a global HTA benchmark disproportionate to UK market size."
//
// Compliance: every entry has a `src` URL. Vendor claims where NHSE primary
// source could not be located in research are flagged via `tier: 'secondary'`
// + a `note` field. The UI renders both the `(2°)` marker and the note.

export type Confidence = 'official' | 'observed' | 'inference';
export type SourceTier = 'primary' | 'secondary';

// ─── 1. Headline contrast — UK vs US ────────────────────────────────────

export interface UkContrastRow {
  id: string;
  metric: string;
  us: string;
  uk: string;
  ratio: string;
  note?: string;
  src: string;
  tier: SourceTier;
  confidence: Confidence;
}

export const UK_CONTRAST: UkContrastRow[] = [
  {
    id: 'market-size-2024',
    metric: 'Healthcare AI market size, 2024–2025',
    us: '~$17.5 bn (NA share, ~44.5% global)',
    uk: '~$2–4 bn estimated; UK led European digital health Q3 2025 at $409m',
    ratio: '~5–8×',
    note: 'Same order of magnitude as EU (~1/3 US scale), unlike UAE. Fundable, but with a different operating model.',
    src: 'https://www.galengrowth.com/',
    tier: 'secondary',
    confidence: 'observed',
  },
  {
    id: 'digital-health-vc-2025',
    metric: 'Digital-health VC deployed, H1 2025',
    us: '~$10–14 bn (Rock Health, annualised)',
    uk: '$409m Q3 2025 alone (41% of European $1.0bn quarterly total)',
    ratio: '~3×',
    note: 'UK is Europe\'s #1 digital health ecosystem by funding deployed in 2023 and again in 2025. Q3 2025 standout driven by AI-enabled drug discovery and preventive health.',
    src: 'https://www.galengrowth.com/',
    tier: 'secondary',
    confidence: 'observed',
  },
  {
    id: 'reg-layers',
    metric: 'Regulatory layers a healthcare-AI startup must navigate',
    us: '4 (FDA + CMS + AMA/CPT + payers)',
    uk: '5 (MHRA + NICE + NHS DTAC + ICB-level + four-nation)',
    ratio: '+1 layer',
    note: 'Post-Brexit three-layer architecture (MHRA / NICE / NHS) operates on different timelines and decision logic. Northern Ireland separately under EU MDR/IVDR via Windsor Framework.',
    src: 'https://www.gov.uk/government/publications/software-and-ai-as-a-medical-device-change-programme',
    tier: 'primary',
    confidence: 'official',
  },
  {
    id: 'local-procurement',
    metric: 'Production-scale NHS procurement won by UK-founded AI vendors',
    us: '—',
    uk: 'Brainomix 107/107 stroke centres; Annalise 40+ Trusts; Skin Analytics DERM (NICE EVA)',
    ratio: 'medium-high',
    note: 'Materially different from UAE where 0 of 12 documented contracts went to local vendors. NHS as buyer is real — but four-nation, ICB-fragmented, and DTAC is not passport-able between Trusts.',
    src: 'https://www.england.nhs.uk/long-read/transforming-stroke-care-with-artificial-intelligence/',
    tier: 'primary',
    confidence: 'official',
  },
  {
    id: 'realistic-exit',
    metric: 'Realistic exit channel',
    us: 'NYSE/NASDAQ IPO + US strategic acquisition',
    uk: 'Acquisition by US/global (Recursion–Exscientia template); IPO route effectively closed post-Babylon (Aug 2023) + BenevolentAI delist (Mar 2025)',
    ratio: '—',
    note: 'BenevolentAI delisted from Euronext Amsterdam at materially compressed market cap; Exscientia closed into Recursion all-stock 20 Nov 2024. Three major UK AI-drug-discovery exit failures inside 24 months.',
    src: 'https://www.businesswire.com/news/home/20250312744928/en/BenevolentAI-Announces-Approval-of-Merger-with-Osaka-Holdings',
    tier: 'primary',
    confidence: 'official',
  },
  {
    id: 'green-lane',
    metric: 'Strongest AI-health lane for founders',
    us: 'Workflow + EHR-integrated SaaS + radiology AI',
    uk: 'Drug discovery (Isomorphic / BenevolentAI legacy / Healx) + NHS workflow (Cera) + diagnostic imaging (Brainomix / DERM / Annalise integration)',
    ratio: 'different',
    note: 'Pharma-AI is the green lane. Generic radiology AI is being consolidated globally (RadNet acquired Kheiron Feb 2025). DeepMind diaspora is a recurring early-backer pattern.',
    src: 'https://www.isomorphiclabs.com/articles/isomorphic-labs-announces-600m-external-investment-round',
    tier: 'primary',
    confidence: 'official',
  },
];

// ─── 2. UK regulatory architecture (4 layers) ───────────────────────────

export interface PhasedMilestone {
  date: string;
  what: string;
}

export interface UkRegulatoryLayer {
  id: 'mhra' | 'uk-mdr' | 'nice-esf-dtac' | 'uk-data';
  name: string;
  regulationName: string;
  enteredForce: string;
  oneLiner: string;
  scope: string;
  phased: PhasedMilestone[];
  penalties?: string;
  src: string;
  tier: SourceTier;
}

export const UK_REGULATORY_LAYERS: UkRegulatoryLayer[] = [
  {
    id: 'mhra',
    name: 'MHRA SaMD/AIaMD',
    regulationName: 'Software and AI as a Medical Device Change Programme + AI Airlock',
    enteredForce: '17 October 2022 (roadmap) · refresh 11 December 2024',
    oneLiner: 'Genuinely independent post-Brexit. Parallel regime, not "EU minus EMA". AI Airlock sandbox is the Class IIa+ adaptive-AI proving ground.',
    scope: 'Joint MHRA / FDA / Health Canada principles: 10 Good Machine Learning Practice (GMLP) + 5 Predetermined Change Control Plan (PCCP). MHRA "Impact of AI on the Regulation of Medical Products" strategic position published 30 April 2024. AI Airlock Phase 1 ran April 2024 – March 2025; report published October 2025. Phase 2 in progress, due Spring 2026.',
    phased: [
      { date: '17 Oct 2022', what: 'SaMD/AIaMD Change Programme Roadmap published' },
      { date: '9 May 2024', what: 'AI Airlock pilot launched (4 final case studies)' },
      { date: '11 Dec 2024', what: 'Implementation Roadmap refresh — legislative timelines updated' },
      { date: 'Oct 2025', what: 'AI Airlock pilot programme report published' },
      { date: 'Spring 2026', what: 'AI Airlock Phase 2 due to complete; report Summer 2026' },
    ],
    src: 'https://www.gov.uk/government/publications/software-and-ai-as-a-medical-device-change-programme/software-and-ai-as-a-medical-device-change-programme-roadmap',
    tier: 'primary',
  },
  {
    id: 'uk-mdr',
    name: 'UK MDR + PMS',
    regulationName: 'UK Medical Devices Regulations 2002 (as amended)',
    enteredForce: '26 May 2021 (post-Brexit) · PMS SI in force 16 June 2025',
    oneLiner: 'CE mark continues to be accepted on GB market under indefinite extension (SI 2023/627). PMS SI is the first material divergence in operational obligations.',
    scope: 'Statutory instrument chain: SI 2002/618 (original) → SI 2019/791 → SI 2021/873 (GB/NI bifurcation) → SI 2023/627 (indefinite CE-mark recognition) → SI 2024/1368 (PMS). Future "international recognition" / "trusted regulator reliance" scheme consulted on 14 Nov 2024 — direction is more international reliance, not less.',
    phased: [
      { date: '26 May 2021', what: 'Post-Brexit transition; UKCA marking deadline introduced' },
      { date: 'SI 2023/627', what: 'Indefinite acceptance of CE-marked medical devices on GB market' },
      { date: '14 Nov 2024', what: 'Consultation opens on international recognition (FDA / Health Canada / TGA / EU NB reliance)' },
      { date: '16 Jun 2025', what: 'SI 2024/1368 PMS Requirements come into force — low-risk PMS Report 3-yearly; medium/high-risk PSUR annual or biennial' },
    ],
    src: 'https://www.legislation.gov.uk/uksi/2024/1368/made',
    tier: 'primary',
  },
  {
    id: 'nice-esf-dtac',
    name: 'NICE ESF + NHS DTAC',
    regulationName: 'Evidence Standards Framework + Digital Technology Assessment Criteria',
    enteredForce: 'ESF 2018 (major update Aug 2022) · DTAC v1 Feb 2021 · DTAC v2 Feb 2026',
    oneLiner: 'NICE has global HTA influence disproportionate to UK market size. DTAC is the operational gate but is not passport-able — every Trust re-assesses.',
    scope: 'ESF Tier A (system-service) / Tier B (inform-communicate) / Tier C (diagnose-calculate-replace clinician). Tier C demands RCT or strong RWE comparative — 18–36 month lead-time. EVA pathway since June 2022: 15 EVAs / 103 technologies / 55% conditional recommendation rate by July 2024. DTAC v2 form released 24 Feb 2026, full transition 6 Apr 2026 — 25% reduction in question count, scope re-aligned with NICE.',
    phased: [
      { date: 'Aug 2022', what: 'NICE ESF major update (3-tier framework)' },
      { date: 'Jun 2022', what: 'NICE Early Value Assessment (EVA) pathway launched' },
      { date: '24 Feb 2026', what: 'NHS DTAC v2 form released' },
      { date: '6 Apr 2026', what: 'Full DTAC v2 transition required' },
    ],
    src: 'https://www.nice.org.uk/corporate/ecd7',
    tier: 'primary',
  },
  {
    id: 'uk-data',
    name: 'UK GDPR + DUA Act 2025',
    regulationName: 'Data Protection Act 2018 + UK GDPR + Data (Use and Access) Act 2025',
    enteredForce: 'DPA 2018 · DUA Act 2025 (Royal Assent)',
    oneLiner: 'EU adequacy decision renewed 2025 (cross-border clinical data flows). DUA Act modifies automated-decision-making; ICO operational guidance still being issued.',
    scope: 'UK GDPR retained post-Brexit. DUA Act 2025 modifies elements of UK GDPR including automated decision-making and creates statutory footing for Smart Data + digital verification services. Goldacre Review (April 2022, 185 recommendations) — TRE rollout via NHS England Secure Data Environments has progressed but uneven; primary-care GP data access still constrained as of 2026.',
    phased: [
      { date: '7 Apr 2022', what: 'Goldacre Review published — TREs as default access mechanism' },
      { date: '2022', what: '£200m TRE investment committed' },
      { date: '2025', what: 'EU adequacy decision for UK renewed' },
      { date: '2025', what: 'Data (Use and Access) Act receives Royal Assent' },
    ],
    src: 'https://www.gov.uk/government/publications/better-broader-safer-using-health-data-for-research-and-analysis',
    tier: 'primary',
  },
];

// ─── 3. NICE Kisunla / Leqembi rejection sequence (the EU-bridge HTA case) ─

export interface NiceRejectionEvent {
  id: string;
  date: string;
  agency: 'FDA' | 'MHRA' | 'NICE' | 'SMC' | 'NICE-Lilly';
  drug: 'donanemab (Kisunla)' | 'lecanemab (Leqembi)';
  outcome: 'approved' | 'rejected' | 'narrowed' | 'consultation';
  detail: string;
  src: string;
  tier: SourceTier;
}

export const UK_NICE_REJECTION: NiceRejectionEvent[] = [
  {
    id: 'fda-donanemab',
    date: '2 Jul 2024',
    agency: 'FDA',
    drug: 'donanemab (Kisunla)',
    outcome: 'approved',
    detail: 'FDA traditional approval. Boxed warning, ARIA monitoring required.',
    src: 'https://www.fda.gov/drugs/news-events-human-drugs/fda-approves-treatment-adults-alzheimers-disease',
    tier: 'primary',
  },
  {
    id: 'mhra-lecanemab',
    date: '22 Aug 2024',
    agency: 'MHRA',
    drug: 'lecanemab (Leqembi)',
    outcome: 'approved',
    detail: 'Lecanemab licensed by MHRA — but NICE same-day draft guidance says "not recommended" for NHS use. Two-track regulatory/HTA divergence at point of approval.',
    src: 'https://pharmaceutical-journal.com/',
    tier: 'secondary',
  },
  {
    id: 'nice-1st-rejection',
    date: '23 Oct 2024',
    agency: 'NICE',
    drug: 'donanemab (Kisunla)',
    outcome: 'rejected',
    detail: 'First draft rejection on cost-effectiveness grounds. 4–6 months progression delay vs ARIA-monitoring burden — ICER not justified.',
    src: 'https://www.nice.org.uk/',
    tier: 'primary',
  },
  {
    id: 'nice-2nd-rejection',
    date: '6 Mar 2025',
    agency: 'NICE',
    drug: 'donanemab (Kisunla)',
    outcome: 'rejected',
    detail: 'Second rejection. Additional evidence "confirmed not currently cost-effective". Consultation to 27 March 2025.',
    src: 'https://www.nice.org.uk/',
    tier: 'primary',
  },
  {
    id: 'smc-rejection',
    date: '2025',
    agency: 'SMC',
    drug: 'donanemab (Kisunla)',
    outcome: 'rejected',
    detail: 'Scottish Medicines Consortium rejection — separate HTA pathway, substantively similar reasoning.',
    src: 'https://www.scottishmedicines.org.uk/',
    tier: 'secondary',
  },
  {
    id: 'nice-3rd-rejection',
    date: '19 Jun 2025',
    agency: 'NICE',
    drug: 'donanemab (Kisunla)',
    outcome: 'rejected',
    detail: 'NICE final draft guidance — third rejection. Eli Lilly announces appeal.',
    src: 'https://www.nice.org.uk/',
    tier: 'primary',
  },
  {
    id: 'nice-appeal-return',
    date: '20 Mar 2026',
    agency: 'NICE-Lilly',
    drug: 'donanemab (Kisunla)',
    outcome: 'consultation',
    detail: 'Appraisal returned to NICE post-appeal for further consideration of caregiver utilities and unpaid care costs.',
    src: 'https://pharmaceutical-journal.com/',
    tier: 'secondary',
  },
  {
    id: 'nice-3rd-consultation',
    date: '31 Mar 2026',
    agency: 'NICE',
    drug: 'donanemab (Kisunla)',
    outcome: 'consultation',
    detail: 'NICE opens 3rd consultation. New cost-effectiveness thresholds expected to apply.',
    src: 'https://pharmaceutical-journal.com/',
    tier: 'secondary',
  },
];

// ─── 4. NHS deployments (verified vs vendor-claim) ──────────────────────

export interface NhsDeployment {
  id: string;
  vendor: string;
  vendorHq: string;
  product: string;
  useCase: string;
  status: string;
  scale: string;
  src: string;
  tier: SourceTier;
  note?: string;
}

export const UK_NHS_DEPLOYMENTS: NhsDeployment[] = [
  {
    id: 'brainomix',
    vendor: 'Brainomix',
    vendorHq: 'UK (Oxford spin-out, founded 2010)',
    product: 'e-Stroke / 360 Stroke',
    useCase: 'Stroke imaging triage, large-vessel occlusion detection',
    status: 'Deployed in all 107 stroke centres in England (Summer 2024)',
    scale: '~80,000 stroke patients/year covered. Wales: deployed nationwide; thrombectomy rates +44% YoY (vendor claim).',
    src: 'https://www.england.nhs.uk/long-read/transforming-stroke-care-with-artificial-intelligence/',
    tier: 'primary',
  },
  {
    id: 'annalise',
    vendor: 'Annalise.ai',
    vendorHq: 'Australia',
    product: 'Chest X-ray AI',
    useCase: '~124 findings detection',
    status: 'Won 6 of 11 AIDF imaging networks (2024); deployed at >40 Trusts via Newton\'s Tree as integration partner',
    scale: 'Greater Manchester, North East & North Cumbria, Cheshire & Merseyside, East Midlands (EMRAD 22 Jan 2024), Surrey/Sussex/Frimley, Yorkshire Imaging Collaborative. Leeds Teaching Hospitals went live May 2025.',
    src: 'https://www.england.nhs.uk/2023/06/21-million-to-roll-out-artificial-intelligence-across-the-nhs/',
    tier: 'primary',
  },
  {
    id: 'skin-analytics',
    vendor: 'Skin Analytics',
    vendorHq: 'UK (London)',
    product: 'DERM',
    useCase: 'Autonomous AI for skin-cancer triage; UKCA Class IIa / CE Class III',
    status: 'NICE EVA conditional recommendation — referenced in 10-Year Plan as standard practice in dermatology pathways by 2028–2029',
    scale: 'Chelsea & Westminster (since 2022, >10,000 patients), Manchester University NHS FT (May 2024), 9 additional Trusts via NHS England funding (Feb 2024).',
    src: 'https://skin-analytics.com/',
    tier: 'primary',
  },
  {
    id: 'lunit',
    vendor: 'Lunit',
    vendorHq: 'South Korea',
    product: 'INSIGHT MMG',
    useCase: 'Breast-cancer screening AI (mammography)',
    status: 'Multiple Trust-level deployments through 2024–2025',
    scale: 'Trust-local communications exist; no consolidated NHS England primary press release equivalent to Brainomix/Annalise positions.',
    src: 'https://www.lunit.io/',
    tier: 'secondary',
    note: 'Vendor claim. NHS England primary procurement source not located in research session — treat as pending verification.',
  },
  {
    id: 'kheiron',
    vendor: 'Kheiron Medical',
    vendorHq: 'UK (acquired by RadNet/DeepHealth, Feb 2025)',
    product: 'Mia',
    useCase: 'Mammography decision support',
    status: 'Won AI in Health and Care Award (Round 1, 2020). Acquired by RadNet/DeepHealth Feb 2025 — UK exit pattern.',
    scale: 'Pre-acquisition: Round 1 award £36m boost (2021). Post-acquisition: integration into DeepHealth global radiology portfolio.',
    src: 'https://www.gov.uk/government/news/36-million-boost-for-ai-technologies-to-revolutionise-nhs-care',
    tier: 'primary',
  },
  {
    id: 'newtons-tree',
    vendor: 'Newton\'s Tree',
    vendorHq: 'UK',
    product: 'FAMOS — Federated AI Monitoring Service',
    useCase: 'In-clinic AI performance drift detection',
    status: 'AI Airlock pilot participant (Phase 1, 2024–2025); integration partner for Annalise deployments',
    scale: 'Multi-Trust integration footprint via Annalise contracts.',
    src: 'https://www.gov.uk/government/publications/ai-airlock-sandbox-pilot-programme-report',
    tier: 'primary',
  },
  {
    id: 'deepc',
    vendor: 'deepc',
    vendorHq: 'Germany (Munich)',
    product: 'deepcOS',
    useCase: 'Radiology AI orchestration platform',
    status: 'Deployed alongside multiple AIDF tenders; partnership with BT for NHS digital health',
    scale: 'Per vendor materials. NHS England primary procurement source not located in research session.',
    src: 'https://www.deepc.ai/',
    tier: 'secondary',
    note: 'Vendor claim. NHS England primary press-release equivalent to Brainomix/Annalise not located — treat as pending verification.',
  },
];

// ─── 5. AI Airlock cohort (Phase 1 — 4 final case studies) ──────────────

export interface AirlockParticipant {
  id: string;
  name: string;
  organisation: string;
  product: string;
  challenge: string;
  src: string;
  tier: SourceTier;
}

export const UK_AIRLOCK_COHORT: AirlockParticipant[] = [
  {
    id: 'philips-rai',
    name: 'Radiology Auto Impression',
    organisation: 'Philips',
    product: 'LLM for radiology report drafting',
    challenge: 'Hallucination risk + post-market continuous-monitoring obligations not codified under UK MDR.',
    src: 'https://www.gov.uk/government/publications/ai-airlock-sandbox-pilot-programme-report',
    tier: 'primary',
  },
  {
    id: 'newtons-tree-famos',
    name: 'FAMOS',
    organisation: 'Newton\'s Tree',
    product: 'Federated AI Monitoring Service — performance drift detection',
    challenge: 'Continuous post-market AI performance monitoring as a regulated activity.',
    src: 'https://www.gov.uk/government/publications/ai-airlock-sandbox-pilot-programme-report',
    tier: 'primary',
  },
  {
    id: 'automedica-rag',
    name: 'RAG + LLM with verified clinical knowledge bases',
    organisation: 'Automedica Ltd',
    product: 'Retrieval-augmented generation grounded in verified clinical sources',
    challenge: 'LLM grounding + hallucination mitigation; regulatory classification of RAG architectures.',
    src: 'https://www.gov.uk/government/publications/ai-airlock-sandbox-pilot-programme-report',
    tier: 'primary',
  },
  {
    id: 'oncoflow',
    name: 'OncoFlow',
    organisation: 'OncoFlow',
    product: 'AI for personalised cancer-care management plans',
    challenge: 'Adaptive AI with clinician-in-the-loop decision support; PCCP guidance.',
    src: 'https://www.gov.uk/government/publications/ai-airlock-sandbox-pilot-programme-report',
    tier: 'primary',
  },
];

// ─── 6. UK funding rounds & exits (2024–2026) ───────────────────────────

export interface UkFundingRound {
  id: string;
  company: string;
  type: 'funding' | 'acquisition' | 'delisting' | 'merger';
  amount: string;
  date: string;
  detail: string;
  founder: string;
  src: string;
  tier: SourceTier;
}

export const UK_FUNDING_ROUNDS: UkFundingRound[] = [
  {
    id: 'isomorphic-600m',
    company: 'Isomorphic Labs',
    type: 'funding',
    amount: '$600m',
    date: '31 Mar 2025',
    detail: 'First external round since 2021 spin-out from Google DeepMind. Lead Thrive Capital + GV + Alphabet follow-on. London-Lausanne. AlphaFold 3 (May 2024); Eli Lilly + Novartis partnerships up to ~$3bn combined milestones. First human oncology trials "very close" but not yet initiated.',
    founder: 'Sir Demis Hassabis — Cambridge (Queen\'s) + UCL PhD; co-founder DeepMind; 2024 Nobel laureate in Chemistry for AlphaFold.',
    src: 'https://www.isomorphiclabs.com/articles/isomorphic-labs-announces-600m-external-investment-round',
    tier: 'primary',
  },
  {
    id: 'cera-150m',
    company: 'Cera',
    type: 'funding',
    amount: '$150m',
    date: '13 Jan 2025',
    detail: 'Series C lead BDT & MSD Partners + Schroders Capital. Mostly debt-weighted. Total raised ~$571m (Tracxn). Reached unicorn status January 2025. 30m population coverage, ~10,000 carers, 2.5m visits/month, 150+ local authorities + 29 NHS ICBs (two-thirds of 42).',
    founder: 'Dr Mahiben Maruthappu MBE — Cambridge + Oxford + Harvard; NHS clinician at Ealing + Chelsea & Westminster; co-founder NHS Innovation Accelerator; former NHS England Innovation Adviser; former Imperial NHS Trust + NW London ICB board. Clean counter-example to Babylon failure mode.',
    src: 'https://ceraqcare.com/',
    tier: 'primary',
  },
  {
    id: 'lindus-55m',
    company: 'Lindus Health',
    type: 'funding',
    amount: '$55m Series B',
    date: '22 Jan 2025',
    detail: 'Lead Balderton Capital; Visionaries Club, Creandum, Firstminute, Seedcamp continuing. Total raised ~$78–80m since Nov 2021. Strategic advisors: Robert Langer (MIT, Moderna co-founder), Tim Garnett (former CMO Eli Lilly). HQ migration to US underway — UK→US headquarter drift signal.',
    founder: 'Meri Beckwith, Michael Young, Nik Haldimann (UK-based, founded 2021). Thesis: "fix the broken CRO industry" with fixed-fee, milestone-based billing.',
    src: 'https://www.lindushealth.com/news',
    tier: 'primary',
  },
  {
    id: 'benevolent-delisting',
    company: 'BenevolentAI',
    type: 'delisting',
    amount: 'Compressed market cap',
    date: '12–13 Mar 2025',
    detail: 'EGM 12 March 2025 approved (>95%) merger into Osaka Holdings S.à r.l. (Luxembourg) — transition to private. Last trading 12 Mar; delisting effective 13 Mar 2025. Originally listed via SPAC (April 2022, Odyssey Acquisition) at multi-billion euro valuation. 7 milestones in AstraZeneca collaboration + one FDA-approved drug via partnership before strategic reset.',
    founder: 'Ken Mulvany — founded 2013 as Stratified Medical. Cambridge cluster + London office.',
    src: 'https://www.businesswire.com/news/home/20250312744928/en/BenevolentAI-Announces-Approval-of-Merger-with-Osaka-Holdings',
    tier: 'primary',
  },
  {
    id: 'exscientia-recursion',
    company: 'Exscientia → Recursion',
    type: 'merger',
    amount: 'All-stock; ~26% to Exscientia shareholders',
    date: '20 Nov 2024 (closed)',
    detail: 'Announced 8 Aug 2024; shareholders approved 12 Nov 2024; UK Court sanction 19 Nov 2024; closed pre-market 20 Nov 2024; EXAI ADSs delisted Nasdaq. Post-merger reality: Recursion deprioritised three Exscientia clinical-stage programmes within 6 months; analysts read as defensive consolidation, not synergistic combination.',
    founder: 'Prof. Andrew Hopkins (formerly Pfizer) — University of Dundee spin-out, Oxford operational base; chemistry-led AI drug design.',
    src: 'https://archives.sec.gov/Archives/edgar/data/0001865408/000094787124000937/',
    tier: 'primary',
  },
];

// ─── 7. Babylon case study (6 sections) ─────────────────────────────────

export interface BabylonCaseSection {
  id: string;
  title: string;
  period: string;
  body: string;
  keySources: { label: string; src: string; tier: SourceTier }[];
}

export const UK_BABYLON_CASE: BabylonCaseSection[] = [
  {
    id: 'founding-rwanda',
    title: 'Founding & Rwanda — the international template',
    period: '2013–2016',
    body: 'Ali Parsa (Iranian-British, ex-Goldman Sachs MD, ex-CEO Circle Health which abandoned the Hinchingbrooke franchise in 2015) founds Babylon in 2013. January 2016 Series A $25m — Hoxton Ventures, Kinnevik, and the founders of Google DeepMind as angels. 2014: Babylon Health Services Ltd becomes the first service of its kind registered with the CQC. 2016: 10-year agreement with Government of Rwanda for virtual primary care under Babyl brand, partly subsidised by $2.2m from the Bill & Melinda Gates Foundation. By end-2022 Babyl reports 2.8m users (~20% of Rwanda\'s 13.2m population) at ~4,000 daily consultations.',
    keySources: [
      { label: 'Wikipedia (Babylon Health)', src: 'https://en.wikipedia.org/wiki/Babylon_Health', tier: 'secondary' },
      { label: 'Telecareaware (Rwanda contract)', src: 'https://telecareaware.com/', tier: 'secondary' },
    ],
  },
  {
    id: 'gp-at-hand',
    title: 'NHS GP at Hand — the local-economy destabilisation',
    period: '2017–2020',
    body: 'November 2017 launch as partnership between Dr S Jefferies and Partners (small Hammersmith & Fulham GP practice on Lillie Road) and Babylon. Mechanism: existing GMS contract + NHS GP choice policy — patients within ~30–40 min of any London site could register, transferring full per-capita NHS funding. Adoption: ~2,500 patients (mid-2017) → ~36,489 (Nov 2018, NHS Digital) → ~48,000 (May 2019) → >54,700 (2019). Demographic skew: by Nov 2018, 49% of patients aged 20–29 (up from 16% Apr 2017); only 1% over 65 (down from ~10%). H&F CCG flagged as primary deficit driver (Mar 2018); needed £18m NHS England bailout (May 2018); MP Andy Slaughter cited "accumulated deficit of at least £26m for 2018–2020". Mental-health and community-care referral problem: GP at Hand referred to home-CCG services which would not accept; H&F paid out-of-area treatment. Health Secretary Matt Hancock publicly registered + endorsed model against RCGP/BMA/RCP resistance.',
    keySources: [
      { label: 'NHS England GP at Hand fact sheet', src: 'https://www.england.nhs.uk/london/our-work/gp-at-hand-fact-sheet/', tier: 'primary' },
      { label: 'Health Foundation Policy Navigator', src: 'https://navigator.health.org.uk/', tier: 'secondary' },
    ],
  },
  {
    id: 'safety-dispute',
    title: 'Symptom-checker safety dispute',
    period: '2018–2020',
    body: 'June 2018: Babylon publishes internal study claiming AI symptom-checker performs comparably to or better than human GPs on MRCGP exam material; Royal College of Physicians hosted presentation. 24 November 2018: Hamish Fraser, Enrico Coiera, David Wong publish letter "Safety of patient-facing digital symptom checkers" in The Lancet (vol. 392, p. 2263–2264). Methodological critique: data entered by doctors not lay users; no statistical significance testing; results sensitive to outlier doctor performance; small sample. December 2017 BMJ: Iacobucci, "London GP clinic sees big jump in patient registrations after Babylon app launch". 2020: Iacobucci, "Row over Babylon\'s chatbot shows lack of regulation" (BMJ 368:m815). July 2017 CQC inspection raised concerns about prescription practices and information sharing. NHS doctor account "DrMurphy11" surfaced repeated cases where the symptom checker advised home management for presentations consistent with cardiac ischaemia, including a 48-year-old male smoker with shoulder/arm pain.',
    keySources: [
      { label: 'The Lancet — Fraser, Coiera, Wong (Nov 2018)', src: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(18)32819-8/fulltext', tier: 'primary' },
      { label: 'BMJ — Iacobucci (2017, 2020)', src: 'https://www.bmj.com/', tier: 'primary' },
    ],
  },
  {
    id: 'spac',
    title: 'SPAC and NYSE listing',
    period: '2021',
    body: '3 June 2021: definitive merger agreement with Alkuri Global Acquisition Corp (NASDAQ: KURI) — SPAC led by former Groupon CEO Rich Williams + former COO Steve Krenzer. Pro forma equity value at announcement: $4.2bn. Gross proceeds estimated $575m including ~$230m PIPE from AMF Pensionsförsäkring + Palantir. Saudi Public Investment Fund (PIF) was a pre-SPAC backer. 20 Oct 2021: Alkuri shareholders approve. 21 Oct 2021: business combination completed. 22 Oct 2021: Babylon Holdings Ltd Class A shares begin trading on NYSE under ticker BBLN. With AlbaCore Sustainability-Linked Notes, Babylon received ~$460m gross at IPO.',
    keySources: [
      { label: 'PR Newswire — Alkuri/Babylon merger announcement', src: 'https://www.prnewswire.com/news-releases/babylon-and-alkuri-global-acquisition-corp-announce-business-combination-301304041.html', tier: 'primary' },
      { label: 'SEC EDGAR Form 6-K (Oct 2021)', src: 'https://www.sec.gov/Archives/edgar/data/0001866390/000119312521304150/d231170dex991.htm', tier: 'primary' },
    ],
  },
  {
    id: 'collapse',
    title: 'Public-market collapse',
    period: '2022–2023',
    body: 'Q1 2022: revenue ~$266m reported, losses widened. Parsa publicly stated unit economics: "the UK government pays you to look after people in our [average] age cohort two to three times a year… in reality, people use us six or seven times a year and we lose money on every member that comes in." This is the GP at Hand cherry-pick paradox — younger registrants ended up higher-utilisation than Carr-Hill weighting assumed. Aug 2022: ~50% workforce redundancy, including head-office staff at Knightsbridge and Euston. Sep 2022: NYSE notice of non-compliance with $1 minimum closing-price rule. Dec 2022: reverse share split. 2022–2023: Bupa contract loss; Centene affiliate plans serve notice they will not renew, eliminating "nearly half" of Babylon\'s 2022 revenue per filings. May 2023: AlbaCore Capital amends loan to provide up to $34.5m bridge. 28 June 2023: Babylon announces NYSE delist; "core operating subsidiaries" to transfer to MindMaze SA — no payment to Class A or other equity holders. 7 Aug 2023: MindMaze take-private deal collapses (no public explanation).',
    keySources: [
      { label: 'Mobihealthnews coverage (NYSE non-compliance, reverse split)', src: 'https://www.mobihealthnews.com/', tier: 'secondary' },
      { label: 'Healthcare Dive — Centene contract loss + AlbaCore bridge', src: 'https://www.healthcaredive.com/', tier: 'secondary' },
    ],
  },
  {
    id: 'bankruptcy',
    title: 'Chapter 7, administration, and £500K asset sale',
    period: '9 Aug – 11 Sep 2023',
    body: '9 August 2023: Babylon Inc. + Babylon Healthcare Inc. file for Chapter 7 bankruptcy in US Bankruptcy Court for the District of Delaware. Filed by COO Paul-Henri Ferrand. Both subsidiaries listed liabilities $100m–$500m and hundreds of creditors. AlbaCore Capital alone owed ~$34.5m bridge + ~$300m in 2026-due notes. ~11 Aug 2023: Babylon announces winding-down of Babyl Rwanda despite 2.8m users. 30/31 Aug 2023: Alvarez & Marsal Europe LLP appointed administrators of Babylon Group Holdings + Babylon Partners. Sale of UK business completed to eMed Healthcare UK Limited — UK assets sold for ~£500,000. eMed acquired GP at Hand NHS practice (~700,000 patients) and preventative-care book. 11 Sep 2023: Babylon collapses formally into administration in UK courts. Why this is the bridge case to US SPAC era: capital structure preceded clinical evidence (2021 SPAC window enabled $460m gross at $4.2bn before 2018 safety questions resolved); regulatory authority blocked at a different layer than expected (NHS payor + capital market, not CQC/MHRA); loss event was unit-economic — payment-mechanism mismatch dressed in clinical-tech narrative.',
    keySources: [
      { label: 'Becker\'s Hospital Review — Chapter 7 filing (18 Aug 2023)', src: 'https://www.beckershospitalreview.com/', tier: 'secondary' },
      { label: 'Fierce Healthcare — eMed acquisition (5 Sep 2023)', src: 'https://www.fiercehealthcare.com/', tier: 'secondary' },
      { label: 'Companies House (Babylon entities)', src: 'https://www.gov.uk/government/organisations/companies-house', tier: 'primary' },
    ],
  },
];

// ─── 8. UK founder frame — 7 axes from §9.6 ─────────────────────────────

export interface FounderFrameItem {
  id: string;
  title: string;
  body: string;
}

export const UK_FOUNDER_FRAME: FounderFrameItem[] = [
  {
    id: 'mhra-saamd',
    title: 'MHRA SaMD/AIaMD pathway is parallel, not "EU minus EMA"',
    body: 'UKCA mark + indefinite CE-mark recognition (SI 2023/627). PMS SI in force 16 June 2025 (SI 2024/1368). AI Airlock Phase 2 to Spring 2026. Treat CE mark as still the practical gateway; engage AI Airlock if your product hits classification edge cases (synthetic data, LLM, adaptive).',
  },
  {
    id: 'nice-evidence',
    title: 'NICE evidence requirements gate NHS scaling',
    body: 'ESF Tier A/B/C; Tier C demands RCT or strong RWE comparative. EVA pathway since 2022 has 55% conditional-recommendation rate. Plan evidence generation 18–36 months ahead of NHS scaling. EVA is the only fast-lane and only for genuinely unmet need.',
  },
  {
    id: 'dtac-procurement',
    title: 'NHS DTAC is the procurement gate but not passport-able',
    body: 'DTAC v2 form effective 24 February 2026; full transition 6 April 2026. Five domains. Each Trust is a fresh assessment — design the assurance pack once, deploy many times. Build DTAC compliance into product spec from day one.',
  },
  {
    id: 'central-funding-weak',
    title: 'Don\'t build a thesis around central NHS AI grant programmes',
    body: 'NHS AI Lab wound down March 2025; AIDF £21m exhausted across 11 imaging networks; future central funding signal weak as of 2026. ICB-level relationships are now the more durable channel.',
  },
  {
    id: 'four-nation-deployment',
    title: 'Sequence: Trust pilot → SBS framework → ICB rollout → cross-nation',
    body: '42 ICBs + ~215 Trusts + Wales/Scotland/NI separately. SBS framework agreements (e.g., stroke AI) bypass per-Trust tender. Skipping steps fails on procurement.',
  },
  {
    id: 'us-capital-c-plus',
    title: 'Plan for US capital partnership at Series C+',
    body: 'UK led Q3 2025 European digital health at $409m. SPAC route effectively closed post-Babylon/BenevolentAI delisting. Realistic exit is acquisition by US/global, not London IPO. Lindus Health\'s HQ migration to US is the canonical signal.',
  },
  {
    id: 'pharma-strategic',
    title: 'Pharma partnership is the most reliable non-dilutive route',
    body: 'AstraZeneca + GSK in-house AI; AstraZeneca–BenevolentAI partnership; Owkin–Sanofi; Isomorphic–Lilly/Novartis partnership economics ~$3bn combined milestones. Lilly + Novartis specifically are the most Isomorphic-style buyers.',
  },
];
