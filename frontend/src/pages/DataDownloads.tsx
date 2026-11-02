// DataDownloads.tsx ──────────────────────────────────────────────────────────
//
// /data — the open-data download page.
//
// It lists the datasets the Atlas publishes as files: what is in them, how many
// rows, the "as of" date, the licence, the not-medical-advice disclaimer and the
// takedown route. The files themselves are built by scripts/export/buildDownloads.cjs
// (npm run export:data) from the committed public data modules and are served
// from the static build at /data/<dataset>.<build-date>.csv|.json.
//
// Row counts come from dist/data/manifest.json when it is present (that is the
// file's own truth) and from the live data modules otherwise.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { openCallEntries } from '@/data/openCallEntries';
import { conferences } from '@/data/conferences';
import { newsItems } from '@/data/newsFeed';
import { domains } from '@/data/domains';
import { projectMilestones } from '@/data/projectTimeline';
import jobsSeed from '@/data/jobsData.json';
import { externalJobs_80000hours } from '@/data/jobsExternal.80000hours';

const DATA_DIR = '/data/';

type DatasetId =
  | 'open-calls'
  | 'jobs'
  | 'events'
  | 'news'
  | 'domains'
  | 'project-timeline';

interface DatasetMeta {
  id: DatasetId;
  labelKey: string;
  renderedOn: string;
  fallbackRows: number;
}

const DATASETS: DatasetMeta[] = [
  { id: 'open-calls', labelKey: 'nav.opencalls', renderedOn: '/open-calls', fallbackRows: openCallEntries.length },
  {
    id: 'jobs',
    labelKey: 'nav.jobs',
    renderedOn: '/jobs',
    fallbackRows: jobsSeed.length + (externalJobs_80000hours?.length ?? 0),
  },
  { id: 'events', labelKey: 'nav.events', renderedOn: '/events', fallbackRows: conferences.length },
  { id: 'news', labelKey: 'nav.news', renderedOn: '/news', fallbackRows: newsItems.length },
  { id: 'domains', labelKey: 'nav.domains', renderedOn: '/directory', fallbackRows: domains.length },
  {
    id: 'project-timeline',
    labelKey: 'data.ds.projectTimeline',
    renderedOn: '/about',
    fallbackRows: projectMilestones.length,
  },
];

interface ManifestDataset {
  id: string;
  rows: number;
  rowsRefused?: number;
  files: { csv: string; json: string };
}

interface Manifest {
  asOf?: string;
  counts?: Record<string, number>;
  datasets?: ManifestDataset[];
}

const LICENCE_URL = 'https://creativecommons.org/licenses/by-nc/4.0/';

const DataDownloads = () => {
  const { t } = useLanguage();
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [manifestMissing, setManifestMissing] = useState(false);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    let cancelled = false;
    fetch(`${DATA_DIR}manifest.json`, { headers: { Accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: Manifest) => {
        if (!cancelled) setManifest(json);
      })
      .catch(() => {
        // No manifest (dev build, or a deploy that skipped `npm run export:data`):
        // fall back to the counts the live modules render and to today's date,
        // and say so instead of pointing at files that are not there.
        if (!cancelled) setManifestMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const asOf = manifest?.asOf ?? today;
  const countFor = (meta: DatasetMeta) => manifest?.counts?.[meta.id] ?? meta.fallbackRows;

  return (
    <Layout>
      <div className="container py-12 md:py-16 [&>*]:max-w-3xl">
        <PageHeader
          eyebrow={t('data.eyebrow')}
          title={t('data.title')}
          subtitle={t('data.subtitle')}
        />

        <p className="text-sm font-mono text-muted-foreground mb-8">
          {t('data.asOf')} {asOf}
        </p>

        <ul className="border-t border-border mb-10">
          {DATASETS.map((meta) => (
            <li
              key={meta.id}
              className="border-b border-border py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <h2 className="heading-lg mb-1">{t(meta.labelKey)}</h2>
                <p className="text-sm text-muted-foreground">
                  <span className="font-mono">{countFor(meta)}</span> {t('data.rows')}
                  {' · '}
                  <Link to={meta.renderedOn} className="hover:text-foreground underline-offset-4 hover:underline">
                    {meta.renderedOn}
                  </Link>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <a
                  href={`${DATA_DIR}${meta.id}.${asOf}.csv`}
                  className="inline-flex items-center border border-border px-3 py-1.5 text-xs font-mono hover:bg-muted transition-colors"
                >
                  {t('data.csv')}
                </a>
                <a
                  href={`${DATA_DIR}${meta.id}.${asOf}.json`}
                  className="inline-flex items-center border border-border px-3 py-1.5 text-xs font-mono hover:bg-muted transition-colors"
                >
                  {t('data.json')}
                </a>
              </div>
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground mb-10">{t('data.note')}</p>

        {manifestMissing && (
          <p className="text-sm text-muted-foreground border-s-2 border-border ps-4 mb-10">
            {t('data.missing')}
          </p>
        )}

        <section className="mb-8">
          <h2 className="heading-lg mb-3">{t('data.licence')}</h2>
          <p className="text-muted-foreground text-body">
            {t('data.licence.body')}{' '}
            <a
              href={LICENCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              CC BY-NC 4.0
            </a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="heading-lg mb-3">{t('data.disclaimer')}</h2>
          <p className="text-muted-foreground text-body">{t('data.disclaimer.body')}</p>
        </section>

        <section className="mb-8">
          <h2 className="heading-lg mb-3">{t('data.excluded')}</h2>
          <p className="text-muted-foreground text-body">{t('data.excluded.body')}</p>
        </section>

        <section className="mb-8">
          <h2 className="heading-lg mb-3">{t('data.takedown')}</h2>
          <p className="text-muted-foreground text-body">
            {t('data.takedown.body')}{' '}
            <Link to="/contact" className="underline underline-offset-4 hover:text-foreground">
              {t('data.contact')}
            </Link>
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default DataDownloads;
