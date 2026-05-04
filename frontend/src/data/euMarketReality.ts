// EU + Switzerland Founder Map — synthesis from research brief Section 7.
//
// Purpose: tell a healthcare-AI founder the European system they're walking
// into. The US tab argues "which spoke kills you"; the UAE tab argues "the
// floor is too low for venture scale"; the EU tab argues "the regulatory
// grammar is the moat AND the wall — pharma-AI is the green lane, generic
// radiology AI is being consolidated, and Switzerland is a separate animal."
//
// Compliance: every entry has a `src` URL. Secondary sources (legal-analyst
// summaries, CRO benchmark sources, deal-tracker estimates) are flagged via
// `tier: 'secondary'` so the UI renders the epistemic status.

export type Confidence = 'official' | 'observed' | 'inference';
export type SourceTier = 'primary' | 'secondary';

// ─── 1. EU four-layer regulatory rulebook ───────────────────────────────

export interface PhasedMilestone {
  date: string;
  what: string;
}

export interface RegulatoryLayer {
  id: 'ai-act' | 'ehds' | 'htar' | 'mdr-ivdr';
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

export const EU_REGULATORY_LAYERS: RegulatoryLayer[] = [
  {
    id: 'ai-act',
    name: 'AI Act',
    regulationName: 'Regulation (EU) 2024/1689',
    enteredForce: '1 August 2024',
    oneLiner: 'Class IIa+ medical AI is automatically high-risk. Stacks on top of MDR/IVDR.',
    scope: 'Any AI system that is a safety component of, or itself constitutes, a medical device under MDR or IVD under IVDR — and requires Notified Body conformity assessment — is automatically classified high-risk.',
    phased: [
      { date: '2 Feb 2025', what: 'Prohibited AI practices ban + AI literacy obligations' },
      { date: '2 Aug 2025', what: 'GPAI model obligations + governance + penalties' },
      { date: '2 Aug 2026', what: 'Most high-risk AI obligations apply' },
      { date: '2 Aug 2027', what: 'Full compliance for AI in MDR/IVDR-regulated products' },
    ],
    penalties: 'Up to 7% of global revenue or €15m (whichever higher) for prohibited AI; up to 3% / €15m for high-risk non-compliance.',
    src: 'https://health.ec.europa.eu/ehealth-digital-health-and-care/artificial-intelligence-healthcare_en',
    tier: 'primary',
  },
  {
    id: 'ehds',
    name: 'EHDS',
    regulationName: 'Regulation (EU) 2025/327 — European Health Data Space',
    enteredForce: '26 March 2025',
    oneLiner: 'Permits using data to train, test, evaluate AI in medical devices/IVDs — but operational apparatus builds out 2025–2031.',
    scope: 'Health Data Access Bodies issue permits for secondary use of de-identified health data: scientific research, AI training/testing/evaluation, public-interest, official statistics. Patient opt-out mandatory.',
    phased: [
      { date: '26 Mar 2027', what: 'General application; HDABs operational; templates + secure environments' },
      { date: 'Mar 2029', what: 'Primary use: patient summaries + ePrescriptions across MS; secondary use for EHR data' },
      { date: 'Mar 2031', what: 'Primary use: medical images + lab results + discharge reports; secondary use for genomic data' },
      { date: 'Mar 2035', what: 'Third countries may apply to join HealthData@EU for secondary use' },
    ],
    penalties: 'Maximum administrative fines €20m or 4% of worldwide annual turnover.',
    src: 'https://eur-lex.europa.eu/eli/reg/2025/327/oj/eng',
    tier: 'primary',
  },
  {
    id: 'htar',
    name: 'HTAR',
    regulationName: 'Regulation (EU) 2021/2282 — Health Technology Assessment',
    enteredForce: '12 January 2025 (oncology + ATMPs)',
    oneLiner: 'Joint Clinical Assessment at EU level — but national pricing/reimbursement stays with G-BA, HAS, NICE, Zorginstituut.',
    scope: 'JCA by HTA Coordination Group runs in parallel with EMA marketing authorisation. Produces relative clinical assessment only — not pricing or reimbursement.',
    phased: [
      { date: 'Jan 2025', what: 'New oncology medicines + ATMPs (gene/cell/tissue therapy)' },
      { date: '2026', what: 'High-risk medical devices (Class IIb/III) + Class D IVDs' },
      { date: '2028', what: 'Orphan medicinal products' },
      { date: '2030', what: 'All centrally authorised medicines' },
    ],
    src: 'https://www.iqwig.de/en/presse/in-the-focus/european-health-technology-assessment/',
    tier: 'secondary',
  },
  {
    id: 'mdr-ivdr',
    name: 'MDR / IVDR',
    regulationName: 'Regulation (EU) 2017/745 + Regulation (EU) 2017/746',
    enteredForce: '26 May 2021 (MDR) / 26 May 2022 (IVDR)',
    oneLiner: 'Operational baseline. Notified Body capacity chronically constrained. UDI registration in EUDAMED.',
    scope: 'Stricter clinical evaluation + post-market surveillance + technical documentation depth than predecessor MDD/IVDD. Class IIa+ AI-SaMD requires Notified Body conformity assessment.',
    phased: [
      { date: '26 May 2021', what: 'MDR applies; MRA with Switzerland ceases' },
      { date: '26 May 2022', what: 'IVDR applies' },
      { date: 'ongoing', what: 'EUDAMED phased rollout; transition deadlines extended for legacy devices through 2027–2028' },
    ],
    src: 'https://health.ec.europa.eu/medical-devices-sector_en',
    tier: 'primary',
  },
];

// ─── 2. Alzheimer's bridge case (3 drugs × 4 regulators) ────────────────

export interface BridgeOutcome {
  agency: 'FDA' | 'CMS' | 'EMA/CHMP' | 'EC' | 'NICE / national HTA';
  outcome: 'approved' | 'narrowed' | 'refused' | 'restricted' | 'withdrawn';
  date: string;
  detail: string;
  src: string;
  tier: SourceTier;
}

export interface BridgeCase {
  id: string;
  drug: string;
  manufacturer: string;
  finalState: string;
  outcomes: BridgeOutcome[];
}

export const EU_ALZHEIMERS_BRIDGE: BridgeCase[] = [
  {
    id: 'aduhelm',
    drug: 'Aduhelm (aducanumab)',
    manufacturer: 'Biogen',
    finalState: 'Discontinued January 2024 — chain: FDA approve → CMS NCD restrict → weak uptake → EMA refuse → exit.',
    outcomes: [
      {
        agency: 'FDA',
        outcome: 'approved',
        date: '7 Jun 2021',
        detail: 'Accelerated approval on amyloid-β reduction surrogate, over advisory-committee No vote.',
        src: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8491638/',
        tier: 'secondary',
      },
      {
        agency: 'CMS',
        outcome: 'restricted',
        date: 'Apr 2022',
        detail: 'National Coverage Determination — Coverage with Evidence Development. Reimbursement only for clinical-trial enrolees. Effective commercial death.',
        src: 'https://www.cms.gov/medicare-coverage-database/view/medicare-coverage-document.aspx?MCDId=27',
        tier: 'primary',
      },
      {
        agency: 'EMA/CHMP',
        outcome: 'refused',
        date: '17 Dec 2021',
        detail: 'Formal opinion: amyloid-β reduction was demonstrated, but link to clinical improvement not established; main study results conflicting; ARIA risk substantial.',
        src: 'https://www.ema.europa.eu/en/medicines/human/EPAR/aduhelm',
        tier: 'primary',
      },
      {
        agency: 'EC',
        outcome: 'withdrawn',
        date: '20 Apr 2022',
        detail: 'Biogen withdraws EU MAA during re-examination; EMA confirms benefits did not outweigh risks.',
        src: 'https://www.ema.europa.eu/en/documents/medicine-qa/questions-and-answers-withdrawal-application-marketing-authorisation-aduhelm-aducanumab_en.pdf',
        tier: 'primary',
      },
    ],
  },
  {
    id: 'leqembi',
    drug: 'Leqembi (lecanemab)',
    manufacturer: 'Eisai / Biogen / BioArctic',
    finalState: 'EU approved 15 Apr 2025 — narrowed to ApoE4 non-carriers + heterozygotes only (homozygotes excluded due to ARIA).',
    outcomes: [
      {
        agency: 'FDA',
        outcome: 'approved',
        date: 'Jul 2023',
        detail: 'Full approval. 27% slowing of CDR-SB decline at 18 months in CLARITY-AD trial.',
        src: 'https://www.fda.gov/news-events/press-announcements/fda-converts-novel-alzheimers-disease-treatment-traditional-approval',
        tier: 'primary',
      },
      {
        agency: 'EMA/CHMP',
        outcome: 'narrowed',
        date: '14 Nov 2024',
        detail: 'After initial negative opinion (25 Jul 2024), re-examination produced conditional positive for ApoE4 non-carriers/heterozygotes; ApoE4 homozygotes excluded.',
        src: 'https://www.ema.europa.eu/en/medicines/human/EPAR/leqembi',
        tier: 'primary',
      },
      {
        agency: 'EC',
        outcome: 'approved',
        date: '15 Apr 2025',
        detail: 'EU Commission marketing authorisation granted with controlled access programme, after Standing Committee + Appeal Committee both reverted "no opinion." First disease-modifying Alzheimer\'s medicine authorised in EU.',
        src: 'https://www.alzint.org/news-events/news/european-commission-approves-first-disease-modifying-treatment-for-alzheimers-disease-in-the-eu/',
        tier: 'secondary',
      },
    ],
  },
  {
    id: 'kisunla',
    drug: 'Kisunla (donanemab)',
    manufacturer: 'Eli Lilly',
    finalState: 'EU approved Sep 2025 — narrowed mirroring Leqembi. NICE rejected on cost-effectiveness (independent of EMA).',
    outcomes: [
      {
        agency: 'FDA',
        outcome: 'approved',
        date: '2024',
        detail: 'Full approval with boxed warning, ARIA monitoring required.',
        src: 'https://www.fda.gov/drugs',
        tier: 'primary',
      },
      {
        agency: 'NICE / national HTA',
        outcome: 'refused',
        date: 'Mar 2025',
        detail: 'NHS England rejected on cost-effectiveness grounds, independent of EMA opinion.',
        src: 'https://www.nice.org.uk/',
        tier: 'secondary',
      },
      {
        agency: 'EMA/CHMP',
        outcome: 'narrowed',
        date: 'Jul 2025',
        detail: 'After negative first opinion 27 Mar 2025 (ARIA 36.8% treated vs 14.9% placebo, 3 deaths in study), re-examination reversed and recommended approval for ApoE4 non-carriers + heterozygotes.',
        src: 'https://www.ema.europa.eu/en/documents/medicine-qa/questions-answers-approval-marketing-authorisation-kisunla-donanemab-outcome-re-examination_en.pdf',
        tier: 'primary',
      },
      {
        agency: 'EC',
        outcome: 'approved',
        date: 'Sep 2025',
        detail: 'EC marketing authorisation granted.',
        src: 'https://investor.lilly.com/news-releases/news-release-details/lillys-statement-about-chmp-opinion-issued-donanemab',
        tier: 'primary',
      },
    ],
  },
];

// ─── 3. CEE clinical-trial cost arbitrage (operational layer) ───────────

export interface CountryArbitrage {
  country: string;
  regulator: string;
  startupTimeline: string;
  costVsWestern: string;
  specialty: string;
  src: string;
  tier: SourceTier;
}

export const EU_CEE_ARBITRAGE: CountryArbitrage[] = [
  {
    country: 'Czech Republic',
    regulator: 'SUKL',
    startupTimeline: '45–60 days (among fastest in EU)',
    costVsWestern: '20–40% lower (50% vs US)',
    specialty: 'Oncology, rheumatology, endocrinology. Prague + Brno primary sites.',
    src: 'https://www.biomapas.com/7-reasons-to-include-eastern-europe-in-your-clinical-trial-strategy/',
    tier: 'secondary',
  },
  {
    country: 'Poland',
    regulator: 'URPL',
    startupTimeline: 'Standard EU CTR timelines',
    costVsWestern: '20–40% lower',
    specialty: 'Top non-US country by trial volume globally. Warsaw + Kraków host ICH-GCP-compliant multilingual sites.',
    src: 'https://www.biomapas.com/7-reasons-to-include-eastern-europe-in-your-clinical-trial-strategy/',
    tier: 'secondary',
  },
  {
    country: 'Hungary',
    regulator: 'OGYÉI',
    startupTimeline: 'Centralised ethics committee — single approval',
    costVsWestern: '20–40% lower',
    specialty: 'Semmelweis University ecosystem; unified national EHR enables real-time feasibility + automated screening.',
    src: 'https://comac-medical.com/benefits-of-conducting-clinical-trials-in-central-and-eastern-europe-cee/',
    tier: 'secondary',
  },
  {
    country: 'Bulgaria / Romania / Slovakia / Slovenia / Croatia',
    regulator: 'National authorities under CTR 536/2014 (CTIS)',
    startupTimeline: 'Simplified procedures via CTIS since Jan 2022',
    costVsWestern: '30–50% lower',
    specialty: 'Lower trial competition + large patient pools. Same regulatory regime as Western EU.',
    src: 'https://comac-medical.com/benefits-of-conducting-clinical-trials-in-central-and-eastern-europe-cee/',
    tier: 'secondary',
  },
];

// ─── 4. Pharma-AI gravity — named European AI-health cases ──────────────

export interface PharmaCase {
  id: string;
  name: string;
  type: 'funding' | 'acquisition' | 'spinout';
  amount: string;
  date: string;
  detail: string;
  src: string;
  tier: SourceTier;
}

export const EU_PHARMA_GRAVITY: PharmaCase[] = [
  {
    id: 'isomorphic-600m',
    name: 'Isomorphic Labs',
    type: 'funding',
    amount: '$600m',
    date: 'Mar 2025',
    detail: 'First external round — Thrive Capital lead with GV + Alphabet. London-Lausanne, spun out of Google DeepMind 2021. Eli Lilly + Novartis partnerships ~$3bn collectively. AlphaFold 3 released May 2024. First AI-designed drug entering human trials announced 2026.',
    src: 'https://www.isomorphiclabs.com/articles/isomorphic-labs-announces-600m-external-investment-round',
    tier: 'primary',
  },
  {
    id: 'biontech-instadeep',
    name: 'BioNTech ← InstaDeep',
    type: 'acquisition',
    amount: '€500m / ~$680m',
    date: 'Completed 31 Jul 2023',
    detail: '£362m upfront + shares + up to £200m performance milestones. InstaDeep: ~290 AI/ML employees across UK/Germany/France/Tunisia/Nigeria/SA/UAE/Boston/SF. BioNTech\'s largest acquisition + first AI deal. Strategy: embed AI across discovery via DeepChain platform.',
    src: 'https://investors.biontech.de/news-releases/news-release-details/biontech-completes-acquisition-instadeep',
    tier: 'primary',
  },
  {
    id: 'owkin-waiv-2026',
    name: 'Owkin → Waiv spinout',
    type: 'spinout',
    amount: '$33m',
    date: '2026',
    detail: 'Owkin (Paris/NYC) spun out diagnostics company Waiv with $33m financing to scale AI-powered precision testing. Owkin repositioning around agentic AI / biology / drug development infrastructure.',
    src: 'https://owkin.com/',
    tier: 'secondary',
  },
];

// ─── 5. Imaging AI consolidation (RadNet / DeepHealth pattern) ──────────

export interface ImagingAcquisition {
  id: string;
  acquirer: string;
  target: string;
  country: string;
  specialty: string;
  date: string;
  value: string;
  src: string;
  tier: SourceTier;
}

export const EU_IMAGING_CONSOLIDATION: ImagingAcquisition[] = [
  {
    id: 'aidence',
    acquirer: 'RadNet / DeepHealth',
    target: 'Aidence',
    country: 'Netherlands',
    specialty: 'Lung AI',
    date: 'pre-2024',
    value: 'undisclosed',
    src: 'https://deephealth.com/',
    tier: 'secondary',
  },
  {
    id: 'quantib',
    acquirer: 'RadNet / DeepHealth',
    target: 'Quantib',
    country: 'Netherlands',
    specialty: 'Prostate + Brain AI',
    date: 'pre-2024',
    value: 'undisclosed',
    src: 'https://deephealth.com/',
    tier: 'secondary',
  },
  {
    id: 'kheiron',
    acquirer: 'RadNet / DeepHealth',
    target: 'Kheiron Medical Technologies',
    country: 'UK',
    specialty: 'Mia mammography AI',
    date: 'Feb 2025',
    value: 'undisclosed',
    src: 'https://deephealth.com/press-releases/deephealth-expands-its-ai-powered-cancer-diagnostic-and-screening-portfolio-with-the-acquisition-of-kheiron/',
    tier: 'primary',
  },
  {
    id: 'icad',
    acquirer: 'RadNet / DeepHealth',
    target: 'iCAD',
    country: 'US',
    specialty: 'Breast cancer detection / risk / density',
    date: 'Jul 2025',
    value: '~$103m all-stock',
    src: 'https://deephealth.com/press-releases/radnets-wholly-owned-subsidiary-deephealth-completes-acquisition-of-icad/',
    tier: 'primary',
  },
  {
    id: 'see-mode',
    acquirer: 'RadNet / DeepHealth',
    target: 'See-Mode Technologies',
    country: 'Singapore',
    specialty: 'Thyroid + Breast ultrasound AI',
    date: 'Jun 2025',
    value: 'undisclosed',
    src: 'https://deephealth.com/',
    tier: 'secondary',
  },
  {
    id: 'gleamer',
    acquirer: 'RadNet / DeepHealth',
    target: 'Gleamer',
    country: 'France',
    specialty: 'Radiology AI',
    date: 'Mar 2026',
    value: 'up to ~$270m / €230m all-cash + milestone',
    src: 'https://www.privsource.com/acquisitions/deal/radnet-subsidiary-deephealth-acquires-kheiron-medical-technologies-WNSEpl',
    tier: 'secondary',
  },
];

// ─── 6. EU Founder Frame — 7 axes from 7.6 ──────────────────────────────

export interface FounderFrameItem {
  id: string;
  title: string;
  body: string;
}

export const EU_FOUNDER_FRAME: FounderFrameItem[] = [
  {
    id: 'mdr-ivdr',
    title: 'MDR/IVDR conformity assessment is the gating clock',
    body: 'Notified Body capacity is chronically constrained. Pick a body early; budget 9–18 months for high-class devices. This is the slowest single step in the European pathway.',
  },
  {
    id: 'ai-act-stack',
    title: 'AI Act stacks on top of MDR — automatic high-risk',
    body: 'Any MDR Class IIa+ AI-SaMD or IVDR Class B+ with AI is automatically high-risk under the AI Act. Full obligations August 2026/2027. Penalties up to 7% global revenue.',
  },
  {
    id: 'ehds-bridge',
    title: 'EHDS does not give you instant data access',
    body: 'EHDS framework adopted 2025 but operational apparatus (HDABs, HealthData@EU, secondary-use permits) builds out 2025–2031. Bridge mechanism remains bilateral hospital agreements + national HDAs. CEE arbitrage applies to evidence generation, not to data scaling.',
  },
  {
    id: 'hta-jca',
    title: 'JCA harmonises evidence; national HTA still controls reimbursement',
    body: 'Joint Clinical Assessment at EU level for oncology + ATMPs since Jan 2025, expanding to high-risk MDs 2026, all medicines 2030. National pricing + reimbursement decisions (G-BA, HAS, NICE, Zorginstituut) remain country-specific. "Passed JCA" ≠ "EU-wide reimbursement."',
  },
  {
    id: 'reimbursement-graveyard',
    title: 'Reimbursement is country-specific and is the actual graveyard',
    body: 'Germany DiGA fast-track, France PECAN, UK NICE cost-effectiveness gate, Netherlands Zorginstituut. Each has different evidence requirements, pricing logic, and timelines. NICE rejected Kisunla on cost-effectiveness independent of EMA approval.',
  },
  {
    id: 'hospital-procurement',
    title: 'Hospital procurement is slower than US but more durable',
    body: 'Long sales cycles, heavy IT/clinical engagement requirements, smaller per-deal sizes. Once integrated into clinical workflow + procurement contracts, churn is meaningfully lower than US.',
  },
  {
    id: 'pharma-strategic-capital',
    title: 'Pharma + medtech strategic capital is the unique European moat',
    body: 'Roche, Novartis, Siemens Healthineers, Philips, GE, BioNTech provide partnership capital + exit channels that the European VC market alone does not replicate. Pharma-AI / drug discovery / RWE / clinical trial optimisation / neurodegeneration monitoring is where European specifics actually create competitive moat.',
  },
];

// ─── 7. Switzerland — separate institutional animal ─────────────────────

export interface SwissNote {
  id: string;
  kind: 'separation' | 'reset' | 'pharma-gravity' | 'use-for' | 'avoid-for';
  title: string;
  body: string;
  src?: string;
  tier?: SourceTier;
}

export const SWISS_PROFILE: SwissNote[] = [
  {
    id: 'mra-failure',
    kind: 'separation',
    title: 'MRA failure — Switzerland became a third-country (26 May 2021)',
    body: 'EU-Switzerland Mutual Recognition Agreement ceased for medical devices on 26 May 2021 (MDR application date) and IVDs on 26 May 2022. Swiss manufacturers now need EU-based Authorised Representatives + EU Notified Body conformity assessment. EU manufacturers need Swiss CH-REP and Swissmedic CHRN registration. Switzerland built parallel swissdamed registry — UDI Devices module deadline 1 July 2026.',
    src: 'https://blog.johner-institute.com/regulatory-affairs/switzerland-medical-devices/',
    tier: 'secondary',
  },
  {
    id: 'horizon-reset',
    kind: 'reset',
    title: 'Horizon Europe re-association — signed 10 Nov 2025, retroactive to 1 Jan 2025',
    body: 'EU Programmes Agreement (EUPA) ends four years of "non-associated third country" status. Swiss universities + research institutes + startups regain full eligibility for ERC, EIC, Marie Skłodowska-Curie. Swiss entities can lead/coordinate consortia. Switzerland resumes ~CHF 600m financial contribution. ITER from 2026; Erasmus+ from 2027 (subject to parliamentary); EU4Health subject to bilateral health agreement.',
    src: 'https://www.sbfi.admin.ch/en/horizon-package-2021-2027',
    tier: 'primary',
  },
  {
    id: 'pharma-gravity',
    kind: 'pharma-gravity',
    title: 'Pharma gravity — Roche + Novartis + Lonza + Basel cluster',
    body: '8.9m population but houses two of the world\'s three largest pharma companies by revenue. Strong in oncology RWE / companion Dx (Roche/FoundationOne), neurodegeneration (Roche Genentech Brainshuttle + Alzheimer\'s biomarker work), ATMPs (Novartis Kymriah was first FDA-approved CAR-T 2017), pharmacovigilance + global medical affairs. Swiss clinical infrastructure costs are among Europe\'s highest, but pharma partnership access via Basel is unmatched on the continent.',
    src: 'https://www.sciencedirect.com/science/article/pii/S0895435624002920',
    tier: 'secondary',
  },
  {
    id: 'use-for',
    kind: 'use-for',
    title: 'Use Switzerland for',
    body: 'Pharma partnership entry (direct Roche/Novartis/Genentech/Lonza BD relationships). Clinical credibility via USZ/CHUV/HUG/Inselspital validation (high signalling value). ATMP + oncology RWE. Neurodegeneration / Alzheimer\'s monitoring (Basel neuroscience + Memory Clinics). Horizon Europe consortium leadership (post Nov 2025).',
  },
  {
    id: 'avoid-for',
    kind: 'avoid-for',
    title: 'Don\'t use Switzerland for',
    body: 'First-launch volume play (8.9m population, fragmented cantonal procurement, premium cost structure). Reimbursement shortcut (federal + cantonal mix, narrow-volume dynamics). Cheaper evidence (CEE is cheaper evidence; Switzerland is expensive credibility).',
  },
];

export const SWISS_TAGLINE = 'Switzerland is not cheaper evidence; CEE is cheaper evidence; Switzerland is expensive credibility.';

// ─── 8. EU vs US headline contrast (the "1/3 of US" punch) ──────────────

export interface EuContrastRow {
  id: string;
  metric: string;
  us: string;
  eu: string;
  ratio: string;
  note?: string;
  src: string;
  tier: SourceTier;
}

export const EU_CONTRAST: EuContrastRow[] = [
  {
    id: 'digital-health-vc-2025',
    metric: 'Digital health VC raised, 2025 (annualised from Q3)',
    us: '~$10–12 bn (Rock Health)',
    eu: '~$3–4 bn across ~200+ deals (Galen Growth)',
    ratio: '~3×',
    note: 'Same order of magnitude as US, unlike UAE (which is ~200× smaller). Europe is fundable; the question is what kind of company.',
    src: 'https://rockhealth.com/insights/',
    tier: 'secondary',
  },
  {
    id: 'reg-layers',
    metric: 'Major regulatory layers a healthcare-AI startup must navigate',
    us: '4 (FDA + CMS + AMA/CPT + payers)',
    eu: '6 (EMA/EC + AI Act + EHDS + HTAR + MDR/IVDR + national HTA)',
    ratio: '+2 layers',
    note: 'AI Act + EHDS are EU-specific. National HTA fragments per Member State. No equivalent stack exists in US.',
    src: 'https://health.ec.europa.eu/ehealth-digital-health-and-care/artificial-intelligence-healthcare_en',
    tier: 'primary',
  },
  {
    id: 'trial-cost',
    metric: 'Clinical-trial cost (relative to US baseline)',
    us: '100%',
    eu: 'Western EU: 60–80%; CEE: 50–70%',
    ratio: '−30–50%',
    note: 'CEE arbitrage is operational only — same EMA regulatory standards. Cheaper evidence does not lower the EMA approval bar.',
    src: 'https://www.sofpromed.com/ultimate-guide-clinical-trial-costs',
    tier: 'secondary',
  },
  {
    id: 'realistic-exit',
    metric: 'Realistic exit channel for healthcare-AI startups',
    us: 'IPO + strategic acquisition',
    eu: 'Strategic acquisition (pharma + medtech), rare IPO',
    ratio: '—',
    note: 'Pharma + medtech strategic capital (Roche, Novartis, Siemens Healthineers, Philips, GE, BioNTech) is the European exit moat. RadNet has acquired 4 European imaging-AI startups in 24 months (Aidence, Quantib, Kheiron, Gleamer).',
    src: 'https://deephealth.com/press-releases/radnets-wholly-owned-subsidiary-deephealth-completes-acquisition-of-icad/',
    tier: 'primary',
  },
  {
    id: 'green-lane',
    metric: 'Strongest AI-health lane for founders',
    us: 'Workflow + EHR-integrated SaaS + radiology AI',
    eu: 'Pharma AI, drug discovery, oncology imaging, neurodegeneration, RWE',
    ratio: 'different',
    note: 'Generic radiology AI point solutions are being consolidated globally (RadNet pattern). European specifics create moat in AI attached to biology + pharma evidence.',
    src: 'https://www.isomorphiclabs.com/articles/isomorphic-labs-announces-600m-external-investment-round',
    tier: 'primary',
  },
];
