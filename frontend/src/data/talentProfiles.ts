// Talent profiles — hirer-facing rated directory.
//
// Editorial principle from the talent-scout reference: Kaggle / Grand Challenge
// / MICCAI signals in medical AI are the wedge — a less-saturated top-of-funnel
// than the Codeforces / ICPC market that Lunapark, Spectral, Jane Street et al.
// already compete for. Profiles here lean toward those signal sources.
//
// Visibility model:
//   - public fields: name (or pseudonym), specialization, region, top public
//     signals with primary-source verification URL, availability badge, and a
//     calibrated rating tier
//   - gated fields: full identity, contact, detailed track record, references —
//     visible structurally (so hirers can see what they'd unlock) but content
//     is locked until access is granted. Today the gate is a 'Request access'
//     CTA pointing at GitHub; later it becomes a real auth-gated reveal.
//
// Compliance: only profiles with explicit consent to be listed go in here. The
// seed entries below are PLACEHOLDER (anonymized composites, not real people)
// — clearly labeled. Real profiles ship via PR with a documented consent log.

import { PathRole } from '@/types/research';
import { GrantRegion } from './grants';

export type ProfileTier = 'core' | 'strong' | 'emerging';

export type AvailabilityStatus =
  | 'open-to-offers'
  | 'open-to-collab'
  | 'currently-employed'
  | 'unknown';

export type SignalCategory = 'competition' | 'publication' | 'fellowship' | 'product' | 'community';

export interface PublicSignal {
  label: string;          // 'Kaggle GM', 'MICCAI 2024 paper', 'NeurIPS Spotlight'
  detail: string;         // 'Top 0.1% — RSNA Pneumonia 2024'
  category: SignalCategory;
  src?: string;           // primary-source URL — empty only for inference-tier
}

export interface GatedSummary {
  fullProfileAvailable: boolean;
  contactsAvailable: boolean;
  referencesCount: number;       // e.g. 3 — count is public, identities gated
  resumeAvailable: boolean;
}

export interface TalentProfile {
  id: string;
  // PUBLIC
  publicName: string;            // 'K. Smirnova' or full name if consented
  handle?: string;               // public Kaggle / GitHub / HF handle
  specialization: string[];      // ['oncology-imaging', 'sepsis-prediction']
  region: GrantRegion;
  publicSignals: PublicSignal[]; // max 4; ordered by editorial importance
  rating: number;                // 0-100; calibrated, not crowdsourced
  tier: ProfileTier;
  availability: AvailabilityStatus;
  // For the role chip filter — which hirer roles is this profile relevant to
  forRoles: PathRole[];
  isPlaceholder: boolean;        // true = anonymized seed, not a real person
  // GATED
  gated: GatedSummary;
}

// ---------------------------------------------------------------------------
// Seed profiles. All marked isPlaceholder=true. Replace as real (consented)
// profiles arrive via PR. Do NOT add a real person without an entry in the
// consent log.
// ---------------------------------------------------------------------------

export const talentProfiles: TalentProfile[] = [
  {
    id: 'placeholder-medical-imaging-1',
    publicName: 'K. Sasaki',
    handle: 'k-sasaki',
    specialization: ['medical-imaging', 'radiology', 'self-supervised-learning'],
    region: 'Global',
    publicSignals: [
      {
        label: 'Kaggle GM',
        detail: 'Top 0.1%; 1st place RSNA Screening 2024',
        category: 'competition',
        src: 'https://www.kaggle.com/',
      },
      {
        label: 'MICCAI 2024',
        detail: 'First-author paper — chest CT screening at population scale',
        category: 'publication',
        src: 'https://miccai.org/',
      },
      {
        label: 'ML Collective contributor',
        detail: 'Two open-source releases (~3k stars)',
        category: 'community',
        src: 'https://www.mlcollective.org/',
      },
    ],
    rating: 92,
    tier: 'core',
    availability: 'open-to-offers',
    forRoles: ['founder', 'business'],
    isPlaceholder: true,
    gated: { fullProfileAvailable: true, contactsAvailable: true, referencesCount: 3, resumeAvailable: true },
  },
  {
    id: 'placeholder-clinical-nlp-1',
    publicName: 'L. Hoffmann',
    handle: 'l-hoffmann',
    specialization: ['clinical-nlp', 'fhir', 'real-world-evidence'],
    region: 'EU',
    publicSignals: [
      {
        label: 'Google PhD Fellowship',
        detail: '2024 cohort — health & biomedicine',
        category: 'fellowship',
        src: 'https://research.google/programs-and-events/phd-fellowship/',
      },
      {
        label: 'NeurIPS 2025 Spotlight',
        detail: 'Clinical-trial recruitment via LLM-assisted eligibility screening',
        category: 'publication',
        src: 'https://neurips.cc/',
      },
    ],
    rating: 88,
    tier: 'core',
    availability: 'open-to-collab',
    forRoles: ['founder', 'student'],
    isPlaceholder: true,
    gated: { fullProfileAvailable: true, contactsAvailable: true, referencesCount: 2, resumeAvailable: true },
  },
  {
    id: 'placeholder-genomics-1',
    publicName: 'A. Volkova',
    specialization: ['genomics', 'multi-omics', 'variant-calling'],
    region: 'EU',
    publicSignals: [
      {
        label: 'Cohere For AI Scholar',
        detail: '2024 cohort — bioinformatics track',
        category: 'fellowship',
        src: 'https://cohere.com/research/scholars-program',
      },
      {
        label: 'Grand Challenge winner',
        detail: 'AutoPET-III 2024 — multi-tracer PET segmentation',
        category: 'competition',
        src: 'https://grand-challenge.org/',
      },
    ],
    rating: 81,
    tier: 'strong',
    availability: 'open-to-offers',
    forRoles: ['founder', 'business'],
    isPlaceholder: true,
    gated: { fullProfileAvailable: true, contactsAvailable: true, referencesCount: 2, resumeAvailable: true },
  },
  {
    id: 'placeholder-deployment-engineer-1',
    publicName: 'M. Rahimi',
    handle: 'm-rahimi',
    specialization: ['mlops', 'medical-imaging-deployment', 'gpu-inference'],
    region: 'UAE',
    publicSignals: [
      {
        label: 'Production ML at scale',
        detail: 'Deployed two FDA-cleared imaging products at prior employer',
        category: 'product',
      },
      {
        label: 'Kaggle Master',
        detail: 'Top 1% — 4 silver medals',
        category: 'competition',
        src: 'https://www.kaggle.com/',
      },
    ],
    rating: 76,
    tier: 'strong',
    availability: 'currently-employed',
    forRoles: ['founder', 'business'],
    isPlaceholder: true,
    gated: { fullProfileAvailable: true, contactsAvailable: false, referencesCount: 4, resumeAvailable: true },
  },
  {
    id: 'placeholder-safety-researcher-1',
    publicName: 'D. Lin',
    specialization: ['ai-safety', 'medical-llm-eval', 'redteaming'],
    region: 'US',
    publicSignals: [
      {
        label: 'MATS scholar',
        detail: 'Berkeley summer 2025 cohort — model-eval stream',
        category: 'fellowship',
        src: 'https://www.matsprogram.org/',
      },
      {
        label: 'Apart Research sprint',
        detail: '2nd place — clinical LLM hallucination detection',
        category: 'competition',
        src: 'https://www.apartresearch.com/',
      },
    ],
    rating: 72,
    tier: 'strong',
    availability: 'open-to-offers',
    forRoles: ['founder', 'student'],
    isPlaceholder: true,
    gated: { fullProfileAvailable: true, contactsAvailable: true, referencesCount: 1, resumeAvailable: false },
  },
  {
    id: 'placeholder-clinician-engineer-1',
    publicName: 'S. Iyer',
    specialization: ['clinical-decision-support', 'ed-triage', 'hl7-fhir'],
    region: 'UK',
    publicSignals: [
      {
        label: 'NHS AI Lab cohort',
        detail: '2024 — sepsis early-warning pilot',
        category: 'product',
        src: 'https://transform.england.nhs.uk/ai-lab/',
      },
      {
        label: 'BMJ Health & Care Informatics',
        detail: 'Lead author on a deployed-AI evaluation paper',
        category: 'publication',
      },
    ],
    rating: 69,
    tier: 'strong',
    availability: 'open-to-collab',
    forRoles: ['founder', 'business', 'student'],
    isPlaceholder: true,
    gated: { fullProfileAvailable: true, contactsAvailable: false, referencesCount: 2, resumeAvailable: true },
  },
  {
    id: 'placeholder-emerging-1',
    publicName: 'Anonymous, NeurIPS 2025 Tiny Paper',
    specialization: ['medical-imaging', 'data-efficiency'],
    region: 'EU',
    publicSignals: [
      {
        label: 'NeurIPS 2025 Tiny Paper',
        detail: 'Sole author — sample-efficient pretraining for histopathology',
        category: 'publication',
        src: 'https://blog.iclr.cc/2024/02/14/tiny-papers/',
      },
    ],
    rating: 58,
    tier: 'emerging',
    availability: 'open-to-offers',
    forRoles: ['founder', 'student'],
    isPlaceholder: true,
    gated: { fullProfileAvailable: true, contactsAvailable: true, referencesCount: 0, resumeAvailable: true },
  },
  {
    id: 'placeholder-emerging-2',
    publicName: 'R. Petrov',
    handle: 'r-petrov',
    specialization: ['medical-imaging', 'self-supervised-learning'],
    region: 'EU',
    publicSignals: [
      {
        label: 'Kaggle Expert',
        detail: 'Top 4% — RSNA Cervical Spine 2023',
        category: 'competition',
        src: 'https://www.kaggle.com/',
      },
      {
        label: 'Open-source maintainer',
        detail: 'Health-AI library, ~700 stars on GitHub',
        category: 'community',
      },
    ],
    rating: 54,
    tier: 'emerging',
    availability: 'open-to-offers',
    forRoles: ['founder', 'business'],
    isPlaceholder: true,
    gated: { fullProfileAvailable: true, contactsAvailable: false, referencesCount: 1, resumeAvailable: true },
  },
];

// ---------------------------------------------------------------------------
// Tier configuration — visual + framing per tier.
// ---------------------------------------------------------------------------

export const tierConfig: Record<ProfileTier, { label: string; description: string; accent: string }> = {
  core: {
    label: 'Core',
    description: 'Top 5% — verified competition wins, peer-reviewed first-author work, or production-deployed AI.',
    accent: 'border-primary text-primary',
  },
  strong: {
    label: 'Strong',
    description: 'Verified specialists with published work or competition medals; ready for senior roles.',
    accent: 'border-foreground/60 text-foreground',
  },
  emerging: {
    label: 'Emerging',
    description: 'Strong early signal (one publication, one ranked competition); early-career or transitioning.',
    accent: 'border-muted-foreground/40 text-muted-foreground',
  },
};

export const availabilityConfig: Record<AvailabilityStatus, { label: string; tone: 'positive' | 'neutral' | 'muted' }> = {
  'open-to-offers': { label: 'Open to offers', tone: 'positive' },
  'open-to-collab': { label: 'Open to collaboration', tone: 'positive' },
  'currently-employed': { label: 'Currently placed', tone: 'neutral' },
  unknown: { label: 'Status unknown', tone: 'muted' },
};
