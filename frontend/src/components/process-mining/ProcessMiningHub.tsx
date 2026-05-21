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
        {
          id: 'dealflow',
          label: 'Deal Flow',
          description:
            'Bubble chart of all funding, M&A, IPO, layoffs, and other events across companies and time. Bubble size = deal value; color = event type. Best for spotting biggest deals and most active companies at a glance.',
          render: () => <DealFlowView />,
        },
        {
          id: 'products',
          label: 'Products',
          description:
            'Vendor catalogue grouped by use case (data exchange, EHR, workflows, etc.) with evidence-tagged client outcomes. Best for evaluating who builds what.',
          render: () => <ProductsView />,
        },
        {
          id: 'landscape',
          label: 'Open Landscape',
          description:
            'Open-source projects, public datasets, and shared infrastructure in healthcare process mining. Best for finding things you can adopt or contribute to.',
          render: () => <OpenLandscapeView />,
        },
        {
          id: 'geography',
          label: 'Geography',
          description:
            'Adoption by country / region: market size, key buyers, and dominant vendors per geography. Best for market-entry decisions.',
          render: () => <GeographyView />,
        },
        {
          id: 'timeline',
          label: 'Timeline',
          description:
            'Same events as Deal Flow but laid out chronologically as a single feed. Best for reading the recent history of the space top-to-bottom.',
          render: () => <TimelineView />,
        },
      ]}
    />
  );
}
