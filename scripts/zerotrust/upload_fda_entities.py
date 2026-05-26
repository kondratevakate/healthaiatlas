"""
upload_fda_entities.py
----------------------
Extracts unique companies from fda_ai_devices_full.csv, normalizes canonical names
(grouping known aliases like "Siemens Medical Solutions USA, Inc." → "Siemens Healthineers"),
maps specialty → cluster, and upserts each canonical entity into Airtable Entities
with source=fda tag and Aliases field populated.

Idempotent: uses External ID = c_ent_fda_<slug> as upsert key.
"""

import csv
import json
import os
import re
import time
import urllib.parse
import urllib.request
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv("backend/.env")

AIRTABLE_TOKEN = os.environ["AIRTABLE_TOKEN"]
AIRTABLE_BASE  = os.environ["AIRTABLE_BASE"]
TABLE_NAME     = "Entities"
CSV_PATH       = "scripts/zerotrust/fda_ai_devices_full.csv"

# ---------------------------------------------------------------------------
# Specialty → cluster mapping
# ---------------------------------------------------------------------------
SPECIALTY_TO_CLUSTER = {
    "Radiology":                   "diagnostics_imaging",
    "Cardiovascular":              "diagnostics_imaging",
    "Neurology":                   "diagnostics_imaging",
    "Ophthalmic":                  "diagnostics_imaging",
    "Pathology":                   "diagnostics_imaging",
    "Hematology":                  "diagnostics_imaging",
    "Clinical Chemistry":          "diagnostics_imaging",
    "Clinical Toxcicology":        "diagnostics_imaging",
    "Microbiology":                "diagnostics_imaging",
    "Immunology":                  "diagnostics_imaging",
    "Dental":                      "diagnostics_imaging",
    "Gastroenterology-Urology":    "diagnostics_imaging",
    "Anesthesiology":              "hospital_ops",
    "Obstetrics and Gynecology":   "hospital_ops",
    "General Hospital":            "hospital_ops",
    "General and Plastic Surgery": "surgical_robotics",
    "Orthopedic":                  "surgical_robotics",
}

# ---------------------------------------------------------------------------
# Canonical name overrides: raw_name → canonical_name
# Covers all "GE Medical Systems *" variants, "Siemens *" variants, etc.
# ---------------------------------------------------------------------------
CANONICAL_OVERRIDES: dict[str, str] = {
    # GE HealthCare
    "ge medical systems, llc":                                               "GE HealthCare",
    "ge medical systems scs":                                                "GE HealthCare",
    "ge medical systems ultrasound and primary care diagnostics":            "GE HealthCare",
    "ge medical systems ultrasound and primary care diagnostics,":           "GE HealthCare",
    "ge healthcare":                                                         "GE HealthCare",
    "ge healthcare technologies":                                            "GE HealthCare",

    # Siemens Healthineers
    "siemens medical solutions usa, inc.":                                   "Siemens Healthineers",
    "siemens healthcare gmbh":                                               "Siemens Healthineers",
    "siemens healthcare diagnostics inc.":                                   "Siemens Healthineers",
    "siemens medical solutions":                                             "Siemens Healthineers",
    "siemens healthcare scs":                                                "Siemens Healthineers",

    # Philips
    "philips ultrasound llc":                                                "Philips Healthcare",
    "philips healthcare":                                                    "Philips Healthcare",
    "philips medical systems nederland b.v.":                                "Philips Healthcare",

    # Canon Medical
    "canon medical systems corporation":                                     "Canon Medical Systems",
    "canon medical systems usa, inc.":                                       "Canon Medical Systems",

    # United Imaging
    "shanghai united imaging healthcare co., ltd.":                         "United Imaging Healthcare",
    "united imaging healthcare co., ltd.":                                   "United Imaging Healthcare",

    # iSchemaView (comma variant)
    "ischemaview, inc.":                                                     "iSchemaView",
    "ischemaview inc.":                                                      "iSchemaView",
    "ischemaview":                                                           "iSchemaView",

    # Samsung Medison
    "samsung medison co., ltd.":                                             "Samsung Medison",
    "samsung medison":                                                       "Samsung Medison",
}


def to_slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def canonical_name(raw: str) -> str:
    """Return canonical company name, applying overrides where known."""
    key = raw.lower().strip().rstrip(",")
    if key in CANONICAL_OVERRIDES:
        return CANONICAL_OVERRIDES[key]
    # Strip trailing legal suffixes for display normalization
    clean = re.sub(
        r"\s*,?\s*(inc\.?|llc\.?|ltd\.?|corp\.?|co\.?|gmbh|s\.a\.s\.?|b\.v\.?|pty\s+ltd\.?|limited|a\.s\.|s\.p\.a\.)$",
        "",
        raw,
        flags=re.IGNORECASE,
    ).strip().rstrip(",").strip()
    # Title-case if fully upper or fully lower
    if clean == clean.upper() or clean == clean.lower():
        clean = clean.title()
    return clean


# ---------------------------------------------------------------------------
# Parse CSV: build canonical → {aliases, specialty_counts, device_count}
# ---------------------------------------------------------------------------
def parse_fda_companies(csv_path: str):
    canonical_map: dict[str, dict] = {}  # canonical_name → info

    with open(csv_path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            raw = row["company_name"].strip()
            if not raw:
                continue
            canon = canonical_name(raw)
            specialty = row.get("specialty", "").strip()
            cluster = SPECIALTY_TO_CLUSTER.get(specialty, "diagnostics_imaging")

            if canon not in canonical_map:
                canonical_map[canon] = {
                    "aliases": set(),
                    "specialty_counts": defaultdict(int),
                    "cluster_counts": defaultdict(int),
                }

            info = canonical_map[canon]
            if raw != canon:
                info["aliases"].add(raw)
            info["specialty_counts"][specialty] += 1
            info["cluster_counts"][cluster] += 1

    # Resolve primary cluster (most devices) and format aliases
    result = []
    for name, info in canonical_map.items():
        primary_cluster = max(info["cluster_counts"], key=info["cluster_counts"].get)
        result.append({
            "name": name,
            "aliases": sorted(info["aliases"]),
            "primary_cluster": primary_cluster,
            "device_count": sum(info["specialty_counts"].values()),
        })

    return sorted(result, key=lambda x: -x["device_count"])


# ---------------------------------------------------------------------------
# Airtable helpers
# ---------------------------------------------------------------------------
def airtable_request(method: str, path: str, payload: dict | None = None):
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE}/{urllib.parse.quote(TABLE_NAME)}"
    if path:
        url = f"{url}/{path}"

    data = json.dumps(payload).encode() if payload else None
    req = urllib.request.Request(url, data=data, headers={
        "Authorization": f"Bearer {AIRTABLE_TOKEN}",
        "Content-Type":  "application/json",
    })
    req.get_method = lambda: method

    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f"Airtable {method} {url}: {e.code} {body}") from e


def get_existing_ids() -> dict[str, str]:
    """Return {external_id → airtable_record_id} for all fda entities."""
    existing: dict[str, str] = {}
    offset = None

    while True:
        params = {"fields[]": "External ID", "pageSize": "100"}
        if offset:
            params["offset"] = offset

        qs = urllib.parse.urlencode(params)
        full_url = (
            f"https://api.airtable.com/v0/{AIRTABLE_BASE}/"
            f"{urllib.parse.quote(TABLE_NAME)}?{qs}"
        )
        req = urllib.request.Request(full_url, headers={
            "Authorization": f"Bearer {AIRTABLE_TOKEN}"
        })
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())

        for rec in data.get("records", []):
            ext_id = rec.get("fields", {}).get("External ID", "")
            if ext_id.startswith("c_ent_fda_"):
                existing[ext_id] = rec["id"]

        offset = data.get("offset")
        if not offset:
            break
        time.sleep(0.2)

    return existing


# ---------------------------------------------------------------------------
# Main upload
# ---------------------------------------------------------------------------
def upload_entities(companies: list[dict]):
    print(f"Parsed {len(companies)} canonical FDA entities from CSV.")

    existing = get_existing_ids()
    print(f"Found {len(existing)} existing c_ent_fda_* records in Airtable.")

    created = updated = skipped = 0

    for company in companies:
        slug = to_slug(company["name"])
        ext_id = f"c_ent_fda_{slug}"

        fields = {
            "Entity Name": company["name"],
            "External ID": ext_id,
            "Industry": "Healthcare AI",
            "Aliases": "\n".join(company["aliases"]) if company["aliases"] else "",
        }
        # Add cluster as tag via Industry Classification field isn't reliable —
        # use Description to carry cluster hint so regen_life_sciences.py can read it
        cluster = company["primary_cluster"]
        device_count = company["device_count"]
        fields["Description"] = (
            f"FDA-cleared AI medical device company. "
            f"Cluster: {cluster}. "
            f"Devices: {device_count}. "
            f"Source: FDA 510(k)/De Novo database (accessed 2026-03-04)."
        )

        if ext_id in existing:
            record_id = existing[ext_id]
            airtable_request("PATCH", record_id, {"fields": fields})
            updated += 1
        else:
            airtable_request("POST", "", {"fields": fields})
            created += 1

        status = "✓ new" if ext_id not in existing else "↺ upd"
        if (created + updated) % 25 == 0:
            print(f"  Progress: {created} created, {updated} updated, {skipped} skipped…")

        time.sleep(0.22)  # stay under 5 req/s free-tier limit

    print(f"\nDone. Created: {created} · Updated: {updated} · Skipped: {skipped}")


if __name__ == "__main__":
    companies = parse_fda_companies(CSV_PATH)
    # Show a sample before uploading
    print("\nSample canonical entities:")
    for c in companies[:10]:
        aliases_str = f" (aliases: {len(c['aliases'])})" if c["aliases"] else ""
        print(f"  {c['name']}: {c['device_count']} devices -> {c['primary_cluster']}{aliases_str}")
    print()

    import sys
    auto = "--yes" in sys.argv or "-y" in sys.argv
    if auto:
        answer = "y"
    else:
        answer = input("Proceed with upload? [y/N] ").strip().lower()

    if answer == "y":
        upload_entities(companies)
    else:
        print("Aborted.")
