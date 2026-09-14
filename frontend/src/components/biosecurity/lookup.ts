import { BIO_COLUMNS, BIO_GROUPS, type BioOrg } from '@/data/biosecurity';

// BIO_GROUPS is the single source of truth for group colour — chips, headers
// and sheet pills all read from here.
export const COLUMN_BY_ID = new Map(BIO_COLUMNS.map((c) => [c.id, c]));
export const GROUP_BY_ID = new Map(BIO_GROUPS.map((g) => [g.id, g]));

export function groupColor(groupId: string): string {
  return GROUP_BY_ID.get(groupId)?.color ?? 'hsl(var(--muted-foreground))';
}

export function columnLabel(columnId: string): string {
  const col = COLUMN_BY_ID.get(columnId);
  if (!col) return columnId;
  const group = GROUP_BY_ID.get(col.group)?.label ?? col.group;
  return col.label === 'General' ? group : `${group} · ${col.label}`;
}

/** Acronym from a trailing "(ABC)" when present, otherwise the full name. */
export function shortName(name: string): string {
  return name.match(/\(([^)]{2,14})\)/)?.[1] ?? name;
}

export function orgGroups(org: BioOrg): string[] {
  return Array.from(new Set(org.cols.map((c) => COLUMN_BY_ID.get(c)?.group).filter((g): g is string => !!g)));
}
