// AUTO-GENERATED pipeline step (Phase 0 pattern): ingest EXTERNAL job sources
// into committed, curated TS modules under src/data/. Emitted entries carry
// `provenance` + `verifiedAt` on every record.
//
// Local-DB-safe design rules (Kate, standing):
//  - The client NEVER fetches these sources. This script runs on a dev box or
//    in CI and writes a committed TS module the static build imports.
//  - Local/private sources (BlueDot via Slack MCP, Kate's exports) are read
//    from a path given as a PARAMETER (--file=...). No local path is baked in
//    and no raw local DB is ever committed.
//  - NEVER FABRICATE. A source that is not reachable/verifiable is reported as
//    BLOCKED and its output file is NOT written (no empty/fake entries).
//  - The generated module is machine-owned. Never hand-edit it — re-run this
//    script.
//
// Usage
//   node scripts/ingest/jobsExternal.cjs                       # all sources
//   node scripts/ingest/jobsExternal.cjs --source=80000hours
//   node scripts/ingest/jobsExternal.cjs --source=80000hours --areas=all
//   node scripts/ingest/jobsExternal.cjs --source=bluedot --file=/path/export.json
//   node scripts/ingest/jobsExternal.cjs --dry                 # report only
//
// Options
//   --source=<name|all>   which source to ingest (default: all)
//   --file=<path>         input file for file-backed sources (bluedot)
//   --areas=health|all    which 80k problem areas to keep (default: health)
//   --out=<path>          override output path
//   --dry                 fetch + transform, print report, write nothing
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const JOBS_SEED = path.join(DATA_DIR, 'jobsData.json');

// Local date (Kate's box runs UTC+04) — UTC would stamp yesterday in the evening.
const _now = new Date();
const TODAY = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`;

// ── CLI ─────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function arg(name, fallback) {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}
const hasFlag = (name) => argv.includes(`--${name}`);
const SOURCE = arg('source', 'all');
const DRY = hasFlag('dry');
const AREAS = arg('areas', 'health');

// ── helpers ─────────────────────────────────────────────────────────────────
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/`/g, '\\`')
    .replace(/\s+/g, ' ')
    .trim();
}
const isHttps = (u) => typeof u === 'string' && /^https:\/\/\S+$/.test(u);
function uniq(list, cap) {
  const seen = new Set();
  const out = [];
  for (const v of list) {
    if (!v) continue;
    const k = String(v).trim();
    if (!k || seen.has(k.toLowerCase())) continue;
    seen.add(k.toLowerCase());
    out.push(k);
    if (cap && out.length >= cap) break;
  }
  return out;
}

// ── source: 80,000 Hours job board ──────────────────────────────────────────
// The public board https://jobs.80000hours.org/ is a Nuxt app that queries its
// own public JSON endpoint (exposed in the page's runtime config as `apiBase`).
// This is the same data the board renders — no scraping of HTML, no auth.
const EIGHTY_K = {
  name: '80000hours',
  label: '80,000 Hours job board',
  endpoint: 'https://backend.eawork.org/api/jobs/',
  boardUrl: 'https://jobs.80000hours.org/',
};

// Only health-adjacent problem areas are in scope for a health-AI atlas.
// AI safety & policy / animal welfare / climate etc. are deliberately OUT
// (use --areas=all to override).
const HEALTH_AREAS = ['Biosecurity & pandemic preparedness', 'Global health & development'];
const AREA_CATEGORY = {
  'Biosecurity & pandemic preparedness': 'Biosecurity / Pandemic Preparedness',
  'Global health & development': 'Global Health & Development',
  'AI safety & policy': 'AI Safety & Policy',
  'AI technical safety': 'AI Safety & Policy',
};

async function fetchEightyK() {
  const res = await fetch(EIGHTY_K.endpoint, {
    headers: { 'User-Agent': 'healthaiatlas-ingest/1.0 (+https://healthaiatlas.ai)', accept: 'application/json' },
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) throw new Error(`${EIGHTY_K.endpoint} → HTTP ${res.status}`);
  const rows = await res.json();
  if (!Array.isArray(rows)) throw new Error('unexpected payload: expected a JSON array of jobs');
  return rows;
}

function transformEightyK(rows, areas) {
  const wanted = areas === 'all' ? null : HEALTH_AREAS;
  const kept = rows.filter((r) => {
    const tags = Array.isArray(r.tags_area) ? r.tags_area : [];
    if (!wanted) return tags.length > 0;
    return tags.some((t) => wanted.includes(t));
  });

  // Group the role-level rows into company-level entries: the Atlas job board
  // is one row per company with `count` = open roles (see jobsData.json).
  const byCompany = new Map();
  for (const r of kept) {
    const company = (r.company && r.company.name ? r.company.name : '').trim();
    if (!company) continue;
    if (!byCompany.has(company)) byCompany.set(company, []);
    byCompany.get(company).push(r);
  }

  const entries = [];
  const skipped = [];
  for (const [company, roles] of byCompany) {
    const url = [roles[0].company && roles[0].company.career_page_url,
      roles[0].company && roles[0].company.url,
      ...roles.map((r) => r.url_external)].find(isHttps);
    if (!url) {
      // Zero-Trust: shipping an http:// or missing link is worse than no entry.
      skipped.push(`${company} (no https URL)`);
      continue;
    }
    const areaTally = new Map();
    for (const r of roles) {
      for (const a of Array.isArray(r.tags_area) ? r.tags_area : []) {
        if (wanted && !wanted.includes(a)) continue;
        areaTally.set(a, (areaTally.get(a) || 0) + 1);
      }
    }
    const primaryArea = [...areaTally.entries()].sort((a, b) => b[1] - a[1])[0];
    const titles = uniq(roles.map((r) => r.title), 6);
    const cities = uniq(roles.flatMap((r) => (Array.isArray(r.tags_city) ? r.tags_city : [])), 5);
    const countries = uniq(roles.flatMap((r) => (Array.isArray(r.tags_region_country) ? r.tags_region_country : [])), 4);
    const allTags = roles.flatMap((r) => [
      ...(Array.isArray(r.tags_city) ? r.tags_city : []),
      ...(Array.isArray(r.tags_region_country) ? r.tags_region_country : []),
    ]);
    const location = cities.length ? cities.join(', ') : countries.join(', ');
    entries.push({
      company,
      category: (primaryArea && AREA_CATEGORY[primaryArea[0]]) || 'Other',
      count: roles.length,
      count_raw: String(roles.length),
      roles: titles.join('; '),
      location,
      remote: allTags.some((t) => /remote/i.test(String(t))) ? 'Yes' : 'No',
      url,
      status: 'Active',
      active: true,
      uae: allTags.some((t) => /UAE|United Arab Emirates|Emirates/i.test(String(t))),
      provenance: '80000hours',
      verifiedAt: TODAY,
    });
  }
  entries.sort((a, b) => b.count - a.count || a.company.localeCompare(b.company));
  return { entries, skipped, scanned: rows.length, matched: kept.length };
}

// ── source: BlueDot Opportunities ───────────────────────────────────────────
// BlueDot's Opportunities board is only reachable through Kate's Slack MCP,
// which this pipeline does not have. The source is therefore FILE-backed: drop
// an export at a path and pass --file=<path>. Without a file the source is
// reported BLOCKED and NOTHING is written (no invented rows).
//
// Accepted input: JSON array of objects with at least `company` + `url`
// (https). Optional: title|role, location, remote, category.
const BLUEDOT = { name: 'bluedot', label: 'BlueDot Opportunities (Slack MCP export)' };

function transformBluedot(rows) {
  const byCompany = new Map();
  for (const r of rows) {
    const company = String(r.company || '').trim();
    if (!company) continue;
    if (!byCompany.has(company)) byCompany.set(company, []);
    byCompany.get(company).push(r);
  }
  const entries = [];
  const skipped = [];
  for (const [company, roles] of byCompany) {
    const url = roles.map((r) => r.url).find(isHttps);
    if (!url) { skipped.push(`${company} (no https URL)`); continue; }
    const titles = uniq(roles.map((r) => r.title || r.role), 6);
    const locations = uniq(roles.map((r) => r.location), 5);
    entries.push({
      company,
      category: String(roles[0].category || 'Other'),
      count: roles.length,
      count_raw: String(roles.length),
      roles: titles.join('; '),
      location: locations.join(', '),
      remote: roles.some((r) => /yes|remote/i.test(String(r.remote || ''))) ? 'Yes' : 'No',
      url,
      status: 'Active',
      active: true,
      uae: roles.some((r) => /UAE|United Arab Emirates|Emirates/i.test(`${r.location || ''}`)),
      provenance: 'bluedot',
      verifiedAt: TODAY,
    });
  }
  entries.sort((a, b) => b.count - a.count || a.company.localeCompare(b.company));
  return { entries, skipped, scanned: rows.length, matched: rows.length };
}

async function loadBluedot(file) {
  if (!file) {
    const e = new Error('BLOCKED: BlueDot Opportunities needs a Slack MCP export (no reachable public feed). Re-run with --file=<path to export>.json');
    e.blocked = true;
    throw e;
  }
  if (!fs.existsSync(file)) {
    const e = new Error(`BLOCKED: BlueDot source file not found: ${file}`);
    e.blocked = true;
    throw e;
  }
  const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(rows)) throw new Error('BlueDot export must be a JSON array');
  return rows;
}

// ── emit ────────────────────────────────────────────────────────────────────
function renderModule(entry, entries, entryCount, roleCount, headerNotes) {
  const body = entries
    .map(
      (e) =>
        `  {\n` +
        `    company: '${esc(e.company)}',\n` +
        `    category: '${esc(e.category)}',\n` +
        `    count: ${e.count},\n` +
        `    count_raw: '${esc(e.count_raw)}',\n` +
        `    roles: '${esc(e.roles)}',\n` +
        `    location: '${esc(e.location)}',\n` +
        `    remote: '${esc(e.remote)}',\n` +
        `    url: '${esc(e.url)}',\n` +
        `    status: '${esc(e.status)}',\n` +
        `    active: ${e.active},\n` +
        `    uae: ${e.uae},\n` +
        `    provenance: '${esc(e.provenance)}',\n` +
        `    verifiedAt: '${esc(e.verifiedAt)}',\n` +
        `  }`,
    )
    .join(',\n');

  return (
    `// AUTO-GENERATED by scripts/ingest/jobsExternal.cjs — DO NOT EDIT BY HAND.\n` +
    `// Regenerate: node scripts/ingest/jobsExternal.cjs --source=${entry.name}\n` +
    headerNotes.map((n) => `// ${n}`).join('\n') +
    `\n` +
    `// ${entryCount} companies · ${roleCount} roles · verifiedAt ${TODAY}\n\n` +
    `export interface ExternalJob {\n` +
    `  company: string;\n` +
    `  category: string;\n` +
    `  count: number | null;\n` +
    `  count_raw: string;\n` +
    `  roles: string;\n` +
    `  location: string;\n` +
    `  remote: string;\n` +
    `  url: string;\n` +
    `  status: string;\n` +
    `  active: boolean;\n` +
    `  uae: boolean;\n` +
    `  provenance: string;\n` +
    `  verifiedAt: string;\n` +
    `}\n\n` +
    `export const externalJobs_${entry.exportSuffix}: ExternalJob[] = [\n${body}\n];\n` +
    `export default externalJobs_${entry.exportSuffix};\n`
  );
}

// ── main ────────────────────────────────────────────────────────────────────
const SOURCES = [
  {
    name: '80000hours',
    label: EIGHTY_K.label,
    exportSuffix: '80000hours',
    out: path.join(DATA_DIR, 'jobsExternal.80000hours.ts'),
    async run() {
      const rows = await fetchEightyK();
      const { entries, skipped, scanned, matched } = transformEightyK(rows, AREAS);
      return {
        entries,
        skipped,
        notes: [
          `Source: ${EIGHTY_K.label} — ${EIGHTY_K.boardUrl}`,
          `Endpoint: ${EIGHTY_K.endpoint} (public JSON feed the board itself renders)`,
          `Areas kept: ${AREAS === 'all' ? 'all' : HEALTH_AREAS.join(' | ')}`,
          `Scanned ${scanned} roles · ${matched} matched the area filter`,
        ],
      };
    },
  },
  {
    name: 'bluedot',
    label: BLUEDOT.label,
    exportSuffix: 'bluedot',
    out: path.join(DATA_DIR, 'jobsExternal.bluedot.ts'),
    async run() {
      const rows = await loadBluedot(arg('file', null));
      const { entries, skipped, scanned } = transformBluedot(rows);
      return {
        entries,
        skipped,
        notes: [
          `Source: ${BLUEDOT.label}`,
          `Input file: ${arg('file', null)} (local export — never committed)`,
          `Scanned ${scanned} rows`,
        ],
      };
    },
  },
];

async function main() {
  const selected = SOURCE === 'all' ? SOURCES : SOURCES.filter((s) => s.name === SOURCE);
  if (selected.length === 0) {
    console.error(`ERROR: unknown --source=${SOURCE}. Known: ${SOURCES.map((s) => s.name).join(', ')}, all`);
    process.exit(1);
  }

  // Companies already in the hand-curated seed are never duplicated.
  const seed = JSON.parse(fs.readFileSync(JOBS_SEED, 'utf8'));
  const seedNames = new Set(seed.map((j) => String(j.company).trim().toLowerCase()));

  let wrote = 0;
  let blocked = 0;
  for (const src of selected) {
    console.log(`\n── ${src.name} (${src.label}) ──`);
    try {
      const { entries, skipped, notes } = await src.run();
      const fresh = [];
      const dupes = [];
      for (const e of entries) {
        if (seedNames.has(e.company.trim().toLowerCase())) dupes.push(e.company);
        else fresh.push(e);
      }
      const roleCount = fresh.reduce((n, e) => n + e.count, 0);
      const out = arg('out', null) || src.out;
      console.log(`  companies     : ${entries.length}`);
      console.log(`  new companies : ${fresh.length} (${roleCount} roles)`);
      if (dupes.length) console.log(`  deduped (already in jobsData.json): ${dupes.join(', ')}`);
      if (skipped.length) console.log(`  skipped       : ${skipped.length} → ${skipped.slice(0, 5).join('; ')}`);
      if (fresh.length === 0) {
        console.log(`  NOT WRITTEN   : no entries after filtering — refusing to emit an empty module.`);
        continue;
      }
      const ts = renderModule(src, fresh, fresh.length, roleCount, notes);
      if (DRY) {
        console.log(`  dry run       : would write ${out} (${ts.length} bytes)`);
      } else {
        fs.writeFileSync(out, ts);
        console.log(`  WROTE         : ${out}`);
        wrote += 1;
      }
      console.log(`  sample        : ${fresh.slice(0, 3).map((e) => `${e.company} (${e.count} roles, ${e.category})`).join(' · ')}`);
    } catch (err) {
      if (err.blocked) {
        blocked += 1;
        console.log(`  BLOCKED       : ${err.message}`);
      } else {
        console.error(`  FAILED        : ${err.message}`);
      }
    }
  }

  console.log(`\nSummary: ${wrote} source(s) written, ${blocked} blocked, ${selected.length - wrote - blocked} failed.`);
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
