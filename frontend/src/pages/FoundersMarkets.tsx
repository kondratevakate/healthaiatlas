// Founder Toolkit → Markets & Regulatory (merged)
//
// One page because a founder asking "should I go to UAE?" needs BOTH
// the market size AND the regulatory stack — not two separate clicks.
//
// Structure:
//   1. MarketScalePlanets — cross-region overview chart
//   2. Per-region grid — market size + regulator stack + founder reality
//
// SW vs HW classification pending Zerotrust pipeline (see TODO.md).

import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

import { Layout } from '@/components/layout';
import { FounderToolkitNav } from '@/components/shared/FounderToolkitNav';
import { MarketScalePlanets } from '@/components/context-compare';

type Region = {
  flag: string;
  name: string;
  market: string;
  aiSlice: string;
  stack: string;
  reality: string;
  deepLink: string;
};

const REGIONS: Region[] = [
  {
    flag: '🇺🇸', name: 'United States',
    market: '$4.9T healthcare', aiSlice: '$18B medical AI',
    stack: 'FDA SaMD · 510(k) / De Novo · CMS reimbursement · HIPAA',
    reality: 'Largest TAM. Four-spoke decision matrix — regulatory, reimbursement, sales motion, exit — decides which one kills you.',
    deepLink: '/founders/context?side=healthcare&region=us',
  },
  {
    flag: '🇨🇳', name: 'China',
    market: '$1.6T healthcare', aiSlice: '$2B medical AI',
    stack: 'NMPA AI track (2019) · provincial reimbursement · BAT gravity',
    reality: '92 NMPA-approved AI devices. Strong tailwinds; restricted access for non-resident founders.',
    deepLink: '/founders/context?side=healthcare&region=cn',
  },
  {
    flag: '🇪🇺', name: 'EU',
    market: '$1.5T healthcare', aiSlice: '$6.5B medical AI',
    stack: 'MDR (2017/745) · notified bodies · EMA · CE mark',
    reality: 'CEE = cheaper evidence. Switzerland = expensive credibility. CE mark opens 27 markets at once.',
    deepLink: '/founders/context?side=healthcare&region=eu',
  },
  {
    flag: '🇬🇧', name: 'UK',
    market: '$260B healthcare', aiSlice: '$3B medical AI',
    stack: 'MHRA · UKCA mark · NICE HTA · NHS DTAC',
    reality: 'NHS gravity well — one payer, slow procurement, brutal exit ramp. Babylon-class death is real here.',
    deepLink: '/founders/context?side=healthcare&region=uk',
  },
  {
    flag: '🇨🇭', name: 'Switzerland',
    market: '$100B healthcare', aiSlice: '$300M medical AI',
    stack: 'Swissmedic · MedDO · CH-MDR (post-2026)',
    reality: 'Institutionally outside the EU. Use for regulatory-passport plays, not scaling.',
    deepLink: '/founders/context?side=healthcare&region=ch',
  },
  {
    flag: '🇦🇪', name: 'UAE',
    market: '$35B healthcare', aiSlice: '$28M medical AI',
    stack: 'DHA (Dubai) · DoH (Abu Dhabi) · MOHAP federal',
    reality: 'Pre-market approval per emirate. Fast-moving; market floor too low for venture scale.',
    deepLink: '/founders/context?side=healthcare&region=uae',
  },
];

const FoundersMarkets = () => (
  <Layout>
    <div className="container py-12 md:py-16">
      <FounderToolkitNav />

      <div className="mb-8 max-w-xl">
        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/50 mb-3">
          Founder Toolkit · Markets & Regulatory
        </p>
        <h1 className="heading-editorial mb-3">
          How big the markets are — and who owns the gate
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Market size and regulator stack per country, in one view.
          Hover a planet for figures; scroll for per-country breakdown.
        </p>
      </div>

      {/* Chart — the main event */}
      <MarketScalePlanets />

      {/* Per-region grid */}
      <div className="mt-14 pt-10 border-t border-border/40">
        <p className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40 mb-6">
          Per-country · market + regulatory stack
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
          {REGIONS.map((r) => (
            <div key={r.name} className="border border-border bg-card p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none">{r.flag}</span>
                <div>
                  <div className="font-semibold text-sm">{r.name}</div>
                  <div className="font-mono text-[9px] text-muted-foreground/50">{r.market} · AI: {r.aiSlice}</div>
                </div>
              </div>

              <div>
                <div className="font-mono text-[8.5px] tracking-widest uppercase text-muted-foreground/40 mb-1">Regulators</div>
                <p className="text-xs text-foreground/80 leading-relaxed">{r.stack}</p>
              </div>

              <div>
                <div className="font-mono text-[8.5px] tracking-widest uppercase text-muted-foreground/40 mb-1">Founder reality</div>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{r.reality}</p>
              </div>

              <Link
                to={r.deepLink}
                className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase text-muted-foreground/40 hover:text-foreground/70 transition-colors mt-auto"
              >
                Deep dive <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-border/30 max-w-lg">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground/50">Software vs hardware split</span>
          {' '}— per-company classification pending Zerotrust pipeline.
          Software: 70–85% gross margins. Hardware: 20–45%. Same TAM, different economics.
        </p>
      </div>
    </div>
  </Layout>
);

export default FoundersMarkets;
