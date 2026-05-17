"""Import AI Architecture x Revenue zero-trust dataset into typed TypeScript.

Source:  C:/Projects/data/aiatls/ai_arch_revenue_data_final.xlsx
Target:  frontend/src/data/aiArchitectureRevenue.ts

The Excel is the single source of truth. The HTML at
ai_revenue_map_final.html is a rendered view of the same data — do not
edit the TS file directly, edit the xlsx and re-run this script.

Sheets imported:
  README           -> embedded as methodology comments + disclaimer constants
  Sources          -> AI_SOURCES (85 zero-trust claims, FK target)
  Architectures    -> AI_ARCHITECTURES (22 rows)
  Products         -> AI_REVENUE_PRODUCTS (58 rows)
  Tags             -> not exported (taxonomy reference only)
  Hardware         -> not exported in MVP
  WorkloadPapers   -> not exported in MVP

Compliance (AGENTS.md):
  - Every architecture row carries paper_url (primary source).
  - Every product row carries revenue_source_claim (FK to Sources), and
    Sources rows have publisher + url + retrieved date + confidence tier.
  - The MedGemma / Med-PaLM $0 attribution is explicitly noted as
    absence-of-evidence per README S071 reasoning.

Usage:  python scripts/import-ai-arch-revenue.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import openpyxl

REPO_ROOT = Path(__file__).resolve().parents[1]
EXCEL_PATH = Path(r"C:\Projects\data\aiatls\ai_arch_revenue_data_final.xlsx")
OUT_PATH = REPO_ROOT / "frontend" / "src" / "data" / "aiArchitectureRevenue.ts"


def _val(v):
    """Excel cell -> python value, normalising whitespace."""
    if v is None:
        return None
    if isinstance(v, str):
        return v.strip()
    return v


def _split_list(s: str | None) -> list[str]:
    if not s:
        return []
    return [x.strip() for x in s.split(";") if x.strip()]


def _ts(value) -> str:
    """Render a python value as a TypeScript literal."""
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return json.dumps(value)
    if isinstance(value, list):
        return "[" + ", ".join(_ts(x) for x in value) + "]"
    if isinstance(value, str):
        # json.dumps gives correct JS string escaping
        return json.dumps(value, ensure_ascii=False)
    raise TypeError(f"Unsupported value type: {type(value)}")


def _row_dict(ws, header_row=1):
    headers = [_val(c.value) for c in ws[header_row]]
    for row in ws.iter_rows(min_row=header_row + 1, values_only=True):
        if not any(row):
            continue
        yield {h: _val(v) for h, v in zip(headers, row)}


def load_sources(wb) -> list[dict]:
    ws = wb["Sources"]
    out = []
    for r in _row_dict(ws):
        if not r.get("claim_id"):
            continue
        retrieved = r["retrieved"]
        if hasattr(retrieved, "isoformat"):
            retrieved = retrieved.isoformat()[:7]  # "YYYY-MM"
        out.append(
            {
                "claimId": r["claim_id"],
                "entity": r["entity"],
                "metric": r["metric"],
                "value": r["value"],
                "unit": r["unit"],
                "period": r["period"],
                "publisher": r["publisher"],
                "url": r["url"],
                "retrieved": retrieved,
                "confidence": r["confidence"],
                "exactQuoteOrBasis": r["exact_quote_or_basis"],
            }
        )
    return out


def load_architectures(wb) -> list[dict]:
    ws = wb["Architectures"]
    out = []
    for r in _row_dict(ws):
        if not r.get("arch_id"):
            continue
        out.append(
            {
                "archId": r["arch_id"],
                "name": r["name"],
                "family": r["family"],
                "paperYear": int(r["paper_year"]) if r["paper_year"] else None,
                "authors": r.get("authors"),
                "paperTitle": r.get("paper_title"),
                "paperUrl": r["paper_url"],
                "attributableRevenueM": int(r["attributable_revenue_m_usd"] or 0),
                "paperCountK": int(r["paper_count_k_estimate"] or 0),
                "directRevenueM": int(r["direct_revenue_m_usd"] or 0),
                "domains": _split_list(r["domain_tags"]),
            }
        )
    return out


def load_products(wb) -> list[dict]:
    ws = wb["Products"]
    out = []
    for r in _row_dict(ws):
        if not r.get("product_id"):
            continue
        out.append(
            {
                "productId": r["product_id"],
                "name": r["name"],
                "company": r["company"],
                "revenueM": float(r["revenue_m_usd"]) if r["revenue_m_usd"] is not None else 0,
                "revenueSourceClaim": r.get("revenue_source_claim"),
                "valuationM": float(r["valuation_m_usd"]) if r.get("valuation_m_usd") is not None else None,
                "valuationSourceClaim": r.get("valuation_source_claim"),
                "primaryArchId": r["primary_arch_id"],
                "secondaryArchs": _split_list(r["secondary_archs"]),
                "domainTag": r["domain_tag"],
                "useCase": _split_list(r["use_case"]),
                "stage": r["stage"],
                "notes": r.get("notes"),
            }
        )
    return out


def emit(sources, archs, products) -> str:
    """Render the TypeScript file."""
    lines = [
        "// AI Architecture × Revenue Map — zero-trust dataset.",
        "// AUTO-GENERATED by scripts/import-ai-arch-revenue.py",
        "// Source: ai_arch_revenue_data_final.xlsx (Architectures + Products + Sources + README)",
        "// To regenerate: python scripts/import-ai-arch-revenue.py",
        "//",
        "// Methodology (from xlsx README):",
        "//   Every architecture row has a verified arxiv / Nature DOI / company",
        "//   technical disclosure. Every product row has a revenueSourceClaim",
        "//   FK to AI_SOURCES with publisher + url + retrieved + confidence tier.",
        "//",
        "// Confidence tiers:",
        "//   PRIMARY    SEC filing, earnings release, named-officer blog, Stanford AI Index,",
        "//              arxiv preprint or Nature DOI.",
        "//   SECONDARY  Specific article in TechCrunch / Reuters / Bloomberg / WSJ / FT / Axios",
        "//              directly reporting the claim.",
        "//   ANALYST    Sacra, The Information, named analysts. Treated as estimate, not fact.",
        "//",
        "// Editorial decisions baked into this dataset (do not 'fix' without re-reading README):",
        "//   - AI scribes (Abridge, Ambience, Freed) have primaryArchId = A07 (GPT), not",
        "//     Whisper. The LLM does ~90% of the value (transcript -> billing-ready note).",
        "//     Whisper-class ASR is in secondaryArchs.",
        "//   - Meta Ads = DLRM (A10); Google Search Ads = Transformer-era (A05);",
        "//     YouTube + LinkedIn = Wide & Deep (A09); TikTok = Monolith / DLRM-family (A10).",
        "//   - Med-PaLM / MedGemma attribution = $0 reflects no public confirmation of",
        "//     production deployment (absence-of-evidence). See Sources claim_id S071.",
        "",
        "export type ArchFamily =",
        "  | 'CNN / Vision'",
        "  | 'Transformer'",
        "  | 'Diffusion'",
        "  | 'Recsys'",
        "  | 'Audio/Speech'",
        "  | 'Other'",
        "  | 'Other (Geometric DL)';",
        "",
        "export type ProductDomain =",
        "  | 'Medical'",
        "  | 'Advertising'",
        "  | 'Consumer/Enterprise'",
        "  | 'Defense/Industrial'",
        "  | 'Creative'",
        "  | 'Fintech'",
        "  | 'Science'",
        "  | 'Infra'",
        "  | 'Audio';",
        "",
        "export type ProductStage =",
        "  | 'Early'",
        "  | 'Growth'",
        "  | 'Mature'",
        "  | 'Growth/Dominant'",
        "  | 'Acquired'",
        "  | 'Distressed';",
        "",
        "export type ConfidenceTier = 'PRIMARY' | 'SECONDARY' | 'ANALYST';",
        "",
        "export interface AIArchitecture {",
        "  archId: string;",
        "  name: string;",
        "  family: ArchFamily;",
        "  paperYear: number;",
        "  authors: string | null;",
        "  paperTitle: string | null;",
        "  paperUrl: string;",
        "  attributableRevenueM: number;",
        "  paperCountK: number;",
        "  directRevenueM: number;",
        "  domains: ProductDomain[];",
        "}",
        "",
        "export interface AIRevenueProduct {",
        "  productId: string;",
        "  name: string;",
        "  company: string;",
        "  revenueM: number;",
        "  revenueSourceClaim: string | null;",
        "  valuationM: number | null;",
        "  valuationSourceClaim: string | null;",
        "  primaryArchId: string;",
        "  secondaryArchs: string[];",
        "  domainTag: ProductDomain;",
        "  useCase: string[];",
        "  stage: ProductStage;",
        "  notes: string | null;",
        "}",
        "",
        "export interface AISource {",
        "  claimId: string;",
        "  entity: string;",
        "  metric: string;",
        "  value: number | string | null;",
        "  unit: string | null;",
        "  period: string | null;",
        "  publisher: string;",
        "  url: string;",
        "  retrieved: string;",
        "  confidence: ConfidenceTier;",
        "  exactQuoteOrBasis: string;",
        "}",
        "",
        "export const FAMILY_COLORS: Record<ArchFamily, string> = {",
        "  'CNN / Vision': '#b85c38',",
        "  'Transformer': '#1f3a5f',",
        "  'Diffusion': '#a23b72',",
        "  'Recsys': '#c19a2b',",
        "  'Audio/Speech': '#5c7048',",
        "  'Other': '#6b6b6b',",
        "  'Other (Geometric DL)': '#6b6b6b',",
        "};",
        "",
        "export const CONFIDENCE_COLORS: Record<ConfidenceTier, string> = {",
        "  PRIMARY: 'hsl(155 50% 38%)',",
        "  SECONDARY: 'hsl(45 80% 45%)',",
        "  ANALYST: 'hsl(0 50% 50%)',",
        "};",
        "",
        "export const ALL_FAMILIES: ArchFamily[] = [",
        "  'CNN / Vision',",
        "  'Transformer',",
        "  'Diffusion',",
        "  'Recsys',",
        "  'Audio/Speech',",
        "  'Other',",
        "];",
        "",
        "export const ALL_DOMAINS: ProductDomain[] = [",
        "  'Medical',",
        "  'Advertising',",
        "  'Consumer/Enterprise',",
        "  'Defense/Industrial',",
        "  'Creative',",
        "  'Fintech',",
        "  'Science',",
        "  'Infra',",
        "];",
        "",
        "// Collapses 'Other (Geometric DL)' → 'Other' for legend grouping.",
        "export function familyKey(f: ArchFamily): ArchFamily {",
        "  return f === 'Other (Geometric DL)' ? 'Other' : f;",
        "}",
        "",
    ]

    # --- AI_SOURCES
    lines.append("export const AI_SOURCES: AISource[] = [")
    for s in sources:
        kv = [
            f"claimId: {_ts(s['claimId'])}",
            f"entity: {_ts(s['entity'])}",
            f"metric: {_ts(s['metric'])}",
            f"value: {_ts(s['value'])}",
            f"unit: {_ts(s['unit'])}",
            f"period: {_ts(s['period'])}",
            f"publisher: {_ts(s['publisher'])}",
            f"url: {_ts(s['url'])}",
            f"retrieved: {_ts(s['retrieved'])}",
            f"confidence: {_ts(s['confidence'])}",
            f"exactQuoteOrBasis: {_ts(s['exactQuoteOrBasis'])}",
        ]
        lines.append("  { " + ", ".join(kv) + " },")
    lines.append("];")
    lines.append("")
    lines.append("// Fast lookup: claimId -> AISource")
    lines.append("export const AI_SOURCES_BY_ID: Record<string, AISource> = Object.fromEntries(")
    lines.append("  AI_SOURCES.map((s) => [s.claimId, s]),")
    lines.append(");")
    lines.append("")

    # --- AI_ARCHITECTURES
    lines.append("export const AI_ARCHITECTURES: AIArchitecture[] = [")
    for a in archs:
        kv = [
            f"archId: {_ts(a['archId'])}",
            f"name: {_ts(a['name'])}",
            f"family: {_ts(a['family'])}",
            f"paperYear: {_ts(a['paperYear'])}",
            f"authors: {_ts(a['authors'])}",
            f"paperTitle: {_ts(a['paperTitle'])}",
            f"paperUrl: {_ts(a['paperUrl'])}",
            f"attributableRevenueM: {_ts(a['attributableRevenueM'])}",
            f"paperCountK: {_ts(a['paperCountK'])}",
            f"directRevenueM: {_ts(a['directRevenueM'])}",
            f"domains: {_ts(a['domains'])}",
        ]
        lines.append("  { " + ", ".join(kv) + " },")
    lines.append("];")
    lines.append("")

    # --- AI_REVENUE_PRODUCTS
    lines.append("export const AI_REVENUE_PRODUCTS: AIRevenueProduct[] = [")
    for p in products:
        kv = [
            f"productId: {_ts(p['productId'])}",
            f"name: {_ts(p['name'])}",
            f"company: {_ts(p['company'])}",
            f"revenueM: {_ts(p['revenueM'])}",
            f"revenueSourceClaim: {_ts(p['revenueSourceClaim'])}",
            f"valuationM: {_ts(p['valuationM'])}",
            f"valuationSourceClaim: {_ts(p['valuationSourceClaim'])}",
            f"primaryArchId: {_ts(p['primaryArchId'])}",
            f"secondaryArchs: {_ts(p['secondaryArchs'])}",
            f"domainTag: {_ts(p['domainTag'])}",
            f"useCase: {_ts(p['useCase'])}",
            f"stage: {_ts(p['stage'])}",
            f"notes: {_ts(p['notes'])}",
        ]
        lines.append("  { " + ", ".join(kv) + " },")
    lines.append("];")
    lines.append("")

    # --- DISCLAIMER (verbatim from HTML, mirrors xlsx README intent)
    lines += [
        "// Methodology disclaimer — render verbatim in the UI footer.",
        "export const AI_REVENUE_DISCLAIMER = {",
        "  headline: 'What these numbers are — and aren\\u2019t',",
        "  body: [",
        "    'Every revenue figure here is an estimated attribution, not a measured fact. No company discloses revenue by architecture. NVIDIA\\u2019s 10-K doesn\\u2019t contain a line called \"Transformer-attributable sales\"; Meta never isolates \"DLRM revenue\"; Stripe doesn\\u2019t publish what fraction of Radar\\u2019s lift comes from which model class. Those numbers are unknowable from outside the company.',",
        "    'So this is a Bayesian estimate. The prior is what is public — 10-K segment data, signed company announcements, funding rounds, analyst reporting (Sacra, The Information, TechCrunch, Bloomberg for private firms like ByteDance). That prior is then updated by an attribution rule: each product is credited to the canonical SOTA paper for its product class, not its backbone. The posterior is a plausible figure — not the true one.',",
        "    'And there\\u2019s a deeper problem: the work that quietly earns the most is often the least published. Internal ranking models, proprietary fraud systems, in-house recommendation stacks — the architectures behind enormous revenue frequently never appear in a paper at all, or appear years late and stripped of detail. A bubble sitting low-left (\"high research, low visible $\") may simply be earning silently. Absence of attributed revenue is absence of evidence, not evidence of absence.',",
        "  ],",
        "  footerMeta:",
        "    'Paper counts — ANALYST-tier estimates (Stanford AI Index 2025 + OpenAlex). Public-company revenue from 10-K filings; private-company figures are analyst estimates and flagged as such in the dataset. Med-PaLM / MedGemma attribution = $0 reflects no public confirmation of production deployment — itself an absence-of-evidence claim, not a measurement.',",
        "} as const;",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    if not EXCEL_PATH.exists():
        print(f"ERROR: xlsx not found at {EXCEL_PATH}", file=sys.stderr)
        return 1
    wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)

    sources = load_sources(wb)
    archs = load_architectures(wb)
    products = load_products(wb)

    # Sanity: every product revenueSourceClaim must resolve to a known claimId
    known_claims = {s["claimId"] for s in sources}
    orphans = [
        p["productId"]
        for p in products
        if p["revenueSourceClaim"] and p["revenueSourceClaim"] not in known_claims
    ]
    if orphans:
        print(f"WARNING: {len(orphans)} products reference unknown claim IDs: {orphans}", file=sys.stderr)

    # Sanity: every product primaryArchId resolves
    known_archs = {a["archId"] for a in archs}
    bad_arch = [
        p["productId"] for p in products if p["primaryArchId"] not in known_archs
    ]
    if bad_arch:
        print(f"ERROR: products reference unknown arch IDs: {bad_arch}", file=sys.stderr)
        return 2

    content = emit(sources, archs, products)
    OUT_PATH.write_text(content, encoding="utf-8")
    print(
        f"Wrote {OUT_PATH.relative_to(REPO_ROOT)}: "
        f"{len(sources)} sources, {len(archs)} archs, {len(products)} products"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
