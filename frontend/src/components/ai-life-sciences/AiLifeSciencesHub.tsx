import { HubShell } from '@/components/shared/HubShell';
import { LandscapeView } from './LandscapeView';
import { ClusterTreemapView } from './ClusterTreemapView';
import { RevenueView } from './RevenueView';
import { RegulatoryView } from './RegulatoryView';
import { RecentSignalsView } from './RecentSignalsView';
// ModalityMatrixView archived 2026-05-26 — pipeline-stage taxonomy underdeveloped.

export function AiLifeSciencesHub() {
  return (
    <HubShell
      domainId="ai-life-sciences"
      views={[
        {
          id: 'landscape',
          label: 'Frontier Landscape',
          render: () => <LandscapeView />,
        },
        {
          id: 'capital',
          label: 'Capital Flow',
          render: () => <ClusterTreemapView />,
        },
        {
          id: 'revenue',
          label: 'Revenue',
          render: () => <RevenueView />,
        },
        {
          id: 'regulatory',
          label: 'Regulatory',
          render: () => <RegulatoryView />,
        },
        {
          id: 'recent-signals',
          label: 'Recent Signals',
          render: () => <RecentSignalsView />,
        },
      ]}
    />
  );
}
