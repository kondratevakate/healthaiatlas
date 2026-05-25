import { Map, BarChart3, Building2, Compass, Lightbulb } from 'lucide-react';
import { UAE_FOUNDER_TAKEAWAYS } from '@/data/uaeMarketReality';
import { HeadlineContrast } from './HeadlineContrast';
import { ProcurementTable } from './ProcurementTable';
import { AcceleratorGrid } from './AcceleratorGrid';

function SubBlockHeader({
  icon: Icon,
  label,
  intro,
}: {
  icon: typeof Map;
  label: string;
  intro: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-mono text-[11px] uppercase tracking-widest font-semibold text-foreground">
          {label}
        </h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed italic max-w-3xl">{intro}</p>
    </div>
  );
}

export function MarketReality() {
  return (
    <section>
      <header className="mb-6">
        <div
          className="text-[10px] uppercase tracking-widest font-mono italic text-muted-foreground mb-2"
        >
          ★ <span style={{ color: 'hsl(14 90% 55%)' }}>UAE Founder Reality</span> · 2026 · the floor before any other decision
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Map className="h-5 w-5" style={{ color: 'hsl(180 70% 40%)' }} />
          <h2 className="heading-editorial">
            Founder Reality Map
          </h2>
        </div>
        <p className="text-sm text-foreground/85 leading-relaxed max-w-3xl">
          Where a UAE healthcare-AI founder actually stands. Five facts, primary-sourced. The US
          tab argues <em>which spoke kills you</em>; the UAE tab argues <em>the floor is too low
          for any spoke to matter at venture scale.</em>
        </p>
      </header>

      {/* 1. Headline contrast */}
      <div className="mb-10">
        <SubBlockHeader
          icon={BarChart3}
          label="Scale"
          intro="UAE healthcare AI is roughly 0.2% of US. This is the denominator before any other decision."
        />
        <HeadlineContrast />
      </div>

      {/* 2. Procurement reality */}
      <div className="mb-10">
        <SubBlockHeader
          icon={Building2}
          label="Procurement"
          intro="Twelve major UAE healthcare AI infrastructure contracts in recent years went to US/EU vendors. Zero to UAE-founded startups."
        />
        <ProcurementTable />
      </div>

      {/* 3. Accelerator pattern */}
      <div className="mb-10">
        <SubBlockHeader
          icon={Compass}
          label="Accelerators"
          intro="Six programs. Documented pattern is soft-landing for international companies, not launchpad for UAE-founded scaleups."
        />
        <AcceleratorGrid />
      </div>

      {/* 4. Founder takeaways */}
      <div>
        <SubBlockHeader
          icon={Lightbulb}
          label="What this means"
          intro="Five takeaways for someone deciding where to incorporate."
        />
        <div className="space-y-3">
          {UAE_FOUNDER_TAKEAWAYS.map((t, i) => (
            <div key={t.id} className="border-l-2 border-primary pl-3 py-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h4 className="font-serif text-base font-semibold text-foreground leading-tight">
                  {t.title}
                </h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
