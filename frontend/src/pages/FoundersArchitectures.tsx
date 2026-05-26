// Founder Toolkit → Architectures
//
// What revenue-shape buys you what kind of company. Re-uses the existing
// ArchitectureRevenueMap component lifted out of the deprecated
// /founders/context AI side.
//
// No new data — same component, different framing in the title/eyebrow.

import { useState } from 'react';

import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { FounderToolkitNav } from '@/components/shared/FounderToolkitNav';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  ArchitectureRevenueMap,
  ArchitectureSidebar,
} from '@/components/context-architecture';

const FoundersArchitectures = () => {
  const [selectedArchId, setSelectedArchId] = useState<string | null>(null);

  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <FounderToolkitNav />

        <PageHeader
          eyebrow="Founder Toolkit · Architectures"
          title="What revenue-shape buys you what kind of company"
          subtitle="SaaS subscription, marketplace take-rate, deployed system, hardware-as-a-service, services + software hybrid. Each architecture forces a different sales motion, margin profile, and exit ramp. Click a node to drill in."
        />

        <div className="mt-8">
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-[600px] border border-border rounded-none"
          >
            <ResizablePanel defaultSize={66} minSize={40}>
              <ArchitectureRevenueMap
                selectedArchId={selectedArchId}
                onSelectArch={setSelectedArchId}
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={34} minSize={25}>
              <ArchitectureSidebar
                selectedArchId={selectedArchId}
                onClearSelection={() => setSelectedArchId(null)}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </Layout>
  );
};

export default FoundersArchitectures;
