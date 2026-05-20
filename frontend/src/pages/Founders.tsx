import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { SuggestActions } from '@/components/shared/SuggestActions';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Skull } from 'lucide-react';

// Founder Toolkit landing — two sections curated from materials that are
// hard to assemble via general web search. Each section is a separate concern
// with its own data source and shipping cadence:
//
//   Context        – AI side + Healthcare side (the world the AI is going
//                    into). Healthcare carries 4-region histories,
//                    regulators, market reality. AI carries methods +
//                    editorial coverage.
//   Dead Valley    – postmortem records of healthcare-AI ventures that did
//                    not make it. Sourced from atlas-wide failure data
//                    (PM_EVENTS / PM_CATEGORIES / UK_BABYLON_CASE).
//
// A planned "Regulatory case studies" section was dropped intentionally —
// two live sections is more honest than three with a permanent
// "coming soon" placeholder. See memory/project_ia_refactor.md.
type FounderSection = {
  id: string;
  to: string;
  icon: typeof Globe;
  title: string;
  blurb: string;
  status: 'live' | 'coming-soon';
};

const sections: FounderSection[] = [
  {
    id: 'context',
    to: '/founders/context',
    icon: Globe,
    title: 'Context',
    blurb:
      'Two sides — the AI you are building, and the healthcare system that receives it. Healthcare side carries country histories, regulators and market reality across UAE / EU / UK / US. AI side covers methods and editorial coverage.',
    status: 'live',
  },
  {
    id: 'dead-valley',
    to: '/founders/dead-valley',
    icon: Skull,
    title: 'Dead Valley',
    blurb:
      'Every shutdown, SPAC collapse and fire-sale the Atlas tracks — read for patterns, not nostalgia. $50B+ value destroyed across four classes of death. Founders learn more here than from any launch deck.',
    status: 'live',
  },
];

const Founders = () => {
  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <PageHeader
          eyebrow="For founders"
          title="Founder Toolkit"
          subtitle="Three curated artefacts you cannot assemble from a Google search: regional market reality, jurisdictional regulation paths, and lessons from healthcare AI ventures that did not make it."
        />

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {sections.map(({ id, to, icon: Icon, title, blurb, status }) => (
            <Link
              key={id}
              to={to}
              className="group border border-border bg-background p-6 hover:border-primary hover:shadow-md transition-all flex flex-col"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground mb-4 flex-1">{blurb}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border/60">
                {status === 'coming-soon' ? (
                  <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                    In preparation
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-widest font-mono text-primary">
                    Live
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        <SuggestActions />
      </div>
    </Layout>
  );
};

export default Founders;
