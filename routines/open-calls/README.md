# routines/open-calls

Automated daily research routine. Surfaces currently-open application calls
(grants, accelerators, hackathons, conference CFPs) relevant to AI in healthcare.

## How it runs

A scheduled remote Claude agent runs every day at **09:07 Asia/Dubai** and
commits the digest directly to `main` (`routine: open calls digest <YYYY-MM-DD>`).
If zero new verified calls are found, nothing is committed (no-noise rule).

- Routine config: https://claude.ai/code/routines/trig_01SR4rdtLYQxd7Gprhg4ht9Q
- Minimum interval between runs: 1 hour (Anthropic platform limit)

### Fetch strategy

Each seed URL from `SOURCES.md` is fetched with a two-attempt strategy:

1. **Direct `WebFetch`** on the original URL.
2. **Jina Reader fallback** (`https://r.jina.ai/<url>`) if the direct fetch
   returns an error, a Cloudflare/anti-bot interstitial, a JS-shell with no
   content, or fewer than 200 characters. Jina Reader is a hosted reader-mode
   service that renders the page and returns clean markdown.

If both attempts fail, the URL is listed in a `Sources that failed to fetch`
footer in that day's digest. This makes recurring failures visible so they
can be cleaned out of `SOURCES.md`. The routine never silently drops a
source — every failure surfaces in the commit.

## Files in this directory

- `SOURCES.md` — **edit this freely**; the routine reads it on every run as
  its seed list of URLs to WebFetch
- `README.md` — this file
- `inbox/YYYY-MM-DD.md` — one digest per day, only when new calls are found
- `index.md` — one-line summary appended per run (auto-created)

## Reviewing a digest

Digests land directly on `main`. To review:

1. Open `routines/open-calls/inbox/<date>.md` in the repo.
2. If an entry looks wrong, edit the file and commit directly to main.
3. To port a call into Airtable (`Programs` table, base `appiYen6pEW5tSVrn`) —
   that's a manual step; the routine deliberately does **not** write to Airtable.

## Adjusting cadence or scope

- **Change cadence** — update routine via `RemoteTrigger action=update` with a
  new `cron_expression` (UTC, minimum 1 hour granularity).
- **Change sources** — edit `SOURCES.md` and commit. No routine config change.
- **Pause** — set `enabled: false` on the routine. The schedule stops; config
  is preserved.

## Compliance

Routine writes only inside `routines/open-calls/`. It cannot touch
`frontend/`, `backend/`, `ansible/`, or any data file in `frontend/src/data/`.
All committed text is in English (project rule).
