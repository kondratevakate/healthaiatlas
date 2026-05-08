"""Import AI Life Sciences "Recent Signals" workbook into typed TypeScript data.

Source:  C:/Projects/data/aiatls/AI_LifeSci_2026_Consolidated.xlsx
Target:  frontend/src/data/aiLifeSciencesRecentSignals.ts

Companion to import-ai-life-sciences.py. The Consolidated workbook is a
hand-curated narrative cut of the most recent AI x life-sciences signals,
with rich editorial fields (Quality_Signals, Founders_Credentials,
Buyer_Investor_Source_URL) that the bulk LS_BUBBLES schema does not carry.

This script does:
  1. Read the single sheet, one row per signal.
  2. Bulk-extract date, geo, theme cluster, quality signal, src URL.
  3. Apply per-row overrides (ROW_OVERRIDES) for editorial fields:
     actor, target, action, dealSizeUsdM, dealSizeLabel, lens[], isBio.
     The xlsx packs actor + action into a free-text Event_Type column,
     so deterministic parsing is unreliable; overrides are keyed by Startup.
  4. Emit a typed TS file with every entry carrying a non-empty `src`.

Compliance: rows lacking both Buyer_Investor_Source_URL and
Founder_Source_URL are dropped with a warning.

Usage:  python scripts/import-ai-life-sciences-recent.py
"""
from __future__ import annotations

import hashlib
import re
import sys
from datetime import datetime
from pathlib import Path

import openpyxl

REPO_ROOT = Path(__file__).resolve().parents[1]
EXCEL_PATH = Path(r"C:\Projects\data\aiatls\AI_LifeSci_2026_Consolidated.xlsx")
OUT_PATH = REPO_ROOT / "frontend" / "src" / "data" / "aiLifeSciencesRecentSignals.ts"

# ---------------------------------------------------------------------------
# Per-row editorial overrides — keyed by Startup column value.
# Carries the fields that cannot be reliably parsed from free-text Event_Type.
# ---------------------------------------------------------------------------

ROW_OVERRIDES = {
    "Latent Labs": dict(
        id="latent-labs-stealth",
        actor="Latent Labs",
        target="Latent Labs",
        action="stealth_launch",
        deal_size_usd_m=50,
        deal_size_label="$10M seed + $40M Series A = $50M",
        lens=["frontier-lab"],
        is_bio=True,
    ),
    "Edison Scientific": dict(
        id="edison-scientific-spinout",
        actor="Edison Scientific",
        target="Edison Scientific",
        action="stealth_launch",
        deal_size_usd_m=70,
        deal_size_label="$70M raise",
        lens=["public-research", "frontier-lab"],
        is_bio=True,
    ),
    "Earendil Labs / Helixon Therapeutics": dict(
        id="sanofi-earendil-helixon",
        actor="Sanofi",
        target="Earendil/Helixon",
        action="pharma_deal",
        deal_size_usd_m=2500,  # total potential value
        deal_size_label="$160M up + $2.5B total (then $787M raise)",
        lens=["pharma", "mega-raise"],
        is_bio=True,
    ),
    "Torch Health": dict(
        id="openai-torch-health",
        actor="OpenAI",
        target="Torch Health",
        action="acquisition",
        deal_size_usd_m=80,  # midpoint of $60-100M
        deal_size_label="~$60-100M all-equity",
        lens=["openai"],
        is_bio=True,
    ),
    "NVIDIA × Eli Lilly Co-Innovation Lab": dict(
        id="nvidia-lilly-coinnovation",
        actor="NVIDIA × Eli Lilly",
        target="Co-Innovation Lab",
        action="partnership",
        deal_size_usd_m=1000,
        deal_size_label="$1B over 5 years",
        lens=["pharma", "mega-raise"],
        is_bio=True,
    ),
    "Merge Labs": dict(
        id="openai-merge-labs",
        actor="OpenAI / Sam Altman",
        target="Merge Labs",
        action="investment",
        deal_size_usd_m=252,
        deal_size_label="$252M seed @ $850M val",
        lens=["openai", "mega-raise"],
        is_bio=True,
    ),
    "Eikon Therapeutics": dict(
        id="eikon-therapeutics-ipo",
        actor="Eikon Therapeutics",
        target="Eikon Therapeutics (NASDAQ:EIKN)",
        action="ipo",
        deal_size_usd_m=381,
        deal_size_label="$381M @ $18 (upsized)",
        lens=["ipo", "mega-raise"],
        is_bio=True,
    ),
    "Zyphra ZUNA": dict(
        id="zyphra-zuna-launch",
        actor="Zyphra",
        target="ZUNA (BCI foundation model)",
        action="product_launch",
        deal_size_usd_m=100,  # pre-existing Series A
        deal_size_label="Pre-existing $100M Series A @ $1B",
        lens=["frontier-lab"],
        is_bio=True,
    ),
    "Vercept": dict(
        id="anthropic-vercept",
        actor="Anthropic",
        target="Vercept",
        action="acquisition",
        deal_size_usd_m=None,
        deal_size_label="Undisclosed (pre-acq raised $50M)",
        lens=["anthropic", "frontier-lab"],
        is_bio=False,
    ),
    "Generate:Biomedicines": dict(
        id="generate-biomedicines-ipo",
        actor="Generate:Biomedicines",
        target="Generate:Biomedicines (NASDAQ:GENB)",
        action="ipo",
        deal_size_usd_m=400,
        deal_size_label="$400M @ $16 (Amgen + Novartis collabs)",
        lens=["ipo", "mega-raise", "pharma"],
        is_bio=True,
    ),
    "Paperclip (multi-agent OSS, NOT bio)": dict(
        id="paperclip-oss",
        actor="@dotta",
        target="Paperclip",
        action="open_source",
        deal_size_usd_m=None,
        deal_size_label="Open-source (50K+ GitHub stars)",
        lens=["frontier-lab"],
        is_bio=False,
    ),
    "Coefficient Bio": dict(
        id="anthropic-coefficient-bio",
        actor="Anthropic",
        target="Coefficient Bio",
        action="acquisition",
        deal_size_usd_m=400,
        deal_size_label="~$400M all-stock (0.1% Anthropic dilution)",
        lens=["anthropic", "frontier-lab", "mega-raise"],
        is_bio=True,
    ),
    "Ailux (XtalPi biologics subsidiary)": dict(
        id="ailux-cso-belvisi",
        actor="Ailux (XtalPi)",
        target="Ailux (CSO appointment)",
        action="strategic_hire",
        deal_size_usd_m=786,  # parent cumulative raised
        deal_size_label="Parent XtalPi $786M cumulative · Lilly/J&J/UCB customers",
        lens=["pharma"],
        is_bio=True,
    ),
    "Human Intelligence (James Zou)": dict(
        id="human-intelligence-zou",
        actor="Human Intelligence",
        target="Human Intelligence (James Zou)",
        action="mega_raise",
        deal_size_usd_m=100,
        deal_size_label="$100M raise targeting $1B val",
        lens=["mega-raise", "public-research"],
        is_bio=True,
    ),
    "Mayo Clinic REDMOD (AI-PACED initiative)": dict(
        id="mayo-redmod-pancreatic",
        actor="Mayo Clinic",
        target="REDMOD / AI-PACED",
        action="clinical_validation",
        deal_size_usd_m=None,
        deal_size_label="73% prediagnostic detection · Gut publication",
        lens=["public-research"],
        is_bio=True,
    ),
    "ALP Bio": dict(
        id="alp-bio-preseed",
        actor="ALP Bio",
        target="ALP Bio",
        action="pre_seed",
        deal_size_usd_m=2.1,  # ~€1.9M
        deal_size_label="€1.9M pre-seed (organoid + AI)",
        lens=[],
        is_bio=True,
    ),
    "Lila Sciences": dict(
        id="lila-sciences-cumulative",
        actor="Lila Sciences",
        target="Lila Sciences",
        action="mega_raise",
        deal_size_usd_m=550,
        deal_size_label="$550M cumulative (7 months · Flagship)",
        lens=["mega-raise"],
        is_bio=True,
    ),
    "Pheiron": dict(
        id="pheiron-aging-clocks",
        actor="Pheiron",
        target="Pheiron (aging clocks preprint)",
        action="open_source",
        deal_size_usd_m=None,
        deal_size_label="F-Prime/F4 portfolio · bioRxiv preprint",
        lens=["public-research"],
        is_bio=True,
    ),
    "FutureHouse (parent of Edison)": dict(
        id="futurehouse-fellowship-2026",
        actor="FutureHouse",
        target="FutureHouse Fellowship 2026",
        action="cohort",
        deal_size_usd_m=None,
        deal_size_label="Schmidt + Kavli funded · 2026 cohort",
        lens=["public-research"],
        is_bio=True,
    ),
    "Thinking Machines Lab (Mira Murati)": dict(
        id="thinking-machines-mega-seed",
        actor="Mira Murati / Thinking Machines",
        target="Thinking Machines Lab",
        action="mega_raise",
        deal_size_usd_m=2000,
        deal_size_label="$2B seed @ $12B (largest seed in SV history)",
        lens=["frontier-lab", "mega-raise"],
        is_bio=False,
    ),
    "YC W26 batch — Reticular, Exonic, Anto, Algen, Angstrom (combined entry)": dict(
        id="yc-w26-bio-batch",
        actor="Y Combinator",
        target="W26 bio batch (5 companies)",
        action="cohort",
        deal_size_usd_m=2.5,  # 5 x $500K
        deal_size_label="~$500K SAFE each · Reticular, Exonic, Anto, Algen, Angstrom",
        lens=[],
        is_bio=True,
    ),
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_iso_date(raw):
    """Extract first ISO-like date from a free-text cell.

    Examples:
      datetime(2026, 1, 5)              -> '2026-01-05'
      '2025-12-19'                       -> '2025-12-19'
      '2026-01-05 → 2026-03-20'         -> '2026-01-05'  (use earliest)
      '2025-02-12 (out of stealth)'     -> '2025-02-12'
      '2026 (existing — $550M)'         -> '2026-01-01'  (year-only)
      '2026 batch members'              -> '2026-01-01'
      '2025-02 stealth'                 -> '2025-02-01'
    """
    if raw is None:
        return None
    if isinstance(raw, datetime):
        return raw.date().isoformat()
    s = str(raw).strip()
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", s)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    m = re.search(r"(\d{4})-(\d{2})\b", s)
    if m:
        return f"{m.group(1)}-{m.group(2)}-01"
    m = re.search(r"\b(20\d{2})\b", s)
    if m:
        return f"{m.group(1)}-01-01"
    return None


def clean_text(s):
    if s is None:
        return ""
    out = str(s).replace("\r", " ").replace("\n", " ")
    out = re.sub(r"\s+", " ", out).strip()
    return out


def first_sentence(s, max_chars=240):
    """First 1-2 sentences, capped at max_chars."""
    if not s:
        return ""
    s = clean_text(s)
    parts = re.split(r"(?<=[.!?])\s+", s)
    out = ""
    for p in parts:
        if len(out) + len(p) + 1 > max_chars:
            break
        out = (out + " " + p).strip()
    if not out:
        out = s[:max_chars]
    return out


def ts_string(s):
    if s is None:
        return "''"
    out = str(s)
    out = out.replace("\\", "\\\\").replace("'", "\\'")
    out = out.replace("\n", " ").replace("\r", "")
    out = re.sub(r"\s+", " ", out).strip()
    return f"'{out}'"


def ts_value(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        if isinstance(v, float) and v.is_integer():
            return str(int(v))
        return f"{v:g}"
    if isinstance(v, list):
        return "[" + ", ".join(ts_value(x) for x in v) + "]"
    return ts_string(v)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if not EXCEL_PATH.exists():
        sys.exit(f"Excel not found: {EXCEL_PATH}")

    file_hash = hashlib.md5(EXCEL_PATH.read_bytes()).hexdigest()[:12]
    wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
    ws = wb["2026 Consolidated + Quality"]
    headers = [c.value for c in ws[1]]
    rows = list(ws.iter_rows(min_row=2, values_only=True))

    def col(row, name):
        return row[headers.index(name)]

    out_rows = []
    dropped = []

    for raw in rows:
        startup = clean_text(col(raw, "Startup"))
        if not startup:
            continue

        override = ROW_OVERRIDES.get(startup)
        if not override:
            dropped.append((startup, "no override mapping"))
            continue

        date_iso = parse_iso_date(col(raw, "Date_2026"))
        if not date_iso:
            dropped.append((startup, "no parsable date"))
            continue

        # Compliance: src URL required
        src = clean_text(col(raw, "Buyer_Investor_Source_URL")) \
            or clean_text(col(raw, "Founder_Source_URL"))
        if not src:
            dropped.append((startup, "no source URL"))
            continue

        geo = clean_text(col(raw, "Geography"))
        theme_cluster = clean_text(col(raw, "Theme_Cluster"))
        quality_signal = first_sentence(col(raw, "Quality_Signals"), max_chars=260)

        out_rows.append(dict(
            id=override["id"],
            date=date_iso,
            actor=override["actor"],
            target=override["target"],
            action=override["action"],
            deal_size_usd_m=override["deal_size_usd_m"],
            deal_size_label=override["deal_size_label"],
            geo=geo,
            theme_cluster=theme_cluster,
            quality_signal=quality_signal,
            src=src,
            lens=override["lens"],
            is_bio=override["is_bio"],
        ))

    # Sort by date descending (newest first) — matches a "what's new" reading order
    out_rows.sort(key=lambda r: r["date"], reverse=True)

    # ------------------------------------------------------------------ emit
    lines = []
    lines.append("// AI Frontiers in Life Sciences — Recent Signals (last ~12 months).")
    lines.append("// AUTO-GENERATED by scripts/import-ai-life-sciences-recent.py")
    lines.append(f"// Source: AI_LifeSci_2026_Consolidated.xlsx  (md5: {file_hash})")
    lines.append("// To regenerate: python scripts/import-ai-life-sciences-recent.py")
    lines.append("//")
    lines.append("// Compliance rule: every entry has a primary-source URL.")
    lines.append("")
    lines.append(
        "export type RSLens = 'anthropic' | 'openai' | 'pharma' | 'frontier-lab' "
        "| 'mega-raise' | 'ipo' | 'public-research';"
    )
    lines.append("")
    lines.append("export type RSAction =")
    lines.append("  | 'acquisition' | 'investment' | 'pharma_deal' | 'partnership'")
    lines.append("  | 'ipo' | 'mega_raise' | 'stealth_launch' | 'product_launch'")
    lines.append("  | 'clinical_validation' | 'pre_seed' | 'open_source'")
    lines.append("  | 'strategic_hire' | 'cohort';")
    lines.append("")
    lines.append("export interface RecentSignal {")
    lines.append("  id: string;")
    lines.append("  date: string;             // ISO YYYY-MM-DD; year-only sources land on Jan 1")
    lines.append("  actor: string;            // primary actor (Anthropic, OpenAI, Sanofi, ...)")
    lines.append("  target: string;           // company / vehicle being acted on")
    lines.append("  action: RSAction;")
    lines.append("  dealSizeUsdM: number | null;  // best numeric estimate; null = undisclosed")
    lines.append("  dealSizeLabel: string;        // human label preserved verbatim")
    lines.append("  geo: string;")
    lines.append("  themeCluster: string;")
    lines.append("  qualitySignal: string;        // 1-2 sentence editorial signal")
    lines.append("  src: string;                  // primary URL")
    lines.append("  lens: RSLens[];               // narrative grouping (0-3 lenses)")
    lines.append("  isBio: boolean;               // false for frontier-lab pattern (NOT bio)")
    lines.append("}")
    lines.append("")
    lines.append("export const RS_LENS_LABELS: Record<RSLens, string> = {")
    lines.append("  anthropic: 'Anthropic acquires',")
    lines.append("  openai: 'OpenAI plays',")
    lines.append("  pharma: 'Pharma × AI',")
    lines.append("  'frontier-lab': 'Frontier-lab pattern',")
    lines.append("  'mega-raise': 'Mega-rounds',")
    lines.append("  ipo: 'Public-market window',")
    lines.append("  'public-research': 'Public research',")
    lines.append("};")
    lines.append("")
    lines.append("export const RS_ACTION_LABELS: Record<RSAction, string> = {")
    lines.append("  acquisition: 'Acquisition',")
    lines.append("  investment: 'Investment',")
    lines.append("  pharma_deal: 'Pharma deal',")
    lines.append("  partnership: 'Partnership',")
    lines.append("  ipo: 'IPO',")
    lines.append("  mega_raise: 'Mega-raise',")
    lines.append("  stealth_launch: 'Stealth launch',")
    lines.append("  product_launch: 'Product launch',")
    lines.append("  clinical_validation: 'Clinical validation',")
    lines.append("  pre_seed: 'Pre-seed',")
    lines.append("  open_source: 'Open source',")
    lines.append("  strategic_hire: 'Strategic hire',")
    lines.append("  cohort: 'Cohort',")
    lines.append("};")
    lines.append("")
    lines.append("export const RECENT_SIGNALS: RecentSignal[] = [")
    for r in out_rows:
        lines.append("  {")
        lines.append(f"    id: {ts_string(r['id'])},")
        lines.append(f"    date: {ts_string(r['date'])},")
        lines.append(f"    actor: {ts_string(r['actor'])},")
        lines.append(f"    target: {ts_string(r['target'])},")
        lines.append(f"    action: {ts_string(r['action'])},")
        lines.append(f"    dealSizeUsdM: {ts_value(r['deal_size_usd_m'])},")
        lines.append(f"    dealSizeLabel: {ts_string(r['deal_size_label'])},")
        lines.append(f"    geo: {ts_string(r['geo'])},")
        lines.append(f"    themeCluster: {ts_string(r['theme_cluster'])},")
        lines.append(f"    qualitySignal: {ts_string(r['quality_signal'])},")
        lines.append(f"    src: {ts_string(r['src'])},")
        lens_literal = ", ".join(ts_string(x) for x in r["lens"])
        lines.append(f"    lens: [{lens_literal}],")
        lines.append(f"    isBio: {ts_value(r['is_bio'])},")
        lines.append("  },")
    lines.append("];")
    lines.append("")

    OUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(out_rows)} rows to {OUT_PATH}")
    if dropped:
        print(f"Dropped {len(dropped)} rows:")
        for name, reason in dropped:
            print(f"  - {name}: {reason}")


if __name__ == "__main__":
    main()
