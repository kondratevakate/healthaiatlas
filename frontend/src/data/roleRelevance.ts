// Role-relevance overlay for existing Discovery data (conferences, launches, prompts).
// Keyed by entry id. If an id is absent from the map, the entry is treated as
// relevant to every role (no filtering).

import { PathRole } from '@/types/research';

export type RoleSet = PathRole[];

export const conferenceRoles: Record<string, RoleSet> = {
  'gitex-global-2026': ['founder', 'business', 'jobseeker'],
  'ai-medicine-summit-2026': ['founder', 'student'],
  'digital-health-workshop-2026': ['business', 'student'],
  'hub71-demo-day-2026': ['founder', 'jobseeker'],
};

export const launchRoles: Record<string, RoleSet> = {
  'g42-healthcare': ['founder', 'business', 'student'],
  'pulse-ai': ['founder', 'jobseeker'],
  'botim-health': ['business', 'jobseeker'],
};

// Returns true when the entry should be visible under the current role filter.
// `'all'` always passes; missing entries pass every filter ("relevant to everyone").
export function matchesRole(
  id: string,
  map: Record<string, RoleSet>,
  filter: PathRole | 'all',
): boolean {
  if (filter === 'all') return true;
  const tags = map[id];
  if (!tags) return true;
  return tags.includes(filter);
}
