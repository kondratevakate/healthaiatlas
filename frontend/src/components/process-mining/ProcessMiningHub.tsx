import { HubShell } from '@/components/shared/HubShell';
import { DealFlowView } from './DealFlowView';
import { ProductsView } from './ProductsView';
import { OpenLandscapeView } from './OpenLandscapeView';
import { GeographyView } from './GeographyView';
import { TimelineView } from './TimelineView';

export function ProcessMiningHub() {
  return (
    <HubShell
      domainId="process-mining"
      views={[
        { id: 'dealflow', label: 'Deal Flow', render: () => <DealFlowView /> },
        { id: 'products', label: 'Products', render: () => <ProductsView /> },
        { id: 'landscape', label: 'Open Landscape', render: () => <OpenLandscapeView /> },
        { id: 'geography', label: 'Geography', render: () => <GeographyView /> },
        { id: 'timeline', label: 'Timeline', render: () => <TimelineView /> },
      ]}
    />
  );
}
