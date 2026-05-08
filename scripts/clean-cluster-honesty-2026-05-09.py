"""One-shot xlsx cleanup: delete rows for non-bio companies that are no
longer in scope after the cluster-honesty pass.

Targets (deleted entirely from the AI Life Sciences Events sheet):
  - Strut Motors          — autonomous EVs, not life sciences
  - Sentra                — ML compression technique, not life sciences
  - Vmax (research)       — RL panel discussion, not a company

These three were flagged in the 2026-05-08 source-audit pass with
reliability=5 + confidence=low and pointed at South Park Commons as a
placeholder. With the cluster-honesty rework they are removed completely
(Figure and NVIDIA are *not* dropped — they are remapped to frontier_labs
in the importer's COMPANY_TO_CLUSTER and stay).

Backup: AI_LifeSci_Landscape_v4.bak3-2026-05-09.xlsx (separate from prior
backups).

Usage:  python scripts/clean-cluster-honesty-2026-05-09.py
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

import openpyxl

EXCEL_PATH = Path(r"C:\Projects\data\aiatls\AI_LifeSci_Landscape_v4.xlsx")
BACKUP_PATH = EXCEL_PATH.with_name(EXCEL_PATH.stem + ".bak3-2026-05-09.xlsx")
SHEET = "AI Life Sciences Events"

# Companies whose rows are removed entirely.  Match on Company column,
# case-sensitive exact match (matches xlsx values verbatim).
COMPANIES_TO_DELETE = {
    "Strut Motors",
    "Sentra",
    "Vmax (research)",
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
    company_col = headers.index("Company") + 1

    # Walk rows top-to-bottom and collect indices to delete.  ws.delete_rows()
    # shifts subsequent rows up, so we delete in descending order.
    to_delete = []
    seen = {c: False for c in COMPANIES_TO_DELETE}
    for row_idx in range(2, ws.max_row + 1):
        company = ws.cell(row=row_idx, column=company_col).value
        if company is None:
            continue
        company = str(company).strip()
        if company in COMPANIES_TO_DELETE:
            seen[company] = True
            to_delete.append(row_idx)

    for row_idx in sorted(to_delete, reverse=True):
        company = ws.cell(row=row_idx, column=company_col).value
        ws.delete_rows(row_idx, 1)
        print(f"  delete row {row_idx:3d}  {company}")

    not_found = [c for c, s in seen.items() if not s]

    wb.save(EXCEL_PATH)

    print()
    print(f"Rows deleted: {len(to_delete)}")
    if not_found:
        print(f"Targets not found in xlsx ({len(not_found)}) — already removed?:")
        for c in not_found:
            print(f"  - {c}")


if __name__ == "__main__":
    main()
