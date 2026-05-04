// Grants — open public-funding calls in healthcare AI.
//
// Compliance: every entry must include a primary `src` URL pointing at the
// funder's call page. Entries below are scaffolds — the program names, funders,
// regions, and source URLs are real, but text fields like amount, deadline,
// eligibility, and notes are TODO until each one is verified against the
// funder's current call page.

import { PathRole } from '@/types/research';

export type GrantRegion = 'US' | 'EU' | 'UK' | 'UAE' | 'Global';

export interface GrantOpening {
  id: string;
  title: string;
  funder: string;
  region: GrantRegion;
  amount?: string;
  deadline?: string; // ISO date, 'rolling', or 'TODO'
  eligibility: string;
  roles: PathRole[];
  src: string;
  notes?: string;
}

export const grants: GrantOpening[] = [
  {
    id: 'nih-bridge2ai',
    title: 'NIH Bridge2AI',
    funder: 'NIH Common Fund',
    region: 'US',
    amount: 'TODO',
    deadline: 'TODO',
    eligibility: 'TODO',
    roles: ['student', 'founder'],
    src: 'https://commonfund.nih.gov/bridge2ai',
    notes: 'TODO',
  },
  {
    id: 'arpa-h-missions',
    title: 'ARPA-H Open Calls',
    funder: 'ARPA-H (US)',
    region: 'US',
    amount: 'TODO',
    deadline: 'TODO',
    eligibility: 'TODO',
    roles: ['founder', 'student', 'business'],
    src: 'https://arpa-h.gov/research-and-funding/programs',
    notes: 'TODO',
  },
  {
    id: 'horizon-europe-health',
    title: 'Horizon Europe — Health Cluster',
    funder: 'European Commission',
    region: 'EU',
    amount: 'TODO',
    deadline: 'TODO',
    eligibility: 'TODO',
    roles: ['founder', 'student', 'business'],
    src: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-search',
    notes: 'TODO',
  },
  {
    id: 'aria-precision-neurotech',
    title: 'ARIA — Opportunity Spaces',
    funder: 'Advanced Research and Invention Agency (UK)',
    region: 'UK',
    amount: 'TODO',
    deadline: 'TODO',
    eligibility: 'TODO',
    roles: ['founder', 'student'],
    src: 'https://www.aria.org.uk/opportunity-spaces/',
    notes: 'TODO',
  },
  {
    id: 'wellcome-leap',
    title: 'Wellcome Leap — health-AI programs',
    funder: 'Wellcome Leap',
    region: 'Global',
    amount: 'TODO',
    deadline: 'TODO',
    eligibility: 'TODO',
    roles: ['student', 'founder'],
    src: 'https://wellcomeleap.org/programs/',
    notes: 'TODO',
  },
  {
    id: 'cancer-grand-challenges',
    title: 'Cancer Grand Challenges',
    funder: 'Cancer Research UK + NCI (US)',
    region: 'Global',
    amount: 'TODO',
    deadline: 'TODO',
    eligibility: 'TODO',
    roles: ['student'],
    src: 'https://cancergrandchallenges.org/about',
    notes: 'TODO',
  },
];
