import { HubShell } from '@/components/shared/HubShell';
import { LandscapeView } from './LandscapeView';
// ModalityMatrixView archived 2026-05-25 — pipeline-stage taxonomy underdeveloped.
// File remains on disk; re-enable by restoring the import + tab below.
import { ClusterTreemapView } from './ClusterTreemapView';
import { RecentSignalsView } from './RecentSignalsView';

export function AiLifeSciencesHub() {
  return (
    <HubShell
      domainId="ai-life-sciences"
      views={[
        {
          id: 'landscape',
          label: 'Frontier Landscape',
          description:
            'Time-series view of AI × life-sciences milestones — Y-axis groups by cluster, bubble size scales with disclosed $, color encodes the cluster family (care delivery / discovery / therapeutic / infra / meta).',
          render: () => <LandscapeView />,
        },
        {
          id: 'cluster-treemap',
          label: 'Capital flow × clusters',
          description:
            'Same cluster map, different signals. Toggle between revenue, VC raised, M&A value, FDA clearances and pharma deal value — boxes re-flow to show where each kind of money is concentrated. Mature markets shrink under VC; emerging frontiers shrink under revenue.',
          render: () => <ClusterTreemapView />,
        },
        {
          id: 'recent-signals',
          label: 'Recent Signals',
          description:
            'What just happened in AI × life sciences. Scale-of-deals bar chart over the last ~12 months, plus three narrative lenses: who Anthropic is acquiring, where OpenAI is placing healthcare bets, which pharma majors are paying for AI drug discovery.',
          render: () => <RecentSignalsView />,
        },
      ]}
    />
  );
}
