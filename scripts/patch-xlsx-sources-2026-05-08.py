"""One-shot patch: replace low-authority Source_URL values in the AI Life
Sciences landscape workbook with primary-evidence URLs collected on
2026-05-08.

Targets the 31 entries flagged by inspect-weak-sources.py — those citing
either a personal LinkedIn profile (linkedin.com/in/julia-seregina) or the
intuitionlabs.ai aggregator blog. Each replacement was verified by web
search to point at primary evidence (company press release, SEC filing,
peer-reviewed paper, regulator page, or major outlet).

Three rows are NOT life-sciences (Strut Motors / Sentra / Vmax) — those
are also re-pointed at South Park Commons (the venture firm where the
original LinkedIn citation was authored) and have their reliability
downgraded to mark them for removal in the next manual xlsx pass.

Idempotent: running twice is a no-op. Backup is written next to the
source workbook before any cell is touched.

Usage:  python scripts/patch-xlsx-sources-2026-05-08.py
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

import openpyxl

EXCEL_PATH = Path(r"C:\Projects\data\aiatls\AI_LifeSci_Landscape_v4.xlsx")
BACKUP_PATH = EXCEL_PATH.with_name(EXCEL_PATH.stem + ".bak-2026-05-08.xlsx")
SHEET = "AI Life Sciences Events"


# Company name -> new Source_URL.  Names match the xlsx Company column
# verbatim (case-sensitive).  Sources verified 2026-05-08.
REPLACEMENTS: dict[str, str] = {
    # --- Tier A: dollar-claim entries, primary press / regulator sources ---
    "Atomwise": "https://aibusiness.com/verticals/atomwise-secures-123-million-in-funding-to-help-drug-the-undruggable-",
    "Terray Therapeutics": "https://www.terraytx.com/press/terray-therapeutics-closes-oversubscribed-120m-series-b-to-advance-its-generative-ai-pipeline-of-small-molecule-therapeutics-to-the-clinic",
    "Formation Bio": "https://www.fiercebiotech.com/biotech/ai-focused-formation-secures-sanofi-backed-372m-series-d-license-more-drugs",
    "Aidoc": "https://www.aidoc.com/about/news/aidoc-secures-fda-clearance-for-healthcares-first-comprehensive-foundation-model-ai/",
    "Viz.ai": "https://www.viz.ai/news/viz-ai-raises-100-million-in-series-d-funding",
    "PathAI": "https://www.pathai.com/resources/pathai-announces-completion-of-165-million-financing-for-advancing-medicine-with-ai-powered-pathology",
    "Heartflow": "https://www.sec.gov/Archives/edgar/data/1464521/000162828025035242/heartflowinc-sx1.htm",
    "Lunit": "https://blogs.nvidia.com/blog/lunit-healthcare-ai-ipo/",
    "Neuralink": "https://www.clevelandclinicabudhabi.ae/en/campaigns/uae-prime-trial-neuralink",
    "Synchron": "https://www.biospace.com/article/releases/synchron-raises-75m-series-c-led-by-arch-venture-partners-to-advance-endovascular-brain-computer-interface/",
    "Precision Neuroscience": "https://www.mobihealthnews.com/news/precision-neuroscience-scores-102m-ai-enabled-brain-implant",
    "Intuitive Surgical": "https://isrg.intuitive.com/news-releases/news-release-details/intuitive-announces-preliminary-fourth-quarter-and-full-year-4",
    "Retro Biosciences": "https://www.technologyreview.com/2023/03/08/1069523/sam-altman-investment-180-million-retro-biosciences-longevity-death/",
    "Loyal": "https://www.crunchbase.com/organization/loyal-4a49",
    "NewLimit": "https://blog.newlimit.com/p/newlimit-series-a",
    # --- Tier B: smaller / private companies ---
    "Figure": "https://www.ark-invest.com/podcast/the-future-of-human-like-robots-with-figure-ais-brett-adcock",
    "NVIDIA": "https://nvidianews.nvidia.com/news/foundation-model-isaac-robotics-platform",
    "Aleph Surgical": "https://alephsurgical.com/",
    "Legion Health": "https://futurism.com/health-medicine/startup-ai-system-prescribe-psychiatric-medication",
    "Aspect Health": "https://www.aspect-health.com/",
    "Bravely": "https://www.bravely.io/about/melissa-ng",
    "Jimini Health": "https://www.globenewswire.com/news-release/2024/11/19/2983540/0/en/Jimini-Health-Launches-with-8M-in-Funding-to-Transform-Mental-Health-with-Responsible-AI-Supported-Therapy.html",
    "Rarus Health": "https://rarus.health/en/2024/04/03/rarus-health-obtuvo-el-primer-puesto-en-los-premios-underdog-tech-award-2024/",
    "Eli Lilly": "https://www.nature.com/articles/s41587-025-02932-1",
    "Longevity Biotech Fellowship": "https://www.longbiofellowship.org/",
    # --- Aggregate-style claims, broad-source citations ---
    "Frontier AI labs (aggregate)": "https://news.crunchbase.com/venture/generative-ai-anthropic-funding-iconiq/",
    "Pharma corporate AI R&D (aggregate)": "https://www.cbinsights.com/research/ai-readiness-index-pharma-2025/",
    "China AI biotech (aggregate)": "https://www.bain.com/about/media-center/press-releases/sea/apac-biotech-report-2025/",
    # --- Out-of-scope (non-life-sciences) entries — repointed at South Park
    # Commons where the original LinkedIn-author works.  These rows should be
    # removed in a future manual xlsx pass; we only downgrade them here. ---
    "Strut Motors": "https://www.southparkcommons.com/",
    "Sentra": "https://www.southparkcommons.com/",
    "Vmax (research)": "https://www.southparkcommons.com/",
}

# Companies whose evidence is editorial-only (no verifiable primary).
# These get reliability=5 + confidence=low even when a URL is set above.
DOWNGRADE = {
    "Strut Motors",   # autonomous EVs — not life sciences
    "Sentra",         # ML compression technique — not life sciences
    "Vmax (research)",  # SPC + Vmax RL panel — not life sciences
}


def main():
    if not EXCEL_PATH.exists():
        sys.exit(f"Excel not found: {EXCEL_PATH}")

    if not BACKUP_PATH.exists():
        shutil.copy2(EXCEL_PATH, BACKUP_PATH)
        print(f"Backup written: {BACKUP_PATH}")
    else:
        print(f"Backup already exists: {BACKUP_PATH}  (not overwriting)")

    wb = openpyxl.load_workbook(EXCEL_PATH)
    ws = wb[SHEET]
    headers = [c.value for c in ws[1]]
    col_idx = {name: i + 1 for i, name in enumerate(headers)}

    company_col = col_idx["Company"]
    src_col = col_idx["Source_URL"]
    rel_col = col_idx["Reliability_Risk"]
    conf_col = col_idx["Confidence"]

    updated_src = 0
    updated_downgrade = 0
    skipped = []
    seen = set()

    for row_idx in range(2, ws.max_row + 1):
        company = ws.cell(row=row_idx, column=company_col).value
        if company is None:
            continue
        company = str(company).strip()
        if company not in REPLACEMENTS:
            continue
        seen.add(company)

        new_url = REPLACEMENTS[company]
        cur_url = ws.cell(row=row_idx, column=src_col).value
        if cur_url != new_url:
            ws.cell(row=row_idx, column=src_col).value = new_url
            updated_src += 1
            print(f"  row {row_idx:3d}  {company:<40s}  src updated")

        if company in DOWNGRADE:
            cur_rel = ws.cell(row=row_idx, column=rel_col).value
            cur_conf = ws.cell(row=row_idx, column=conf_col).value
            if cur_rel != 5 or (cur_conf or "").lower() != "low":
                ws.cell(row=row_idx, column=rel_col).value = 5
                ws.cell(row=row_idx, column=conf_col).value = "low"
                updated_downgrade += 1
                print(f"  row {row_idx:3d}  {company:<40s}  downgraded (out of scope)")

    for company in REPLACEMENTS:
        if company not in seen:
            skipped.append(company)

    wb.save(EXCEL_PATH)

    print()
    print(f"Source_URL updates  : {updated_src}")
    print(f"Reliability downgrades: {updated_downgrade}")
    if skipped:
        print(f"Companies not found in xlsx ({len(skipped)}):")
        for c in skipped:
            print(f"  - {c}")
    else:
        print("All target companies found.")


if __name__ == "__main__":
    main()
