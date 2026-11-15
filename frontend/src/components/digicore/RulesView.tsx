import { DC_COHORTS, DC_FUNDING, DC_REGULATION, DC_TOOLS } from '@/data/digicore';
import { Group } from './Sources';
import { TableBlock } from './TableBlock';

export function RulesView() {
  return (
    <div>
      <Group title="Prostate radiotherapy datasets: images, contours, dose, outcomes" count={DC_COHORTS.length} open>
        <TableBlock
          rows={DC_COHORTS}
          rowKey={(r) => r.name}
          columns={[
            { key: 'name', label: 'Dataset' },
            { key: 'region', label: 'Region' },
            { key: 'access', label: 'Access' },
            { key: 'patients', label: 'Patients' },
            { key: 'images', label: 'Images' },
            { key: 'contours', label: 'Contours' },
            { key: 'dose', label: 'Dose' },
            { key: 'outcomes', label: 'Outcomes' },
          ]}
        />
      </Group>
      <Group title="Public funding" count={DC_FUNDING.length}>
        <TableBlock
          rows={DC_FUNDING}
          rowKey={(r) => r.instrument}
          columns={[
            { key: 'instrument', label: 'Instrument' },
            { key: 'funder', label: 'Funder' },
            { key: 'type', label: 'Type' },
            { key: 'amount', label: 'Amount' },
            { key: 'deadline', label: 'Deadline' },
            { key: 'fit', label: 'Scope' },
          ]}
        />
      </Group>
      <Group title="Regulation" count={DC_REGULATION.length}>
        <TableBlock
          rows={DC_REGULATION}
          rowKey={(r, i) => `${i}-${r.law}`}
          columns={[
            { key: 'law', label: 'Law' },
            { key: 'article', label: 'Article' },
            { key: 'requirement', label: 'Requirement', wide: true },
          ]}
        />
      </Group>
      <Group title="Federated tools and their limits" count={DC_TOOLS.length}>
        <TableBlock
          rows={DC_TOOLS}
          rowKey={(r) => r.tool}
          columns={[
            { key: 'tool', label: 'Tool' },
            { key: 'does', label: 'Does' },
            { key: 'limits', label: 'Limits', wide: true },
            { key: 'licence', label: 'Licence' },
          ]}
        />
      </Group>
    </div>
  );
}
