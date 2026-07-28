// Founder Toolkit — editorial home.
// Redesigned for visual weight and information density.
// A founder should see facts (numbers, names, outcomes) within 3 seconds —
// not promises of content that might exist somewhere inside.

import { Link } from 'react-router-dom';
import { ArrowRight, TrendingDown } from 'lucide-react';
import { Layout } from '@/components/layout';
import { SuggestActions } from '@/components/shared/SuggestActions';
import { FOUNDERS_EDITORIAL_CARDS, type EditorialCard } from '@/data/foundersEditorial';
import { cn } from '@/lib/utils';

// ── Editorial card — magazine cover style ────────────────────────────────────
// Each card type gets a distinct accent so they read as three different signals,
// not three copies of the same widget.

const CARD_ACCENTS = [
  // LATEST — DevRel signal: blue
  'border-blue-900/60 hover:border-blue-700/80',
  // CASE — Dead Valley: red
  'border-red-900/60 hover:border-red-700/80',
  // REGION — Market: emerald
  'border-emerald-900/60 hover:border-emerald-700/80',
] as const;

const CARD_EYEBROW_ACCENTS = [
  'text-blue-400/80',
  'text-red-400/80',
  'text-emerald-400/80',
] as const;

const CARD_ARROW_ACCENTS = [
  'group-hover:text-blue-400',
  'group-hover:text-red-400',
  'group-hover:text-emerald-400',
] as const;

function EditorialCard({ card, idx }: { card: EditorialCard; idx: number }) {
  return (
    <Link
      to={card.link.to}
      className={cn(
        'group block border bg-card p-6 transition-all duration-150',
        CARD_ACCENTS[idx],
      )}
    >
      <div className="flex items-baseline justify-between gap-2 mb-4">
        <span className={cn('font-mono text-[9px] tracking-widest uppercase', CARD_EYEBROW_ACCENTS[idx])}>
          {card.eyebrow}
        </span>
        {card.asOf && (
          <span className="font-mono text-[9px] text-muted-foreground/30 shrink-0">{card.asOf}</span>
        )}
      </div>

      <h3 className="text-lg md:text-xl font-semibold leading-snug mb-3 text-foreground">
        {card.headline}
      </h3>

      <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-3">
        {card.dek}
      </p>

      <span className={cn(
        'inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-muted-foreground/50 transition-all duration-150',
        CARD_ARROW_ACCENTS[idx],
        'group-hover:gap-2.5',
      )}>
        {card.link.label} <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  );
}

// ── Context module cards — each shows a key stat up front ────────────────────

type Module = {
  to: string;
  stat: string;
  statLabel: string;
  title: string;
  preview: string;
  status?: 'building';
};

const MODULES: Module[] = [
  {
    to: '/founders/markets',
    stat: '$14T',
    statLabel: 'healthcare spend · 6 regions · market + regulatory in one view',
    title: 'Markets & Regulatory',
    preview: 'Two-orbit chart: total healthcare vs medical-AI per country. Then per-region: market size, regulator stack, and founder reality — UAE / EU / UK / US / CN / CH.',
    status: 'building',
  },
  {
    to: '/founders/architectures',
    stat: '5',
    statLabel: 'revenue architectures mapped',
    title: 'Architectures',
    preview: 'SaaS subscription, marketplace, deployed system, hardware, services-hybrid. Which shapes are making money in healthcare AI right now — and which killed their companies.',
  },
  {
    to: '/founders/tech',
    stat: '29',
    statLabel: 'named Developer Advocates across 14 vendors',
    title: 'Tech Signals',
    preview: 'Where AI vendors are manufacturing developer demand. Talent moves lead product pushes by 6–12 months.',
    status: 'building',
  },
  {
    to: '/founders/tech',
    stat: '21',
    statLabel: 'deals · what big AI couldn\'t build fast enough',
    title: 'Acqui-hires',
    preview: '8 capability clusters · 22 founders tracked · 5 acquirers. Each deal is a confession: the acquirer needed this and couldn\'t build it at market speed.',
  },
];

function ModuleCard({ m }: { m: Module }) {
  return (
    <Link
      to={m.to}
      className="group border border-border bg-card hover:border-foreground/30 transition-all duration-150 p-6 flex flex-col"
    >
      {/* Stat — the first thing eye lands on */}
      <div className="mb-4">
        <div className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-none mb-1">
          {m.stat}
        </div>
        <div className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/50">
          {m.statLabel}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-base font-semibold">{m.title}</h3>
        {m.status === 'building' && (
          <span className="font-mono text-[8px] tracking-wider uppercase border border-border px-1.5 py-0.5 text-muted-foreground/40">
            building
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">
        {m.preview}
      </p>

      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-muted-foreground/40 group-hover:text-foreground/70 group-hover:gap-2.5 transition-all duration-150">
        Open <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const Founders = () => (
  <Layout>
    <div className="container py-12 md:py-16">

      {/* Masthead — tight, no fluff */}
      <div className="mb-10 md:mb-14 max-w-2xl">
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/50 mb-3">
          Founder Toolkit
        </p>
        <h1 className="heading-section mb-4">
          What every healthcare-AI founder needs to know — assembled.
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Market sizes, regulatory stacks, revenue architectures, talent signals, and the full
          record of $50B+ destroyed. Read top-to-bottom or jump to the module you need.
        </p>
      </div>

      {/* FRONT PAGE — 3 editorial cards, auto-pulled daily */}
      <section className="mb-14 md:mb-20">
        <div className="flex items-center gap-3 mb-5">
          <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40">
            Latest · auto-pulled from atlas data
          </span>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        <div className="grid md:grid-cols-3 gap-2">
          {FOUNDERS_EDITORIAL_CARDS.map((card, i) => (
            <EditorialCard key={i} card={card} idx={i} />
          ))}
        </div>
      </section>

      {/* CONTEXT — 4 modules with stats front-and-centre */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-semibold">Reference context</h2>
          <div className="flex-1 h-px bg-border/40" />
          <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40">
            4 modules
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-2">
          {MODULES.map((m) => <ModuleCard key={m.to} m={m} />)}
        </div>
      </section>

      {/* DEAD VALLEY — peer, not nested. Deliberately stark. */}
      <section className="mb-14">
        <Link
          to="/founders/dead-valley"
          className="group flex flex-col sm:flex-row sm:items-center gap-5 border border-red-900/50 bg-red-950/20 hover:bg-red-950/30 hover:border-red-800/70 p-6 transition-all duration-150"
        >
          <div className="flex-shrink-0">
            <TrendingDown className="w-8 h-8 text-red-500/70" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[9px] tracking-widest uppercase text-red-500/60 mb-1.5">
              Dead Valley · separate peer
            </div>
            <div className="text-xl font-bold text-foreground mb-1.5">
              $50B+ destroyed.{' '}
              <span className="text-red-400/80">Babylon. Forward. 23andMe. Pear. Cerebral.</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every shutdown, SPAC collapse and fire-sale the Atlas tracks. Four classes of death —
              read the patterns before you make the same call.
            </p>
          </div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-red-500/50 group-hover:text-red-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-150 shrink-0">
            Open <ArrowRight className="w-3 h-3" />
          </div>
        </Link>
      </section>

      <SuggestActions />
    </div>
  </Layout>
);

export default Founders;
