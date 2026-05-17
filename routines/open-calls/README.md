# routines/open-calls

Automated daily research routine. Surfaces currently-open application calls
(grants, accelerators, hackathons, conference CFPs) relevant to AI in healthcare.

## How it runs

A scheduled remote Claude agent runs every day at **09:07 Asia/Dubai** and
opens a pull request titled `Daily open calls digest <YYYY-MM-DD>` against `main`.
If zero new verified calls are found, no PR is opened (no-noise rule).

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
source — every failure surfaces in the PR.

## Files in this directory

- `SOURCES.md` — **edit this freely**; the routine reads it on every run as
  its seed list of URLs to WebFetch
- `README.md` — this file
- `inbox/YYYY-MM-DD.md` — one digest per day, only when new calls are found
- `index.md` — one-line summary appended per run (auto-created)

## Reviewing a digest

PRs land with the `routine` label. Triage:

1. Open the digest markdown.
2. Drop entries that look wrong or off-topic (the agent is instructed not to
   invent details, but verification can be wrong).
3. Manually port the remaining calls into Airtable (`Programs` table, base
   `appiYen6pEW5tSVrn`) — the routine deliberately does **not** write to
   Airtable; that's a human decision.
4. Merge or close the PR. Merging keeps the digest in `inbox/` for the 7-day
   dedup window. Closing discards it; future runs won't see it.

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
