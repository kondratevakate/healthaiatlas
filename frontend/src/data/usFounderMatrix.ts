// Founder's Decision Matrix — graveyard and survival cases for US healthcare AI.
//
// Each case is scored on 7 axes: the six actors that can independently kill the
// company (FDA, AMA, CMS, Payer, Pharma, Capital) plus a seventh — Policy
// Tailwind / Mission Fit — that captures whether the niche is plugged into
// a funded federal mission (Cancer Moonshot, EHE 2030, ACCESS, etc.).
//
// Scores are 0..1 judgment calls grounded in primary sources cited per case.
// They are NOT measurements; they are a teaching artefact for "which spoke
// killed it / kept it alive." The radar visualisation makes the failure mode
// visible at a glance: a fundable niche fills all seven spokes; the doomed
// ones collapse to one or two.

export type StartupOutcome = 'live' | 'acquired' | 'shutdown' | 'fraud';

export interface DecisionScore {
  fda: number;        // regulatory path cleared
  ama: number;        // CPT code (Cat I = 1, Cat III = 0.5, none = 0)
  cms: number;        // Medicare reimburses
  payer: number;      // private payers cover
  pharma: number;     // pharma partnership / pull
  capital: number;    // funding access
  policy: number;     // attached to a funded federal mission anchor
}

export interface FounderCase {
  id: string;
  name: string;
  niche: string;
  outcome: StartupOutcome;
  outcomeDate: string;        // human-readable, e.g. "Apr 2023"
  scores: DecisionScore;
  policyAnchor?: string;      // which US Policy Horizon, if any
  oneLiner: string;           // diagnostic — which spoke killed/saved it
  src: string;                // primary source
}

export const OUTCOME_LABELS: Record<StartupOutcome, string> = {
  live: 'Live',
  acquired: 'Acquired',
  shutdown: 'Shut down',
  fraud: 'Fraud',
};

export const OUTCOME_COLORS: Record<StartupOutcome, string> = {
  live: 'hsl(155, 60%, 38%)',          // green
  acquired: 'hsl(215, 70%, 50%)',      // blue
  shutdown: 'hsl(0, 65%, 50%)',        // red
  fraud: 'hsl(355, 75%, 30%)',         // dark red
};

export const AXIS_ORDER = [
  'fda',
  'ama',
  'cms',
  'payer',
  'pharma',
  'capital',
  'policy',
] as const satisfies readonly (keyof DecisionScore)[];

export const AXIS_LABELS: Record<keyof DecisionScore, string> = {
  fda: 'FDA',
  ama: 'AMA',
  cms: 'CMS',
  payer: 'Payer',
  pharma: 'Pharma',
  capital: 'Capital',
  policy: 'Policy',
};

export const FOUNDER_CASES: FounderCase[] = [
  // ─── Live winners — full polygons ────────────────────────────────────────
  {
    id: 'digital-diagnostics-idx-dr',
    name: 'Digital Diagnostics (IDx-DR)',
    niche: 'Autonomous diabetic retinopathy screening',
    outcome: 'live',
    outcomeDate: 'live since 2018',
    scores: { fda: 1.0, ama: 1.0, cms: 0.85, payer: 0.75, pharma: 0.2, capital: 0.7, policy: 0.55 },
    policyAnchor: 'Healthy People 2030 (diabetes complications)',
    oneLiner: 'First fully autonomous AI device. Cat I CPT 92229. Medicare and most major payers cover. The textbook full polygon.',
    src: 'https://www.accessdata.fda.gov/cdrh_docs/reviews/DEN180001.pdf',
  },
  {
    id: 'heartflow',
    name: 'HeartFlow',
    niche: 'AI-derived coronary FFR-CT',
    outcome: 'live',
    outcomeDate: 'live, IPO 2024',
    scores: { fda: 1.0, ama: 1.0, cms: 0.9, payer: 0.85, pharma: 0.3, capital: 0.85, policy: 0.6 },
    policyAnchor: 'CMS Accountable Care (cardiovascular value-based care)',
    oneLiner: 'Multiple FDA 510(k) clearances. Cat I CPT 75580 effective Jan 2024 with bumped reimbursement. The strongest CPT-anchored cardiology AI story.',
    src: 'https://www.heartflow.com/newsroom/heartflow-announces-new-category-i-cpt-code/',
  },
  {
    id: 'tempus-ai',
    name: 'Tempus AI',
    niche: 'Multimodal oncology data platform',
    outcome: 'live',
    outcomeDate: 'NASDAQ IPO Jun 2024',
    scores: { fda: 0.6, ama: 0.3, cms: 0.4, payer: 0.5, pharma: 1.0, capital: 0.95, policy: 0.85 },
    policyAnchor: 'Cancer Moonshot 2047',
    oneLiner: 'Pharma-pull is the carrying axis (AstraZeneca, Pfizer, GSK, Merck, BMS contracts). $410M raised at $6.1B valuation. Patient revenue still small share.',
    src: 'https://www.fiercehealthcare.com/health-tech/tempus-ai-shares-jump-15-stock-market-debut-ipo-priced-over-6b-valuation',
  },
  {
    id: 'paige',
    name: 'Paige',
    niche: 'AI digital pathology (prostate, breast)',
    outcome: 'live',
    outcomeDate: 'live since 2018',
    scores: { fda: 1.0, ama: 0.2, cms: 0.3, payer: 0.4, pharma: 0.5, capital: 0.7, policy: 0.85 },
    policyAnchor: 'Cancer Moonshot 2047',
    oneLiner: 'First AI pathology tool with FDA De Novo (2021). Strong mission fit. No dedicated CPT — uptake bottlenecked by reimbursement, not technology.',
    src: 'https://www.paige.ai/press-releases',
  },

  // ─── Acquired — pharma-pull & strategic exits ────────────────────────────
  {
    id: 'icometrix-ge',
    name: 'icometrix → GE HealthCare',
    niche: 'Brain-MRI AI (MS, ARIA monitoring)',
    outcome: 'acquired',
    outcomeDate: 'Sep 2025',
    scores: { fda: 1.0, ama: 0.4, cms: 0.5, payer: 0.5, pharma: 0.95, capital: 0.7, policy: 0.65 },
    policyAnchor: 'MAHA chronic-disease umbrella (Alzheimer / aging)',
    oneLiner: 'icobrain aria FDA-cleared Nov 2024. GE acquisition Sep 2025 — 10 months. The new Alzheimer drugs created the niche; pharma-pull pulled the exit.',
    src: 'https://investor.gehealthcare.com/news-releases/news-release-details/ge-healthcare-announces-intent-acquire-icometrix-strengthen',
  },

  // ─── Shutdowns — partial polygons that left a spoke at zero ─────────────
  {
    id: 'pear-therapeutics',
    name: 'Pear Therapeutics',
    niche: 'Prescription Digital Therapeutics (PDT)',
    outcome: 'shutdown',
    outcomeDate: 'Apr 2023, Ch.11',
    scores: { fda: 1.0, ama: 0.0, cms: 0.0, payer: 0.05, pharma: 0.1, capital: 0.6, policy: 0.4 },
    policyAnchor: 'Healthy People 2030 (mental health, substance use) — soft fit',
    oneLiner: 'FDA cleared three PDTs. Payers refused to reimburse. $6M asset sale vs $32M debt. The PAYER spoke at zero killed it.',
    src: 'https://www.sec.gov/Archives/edgar/data/1835567/000183556723000020/peartherapeuticsfilesforch.htm',
  },
  {
    id: 'olive-ai',
    name: 'Olive AI',
    niche: 'Healthcare back-office RPA / automation',
    outcome: 'shutdown',
    outcomeDate: 'Oct 2023',
    scores: { fda: 0.0, ama: 0.0, cms: 0.0, payer: 0.1, pharma: 0.0, capital: 0.95, policy: 0.15 },
    oneLiner: '$902M raised, $4B peak valuation. CAPITAL-ONLY polygon. No clinical evidence path, no mission anchor, "AI" was largely manual workers.',
    src: 'https://www.fiercehealthcare.com/health-tech/once-high-flying-unicorn-olive-ai-sells-two-key-businesses-winds-down-operations',
  },
  {
    id: 'babylon-health',
    name: 'Babylon Health',
    niche: 'Consumer AI symptom-checker / digital primary care',
    outcome: 'shutdown',
    outcomeDate: 'Aug-Sep 2023, Ch.7',
    scores: { fda: 0.2, ama: 0.0, cms: 0.0, payer: 0.15, pharma: 0.0, capital: 0.85, policy: 0.15 },
    oneLiner: 'SPAC at $4.2B, UK assets sold for £500K. Capital-heavy, mission-orphan, payer model never closed. AI safety claims discredited by UK regulators.',
    src: 'https://www.healthcaredive.com/news/Babylon-Chapter-7-bankruptcy/691218/',
  },
  {
    id: 'forward-health',
    name: 'Forward Health',
    niche: 'Self-service AI primary-care kiosk (CarePod)',
    outcome: 'shutdown',
    outcomeDate: 'Nov 2024',
    scores: { fda: 0.1, ama: 0.0, cms: 0.0, payer: 0.1, pharma: 0.0, capital: 0.8, policy: 0.1 },
    oneLiner: '$657M raised, only 3 CarePods deployed. Patients literally got stuck inside. No reimbursement path for unsupervised AI primary care.',
    src: 'https://www.fiercehealthcare.com/health-tech/primary-care-player-forward-shutters-after-raising-400m-rolling-out-carepods',
  },
  {
    id: 'blackford-bayer',
    name: 'Blackford / Bayer Calantic',
    niche: 'Radiology AI marketplace platform',
    outcome: 'shutdown',
    outcomeDate: 'Sep 2025',
    scores: { fda: 0.5, ama: 0.2, cms: 0.2, payer: 0.2, pharma: 0.5, capital: 0.85, policy: 0.15 },
    oneLiner: '150+ third-party AI apps on the platform. Bayer cited "narrow reimbursement, slow adoption, IT integration friction." The marketplace layer cannot pay for itself yet.',
    src: 'https://hitconsultant.net/2025/09/09/bayer-exits-radiology-ai-market-discontinuing-calantic-and-blackford/',
  },
  {
    id: 'aduhelm-biogen',
    name: 'Aduhelm (Biogen)',
    niche: 'Anti-amyloid Alzheimer therapy',
    outcome: 'shutdown',
    outcomeDate: 'Withdrawn Jan 2024',
    scores: { fda: 1.0, ama: 0.6, cms: 0.05, payer: 0.1, pharma: 1.0, capital: 1.0, policy: 0.5 },
    oneLiner: 'FDA approved over advisory-committee No vote. CMS National Coverage Determination effectively blocked reimbursement. The CMS spoke at zero killed a "blockbuster."',
    src: 'https://investors.biogen.com/news-releases/news-release-details/biogen-realign-resources-alzheimers-disease-franchise',
  },

  // ─── Fraud — capital-only collapse ───────────────────────────────────────
  {
    id: 'theranos',
    name: 'Theranos',
    niche: 'Lab-developed-test loophole abuse',
    outcome: 'fraud',
    outcomeDate: 'Dissolved Sep 2018',
    scores: { fda: 0.05, ama: 0.0, cms: 0.0, payer: 0.0, pharma: 0.0, capital: 1.0, policy: 0.0 },
    oneLiner: '~$700M raised, $9B peak valuation, ONE FDA-cleared test (HSV-1 IgG). Capital-only polygon collapsed into criminal conviction. The doom signal.',
    src: 'https://www.fda.gov/about-fda/regulatory-news-stories-and-features/patient-advocacy-lies-heart-fda-agents-theranos-case',
  },
];
