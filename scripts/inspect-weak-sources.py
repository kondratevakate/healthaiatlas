"""Inspect AI_LifeSci_Landscape_v4.xlsx and dump rows whose Source_URL points
at low-authority sources (LinkedIn personal profile or intuitionlabs.ai
aggregator). One-shot diagnostic for the 2026-05-08 evidence cleanup pass.

Usage:  python scripts/inspect-weak-sources.py
"""
from __future__ import annotations

import sys
from pathlib import Path

import openpyxl

EXCEL_PATH = Path(r"C:\Projects\data\aiatls\AI_LifeSci_Landscape_v4.xlsx")

WEAK_PATTERNS = (
    "linkedin.com/in/julia-seregina",
    "intuitionlabs.ai",
)


def main():
    if not EXCEL_PATH.exists():
        sys.exit(f"Excel not found: {EXCEL_PATH}")

    wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
    ws = wb["AI Life Sciences Events"]
    headers = [c.value for c in ws[1]]

    def col(row, name):
        return row[headers.index(name)]

    raw_rows = list(ws.iter_rows(min_row=2, values_only=True))
    weak_rows = []
    for idx, row in enumerate(raw_rows, start=2):
        src = col(row, "Source_URL")
        if not src:
            continue
        s = str(src).lower()
        if any(p in s for p in WEAK_PATTERNS):
            weak_rows.append((idx, row))

    print(f"Total rows: {len(raw_rows)}")
    print(f"Weak-source rows: {len(weak_rows)}")
    print()

    fields = [
        "Company",
        "Event_Type",
        "Funding_Amount",
        "Deal_Value",
        "Date",
        "Confidence",
        "Reliability_Risk",
        "Source_Type",
        "Source_URL",
        "Event_Description",
    ]

    for row_idx, row in weak_rows:
        print(f"--- xlsx row {row_idx} ---")
        for f in fields:
            v = col(row, f)
            if f == "Event_Description" and v:
                v = str(v)[:200]
            print(f"  {f}: {v}")
        print()


if __name__ == "__main__":
    main()
