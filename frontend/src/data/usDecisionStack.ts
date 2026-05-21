// US Decision Stack — who has veto power over a healthcare AI product
// reaching a patient, plus the price/reimbursement anchors that determine
// whether anyone pays for it once it does.

export interface DecisionActor {
  id: string;
  name: string;          // short label
  expanded: string;      // expanded name of the institution / role
  role: string;          // one-line role
  vetoPower: string;     // what they can block
  cadence: string;       // how often they decide
  src: string;           // primary source
}

export const US_ACTORS: DecisionActor[] = [
  {
    id: 'fda',
    name: 'FDA',
    expanded: 'Food and Drug Administration',
    role: 'Pre-market authorisation for drugs, biologics, devices and SaMD.',
    vetoPower: 'Can block any new drug or device from US commerce. Insufficient on its own — approval ≠ market access.',
    cadence: 'Continuous review; major guidance documents 1–3× per year.',
    src: 'https://www.fda.gov/about-fda',
  },
  {
    id: 'ama',
    name: 'AMA',
    expanded: 'American Medical Association — CPT Editorial Panel',
    role: 'Owns the CPT code system used for billing. Without a code, doctors cannot charge for a service.',
    vetoPower: 'Can refuse a CPT code (or grant only Category III, which barely pays). Sets the AI taxonomy (assistive / augmentative / autonomous) used by CMS.',
    cadence: 'CPT panel meets 3× per year; new codes published annually (effective Jan 1).',
    src: 'https://www.ama-assn.org/about/cpt-editorial-panel/cpt-purpose-mission',
  },
  {
    id: 'cms',
    name: 'CMS',
    expanded: 'Centers for Medicare & Medicaid Services',
    role: 'Decides what Medicare and Medicaid will pay for, and how much. Sets the reimbursement value of CPT codes.',
    vetoPower: 'Can issue a National Coverage Determination that effectively blocks coverage even for FDA-approved drugs (see Aduhelm 2022).',
    cadence: 'Annual Physician Fee Schedule rule; ad-hoc NCDs.',
    src: 'https://www.cms.gov/about-cms',
  },
  {
    id: 'payers',
    name: 'Private payers',
    expanded: 'Commercial insurers, PBMs, ACOs',
    role: 'Cover ~50% of insured Americans. Often follow Medicare but can be more or less restrictive.',
    vetoPower: 'Can refuse to add a drug to formulary, require step therapy, or demand prior authorisation that strangles uptake.',
    cadence: 'Formularies updated quarterly; coverage policies revised yearly.',
    src: 'https://www.kff.org/health-policy-101-private-insurance/',
  },
  {
    id: 'pharma',
    name: 'Pharma & biotech',
    expanded: 'Drug, biologic and device manufacturers',
    role: 'Sponsor trials, set list prices, decide which indications to pursue.',
    vetoPower: 'Can withdraw a drug from market (Aduhelm 2024) or set a launch price so high that payers refuse coverage.',
    cadence: 'Pricing reviewed quarterly; pipeline decisions 1–3 year horizon.',
    src: 'https://www.fda.gov/drugs/development-approval-process-drugs',
  },
  {
    id: 'investors',
    name: 'Investors',
    expanded: 'Venture, growth and public-market investors',
    role: 'Fund the multi-year development cycle (drug R&D ~$1B+ over 10y; AI/SaMD ~$20–100M over 4–6y).',
    vetoPower: 'Can starve a programme by refusing to fund the next round. AI healthcare funding fell ~30% peak-to-trough between 2021 and 2023.',
    cadence: 'Quarterly committee meetings; market windows open / close in months.',
    src: 'https://rockhealth.com/insights/',
  },
];

// ─── Drug pricing anchors ─────────────────────────────────────────────────
//
// These are the price points that policymakers, payers and patients actually
// argue about. Each entry traces a real product to a primary-source price.

export interface DrugPricingExample {
  id: string;
  drug: string;
  manufacturer: string;
  indication: string;
  approved: number;
  priceText: string;      // headline price as quoted in primary source
  priceContext: string;   // "lifetime" / "one-shot" / "per year"
  whyItMatters: string;
  src: string;
}

export const US_DRUG_PRICES: DrugPricingExample[] = [
  {
    id: 'spinraza',
    drug: 'Spinraza (nusinersen)',
    manufacturer: 'Biogen',
    indication: 'Spinal muscular atrophy (SMA)',
    approved: 2016,
    priceText: '$750K year 1, $375K/year after',
    priceContext: 'lifetime — chronic intrathecal injection',
    whyItMatters: 'Modern template for chronic rare-disease pricing. ~$2M+ over 5 years; ICER deemed price misaligned with benefit.',
    src: 'https://www.ncbi.nlm.nih.gov/books/NBK534118/',
  },
  {
    id: 'zolgensma',
    drug: 'Zolgensma (onasemnogene abeparvovec)',
    manufacturer: 'Novartis (AveXis)',
    indication: 'SMA — children under 2',
    approved: 2019,
    priceText: '$2.125M',
    priceContext: 'one-time intravenous infusion',
    whyItMatters: 'Most expensive single-dose drug ever approved. Forced the "value of a cure" debate: how do you finance lifetime benefit billed as one event?',
    src: 'https://www.novartis.com/news/media-releases/avexis-announces-innovative-zolgensma-gene-therapy-access-programs-us-payers-and-families',
  },
  {
    id: 'aduhelm',
    drug: 'Aduhelm (aducanumab)',
    manufacturer: 'Biogen',
    indication: "Early Alzheimer's disease",
    approved: 2021,
    priceText: '$28K–56K/year',
    priceContext: 'withdrawn January 2024',
    whyItMatters: 'Cleanest case of the four-way collision. FDA approved, AMA coded, CMS refused broad coverage, payers refused, manufacturer withdrew — all in 30 months.',
    src: 'https://investors.biogen.com/news-releases/news-release-details/biogen-realign-resources-alzheimers-disease-franchise',
  },
  {
    id: 'leqembi',
    drug: 'Leqembi (lecanemab)',
    manufacturer: 'Eisai / Biogen',
    indication: "Early Alzheimer's disease",
    approved: 2023,
    priceText: '$26,500/year',
    priceContext: 'ongoing infusion + MRI monitoring',
    whyItMatters: 'Priced at half of Aduhelm to win coverage. Anti-amyloid drugs cause ARIA (brain swelling) — driving demand for AI-based MRI surveillance, a new CPT category in waiting.',
    src: 'https://media-us.eisai.com/2023-01-06-EISAIS-APPROACH-TO-U-S-PRICING-FOR-LEQEMBI-TM-LECANEMAB-,-A-TREATMENT-FOR-EARLY-ALZHEIMERS-DISEASE,-SETS-FORTH-OUR-CONCEPT-OF-SOCIETAL-VALUE-OF-MEDICINE-IN-RELATION-TO-PRICE-OF-MEDICINE',
  },
];

// ─── Value of a Statistical Life — the regulatory anchor ──────────────────
//
// The number federal agencies use when weighing whether a regulation's
// benefits outweigh its costs. This is what Spinraza, Zolgensma and Leqembi
// implicitly bid against.

export interface VSLAnchor {
  agency: string;
  year: number;
  amount: string;
  note: string;
  src: string;
}

export const US_VSL: VSLAnchor[] = [
  {
    agency: 'HHS / ASPE',
    year: 2024,
    amount: '$13.1 million',
    note: 'Central estimate used for HHS regulatory impact analysis. NOT the value of a person\'s life — the rate at which a person trades money for small mortality-risk reductions.',
    src: 'https://aspe.hhs.gov/sites/default/files/documents/cd2a1348ea0777b1aa918089e4965b8c/standard-ria-values.pdf',
  },
  {
    agency: 'DOT',
    year: 2024,
    amount: '$13.7 million',
    note: 'Department of Transportation\'s VSL — slightly higher than HHS. Different agencies use different anchors.',
    src: 'https://www.dco.uscg.mil/Portals/9/VSL%202024%209May24%20FINAL%20for%20DIST.pdf',
  },
];

// ─── Roadmap items — what's in the queue 2024-2030 ───────────────────────
//
// AI-specific events on the calendar. Each one has a primary regulator
// document or stated intent — not speculation.

export interface RoadmapItem {
  id: string;
  year: number;
  area: 'fda' | 'ama' | 'cms' | 'industry';
  title: string;
  detail: string;
  src: string;
}

export const US_ROADMAP: RoadmapItem[] = [
  {
    id: 'fda-pccp-final',
    year: 2024,
    area: 'fda',
    title: 'PCCP final guidance issued (Dec 2024)',
    detail: 'Predetermined Change Control Plan path now formally available for AI-enabled device software. Manufacturers can ship pre-approved improvement plans instead of refiling for each retrain.',
    src: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/marketing-submission-recommendations-predetermined-change-control-plan-artificial-intelligence',
  },
  {
    id: 'fda-ai-list-growth',
    year: 2025,
    area: 'fda',
    title: 'FDA AI/ML device list crossed ~1000 (2025)',
    detail: 'List grew from 882 (Mar 2024) to 950 (Aug 2024) and continues. Expect quarterly updates from CDRH; concentration in radiology, cardiology, ophthalmology.',
    src: 'https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-aiml-enabled-medical-devices',
  },
  {
    id: 'ama-cpt-cycle',
    year: 2026,
    area: 'ama',
    title: 'Annual CPT cycle — AI codes accumulate',
    detail: 'AMA CPT Editorial Panel meets three times per year; new codes published each fall, effective January 1. Watch the Category III → Category I migration as evidence accumulates for ARIA monitoring AI, breast-cancer screening AI and ECG-interpretation AI.',
    src: 'https://www.ama-assn.org/practice-management/cpt/cpt-overview-and-code-approval',
  },
  {
    id: 'cms-coverage-evidence',
    year: 2026,
    area: 'cms',
    title: 'CMS coverage-with-evidence-development for AI',
    detail: 'CMS increasingly conditions coverage on registry enrolment (precedent: Leqembi). Expect this model to extend to AI devices — coverage tied to ongoing real-world performance reporting.',
    src: 'https://www.cms.gov/medicare-coverage-database/view/medicare-coverage-document.aspx?MCDId=27',
  },
];
