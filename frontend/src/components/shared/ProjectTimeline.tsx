// ProjectTimeline ───────────────────────────────────────────────────────────
//
// Compact, monochrome change log for the Atlas itself — the widget version of
// src/data/projectTimeline.ts. Each row is a real milestone taken from the
// repository's git history (date + short commit hash), rendered newest-first.
//
// Layout notes
// • Two-column grid (rail | content), NOT an absolutely-positioned rail pinned
//   to one side: CSS grid follows writing direction, so the same markup flips
//   correctly under dir="rtl" with no logical-property utilities.
// • Monochrome: kind is signalled by a small mono label in muted-foreground,
//   never by colour (docs/design-decisions/2026-05-palette-strategy.md).
// • Collapsed to the newest 6 rows behind an explicit "Show all" control so the
//   About page keeps its rhythm.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { projectMilestones } from '@/data/projectTimeline';

const COLLAPSED_COUNT = 6;

export function ProjectTimeline() {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const newestFirst = [...projectMilestones].reverse();
  const rows = expanded ? newestFirst : newestFirst.slice(0, COLLAPSED_COUNT);

  return (
    <section className="mb-8 max-w-2xl" aria-labelledby="project-timeline-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-1">
        <h2 id="project-timeline-heading" className="heading-lg">
          {t('about.timeline.title')}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {projectMilestones.length} {t('about.timeline.entries')}
        </span>
      </div>
      <p className="text-body text-muted-foreground mb-5">{t('about.timeline.subtitle')}</p>

      <ol className="list-none">
        {rows.map((milestone, index) => (
          <li key={milestone.id} className="grid grid-cols-[auto_1fr] gap-x-3">
            {/* Rail: dot + connector. Grid columns flip with direction, so this
                column sits on the right under dir="rtl" automatically. */}
            <div className="flex flex-col items-center pt-1.5" aria-hidden="true">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
              {index < rows.length - 1 && <span className="mt-1 w-px flex-1 bg-border/70" />}
            </div>

            <div className="pb-4">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <time
                  dateTime={milestone.date}
                  className="font-mono text-[10px] tabular-nums text-muted-foreground"
                >
                  {milestone.date}
                </time>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">
                  {t(`about.timeline.kind.${milestone.kind}`)}
                </span>
              </div>

              <h3 className="mt-0.5 text-sm font-medium">{milestone.title[language]}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {milestone.detail[language]}
              </p>

              <span className="mt-1 inline-block font-mono text-[9px] text-muted-foreground/40">
                <span className="sr-only">{t('about.timeline.commit')} </span>
                {milestone.commit}
              </span>
            </div>
          </li>
        ))}
      </ol>

      {projectMilestones.length > COLLAPSED_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-1 inline-flex items-center border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/60 hover:text-foreground"
        >
          {expanded ? t('about.timeline.showLess') : t('about.timeline.showAll')}
        </button>
      )}
    </section>
  );
}
