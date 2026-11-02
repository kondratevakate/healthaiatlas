// Atlas homepage — an INDEX OF INTENTS (aisafety.com information architecture).
//
//   • h1 is a promise, not a brand: what you can find here.
//   • Directly under it, one plain sentence of scope.
//   • Then one block per intent. Each block is:
//       verb h2  →  one line of scope  →  up to 3 real previews
//       →  a single "View all N" action  →  a freshness note.
//     Never two competing CTAs in one block, no chips, no stat badges
//     beyond the honest "View all N" count.
//   • Closing band: who maintains this + one invitation to contribute.
//
// Counts are read from the data modules at build time (`openCallEntries.length`,
// `conferences.length`, …) — never hard-coded, never invented. A block whose
// preview list is empty simply renders without previews; nothing is fabricated
// to fill space.
//
// The 5-question "Find Yourself" persona quiz was removed on 2026-11-02 (Kate:
// noisy, personas undefined). The Una chat intake (roadmap F0) is its intended
// replacement; until then the home page carries no assessment widget.

import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { HeroDiagram } from '@/components/home/HeroDiagram';
import UnaChat from '@/components/home/UnaChat';
import { useLanguage } from '@/contexts/LanguageContext';

import { openCallEntries } from '@/data/openCallEntries';
import { conferences } from '@/data/conferences';
import { domains } from '@/data/domains';
import { FOUNDERS_EDITORIAL_CARDS } from '@/data/foundersEditorial';
import { newsItems, newsGeneratedOn } from '@/data/newsFeed';
import { LAST_UPDATED } from '@/data/constants';
import jobsSeed from '@/data/jobsData.json';
import { externalJobs_80000hours } from '@/data/jobsExternal.80000hours';

// The one contribution channel. Closed Airtable forms are gone — a record or a
// correction now comes in as a GitHub issue against the add-record template.
const CONTRIBUTE_URL =
  'https://github.com/kondratevakate/healthaiatlas/issues/new?template=add-record.yml';

// ── Preview selection ───────────────────────────────────────────────────────
// Everything below is read out of the shipped datasets. Module scope, so the
// same three rows come back on every render.

interface JobRow {
  company: string;
  count: number | null;
  location: string;
}

// Curated seed first, ingested boards after — the same array the Jobs page and
// the nav badge count, so the number on this page matches the one in the header.
const jobRows: JobRow[] = [
  ...(jobsSeed as unknown as JobRow[]),
  ...externalJobs_80000hours,
];
const JOB_PREVIEWS = [...jobRows]
  .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
  .slice(0, 3);

const NOW = new Date();

// Editorial deks in devrelSignal carry a leading glyph (⚡ / ⚠️). The home index
// is text-only, so glyphs are trimmed at render — the words stay verbatim.
const stripGlyphs = (s: string) =>
  s
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\uFE0F|\u200D|\u20E3/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s—–-]+/, '')
    .trim();

// Nearest open deadlines first; if nothing is dated ahead of today, the first
// three curated rows stand in rather than faking a deadline.
const OPEN_CALL_PREVIEWS = openCallEntries
  .filter((e) => e.countdown.kind === 'deadline' && e.countdown.date >= NOW)
  .sort((a, b) => {
    const ad = a.countdown.kind === 'deadline' ? a.countdown.date : NOW;
    const bd = b.countdown.kind === 'deadline' ? b.countdown.date : NOW;
    return ad.getTime() - bd.getTime();
  })
  .slice(0, 3);
const OPEN_CALLS_SHOWN =
  OPEN_CALL_PREVIEWS.length > 0 ? OPEN_CALL_PREVIEWS : openCallEntries.slice(0, 3);

// Upcoming events only — "Attend an event" should never preview a past one.
const UPCOMING_EVENTS = [...conferences]
  .filter((c) => new Date(c.date) >= NOW)
  .sort((a, b) => a.date.localeCompare(b.date));

// ── Row primitives ──────────────────────────────────────────────────────────

interface RowProps {
  title: string;
  meta?: string;
  sub?: string;
}

function RowLink({ to, title, meta, sub }: RowProps & { to: string }) {
  return (
    <li>
      <Link to={to} className="block py-3.5 transition-colors hover:bg-muted/50">
        <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="min-w-0 text-sm font-medium leading-snug">{title}</span>
          {meta ? (
            <span className="shrink-0 font-mono text-xs text-muted-foreground">{meta}</span>
          ) : null}
        </span>
        {sub ? (
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {sub}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

function RowExternal({
  href,
  title,
  meta,
  sub,
}: RowProps & { href: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block py-3.5 transition-colors hover:bg-muted/50"
      >
        <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="min-w-0 text-sm font-medium leading-snug">{title}</span>
          {meta ? (
            <span className="shrink-0 font-mono text-xs text-muted-foreground">{meta}</span>
          ) : null}
        </span>
        {sub ? (
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {sub}
          </span>
        ) : null}
      </a>
    </li>
  );
}

// ── Intent block ────────────────────────────────────────────────────────────

interface IntentBlockProps {
  id?: string;
  title: string;
  description: string;
  to: string;
  count: number;
  note?: string;
  children?: ReactNode;
}

function IntentBlock({
  id,
  title,
  description,
  to,
  count,
  note,
  children,
}: IntentBlockProps) {
  const { t } = useLanguage();

  return (
    <section id={id} className="border-b border-border">
      <div className="container py-10 md:py-14">
        <h2 className="heading-lg">{title}</h2>
        <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">{description}</p>
        {children}
        <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <Link
            to={to}
            className="text-sm font-medium underline decoration-1 underline-offset-4 hover:no-underline"
          >
            {t('home.viewAll')} {count}
          </Link>
          {note ? <span className="text-xs text-muted-foreground">{note}</span> : null}
        </div>
      </div>
    </section>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function Index() {
  const { t, language } = useLanguage();

  const ecosystemPreviews = useMemo(
    () => domains.filter((d) => d.id !== 'overview').slice(0, 3),
    [],
  );

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero — a promise, one line of scope, and the Atlas diagram. */}
        <section className="border-b border-border">
          <div className="container py-12 md:py-16">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-14">
              <div>
                <h1 className="heading-section">{t('home.hero.title')}</h1>
                <p className="mt-4 max-w-2xl text-body text-muted-foreground">
                  {t('home.hero.subtitle')}
                </p>
              </div>
              <div className="hidden lg:block">
                <HeroDiagram />
              </div>
            </div>
          </div>
        </section>

        {/* 0 — Not sure where to start: describe yourself, Una replies. */}
        <UnaChat />

        {/* 1 — Find funding */}
        <IntentBlock
          title={t('home.block.funding.title')}
          description={t('home.block.funding.desc')}
          to="/open-calls"
          count={openCallEntries.length}
          note={`${t('home.updated')} ${LAST_UPDATED['open-calls']}`}
        >
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {OPEN_CALLS_SHOWN.map((e) => (
              <RowLink
                key={e.id}
                to="/open-calls"
                title={e.title}
                meta={
                  e.countdown.kind === 'deadline'
                    ? e.countdown.date.toISOString().slice(0, 10)
                    : undefined
                }
                sub={e.organizer}
              />
            ))}
          </ul>
        </IntentBlock>

        {/* 2 — Find a job */}
        <IntentBlock
          title={t('home.block.jobs.title')}
          description={t('home.block.jobs.desc')}
          to="/jobs"
          count={jobRows.length}
          note={`${t('home.updated')} ${LAST_UPDATED.jobs}`}
        >
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {JOB_PREVIEWS.map((j, i) => (
              <RowLink
                key={`${i}-${j.company}`}
                to="/jobs"
                title={j.company}
                meta={typeof j.count === 'number' ? `${j.count} ${t('home.roles')}` : undefined}
                sub={j.location}
              />
            ))}
          </ul>
        </IntentBlock>

        {/* 3 — Attend an event. Keeps #events so older deep links land here. */}
        <IntentBlock
          id="events"
          title={t('home.block.events.title')}
          description={t('home.block.events.desc')}
          to="/events"
          count={conferences.length}
          note={
            UPCOMING_EVENTS.length > 0 ? `${t('home.next')} ${UPCOMING_EVENTS[0].date}` : undefined
          }
        >
          {UPCOMING_EVENTS.length > 0 ? (
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {UPCOMING_EVENTS.slice(0, 3).map((c) => (
                <RowLink
                  key={c.id}
                  to="/events"
                  title={c.name[language]}
                  meta={c.date}
                  sub={c.location}
                />
              ))}
            </ul>
          ) : null}
        </IntentBlock>

        {/* 4 — Explore the ecosystem */}
        <IntentBlock
          title={t('home.block.ecosystem.title')}
          description={t('home.block.ecosystem.desc')}
          to="/directory"
          count={domains.filter((d) => d.id !== 'overview').length}
          note={`${t('home.updated')} ${LAST_UPDATED.directory}`}
        >
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {ecosystemPreviews.map((d) => (
              <RowLink
                key={d.id}
                to={`/directory?domain=${d.id}`}
                title={d.name[language]}
                sub={d.subtitle[language]}
              />
            ))}
          </ul>
        </IntentBlock>

        {/* 5 — Read the market context */}
        <IntentBlock
          title={t('home.block.context.title')}
          description={t('home.block.context.desc')}
          to="/founders"
          count={FOUNDERS_EDITORIAL_CARDS.length}
        >
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {FOUNDERS_EDITORIAL_CARDS.map((card, i) => (
              <RowLink
                key={`${i}-${card.headline}`}
                to={card.link.to}
                title={stripGlyphs(card.headline)}
                meta={card.asOf}
                sub={stripGlyphs(card.dek)}
              />
            ))}
          </ul>
        </IntentBlock>

        {/* 6 — Stay informed */}
        <IntentBlock
          title={t('home.block.news.title')}
          description={t('home.block.news.desc')}
          to="/news"
          count={newsItems.length}
          note={newsGeneratedOn ? `${t('home.updated')} ${newsGeneratedOn}` : undefined}
        >
          {newsItems.length > 0 ? (
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {newsItems.slice(0, 3).map((item) => (
                <RowExternal
                  key={item.id}
                  href={item.url}
                  title={item.title}
                  meta={item.datePrecision === 'month' ? item.date.slice(0, 7) : item.date}
                  sub={item.source}
                />
              ))}
            </ul>
          ) : null}
        </IntentBlock>

        {/* Closing band — who maintains this, and one way to contribute. */}
        <section className="py-10 md:py-14">
          <div className="container">
            <p className="max-w-2xl text-body-sm text-muted-foreground">
              {t('home.maintained')}
            </p>

            <div className="mt-6 border border-border p-5 md:p-6">
              <h2 className="heading-md">{t('home.contribute.title')}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {t('home.contribute.desc')}
              </p>
              <a
                href={CONTRIBUTE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center border border-foreground px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
              >
                {t('home.contribute.cta')}
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
