import { ExternalLink, ShieldAlert, DollarSign, Scale, Compass, AlertTriangle, ChevronDown } from 'lucide-react';
import {
  US_ACTORS,
  US_DRUG_PRICES,
  US_VSL,
} from '@/data/usDecisionStack';
import { US_POLICY_HORIZONS } from '@/data/usPolicyHorizons';

// Policy horizons that open by default (most actionable / most funded);
// the rest collapse to summary-only to reduce sidebar bottom whitespace.
const DEFAULT_OPEN_HORIZONS = new Set([
  'cms-accountable-care-2030',
  'cancer-moonshot-2047',
  'access-tempo-pilots',
]);

function SectionHeader({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-primary">{icon}</span>
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-mono font-medium">
          {title}
        </h3>
      </div>
      {hint && <p className="text-[11px] text-muted-foreground/80 leading-snug mb-3">{hint}</p>}
    </div>
  );
}

export function UsSidebar() {
  return (
    <div className="space-y-8 p-4">
      {/* Decision stack — actors with veto power */}
      <section>
        <SectionHeader
          icon={<ShieldAlert className="h-4 w-4" />}
          title="Decision stack"
          hint="Each actor can independently kill an AI product's path to a patient. All four (FDA + AMA + CMS + payers) must say yes."
        />
        <div className="space-y-2">
          {US_ACTORS.map((actor) => (
            <details
              key={actor.id}
              className="border border-border bg-background group open:border-foreground/40"
            >
              <summary className="cursor-pointer p-3 flex items-center justify-between gap-3 list-none">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{actor.name}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1">
                    {actor.expanded}
                  </div>
                </div>
                <ChevronDown
                  className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="px-3 pb-3 pt-0 space-y-2 text-xs">
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-0.5">
                    Role
                  </div>
                  <div className="text-foreground/90 leading-relaxed">{actor.role}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-0.5">
                    Veto power
                  </div>
                  <div className="text-foreground/90 leading-relaxed">{actor.vetoPower}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-0.5">
                    Cadence
                  </div>
                  <div className="text-foreground/90 leading-relaxed">{actor.cadence}</div>
                </div>
                <a
                  href={actor.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                >
                  <ExternalLink className="h-3 w-3" /> Source
                </a>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Drug pricing examples */}
      <section>
        <SectionHeader
          icon={<DollarSign className="h-4 w-4" />}
          title="Pricing anchors"
          hint="What drugs cost when the system says yes — and what it costs when it says no (Aduhelm)."
        />
        <div className="space-y-2">
          {US_DRUG_PRICES.map((d) => (
            <div key={d.id} className="border border-border bg-background p-3 space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-sm font-semibold text-foreground">{d.drug}</div>
                <div className="text-[10px] font-mono text-muted-foreground">{d.approved}</div>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {d.manufacturer} · {d.indication}
              </div>
              <div className="font-mono text-sm text-primary font-bold">{d.priceText}</div>
              <div className="text-[11px] text-muted-foreground italic">{d.priceContext}</div>
              <p className="text-xs text-foreground/85 leading-relaxed pt-1 border-t border-border">
                {d.whyItMatters}
              </p>
              <a
                href={d.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
              >
                <ExternalLink className="h-3 w-3" /> Source
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Value of Statistical Life */}
      <section>
        <SectionHeader
          icon={<Scale className="h-4 w-4" />}
          title="Value of a Statistical Life"
          hint="The number federal agencies use to weigh whether a regulation's mortality benefit is worth its cost. The number Spinraza, Zolgensma and Leqembi implicitly bid against."
        />
        <div className="space-y-2">
          {US_VSL.map((v) => (
            <div key={v.agency} className="border border-border bg-background p-3 space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-sm font-semibold text-foreground">{v.agency}</div>
                <div className="text-[10px] font-mono text-muted-foreground">{v.year}</div>
              </div>
              <div className="font-mono text-lg text-primary font-bold">{v.amount}</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{v.note}</p>
              <a
                href={v.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
              >
                <ExternalLink className="h-3 w-3" /> Source
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* US Policy Horizons — replaces the old "Roadmap → 2030" tile */}
      <section>
        <SectionHeader
          icon={<Compass className="h-4 w-4" />}
          title="US Policy Horizons"
          hint="US health AI companies don't only answer to FDA. They operate inside federal missions around chronic disease, cancer mortality, HIV elimination, accountable care, interoperability, and real-world evidence. These shape funding, reimbursement experiments, procurement language, and investor narratives."
        />
        <div className="space-y-2">
          {US_POLICY_HORIZONS.map((h) => {
            const open = DEFAULT_OPEN_HORIZONS.has(h.id);
            return (
              <details
                key={h.id}
                open={open}
                className="border border-border bg-background group open:border-foreground/40"
              >
                <summary className="cursor-pointer p-3 list-none space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-foreground">{h.title}</div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-muted-foreground border border-border px-1.5 py-0.5">
                        {h.owner} · {h.targetYear}
                      </span>
                      <ChevronDown
                        className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-foreground/85 leading-relaxed">{h.oneLiner}</p>
                </summary>

                <div className="px-3 pb-3 pt-0 space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80">
                    {h.enacted}
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mb-0.5">
                      What it funds
                    </div>
                    <p className="text-[11px] text-foreground/85 leading-relaxed">{h.startupAngle}</p>
                  </div>

                  {h.caveat && (
                    <div className="flex items-start gap-1.5 border border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/10 p-2">
                      <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-900 dark:text-amber-200 leading-relaxed">
                        {h.caveat}
                      </p>
                    </div>
                  )}

                  <a
                    href={h.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                  >
                    <ExternalLink className="h-3 w-3" /> Source
                  </a>
                </div>
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}
