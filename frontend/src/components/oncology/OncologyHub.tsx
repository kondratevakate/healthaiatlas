import { HubShell } from '@/components/shared/HubShell';
import { LandscapeView } from './LandscapeView';
import { PharmaMatrixView } from './PharmaMatrixView';

export function OncologyHub() {
  return (
    <HubShell
      domainId="oncology"
      views={[
        {
          id: 'landscape',
          label: 'Cancer AI Landscape',
          description:
            'Time-series bubble view of oncology AI vendors, products and milestones. Best for spotting active areas and recent activity.',
          render: () => <LandscapeView />,
        },
        {
          id: 'pharma',
          label: 'Pharma & Product Benchmark',
          description:
            'Matrix of which AI vendors each top-20 pharma uses across the value chain (R&D, Trials, Patient, Evidence, Ops). Click any cell for vendor detail; hatched cells are market gaps with no AI vendor yet.',
          render: () => <PharmaMatrixView />,
        },
      ]}
    />
  );
}
