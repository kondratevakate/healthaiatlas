# Git hooks

## pre-commit — Claude review

Pipes your staged diff to Claude Haiku and prints a short WHAT/CHECK/RISK summary before each commit. Informational only — it never blocks the commit.

### One-time setup

```bash
git config core.hooksPath .githooks
```

Then put your Anthropic API key in either:
- env var: `export ANTHROPIC_API_KEY=sk-ant-...` (e.g. in your shell profile)
- file:    `~/.anthropic_key` (first line is the key)

If neither is set, the hook just skips silently.

### Usage

Normal flow — runs automatically on `git commit`. Output goes to stderr so it doesn't pollute scripted output.

```
[pre-commit] asking Claude (claude-haiku-4-5-20251001) to review 3 file(s)...
────────────────────────────────────────────────────────────
Claude review (informational — does not block commit)
────────────────────────────────────────────────────────────
WHAT — adds a tumour-emoji map to the oncology landscape filter chips ...
CHECK — verify the chip layout still wraps correctly on narrow viewports ...
RISK — no obvious risk.
────────────────────────────────────────────────────────────
Bypass with: SKIP_REVIEW=1 git commit ...
```

### Bypass

```bash
SKIP_REVIEW=1 git commit -m "..."
```

### Notes

- Diff is truncated at 60k chars so very large commits stay cheap.
- Uses `claude-haiku-4-5-20251001` for speed; latency ≈ 2-5s per commit.
- Failures (network, auth) are non-fatal — the commit proceeds with a warning.
