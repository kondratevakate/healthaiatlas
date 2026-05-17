# Runbook: Add a new domain hub

Adds a domain-specific hub (like `oncology`, `medical-tourism`) to the Directory page. Every step is load-bearing — skipping any one of files (3), (4), or (5) caused the PR #6 incident (2026-05-04). `hubs.integrity.test.ts` now catches that class of slip, but you should still walk the list manually.

## Preconditions

- You have a `<domain-id>` (kebab-case, e.g. `radiology`). The id is the URL path segment (`?domain=radiology`), the data filename, and the component directory name — all three must match.
- You have at least one primary-evidence URL per factual claim you intend to seed the hub with. No `src` → mark the entry `e: 'inference'` with `src: ''` or omit it.

## Steps

```
0. git checkout -b feat/<domain-id>
```

### 1. Data file — `frontend/src/data/<domain-id>.ts`

Mirror the shape of [aiLifeSciences.ts](../../frontend/src/data/aiLifeSciences.ts):

- Typed bubbles (purpose / impact / activity / component)
- Decision-point taxonomy
- Reliability flags: `e: 'primary' | 'secondary' | 'inference'`
- Every factual entry has a `src` URL (or `e: 'inference'` with empty `src`)

### 2. Domain registry — `frontend/src/data/domains.ts`

```ts
{
  id: '<domain-id>',
  name: { en: '...', ar: '...' },
  subtitle: { en: '...', ar: '...' },
  color: '...',           // any tailwind-compatible token
  playerIds: ['...'],     // ids that should filter into this domain
}
```

### 3. Constants — `frontend/src/data/constants.ts`

Add to both:

```ts
export const HUB_DOMAIN_IDS = [
  // ...existing,
  '<domain-id>',
] as const;

export const LAST_UPDATED: Record<string, string> = {
  // ...existing,
  '<domain-id>': '<YYYY-MM-DD>',
};
```

### 4. Component — `frontend/src/components/<domain-id>/`

Minimum two files:

- `<DomainId>Hub.tsx` — wraps `<HubShell>` plus the views it composes
- `index.ts` — re-exports the hub component

### 5. Dispatch — `frontend/src/pages/Directory.tsx`

Two edits in the same file:

1. Import near the existing hub imports:
   ```ts
   import { <DomainId>Hub } from '@/components/<domain-id>';
   ```
2. Dispatch block next to the existing `activeDomainId === '...'` checks:
   ```tsx
   {activeDomainId === '<domain-id>' && (
     <div className="mb-16"><<DomainId>Hub /></div>
   )}
   ```

### 6. Verify before commit

```bash
cd frontend
git status --porcelain                    # ALL files must be tracked (PR #6 lesson)
npm run test -- hubs.integrity            # 4 invariants per hub id
npm run test -- claims.integrity          # if you added players or claims
npm run build                             # smoke
npm run review:staged                     # local self-review
```

If `git status` shows untracked files referenced by code, `git add` them. The component directory is the usual offender.

### 7. Commit and PR

```bash
git add <only the files you touched>      # never `git add -A`
git commit -F .git/COMMIT_EDITMSG
git push -u origin feat/<domain-id>
gh pr create --base dev --title "feat(<domain-id>): ..." --body "..."
```

### 8. Header dropdown

No action — `Header.tsx` auto-iterates `domains.ts`. The new hub appears in the Directory dropdown on the next render.

## Rollback

- **Staging broken after merge to `dev`:** `git revert <merge-sha>` and push to `dev`. nginx keeps serving the old `/var/www/healthaiatlas-dev/` until the next deploy job replaces it — no downtime.
- **Production broken:** same on `main`.
- **Local mistake:** the worktree is isolated; delete the branch and start again.

## Common pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| `Could not load /...components/<id>` on fresh CI checkout | Component directory created locally but never `git add`-ed | `git add frontend/src/components/<domain-id>` + recommit |
| `LAST_UPDATED in constants.ts is missing key "<id>"` | Step 3 partially done | Add the date entry, push |
| Hub renders but tab doesn't appear in dropdown | Step 2 (`domains.ts`) missed | Add the registry entry |
| Dispatch test fails: `Directory.tsx is missing dispatch` | Step 5 import done but JSX block missed (or vice versa) | Re-read step 5; both lines must be present |
| Claim shows broken entity reference | New player added to `players.ts` but `claim.value_entity_id` typo'd | `npm run test -- claims.integrity` will surface it |

## Why this runbook exists

PR #6 (2026-05-04) merged `Directory.tsx` and `constants.ts` referencing `ai-life-sciences` while the component directory and data files were created locally but never staged. Production was fine because the merge target wasn't built yet, but a fresh CI checkout couldn't resolve the import. The `hubs.integrity.test.ts` regression test now catches it pre-merge, but the discipline is still: every step in this file, in order, no shortcuts.
