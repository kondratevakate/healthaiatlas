import { motion } from 'framer-motion';
import {
  ArrowDown,
  ExternalLink,
  Scale,
  Skull,
  FileText,
  ShieldCheck,
  DollarSign,
  Hash,
  XCircle,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react';
import {
  US_TIMELINE,
  US_ERAS,
  WE_ARE_HERE,
  type USEvent,
  type USEra,
  type USEventType,
} from '@/data/usHealthcareTimeline';
import { cn } from '@/lib/utils';

const TYPE_LABEL: Record<USEventType, string> = {
  law: 'Law',
  crisis: 'Crisis',
  agency: 'Framework',
  approval: 'Approval',
  pricing: 'Pricing',
  code: 'CPT Code',
  withdrawal: 'Withdrawal',
  guidance: 'Guidance',
};

const TYPE_ICON: Record<USEventType, LucideIcon> = {
  law: Scale,
  crisis: Skull,
  agency: FileText,
  approval: ShieldCheck,
  pricing: DollarSign,
  code: Hash,
  withdrawal: XCircle,
  guidance: ClipboardList,
};

// HSL accents per era — used for the era-header rail and the type chip.
const ERA_ACCENT: Record<USEra, string> = {
  roadmap: '180 70% 40%',
  ai: '14 90% 55%',
  digital: '215 80% 55%',
  coverage: '30 75% 50%',
  foundation: '0 60% 45%',
  'pre-fda': '0 0% 35%',
};

function EventRow({ event, accent }: { event: USEvent; accent: string }) {
  const Icon = TYPE_ICON[event.type];

  return (
    <motion.article
      className="grid grid-cols-[88px_1fr] md:grid-cols-[140px_1fr] gap-4 md:gap-6 py-4 border-b border-border last:border-b-0"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.25 }}
    >
      {/* Left rail: date + type chip */}
      <div className="flex flex-col gap-2">
        <div className="font-mono text-xs font-bold text-foreground tabular-nums">
          {event.date ?? event.year}
        </div>
        <span
          className="inline-flex items-center gap-1 self-start text-[10px] font-mono uppercase tracking-widest"
          style={{ color: `hsl(${accent})` }}
        >
          <Icon className="h-3 w-3" strokeWidth={2} />
          <span className="hidden md:inline">{TYPE_LABEL[event.type]}</span>
        </span>
      </div>

      {/* Right: title + why + expand + source */}
      <div className="space-y-2 min-w-0">
        <h3 className="font-serif text-base md:text-lg font-semibold text-foreground leading-snug">
          {event.title}
        </h3>

        <p className="text-sm text-foreground/85 leading-relaxed italic">
          {event.why}
        </p>

        <details className="group">
          <summary className="cursor-pointer text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors list-none inline-flex items-center gap-1">
            <span className="group-open:hidden">Read more →</span>
            <span className="hidden group-open:inline">Hide details ↑</span>
          </summary>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2 pr-4">
            {event.detail}
          </p>
        </details>

        <a
          href={event.src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
        >
          <ExternalLink className="h-3 w-3" />
          Primary source
        </a>
      </div>
    </motion.article>
  );
}

function EraSection({ era, events }: { era: (typeof US_ERAS)[number]; events: USEvent[] }) {
  if (events.length === 0) return null;
  const [from, to] = era.range;
  const accent = ERA_ACCENT[era.id];

  return (
    <section className="space-y-6">
      {/* Era header — left-rail color + label + year range */}
      <header
        className="border-l-4 pl-5 pt-4 pb-3 mt-4"
        style={{ borderColor: `hsl(${accent})` }}
      >
        <div className="flex items-baseline justify-between gap-4 mb-2">
          <h2 className="heading-editorial leading-tight">
            {era.label}
          </h2>
          <span
            className="font-mono text-[11px] tabular-nums shrink-0"
            style={{ color: `hsl(${accent})` }}
          >
            {from} – {to}
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
          {era.lead}
        </p>
      </header>

      {/* Event list */}
      <div>
        {events.map((event) => (
          <EventRow key={event.id} event={event} accent={accent} />
        ))}
      </div>
    </section>
  );
}

function WeAreHereBanner() {
  return (
    <motion.div
      className="border-l-4 pl-5 pr-5 py-5 mb-10 border-t border-b"
      style={{
        borderLeftColor: 'hsl(14 90% 55%)',
        borderTopColor: 'hsl(14 90% 55% / 0.35)',
        borderBottomColor: 'hsl(14 90% 55% / 0.35)',
        background:
          'linear-gradient(135deg, hsl(14 90% 55% / 0.04) 0%, transparent 100%)',
      }}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/60 tabular-nums">
          {WE_ARE_HERE.year}
        </span>
        <span
          className="font-mono text-[10px] uppercase tracking-widest font-bold"
          style={{ color: 'hsl(14 90% 55%)' }}
        >
          ★ {WE_ARE_HERE.marker}
        </span>
      </div>

      <p className="text-base md:text-lg text-foreground leading-relaxed font-serif max-w-3xl">
        {WE_ARE_HERE.lead}
      </p>

      <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
        <ArrowDown className="h-3 w-3" />
        How we got here
      </div>
    </motion.div>
  );
}

export function UsTimeline() {
  // Within each era, sort events DESCENDING by year+date.
  const sorted = [...US_TIMELINE].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return (b.date ?? '').localeCompare(a.date ?? '');
  });

  const byEra = new Map<USEra, USEvent[]>();
  for (const e of sorted) {
    const arr = byEra.get(e.era) ?? [];
    arr.push(e);
    byEra.set(e.era, arr);
  }

  // Reverse era order: present → past.
  const orderedEras = [...US_ERAS].reverse();

  return (
    <div>
      <WeAreHereBanner />

      <div className="space-y-10">
        {orderedEras.map((era) => (
          <EraSection key={era.id} era={era} events={byEra.get(era.id) ?? []} />
        ))}
      </div>
    </div>
  );
}
