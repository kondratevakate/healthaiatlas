// Programs — accelerators, fellowships, and structured cohort programs in healthcare AI.
//
// Entries below are scaffolds — the program names, organizers, regions, types,
// and source URLs are real, but text fields like duration, cohortDates,
// audience, and notes are TODO until each one is verified against the
// program's current page.

import { PathRole } from '@/types/research';
import { GrantRegion } from './grants';

export type ProgramType = 'accelerator' | 'fellowship' | 'incubator' | 'residency';

export interface Program {
  id: string;
  title: string;
  organizer: string;
  region: GrantRegion;
  type: ProgramType;
  duration: string;
  cohortDates?: string;
  audience: string;
  roles: PathRole[];
  src: string;
  notes?: string;
}

export const programs: Program[] = [
  {
    id: 'yc-healthtech',
    title: 'Y Combinator (HealthTech accepted)',
    organizer: 'Y Combinator',
    region: 'US',
    type: 'accelerator',
    duration: 'TODO',
    cohortDates: 'TODO',
    audience: 'TODO',
    roles: ['founder'],
    src: 'https://www.ycombinator.com/apply',
    notes: 'TODO',
  },
  {
    id: 'mit-hacking-medicine',
    title: 'MIT Hacking Medicine',
    organizer: 'MIT Hacking Medicine',
    region: 'US',
    type: 'incubator',
    duration: 'TODO',
    audience: 'TODO',
    roles: ['student', 'founder'],
    src: 'https://hackingmedicine.mit.edu/',
    notes: 'TODO',
  },
  {
    id: 'hub71-plus-healthtech',
    title: 'Hub71+ HealthTech',
    organizer: 'Hub71 (Abu Dhabi)',
    region: 'UAE',
    type: 'accelerator',
    duration: 'TODO',
    audience: 'TODO',
    roles: ['founder', 'business'],
    src: 'https://hub71.com/healthtech',
    notes: 'TODO',
  },
  {
    id: 'plug-and-play-health',
    title: 'Plug and Play Health',
    organizer: 'Plug and Play',
    region: 'Global',
    type: 'accelerator',
    duration: 'TODO',
    cohortDates: 'TODO',
    audience: 'TODO',
    roles: ['founder'],
    src: 'https://www.plugandplaytechcenter.com/health/',
    notes: 'TODO',
  },
  {
    id: 'stanford-startx',
    title: 'StartX Med',
    organizer: 'Stanford StartX',
    region: 'US',
    type: 'incubator',
    duration: 'TODO',
    audience: 'TODO',
    roles: ['founder', 'student'],
    src: 'https://startx.com/',
    notes: 'TODO',
  },
  {
    id: 'roche-startup-creator',
    title: 'Roche Startup Creator',
    organizer: 'Roche',
    region: 'Global',
    type: 'accelerator',
    duration: 'TODO',
    audience: 'TODO',
    roles: ['founder', 'business'],
    src: 'https://www.roche.com/innovation',
    notes: 'TODO',
  },
  {
    id: 'nih-postdoc-fellowship',
    title: 'NIH Postdoctoral Fellowships',
    organizer: 'NIH',
    region: 'US',
    type: 'fellowship',
    duration: 'TODO',
    audience: 'TODO',
    roles: ['student'],
    src: 'https://www.training.nih.gov/programs/postdoc',
    notes: 'TODO',
  },
];
