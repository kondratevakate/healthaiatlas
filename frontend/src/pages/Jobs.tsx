// Healthcare AI Jobs — 2026
//
// Filterable directory of open AI roles across 116 companies in the
// HealthAI Atlas landscape. Data sourced from Healthcare AI Jobs Tracker 2026.xlsx
// and stored in src/data/jobsData.json.
//
// Filters: category pills only
// Each card links directly to the company's careers page.

import { useState, useMemo, useEffect, useRef } from 'react';
import { ExternalLink, MapPin, Wifi, GraduationCap } from 'lucide-react';
import { Layout } from '@/components/layout';
import { cn } from '@/lib/utils';
import rawJobs from '@/data/jobsData.json';
import { AIRTABLE_PROVENANCE_URL } from '@/data/constants';
import { PageHeader } from '@/components/shared/PageHeader';

// ── Types ────────────────────────────────────────────────────────────────────

interface Job {
  company: string;
  category: string;
  count: number | null;
  count_raw: string;
  roles: string;
  location: string;
  remote: string;
  url: string;
  status: string;
  active: boolean;
  uae: boolean;
}

const jobs = rawJobs as Job[];


// ── Category grouping ────────────────────────────────────────────────────────
// Categories with only 1 company collapse into "Other" to keep pills readable.

const CATEGORY_ORDER = [
  'AI Research',
  'AI Drug Discovery',
  'Clinical AI',
  'Pharma AI',
  'Brain-Computer Interface',
  'AI Lab Automation',
  'Pathology AI',
  'Surgical Robotics',
  'Cardiovascular AI',
  'Genomic AI',
  'Mental Health AI',
  'Hospital Operations AI',
  'Healthcare AI Platform',
  'Radiology AI',
  'Other',
];

// ── Role-type filter ─────────────────────────────────────────────────────────
// Orthogonal to domain — filters by what kind of work the job involves.

const ROLE_FILTERS: { id: string; label: string; pattern: RegExp }[] = [
  {
    id: 'researcher',
    label: '🔬 Researcher',
    pattern: /research scientist|research engineer|ml scientist|phd|postdoc|research fellow|research associate/i,
  },
  {
    id: 'engineer',
    label: '⚙️ Engineer',
    pattern: /software engineer|ml engineer|machine learning engineer|mlops|ml ops|ml platform|infrastructure engineer|data engineer|robotics engineer|backend engineer|fullstack|full.stack/i,
  },
  {
    id: 'analyst',
    label: '📊 Data / Analyst',
    pattern: /data scientist|data analyst|applied scientist|applied ai|bioinformatics|computational bio/i,
  },
  {
    id: 'clinician',
    label: '🏥 Clinician',
    pattern: /clinical|physician|medical officer|nurse|prompt engineer|clinical pharmacology|biostatistic/i,
  },
  {
    id: 'product',
    label: '🗺️ Product / PM',
    pattern: /product manager|\bpm\b|product engineer|product designer/i,
  },
];

const CATEGORY_COLOR: Record<string, string> = {
  'AI Research':              'bg-violet-500/15 text-violet-300 border-violet-500/20',
  'AI Drug Discovery':        'bg-blue-500/15 text-blue-300 border-blue-500/20',
  'Clinical AI':              'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  'Pharma AI':                'bg-sky-500/15 text-sky-300 border-sky-500/20',
  'Radiology AI':             'bg-amber-500/15 text-amber-300 border-amber-500/20',
  'Pathology AI':             'bg-orange-500/15 text-orange-300 border-orange-500/20',
  'Surgical Robotics':        'bg-rose-500/15 text-rose-300 border-rose-500/20',
  'Brain-Computer Interface': 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/20',
  'Cardiovascular AI':        'bg-red-500/15 text-red-300 border-red-500/20',
  'Genomic AI':               'bg-teal-500/15 text-teal-300 border-teal-500/20',
  'Mental Health AI':         'bg-purple-500/15 text-purple-300 border-purple-500/20',
  'Hospital Operations AI':   'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  'Healthcare AI Platform':   'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
  'AI Lab Automation':        'bg-lime-500/15 text-lime-300 border-lime-500/20',
  'Other':                    'bg-foreground/8 text-muted-foreground border-foreground/10',
};

function catColor(cat: string) {
  return CATEGORY_COLOR[cat] ?? CATEGORY_COLOR['Other'];
}

// ── Animated counter ─────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(Math.round(eased * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

// ── Stat bar ─────────────────────────────────────────────────────────────────

function StatItem({ target, suffix = '', label }: { target: number; suffix?: string; label: string }) {
  const value = useCountUp(target);
  return (
    <div className="bg-card border border-border rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-foreground tabular-nums">
        {value}{suffix}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function StatBar() {
  const active     = jobs.filter(j => j.active).length;
  const withCount  = jobs.filter(j => j.count !== null);
  const totalRoles = withCount.reduce((s, j) => s + (j.count ?? 0), 0);

  return (
    <div className="grid grid-cols-2 gap-3 mb-8 max-w-xs">
      <StatItem target={active}      label="Companies hiring" />
      <StatItem target={totalRoles}  suffix="+" label="Verified open roles" />
    </div>
  );
}

// ── Animated results count ────────────────────────────────────────────────────

function ResultsCount({ count, inactive }: { count: number; inactive: number }) {
  const animated = useCountUp(count, 600);
  return (
    <div className="text-xs text-muted-foreground mb-4 font-mono">
      {animated} {count === 1 ? 'company' : 'companies'} hiring
      {inactive > 0 && <span className="ml-2 opacity-50">· {inactive} with no active roles</span>}
    </div>
  );
}

// ── Inactive card ─────────────────────────────────────────────────────────────

function InactiveCard({ job }: { job: Job }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2 opacity-40">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground text-sm leading-snug truncate line-through decoration-foreground/40">
            {job.company}
          </div>
          <span className={cn(
            'inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded border font-medium',
            catColor(job.category),
          )}>
            {job.category}
          </span>
        </div>
        {job.url && (
          <a href={job.url} target="_blank" rel="noopener noreferrer"
            className="shrink-0 p-1.5 rounded text-muted-foreground"
            aria-label={`${job.company} careers`}>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
      <div className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 w-fit">
        No active roles · May 2026
      </div>
    </div>
  );
}

// ── Job card ─────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: Job }) {
  const roleList = job.roles
    ? job.roles.split(/[;,]/).map(r => r.trim()).filter(Boolean).slice(0, 4)
    : [];

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 hover:border-foreground/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground text-sm leading-snug truncate">
            {job.company}
          </div>
          <span className={cn(
            'inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded border font-medium',
            catColor(job.category),
          )}>
            {job.category}
          </span>
        </div>
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 p-1.5 rounded hover:bg-foreground/8 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`Open ${job.company} careers`}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Count */}
      {(job.count !== null || job.count_raw) && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {job.count !== null ? `${job.count}` : '?'}
          </span>
          {' '}open role{job.count !== 1 ? 's' : ''}
          {job.count_raw && !job.count && (
            <span className="ml-1 opacity-60">({job.count_raw})</span>
          )}
        </div>
      )}

      {/* Key roles */}
      {roleList.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {roleList.map(r => (
            <span key={r} className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">
              {r}
            </span>
          ))}
        </div>
      )}

      {/* Footer meta */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground mt-auto pt-1 border-t border-border">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5" />
            {job.location}
          </span>
        )}
        {job.remote && (
          <span className={cn(
            'flex items-center gap-1 font-medium',
            job.remote === 'Yes' && 'text-emerald-400',
            job.remote === 'Partial' && 'text-amber-400',
          )}>
            <Wifi className="w-2.5 h-2.5" />
            {job.remote === 'Yes' ? 'Remote' : job.remote === 'Partial' ? 'Hybrid' : 'On-site'}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Jobs() {
  const [catFilter, setCat]    = useState<string>('All');
  const [roleFilter, setRole]  = useState<string>('All');
  const [visibleCount, setVisible] = useState(12);

  // Normalise category: anything not in CATEGORY_ORDER → 'Other'
  const normalisecat = (cat: string) =>
    CATEGORY_ORDER.includes(cat) ? cat : 'Other';

  const allNormalised = useMemo(() =>
    jobs.map(j => ({ ...j, category: normalisecat(j.category) })),
  []);

  const activeJobs = useMemo(() => allNormalised.filter(j => j.active), [allNormalised]);

  const inactiveJobs = useMemo(() => allNormalised.filter(j => !j.active), [allNormalised]);

  // Count per category (after normalisation)
  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    activeJobs.forEach(j => { m[j.category] = (m[j.category] ?? 0) + 1; });
    return m;
  }, [activeJobs]);

  // Categories present, in preferred order
  const categories = useMemo(() => {
    const present = new Set(activeJobs.map(j => j.category));
    return CATEGORY_ORDER.filter(c => present.has(c));
  }, [activeJobs]);

  // Role-filter match for a job
  const matchesRole = (j: Job) => {
    if (roleFilter === 'All') return true;
    const rf = ROLE_FILTERS.find(r => r.id === roleFilter);
    return rf ? rf.pattern.test(j.roles ?? '') : true;
  };

  // Count per role filter given current catFilter
  const roleCounts = useMemo(() => {
    const base = activeJobs.filter(j =>
      catFilter === 'All' || j.category === catFilter);
    const m: Record<string, number> = { All: base.length };
    ROLE_FILTERS.forEach(rf => {
      m[rf.id] = base.filter(j => rf.pattern.test(j.roles ?? '')).length;
    });
    return m;
  }, [activeJobs, catFilter]);

  // Count per category given current roleFilter
  const catCountsFiltered = useMemo(() => {
    const base = activeJobs.filter(matchesRole);
    const m: Record<string, number> = { All: base.length };
    categories.forEach(cat => { m[cat] = base.filter(j => j.category === cat).length; });
    return m;
  }, [activeJobs, roleFilter, categories]);

  const filtered = useMemo(() =>
    activeJobs.filter(j => {
      if (catFilter !== 'All' && j.category !== catFilter) return false;
      if (!matchesRole(j)) return false;
      return true;
    }),
  [activeJobs, catFilter, roleFilter]);

  // Inactive companies visible in the current domain filter
  const filteredInactive = useMemo(() =>
    inactiveJobs.filter(j =>
      catFilter === 'All' || j.category === catFilter,
    ),
  [inactiveJobs, catFilter]);

  return (
    <Layout>
      <div className="container pt-8 md:pt-10 pb-12">

        <PageHeader
          title="Healthcare AI Jobs 2026"
          subtitle="Open roles at companies tracked in the HealthAI Atlas."
        />

        <StatBar />

        {/* ── Domain filter ─────────────────────────────────────────────── */}
        <div className="mb-2">
          <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-2">By domain</div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setCat('All'); setVisible(12); }}
              className={cn(
                'inline-flex items-baseline gap-1 text-xs px-3 py-1.5 font-mono border transition-colors',
                catFilter === 'All'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border hover:border-foreground/20',
              )}
            >
              All
              <span className="font-mono opacity-60">{catCountsFiltered['All'] ?? activeJobs.length}</span>
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setCat(cat === catFilter ? 'All' : cat); setVisible(12); }}
                className={cn(
                  'inline-flex items-baseline gap-1 text-xs px-3 py-1.5 font-mono border transition-colors',
                  catFilter === cat
                    ? cn('border opacity-100', catColor(cat))
                    : 'bg-card text-muted-foreground border-border hover:border-foreground/20',
                )}
              >
                {cat}
                <span className="font-mono opacity-60">{catCountsFiltered[cat] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Role-type filter ──────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-2 mt-3">By role type</div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setRole('All'); setVisible(12); }}
              className={cn(
                'inline-flex items-baseline gap-1 text-xs px-3 py-1.5 font-mono border transition-colors',
                roleFilter === 'All'
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border hover:border-foreground/20',
              )}
            >
              All roles
              <span className="font-mono opacity-60">{roleCounts['All']}</span>
            </button>
            {ROLE_FILTERS.map(rf => (
              <button
                key={rf.id}
                onClick={() => { setRole(rf.id === roleFilter ? 'All' : rf.id); setVisible(12); }}
                className={cn(
                  'inline-flex items-baseline gap-1 text-xs px-3 py-1.5 font-mono border transition-colors',
                  roleFilter === rf.id
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground border-border hover:border-foreground/20',
                )}
              >
                {rf.label}
                <span className="font-mono opacity-60">{roleCounts[rf.id] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <ResultsCount count={filtered.length} inactive={filteredInactive.length} />

        {/* Active grid */}
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.slice(0, visibleCount).map(job => (
                <JobCard key={`${job.company}-${job.url}`} job={job} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setVisible(v => v + 12)}
                  className="text-sm px-5 py-2 border border-border font-mono text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
                >
                  Load more · {filtered.length - visibleCount} remaining
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-sm">No companies in this category.</div>
            <button
              onClick={() => setCat('All')}
              className="mt-3 text-xs underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Show all
            </button>
          </div>
        )}

        {/* Inactive companies — always shown below active, filtered by domain */}
        {filteredInactive.length > 0 && (
          <div className="mt-8">
            <div className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-3">
              No active roles · {filteredInactive.length}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredInactive.map(job => (
                <InactiveCard key={`inactive-${job.company}`} job={job} />
              ))}
            </div>
          </div>
        )}

        {/* Academic / Early Career section */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            <span className="heading-md text-foreground">Academic &amp; Early Career</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            {[
              {
                href: 'https://ecrcentral.org/',
                name: 'ECR Central',
                desc: 'Community and job board for early-career researchers — postdocs, PhD candidates, and research fellows across life sciences and health AI.',
                tag: 'Early Career · Community',
              },
              {
                href: 'https://academicpositions.com/',
                name: 'Academic Positions',
                desc: 'Global listings of academic jobs, faculty positions, postdocs, and research roles at universities and research institutes worldwide.',
                tag: 'Faculty · Postdoc · Global',
              },
            ].map(({ href, name, desc, tag }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between gap-4 bg-card border border-border rounded-lg p-5 hover:border-foreground/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground text-sm mb-1">{name}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{desc}</div>
                  <span className="inline-block mt-2 text-[10px] px-1.5 py-0.5 rounded border bg-secondary text-muted-foreground border-border font-medium">
                    {tag}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground space-y-3">
          <div className="text-foreground/40 font-medium">Updated May 2026</div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              Data from Healthcare AI Jobs Tracker 2026. Role counts reflect verified snapshots — check careers pages for current openings.
              Compiled by <a href="/about" className="underline underline-offset-2 hover:text-foreground">HealthAI Atlas</a>.
            </span>
            <a
              href={AIRTABLE_PROVENANCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 underline underline-offset-2 hover:text-foreground transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-3 h-3" />
              Zero Trust data provenance
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
