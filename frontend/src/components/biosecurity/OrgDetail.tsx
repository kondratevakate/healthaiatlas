import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { BIO_SOURCE, type BioOrg } from '@/data/biosecurity';
import { COLUMN_BY_ID, columnLabel, groupIcon } from './lookup';

export function OrgDetail({ org }: { org: BioOrg }) {
  return (
    <>
      <SheetHeader className="text-left mb-5">
        <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">{org.type}</div>
        <SheetTitle className="text-xl font-semibold">{org.name}</SheetTitle>
        {org.desc && <SheetDescription className="text-sm text-muted-foreground">{org.desc}</SheetDescription>}
      </SheetHeader>

      <div className="space-y-4 text-xs">
        <Field label="Categories">
          {org.cols.map((c) => {
            const Icon = groupIcon(COLUMN_BY_ID.get(c)?.group ?? '');
            return (
              <span key={c} className="px-2 py-0.5 border border-foreground text-[11px] text-foreground inline-flex items-center gap-1">
                <Icon className="h-3 w-3" aria-hidden />
                {columnLabel(c)}
              </span>
            );
          })}
        </Field>
        {org.focus.length > 0 && <Field label="Intervention focus">{org.focus.map(pill)}</Field>}
        {org.activity.length > 0 && <Field label="Activity">{org.activity.map(pill)}</Field>}
        {org.approach.length > 0 && <Field label="Approach">{org.approach.map(pill)}</Field>}
        {org.loc.length > 0 && <Field label="Locations">{org.loc.map(pill)}</Field>}

        <div className="flex flex-col gap-1.5 pt-3 border-t border-border">
          {org.web && (
            <a href={org.web} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground underline underline-offset-2 hover:opacity-70">
              <ExternalLink className="h-3 w-3" aria-hidden />
              Website
            </a>
          )}
          <a href={org.src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground underline underline-offset-2 hover:opacity-70">
            <ExternalLink className="h-3 w-3" aria-hidden />
            Source: {BIO_SOURCE.name} directory
          </a>
        </div>
      </div>
    </>
  );
}

function pill(value: string) {
  return (
    <span key={value} className="px-2 py-0.5 border border-border text-[11px] text-foreground">
      {value}
    </span>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-1">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
