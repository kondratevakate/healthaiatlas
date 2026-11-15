import { DC_CENTRES, type DcCentre } from '@/data/digicore';
import { Group, Sources } from './Sources';

const NETWORKS: { key: 'digicore' | 'digione_pilot' | 'atomcat'; label: string }[] = [
  { key: 'digicore', label: 'DIGICORE' },
  { key: 'digione_pilot', label: 'DigiONE pilot' },
  { key: 'atomcat', label: 'atomCAT' },
];

const FIELDS: { key: keyof DcCentre; label: string }[] = [
  { key: 'imaging', label: 'Imaging' },
  { key: 'genomics', label: 'Genomics' },
  { key: 'federated_omop', label: 'Federated / OMOP' },
  { key: 'rare_cancer', label: 'Rare cancer' },
];

const isNo = (v: string) => !v || v === 'no' || v === 'none found';

function Centre({ c }: { c: DcCentre }) {
  const nets = NETWORKS.filter((n) => !isNo(c[n.key])).map((n) => (n.key === 'digicore' ? `${n.label} ${c.digicore}` : n.label));
  return (
    <li className="border-t border-border/30 py-3 first:border-t-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="text-sm font-medium">{c.institution}</span>
        <span className="font-mono text-[10px] text-muted-foreground">{nets.join(' · ')}</span>
      </div>
      <dl className="mt-1.5 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
        {FIELDS.filter((f) => !isNo(String(c[f.key]))).map((f) => (
          <div key={f.key}>
            <dt className="inline font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{f.label} </dt>
            <dd className="inline leading-snug">{String(c[f.key])}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-1">
        <Sources row={c} />
      </div>
    </li>
  );
}

export function CentresView() {
  const countries = [...new Set(DC_CENTRES.map((c) => c.country || 'Not stated'))].sort();
  return (
    <div>
      {countries.map((country, i) => {
        const list = DC_CENTRES.filter((c) => (c.country || 'Not stated') === country);
        return (
          <Group key={country} title={country} count={list.length} open={i === 0}>
            <ul>
              {list.map((c) => (
                <Centre key={c.institution} c={c} />
              ))}
            </ul>
          </Group>
        );
      })}
      <p className="mt-3 text-xs text-muted-foreground">
        &lsquo;Affiliated paper&rsquo; means an author is affiliated with the centre, not that the centre owns the work.
      </p>
    </div>
  );
}
