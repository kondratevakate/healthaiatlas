"""Extract AI Life Sciences Recent Signals from frontend draft.

Source: frontend/src/data/aiLifeSciencesRecentSignals.ts (RECENT_SIGNALS)

Each RecentSignal is one funding / acquisition / pharma-deal event in the
AI × life-sciences market over the rolling 12-month window. The shape is
similar to aiLifeSciences but with extra editorial fields (lens,
qualitySignal, isBio).

Predicate mapping (action → predicate):
  pre_seed / seed / series_a / series_b / series_c / series_d /
       series_e / growth / strategic_invest -> funding_amount_usd_m
  ipo                                       -> ipo_proceeds_usd_m
  acquisition                               -> ma_value_usd_m
  pharma_deal                               -> pharma_deal_value_usd_m
  partnership                               -> partnered_with
  product_release                           -> released_product
  policy / research                         -> ecosystem_event
  layoff                                    -> layoffs_count
  fellowship / grant                        -> ecosystem_event
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

from .common import (
    canonical_url, claim_id_for, entity_id_for, source_id_for, today,
    write_claims, write_entities, write_quarantine, write_sources,
)
from .schema import Claim, Entity, QuarantineRow, Source
from .verify import (
    classify_confidence, downgrade, salvage_via_wayback, verify_urls,
)

REPO_ROOT = Path(__file__).resolve().parents[2]
TS_FILE = REPO_ROOT / "frontend" / "src" / "data" / "aiLifeSciencesRecentSignals.ts"
DUMPER = REPO_ROOT / "scripts" / "zerotrust" / "dump_ts_module.mjs"
OUT_DIR = Path(r"C:\Projects\data\aiatls\zerotrust")
DOMAIN_TAG = "ai_lifesci_recent"


def load_ts_module() -> dict:
    proc = subprocess.run(
        ["node", "--experimental-strip-types", str(DUMPER), str(TS_FILE)],
        capture_output=True, text=True, encoding='utf-8', check=False,
    )
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr)
        raise RuntimeError(f"TS dump failed: rc={proc.returncode}")
    return json.loads(proc.stdout)


# RecentSignal.action → (predicate, value_kind)
# value_kind: 'amount' = dealSizeUsdM; 'text' = dealSizeLabel / qualitySignal
ACTION_MAP = {
    "pre_seed":        ("funding_amount_usd_m", "amount"),
    "seed":            ("funding_amount_usd_m", "amount"),
    "series_a":        ("funding_amount_usd_m", "amount"),
    "series_b":        ("funding_amount_usd_m", "amount"),
    "series_c":        ("funding_amount_usd_m", "amount"),
    "series_d":        ("funding_amount_usd_m", "amount"),
    "series_e":        ("funding_amount_usd_m", "amount"),
    "growth":          ("funding_amount_usd_m", "amount"),
    "strategic_invest": ("funding_amount_usd_m", "amount"),
    "ipo":             ("ipo_proceeds_usd_m",   "amount"),
    "acquisition":     ("ma_value_usd_m",       "amount"),
    "pharma_deal":     ("pharma_deal_value_usd_m", "amount"),
    "partnership":     ("partnered_with",       "text"),
    "product_release": ("released_product",     "text"),
    "policy":          ("ecosystem_event",      "text"),
    "research":        ("ecosystem_event",      "text"),
    "layoff":          ("layoffs_count",        "amount"),
    "fellowship":      ("ecosystem_event",      "text"),
    "grant":           ("ecosystem_event",      "text"),
    "regulatory":      ("regulatory_event",     "text"),
    "earnings":        ("revenue_usd_m",        "amount"),
}


def extract(data, url_status, wayback_replacements=None):
    wayback_replacements = wayback_replacements or {}
    entities: dict[str, Entity] = {}
    claims: list[Claim] = []
    sources: dict[str, Source] = {}
    quarantine: list[QuarantineRow] = []

    for sig in data.get("RECENT_SIGNALS", []):
        src = (sig.get("src") or "").strip()
        actor = (sig.get("actor") or "").strip()
        target = (sig.get("target") or "").strip()
        sig_id = sig.get("id", "")
        if not src:
            quarantine.append(QuarantineRow(
                reason="missing_source_url",
                extracted_from=f"aiLifeSciencesRecentSignals.ts#RECENT_SIGNALS[id={sig_id}]",
                raw=json.dumps(sig, ensure_ascii=False),
            ))
            continue
        alive, status = url_status.get(src, (False, "unchecked"))
        if not alive:
            quarantine.append(QuarantineRow(
                reason=f"dead_url:{status}",
                extracted_from=f"aiLifeSciencesRecentSignals.ts#RECENT_SIGNALS[id={sig_id}]",
                raw=json.dumps({"src": src, **sig}, ensure_ascii=False),
            ))
            continue

        wb_url = wayback_replacements.get(src)
        eff_url = wb_url or src
        confidence, source_type = classify_confidence(src)
        if wb_url:
            confidence = downgrade(confidence)

        sid = source_id_for(eff_url)
        if sid not in sources:
            sources[sid] = Source(
                source_id=sid, url=canonical_url(eff_url), url_raw=src,
                source_type=source_type, retrieved_at=today(),
                title=sig.get("qualitySignal", "")[:200],
            )

        # The acted-upon entity is `target` (the company being funded /
        # acquired). For partnerships, the actor is also relevant — encode
        # it as a tag.
        primary_entity = target or actor or sig_id
        eid = entity_id_for(primary_entity)
        if eid not in entities:
            entities[eid] = Entity(
                entity_id=eid, name=primary_entity, type="vendor",
                domain_tags=DOMAIN_TAG,
            )

        action = (sig.get("action") or "").strip()
        predicate, value_kind = ACTION_MAP.get(action, ("ecosystem_event", "text"))

        if value_kind == "amount" and sig.get("dealSizeUsdM") is not None:
            value = str(sig["dealSizeUsdM"])
            value_unit = "usd_m"
        else:
            value = sig.get("dealSizeLabel") or sig.get("qualitySignal", "")
            value_unit = ""

        period = sig.get("date", "")
        cid = claim_id_for(eid, predicate, period, value[:64])

        tags = [
            f"action:{action}",
            f"actor:{actor}",
            f"target:{target}",
            f"theme:{sig.get('themeCluster', '')[:60]}",
            f"geo:{sig.get('geo', '')}",
            f"is_bio:{sig.get('isBio', '')}",
            f"entity:{eid}",
        ]
        for lens in sig.get("lens", []) or []:
            tags.append(f"lens:{lens}")
        if wb_url:
            tags.append("wayback_archived")

        claims.append(Claim(
            claim_id=cid, entity_id=eid, predicate=predicate,
            value=value[:500], value_unit=value_unit, period=period,
            jurisdiction=sig.get("geo", ""),
            confidence=confidence, source_ids=sid, domain_tags=DOMAIN_TAG,
            tags=",".join(tags),
            extracted_from=f"aiLifeSciencesRecentSignals.ts#RECENT_SIGNALS[id={sig_id}]",
            extracted_at=today(),
        ))

    return entities, claims, sources, quarantine


def collect_urls(data: dict) -> set[str]:
    urls: set[str] = set()
    for sig in data.get("RECENT_SIGNALS", []):
        s = (sig.get("src") or "").strip()
        if s:
            urls.add(s)
    return urls


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--skip-verify", action="store_true")
    ap.add_argument("--skip-wayback", action="store_true")
    args = ap.parse_args()

    print("Loading aiLifeSciencesRecentSignals.ts ...")
    data = load_ts_module()
    n = len(data.get("RECENT_SIGNALS", []))
    print(f"  signals: {n}")

    urls = collect_urls(data)
    print(f"\nVerifying {len(urls)} distinct URLs ...")
    wayback_replacements: dict[str, str] = {}
    if args.skip_verify:
        url_status = {u: (True, "skipped") for u in urls}
    else:
        t0 = time.time()
        url_status = verify_urls(urls)
        alive = sum(1 for v in url_status.values() if v[0])
        print(f"  done in {time.time()-t0:.1f}s — alive={alive} dead={len(urls)-alive}")
        if not args.skip_wayback and (len(urls) - alive) > 0:
            wayback_replacements = salvage_via_wayback(url_status)

    print("\nExtracting...")
    entities, claims, sources, quarantine = extract(data, url_status, wayback_replacements)

    print(f"\nResults:")
    print(f"  entities:   {len(entities)}")
    print(f"  claims:     {len(claims)}")
    print(f"  sources:    {len(sources)}")
    print(f"  quarantine: {len(quarantine)}")
    if claims:
        from collections import Counter
        confs = Counter(c.confidence for c in claims)
        print(f"  confidence:")
        for c, n in confs.most_common():
            print(f"    {c:8s} {n}")

    if not args.write:
        return 0

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    write_entities(OUT_DIR / "entities_recent_signals.csv", entities.values())
    write_claims(OUT_DIR / "claims_recent_signals.csv", claims)
    write_sources(OUT_DIR / "sources_recent_signals.csv", sources.values())
    write_quarantine(OUT_DIR / "quarantine_recent_signals.csv", quarantine)
    print(f"\nWrote CSVs to {OUT_DIR}/*_recent_signals.csv")
    return 0


if __name__ == "__main__":
    sys.exit(main())
