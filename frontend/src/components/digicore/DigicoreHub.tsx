import { HubShell } from '@/components/shared/HubShell';
import { DC_CENTRES, DC_ORG_MAP, DC_SOURCE } from '@/data/digicore';
import { CentresView } from './CentresView';
import { MapView } from './MapView';
import { RulesView } from './RulesView';
import { UseCasesView } from './UseCasesView';

// Order follows the decision board: context, then constraints, then sources.
export function DigicoreHub() {
  return (
    <HubShell
      domainId="digicore"
      views={[
        {
          id: 'use-cases',
          label: 'Use Cases',
          shortLabel: 'Use cases',
          render: () => <UseCasesView />,
        },
        {
          id: 'centres',
          label: 'Network Centres',
          shortLabel: 'Centres',
          description: 'DIGICORE, DigiONE pilot and atomCAT centres and what each already does.',
          render: () => <CentresView />,
        },
        {
          id: 'rules',
          label: 'Data, Money and Rules',
          shortLabel: 'Rules',
          render: () => <RulesView />,
        },
        {
          id: 'map',
          label: 'Who the Workshop Named',
          shortLabel: 'Map',
          description: 'Organisations and companies in the workshop material, placed by how they are described.',
          render: () => <MapView />,
        },
      ]}
    >
      <p className="text-xs text-muted-foreground truncate" title="Rows whose sources were not opened and checked are not shown.">
        Data: {DC_SOURCE.workshop} and public sources · {DC_CENTRES.length} centres · {DC_ORG_MAP.length} organisations ·
        checked sources only
      </p>
    </HubShell>
  );
}
