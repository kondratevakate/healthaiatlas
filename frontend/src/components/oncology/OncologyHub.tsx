import { HubShell } from '@/components/shared/HubShell';
import { LandscapeView } from './LandscapeView';
import { PharmaMatrixView } from './PharmaMatrixView';

export function OncologyHub() {
  return (
    <HubShell
      domainId="oncology"
      views={[
        { id: 'landscape', label: 'Cancer AI Landscape', render: () => <LandscapeView /> },
        { id: 'pharma', label: 'Pharma & Product Benchmark', render: () => <PharmaMatrixView /> },
      ]}
    />
  );
}
