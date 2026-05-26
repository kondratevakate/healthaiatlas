// Founder Toolkit → Regulatory
//
// Compact index of per-country regulator stack. Each card is a 2-3 line
// summary; full deep dive lives under /founders/context?region=<id> while the
// legacy page is being decommissioned.
//
// Editorial point: regulators are the most undervalued dimension by first-time
// healthcare founders. The map of which agency owns what (FDA SaMD vs MDR
// Class IIa vs UAE DHA pre-market vs NMPA AI-specific track) decides your
// 18-month roadmap before you write a line of code.

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { FounderToolkitNav } from '@/components/shared/FounderToolkitNav';

type RegionEntry = {
  flag: string;
  id: string;
  name: string;
  /** Stack of agencies, terse. */
  stack: string;
  /** One-line "what kills you here" reality. */
  reality: string;
  /** Deep-dive link. While Context page is alive this points to its tab. */
  deepLink: string;
};

const REGIONS: RegionEntry[] = [
  {
    flag: '🇦🇪', id: 'uae', name: 'UAE',
    stack: 'DHA · DoH Abu Dhabi · MOHAP federal',
    reality: 'Pre-market approval per emirate. Fast-moving but small market floor.',
    deepLink: '/founders/context?side=healthcare&region=uae',
  },
  {
    flag: '🇪🇺', id: 'eu', name: 'EU',
    stack: 'EMA · per-state notified bodies · MDR (2017/745)',
    reality: 'MDR Class IIa is the default. CEE = cheaper evidence, CH = expensive credibility.',
    deepLink: '/founders/context?side=healthcare&region=eu',
  },
  {
    flag: '🇨🇭', id: 'ch', name: 'Switzerland',
    stack: 'Swissmedic · MedDO · CH-MDR (post-2026)',
    reality: 'Institutionally outside the EU. Use for regulatory passport, not scale.',
    deepLink: '/founders/context?side=healthcare&region=ch',
  },
  {
    flag: '🇬🇧', id: 'uk', name: 'UK',
    stack: 'MHRA · UKCA mark · NICE HTA · NHS DTAC',
    reality: 'NHS gravity well. One payer. Slow procurement. Babylon-class exit risk.',
    deepLink: '/founders/context?side=healthcare&region=uk',
  },
  {
    flag: '🇺🇸', id: 'us', name: 'US',
    stack: 'FDA SaMD · 510(k) / De Novo / PMA · CMS reimbursement · HIPAA',
    reality: 'Largest TAM. Four-spoke decision matrix decides which spoke kills you.',
    deepLink: '/founders/context?side=healthcare&region=us',
  },
  {
    flag: '🇨🇳', id: 'cn', name: 'China',
    stack: 'NMPA · AI-specific track (2019) · provincial reimbursement',
    reality: '92 NMPA-approved AI devices. Restricted access for non-resident founders.',
    deepLink: '/founders/context?side=healthcare&region=cn',
  },
];

const FoundersRegulatory = () => (
  <Layout>
    <div className="container py-12 md:py-16">
      <FounderToolkitNav />

      <PageHeader
        eyebrow="Founder Toolkit · Regulatory"
        title="Which agency owns your product — six jurisdictions, six stacks"
        subtitle="The regulator decides your 18-month roadmap before you write a line of code. Six jurisdictions side-by-side; click into any one for the deep founder reality."
      />

      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {REGIONS.map(({ flag, id, name, stack, reality, deepLink }) => (
          <Link
            key={id}
            to={deepLink}
            className="group border border-border bg-card p-5 hover:border-foreground/40 transition-colors flex flex-col"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl leading-none" aria-hidden>{flag}</span>
              <h3 className="text-lg font-semibold">{name}</h3>
            </div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60 mb-2">
              Stack
            </div>
            <p className="text-xs text-foreground/80 mb-4 leading-relaxed">{stack}</p>
            <div className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/60 mb-2">
              Founder reality
            </div>
            <p className="text-xs text-muted-foreground mb-5 flex-1 leading-relaxed">{reality}</p>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-foreground/60 group-hover:text-primary group-hover:gap-2.5 transition-all">
              Open deep dive <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12 border border-border bg-secondary/30 p-5 text-sm text-muted-foreground leading-relaxed max-w-3xl">
        <span className="font-semibold text-foreground">Note:</span> deep dives currently
        live inside the legacy <code className="font-mono text-xs">/founders/context</code> page
        (region tabs). They will migrate to <code className="font-mono text-xs">/founders/regulatory/&lt;region&gt;</code>{' '}
        in the next iteration — the links above will still work either way.
      </div>
    </div>
  </Layout>
);

export default FoundersRegulatory;
