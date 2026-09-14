import { Circle, Network, Radar, ShieldCheck, Syringe, type LucideIcon } from 'lucide-react';
import { BIO_COLUMNS, BIO_GROUPS, type BioOrg } from '@/data/biosecurity';

// Brand rule (docs/design-decisions/2026-05-palette-strategy.md): categories
// are differentiated by icon and label, never by colour.
const GROUP_ICONS: Record<string, LucideIcon> = {
  prevention: ShieldCheck,
  detection: Radar,
  response: Syringe,
  transversal: Network,
};

export const COLUMN_BY_ID = new Map(BIO_COLUMNS.map((c) => [c.id, c]));
export const GROUP_BY_ID = new Map(BIO_GROUPS.map((g) => [g.id, g]));

export function groupIcon(groupId: string): LucideIcon {
  return GROUP_ICONS[groupId] ?? Circle;
}

export function groupLabel(groupId: string): string {
  return GROUP_BY_ID.get(groupId)?.label ?? groupId;
}

export function columnLabel(columnId: string): string {
  const col = COLUMN_BY_ID.get(columnId);
  if (!col) return columnId;
  return col.label === 'General' ? groupLabel(col.group) : `${groupLabel(col.group)} · ${col.label}`;
}

/** Acronym from a trailing "(ABC)" when present, otherwise the full name. */
export function shortName(name: string): string {
  return name.match(/\(([^)]{2,14})\)/)?.[1] ?? name;
}

export function orgGroups(org: BioOrg): string[] {
  return Array.from(new Set(org.cols.map((c) => COLUMN_BY_ID.get(c)?.group).filter((g): g is string => !!g)));
}
