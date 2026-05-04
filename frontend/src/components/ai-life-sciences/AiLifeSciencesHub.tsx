import { HubShell } from '@/components/shared/HubShell';
import { LandscapeView } from './LandscapeView';
import { ModalityMatrixView } from './ModalityMatrixView';
import { ClusterTreemapView } from './ClusterTreemapView';

export function AiLifeSciencesHub() {
  return (
    <HubShell
      domainId="ai-life-sciences"
      views={[
        {
          id: 'cluster-treemap',
          label: 'Capital flow × clusters',
          description:
            'Same cluster map, different signals. Toggle between revenue, VC raised, M&A value, FDA clearances and pharma deal value — boxes re-flow to show where each kind of money is concentrated. Mature markets shrink under VC; emerging frontiers shrink under revenue.',
          render: () => <ClusterTreemapView />,
        },
        {
          id: 'landscape',
          label: 'Frontier Landscape',
          description:
            'Time-series view of AI × life-sciences milestones — Y-axis groups by cluster, bubble size scales with disclosed $, color encodes the cluster family (care delivery / discovery / therapeutic / infra / meta).',
          render: () => <LandscapeView />,
        },
        {
          id: 'matrix',
          label: 'Modality × Pipeline Stage',
          description:
            'Drug-discovery cross-tab: modalities (protein structure, generative design, RNA, genomics) against pipeline decision points. Hatched cells are uncovered combinations.',
          render: () => <ModalityMatrixView />,
        },
      ]}
    />
  );
}
