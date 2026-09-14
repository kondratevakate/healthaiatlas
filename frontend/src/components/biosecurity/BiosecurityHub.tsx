import { HubShell } from '@/components/shared/HubShell';
import { BIO_ORGS, BIO_SOURCE } from '@/data/biosecurity';
import { DirectoryView } from './DirectoryView';
import { MatrixView } from './MatrixView';

export function BiosecurityHub() {
  return (
    <HubShell
      domainId="biosecurity"
      views={[
        {
          id: 'matrix',
          label: 'Focus × Category Matrix',
          description:
            'Which intervention focus areas are covered in each prevention, detection, response and cross-cutting category. Hatched cells have no organisation listed.',
          render: () => <MatrixView />,
        },
        {
          id: 'directory',
          label: 'Organisation Directory',
          description: 'Searchable list of every organisation, filterable by category and type.',
          render: () => <DirectoryView />,
        },
      ]}
    >
      <p className="text-xs text-muted-foreground">
        Data:{' '}
        <a href={BIO_SOURCE.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          {BIO_SOURCE.name}
        </a>{' '}
        organisation directory · {BIO_ORGS.length} organisations · retrieved {BIO_SOURCE.retrievedAt}. Categories
        and descriptions are curated by {BIO_SOURCE.name} and not independently verified by the Atlas.
      </p>
    </HubShell>
  );
}
