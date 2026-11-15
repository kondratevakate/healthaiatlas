import { DC_CLINICAL, DC_USE_CASES } from '@/data/digicore';
import { Group } from './Sources';
import { TableBlock } from './TableBlock';

export function UseCasesView() {
  return (
    <div>
      <Group title="Where the image drives the next clinical step" count={DC_CLINICAL.length} open>
        <TableBlock
          rows={DC_CLINICAL}
          rowKey={(r) => `${r.tumour}-${r.image}`}
          columns={[
            { key: 'tumour', label: 'Tumour' },
            { key: 'image', label: 'Image' },
            { key: 'decision', label: 'Decision it drives', wide: true },
            { key: 'holders', label: 'Who holds the images' },
          ]}
        />
      </Group>
      <Group title="Use cases brought to the workshop" count={DC_USE_CASES.length} open>
        <TableBlock
          rows={DC_USE_CASES}
          rowKey={(r, i) => `${i}-${r.organisation}`}
          columns={[
            { key: 'useCase', label: 'Use case', wide: true },
            { key: 'organisation', label: 'Organisation' },
            { key: 'tumour', label: 'Tumour' },
            { key: 'imaging', label: 'Imaging in it' },
          ]}
        />
      </Group>
    </div>
  );
}
