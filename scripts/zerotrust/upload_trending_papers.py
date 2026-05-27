"""Seed / refresh the "Trending Papers" table in Airtable.

This script creates or updates rows in a dedicated "Trending Papers" table
inside the existing AI Atlas base.  It is the authoritative uploader — the
frontend TS file is generated FROM Airtable by regen_trending_papers.py,
never edited by hand.

Prerequisites (one-time setup):
  1. In Airtable, inside base appiYen6pEW5tSVrn ("AI Atlas"), create a table
     called "Trending Papers" with the following fields:
       External ID    — Single line text   (upsert key)
       Title          — Long text
       Category       — Single line text   (arXiv code: LG, CL, CV …)
       Category Label — Single line text   (human-readable: "Machine Learning")
       Group          — Single select      (options: ml | math | science | other)
       Snapshot Date  — Date               (YYYY-MM-DD)
       Source URL     — URL                (where this snapshot was taken from)
       Status         — Single select      (options: active | archived)

  2. Ensure backend/.env has AIRTABLE_TOKEN and AIRTABLE_BASE set.

Idempotent:
  External ID = tp_<sha1(title)[:10]>.  Re-running patches fields; never duplicates.

Usage:
  python scripts/zerotrust/upload_trending_papers.py            # full upsert
  python scripts/zerotrust/upload_trending_papers.py --dry-run  # print, no writes
  python scripts/zerotrust/upload_trending_papers.py --limit 5  # smoke test (5 rows)
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

# ── Seed data — this is the ONLY place to hand-edit paper data.
# After the first upload, all updates should go through Airtable UI,
# then regenerate the TS via regen_trending_papers.py.

SNAPSHOT_DATE = "2026-05-27"
SOURCE_URL    = "https://www.emergentmind.com/"

SEED: list[dict] = [
    {"category": "LG", "title": "Incompressible Knowledge Probes: Estimating Black-Box LLM Parameter Counts via Factual Capacity"},
    {"category": "CO", "title": "An explicit lower bound for the unit distance problem"},
    {"category": "LG", "title": "Echo: KV-Cache-Free Associative Recall with Spectral Koopman Operators"},
    {"category": "NT", "title": "Primitive sets and von Mangoldt chains: Erdős Problem #1196 and beyond"},
    {"category": "CL", "title": "A paradox of AI fluency"},
    {"category": "CL", "title": "Is Grep All You Need? How Agent Harnesses Reshape Agentic Search"},
    {"category": "LG", "title": "Manifold Steering Reveals the Shared Geometry of Neural Network Representation and Behavior"},
    {"category": "HC", "title": "Sycophantic AI makes human interaction feel more effortful and less satisfying over time"},
    {"category": "DL", "title": "LLM hallucinations in the wild: Large-scale evidence from non-existent citations"},
    {"category": "AI", "title": "Model Spec Midtraining: Improving How Alignment Training Generalizes"},
    {"category": "LG", "title": "Sub-JEPA: Subspace Gaussian Regularization for Stable End-to-End World Models"},
    {"category": "LG", "title": "Detecting overfitting in Neural Networks during long-horizon grokking using Random Matrix Theory"},
    {"category": "AI", "title": "AI Co-Mathematician: Accelerating Mathematicians with Agentic AI"},
    {"category": "CV", "title": "SANA-WM: Efficient Minute-Scale World Modeling with Hybrid Linear Diffusion Transformer"},
    {"category": "SE", "title": "ProgramBench: Can Language Models Rebuild Programs From Scratch?"},
    {"category": "LG", "title": "Local Inverse Geometry Can Be Amortized"},
    {"category": "CL", "title": "HRM-Text: Efficient Pretraining Beyond Scaling"},
    {"category": "CV", "title": "SenseNova-U1: Unifying Multimodal Understanding and Generation with NEO-unify Architecture"},
    {"category": "AI", "title": "Advancing Mathematics Research with AI-Driven Formal Proof Search"},
    {"category": "MF", "title": "An Explicit Solution to Black-Scholes Implied Volatility"},
    {"category": "CL", "title": "How Language Models Process Negation"},
    {"category": "LG", "title": "Lattice Deduction Transformers"},
    {"category": "AI", "title": "Positive Alignment: Artificial Intelligence for Human Flourishing"},
    {"category": "CV", "title": "MoCapAnything V2: End-to-End Motion Capture for Arbitrary Skeletons"},
    {"category": "LG", "title": "SlimQwen: Exploring the Pruning and Distillation in Large MoE Model Pre-training"},
    {"category": "LG", "title": "General Preference Reinforcement Learning"},
    {"category": "CV", "title": "Pixal3D: Pixel-Aligned 3D Generation from Images"},
    {"category": "QC", "title": "Phase Transitions and Gravitational Waves"},
    {"category": "IM", "title": "Statistically Significant Linear Alignments Among High-Confidence Transient Candidates on POSS-I Photographic Plates"},
    {"category": "LG", "title": "A Theory of Generalization in Deep Learning"},
    {"category": "AI", "title": "Achieving Gold-Medal-Level Olympiad Reasoning via Simple and Unified Scaling"},
    {"category": "LG", "title": "Learning, Fast and Slow: Towards LLMs That Adapt Continually"},
    {"category": "LG", "title": "The Last Human-Written Paper: Agent-Native Research Artifacts"},
    {"category": "AI", "title": "Generative Recursive Reasoning"},
    {"category": "AI", "title": "δ-mem: Efficient Online Memory for Large Language Models"},
    {"category": "CV", "title": "VLMaxxing through FrameMogging: Training-Free Anti-Recomputation for Video Vision-Language Models"},
    {"category": "CL", "title": "Decoupling the Benefits of Subword Tokenization for Language Model Training via Byte-level Simulation"},
    {"category": "CL", "title": "ELF: Embedded Language Flows"},
    {"category": "CL", "title": "Fast Byte Latent Transformer"},
    {"category": "CR", "title": "Language Models Can Autonomously Hack and Self-Replicate"},
    {"category": "GE", "title": "Accelerating unrest at Campi Flegrei signals a critical transition within the next decade"},
    {"category": "CL", "title": "EMO: Pretraining Mixture of Experts for Emergent Modularity"},
    {"category": "CY", "title": "LLMorphism: When humans come to see themselves as language models"},
    {"category": "SE", "title": "Constraint Decay: The Fragility of LLM Agents in Backend Code Generation"},
    {"category": "OS", "title": "Embedded Rust or C Firmware? Lessons from an Industrial Microcontroller Use Case with Ariel OS"},
]

CATEGORY_LABELS: dict[str, str] = {
    "LG": "Machine Learning",
    "CL": "Computation & Language",
    "CV": "Computer Vision",
    "AI": "Artificial Intelligence",
    "SE": "Software Engineering",
    "HC": "Human-Computer Interaction",
    "DL": "Digital Libraries",
    "CR": "Cryptography & Security",
    "CY": "Computers & Society",
    "OS": "Operating Systems",
    "CO": "Combinatorics",
    "NT": "Number Theory",
    "MF": "Mathematical Finance",
    "QC": "Quantum Computing",
    "IM": "Instrumentation & Methods",
    "GE": "Geophysics",
}

CATEGORY_GROUP: dict[str, str] = {
    "LG": "ml",  "CL": "ml",  "CV": "ml",  "AI": "ml",  "SE": "ml",
    "HC": "ml",  "DL": "ml",  "CR": "ml",  "CY": "ml",  "OS": "ml",
    "CO": "math","NT": "math","MF": "math",
    "QC": "science","IM": "science","GE": "science",
}

# ── Config ────────────────────────────────────────────────────────────────────

REPO_ROOT  = Path(__file__).resolve().parents[2]
ENV_PATHS  = [REPO_ROOT / "backend" / ".env", REPO_ROOT / ".env"]
API_BASE   = "https://api.airtable.com/v0"
TABLE_NAME = "Trending Papers"
RATE_SLEEP = 0.26

DRY_RUN = "--dry-run" in sys.argv
LIMIT   = None
for arg in sys.argv:
    if arg.startswith("--limit="):
        LIMIT = int(arg.split("=")[1])
    elif arg == "--limit" and sys.argv.index(arg) + 1 < len(sys.argv):
        LIMIT = int(sys.argv[sys.argv.index(arg) + 1])


# ── Helpers ───────────────────────────────────────────────────────────────────

def load_env() -> None:
    for p in ENV_PATHS:
        if not p.exists():
            continue
        for line in p.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k, v = k.strip(), v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v


def api(method: str, path: str, body: dict | None = None) -> dict:
    tok  = os.environ["AIRTABLE_TOKEN"]
    base = os.environ.get("AIRTABLE_BASE_ID") or os.environ["AIRTABLE_BASE"]
    if "?" in path:
        p, qs = path.split("?", 1)
        pairs = urllib.parse.parse_qsl(qs, keep_blank_values=True)
        url   = f"{API_BASE}/{base}/{p}?" + urllib.parse.urlencode(pairs)
    else:
        url = f"{API_BASE}/{base}/{path}"
    data = json.dumps(body).encode() if body else None
    req  = urllib.request.Request(
        url, data=data, method=method,
        headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method} {path} -> {e.code}: {e.read().decode()}") from e


def external_id(title: str) -> str:
    return "tp_" + hashlib.sha1(title.encode("utf-8")).hexdigest()[:10]


def fetch_existing() -> dict[str, str]:
    """Return {external_id: record_id} for all existing rows."""
    existing: dict[str, str] = {}
    offset = None
    table  = urllib.parse.quote(TABLE_NAME)
    while True:
        qs = "fields%5B%5D=External+ID"
        if offset:
            qs += f"&offset={urllib.parse.quote(offset)}"
        resp   = api("GET", f"{table}?{qs}")
        for rec in resp.get("records", []):
            eid = rec.get("fields", {}).get("External ID", "")
            if eid:
                existing[eid] = rec["id"]
        offset = resp.get("offset")
        if not offset:
            break
        time.sleep(RATE_SLEEP)
    return existing


# ── Main ──────────────────────────────────────────────────────────────────────

def safe_print(s: str) -> None:
    """Print with non-ASCII chars replaced — avoids cp1252 errors on Windows."""
    print(s.encode("ascii", errors="replace").decode("ascii"))


def main() -> None:
    load_env()

    rows = SEED[:LIMIT] if LIMIT else SEED
    print(f"[upload_trending_papers] {len(rows)} papers  dry_run={DRY_RUN}")

    if DRY_RUN:
        for r in rows:
            eid = external_id(r["title"])
            cat = r["category"]
            print(f"  {eid}  [{cat}]  {r['title'][:70]}")
        return

    existing = fetch_existing()
    print(f"  {len(existing)} rows already in Airtable")

    created = updated = skipped = 0
    table   = urllib.parse.quote(TABLE_NAME)

    for r in rows:
        eid    = external_id(r["title"])
        cat    = r["category"]
        fields = {
            "External ID":    eid,
            "Title":          r["title"],
            "Category":       cat,
            "Category Label": CATEGORY_LABELS.get(cat, cat),
            "Group":          CATEGORY_GROUP.get(cat, "other"),
            "Snapshot Date":  SNAPSHOT_DATE,
            "Source URL":     SOURCE_URL,
            "Status":         "active",
        }

        if eid in existing:
            rec_id = existing[eid]
            api("PATCH", f"{table}/{rec_id}", {"fields": fields})
            updated += 1
            safe_print(f"  ~ updated  {eid}  {r['title'][:60]}")
        else:
            api("POST", table, {"fields": fields, "typecast": True})
            created += 1
            safe_print(f"  + created  {eid}  {r['title'][:60]}")

        time.sleep(RATE_SLEEP)

    print(f"\n[done] created={created} updated={updated} skipped={skipped}")
    print("Next step: python scripts/zerotrust/regen_trending_papers.py")


if __name__ == "__main__":
    main()
