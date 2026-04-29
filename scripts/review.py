#!/usr/bin/env python3
"""Pre-PR review — pipes a diff to Claude Haiku and prints a short summary.

Manual command, not a hook. Run before opening a PR.

Usage
-----
    python scripts/review.py            # branch vs origin/main (default)
    python scripts/review.py --staged   # staged-only diff
    python scripts/review.py --base dev # branch vs origin/dev
    npm run review                      # (from frontend/) same as default

Auth
----
    ANTHROPIC_API_KEY env var, or first line of ~/.anthropic_key
"""

import argparse
import json
import os
import pathlib
import subprocess
import sys
import urllib.error
import urllib.request

MODEL = "claude-haiku-4-5-20251001"
MAX_DIFF_CHARS = 80_000
TIMEOUT_S = 60


def green(s): return f"\033[32m{s}\033[0m"
def yellow(s): return f"\033[33m{s}\033[0m"
def dim(s): return f"\033[2m{s}\033[0m"


def get_api_key() -> str | None:
    key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if key:
        return key
    keyfile = pathlib.Path.home() / ".anthropic_key"
    if keyfile.exists():
        lines = keyfile.read_text(encoding="utf-8").strip().splitlines()
        if lines:
            return lines[0].strip()
    return None


def repo_root() -> pathlib.Path:
    out = subprocess.check_output(["git", "rev-parse", "--show-toplevel"]).decode().strip()
    return pathlib.Path(out)


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=repo_root()).decode("utf-8", errors="replace")


def get_diff(staged: bool, base: str) -> tuple[str, list[str], str]:
    """Returns (diff, files, label)."""
    if staged:
        diff = git("diff", "--cached", "--no-color")
        files = [f for f in git("diff", "--cached", "--name-only").splitlines() if f.strip()]
        return diff, files, "staged changes"

    # Try origin/<base> first, fall back to local <base>.
    refs_to_try = [f"origin/{base}", base]
    chosen_ref = None
    for ref in refs_to_try:
        try:
            subprocess.check_output(
                ["git", "rev-parse", "--verify", ref],
                cwd=repo_root(),
                stderr=subprocess.DEVNULL,
            )
            chosen_ref = ref
            break
        except subprocess.CalledProcessError:
            continue
    if chosen_ref is None:
        print(yellow(f"Could not find ref {base!r} or origin/{base!r}."), file=sys.stderr)
        sys.exit(1)

    diff = git("diff", "--no-color", f"{chosen_ref}...HEAD")
    files = [f for f in git("diff", "--name-only", f"{chosen_ref}...HEAD").splitlines() if f.strip()]
    branch = git("rev-parse", "--abbrev-ref", "HEAD").strip()
    return diff, files, f"{branch} vs {chosen_ref}"


def call_claude(api_key: str, diff: str, files: list[str], label: str) -> str:
    truncated = diff[:MAX_DIFF_CHARS]
    if len(diff) > MAX_DIFF_CHARS:
        truncated += f"\n\n[... diff truncated, {len(diff) - MAX_DIFF_CHARS} chars omitted ...]"

    file_list_lines = ["- " + f for f in files[:50]]
    if len(files) > 50:
        file_list_lines.append(f"- ... {len(files) - 50} more")
    file_list = "\n".join(file_list_lines)

    prompt = f"""You are reviewing a branch before it opens a pull request. Be terse and direct.

Scope: {label}
Files changed ({len(files)}):
{file_list}

Diff:
```diff
{truncated}
```

Reply with exactly four short paragraphs (no headers, no bold, no bullets):
1. WHAT — one or two sentences describing the change in plain English. Reference real file names.
2. CHECK — one sentence on what to verify before merging (test coverage, regressions, side effects).
3. RISK — one sentence flagging real risks (secrets, PII, broken contracts, hallucination-prone changes); say "no obvious risk" if none.
4. PR TITLE — propose one short conventional-commit-style PR title (max 70 chars).

Be specific. No fluff."""

    body = json.dumps({
        "model": MODEL,
        "max_tokens": 800,
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=body,
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT_S) as resp:
        data = json.loads(resp.read())
    parts = data.get("content", [])
    return "\n".join(p.get("text", "") for p in parts if p.get("type") == "text").strip()


def main() -> int:
    ap = argparse.ArgumentParser(description="Ask Claude Haiku to review the current branch before a PR.")
    ap.add_argument("--staged", action="store_true", help="review staged diff instead of branch vs base")
    ap.add_argument("--base", default="main", help="base branch to diff against (default: main)")
    args = ap.parse_args()

    diff, files, label = get_diff(args.staged, args.base)
    if not diff.strip():
        print(dim(f"No diff for {label} — nothing to review."), file=sys.stderr)
        return 0

    api_key = get_api_key()
    if not api_key:
        print(yellow("ANTHROPIC_API_KEY not set."), file=sys.stderr)
        print(dim("  export ANTHROPIC_API_KEY=sk-ant-...   # or put it in ~/.anthropic_key"), file=sys.stderr)
        return 1

    print(dim(f"Reviewing {label} ({len(files)} files, {len(diff):,} chars) via {MODEL}..."), file=sys.stderr)
    try:
        review = call_claude(api_key, diff, files, label)
    except urllib.error.HTTPError as e:
        print(yellow(f"Claude review failed: HTTP {e.code} {e.reason}"), file=sys.stderr)
        try:
            print(dim(e.read().decode("utf-8", errors="replace")[:500]), file=sys.stderr)
        except Exception:
            pass
        return 1
    except Exception as e:
        print(yellow(f"Claude review failed: {type(e).__name__}: {e}"), file=sys.stderr)
        return 1

    print()
    print(green("─" * 60))
    print(green(f"Claude review — {label}"))
    print(green("─" * 60))
    print(review)
    print(green("─" * 60))
    print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
