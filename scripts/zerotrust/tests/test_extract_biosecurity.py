"""Tests for the Biosecurity World extractor + regenerator.

Offline tests use a synthetic queryCollection payload that mirrors the real
Notion shape (double-wrapped record values, relation cells with ',' separator
segments, NBSP in titles). `test_live_contract` hits the real endpoint and only
runs with ZEROTRUST_LIVE=1.

Run from the repo root:
  python -m pytest scripts/zerotrust/tests -q
  $env:ZEROTRUST_LIVE = "1"; python -m pytest scripts/zerotrust/tests -q -k live
"""
from __future__ import annotations

import json
import os
import re

import pytest

from scripts.zerotrust import extract_biosecurity as ex
from scripts.zerotrust import regen_biosecurity as rg
from scripts.zerotrust import validate as vd
from scripts.zerotrust.common import (
    canonical_url, write_claims, write_entities, write_sources,
)

SCHEMA_KEYS = {
    "title": "Name", "desc": "Description", "link": "Link", "otype": "Organization Type",
    "act": "Activity Type", "foc": "Intervention Focus",
    "loc": "Location (City, Country, Region)", "gcbr": "GCBR focus",
    "node": "Is intermediate node", "stat": "Status", "par": "Parent",
}


def rel(*ids):
    out = []
    for i, bid in enumerate(ids):
        if i:
            out.append([","])
        out.append(["‣", [["p", bid, ex.SPACE_ID]]])
    return out


def block(bid, **props):
    key = {v: k for k, v in SCHEMA_KEYS.items()}
    return {"spaceId": ex.SPACE_ID,
            "value": {"value": {"id": bid, "properties": {key[n]: v for n, v in props.items()}},
                      "role": "reader"}}


def node(bid, name, parent=None):
    props = {"Name": [[name]], "Is intermediate node": [["Yes"]]}
    if parent:
        props["Parent"] = rel(parent)
    return block(bid, **props)


def org(bid, name, parents, status="Approved", link="https://example.org", **extra):
    props = {
        "Name": [[name]], "Status": [[status]], "Parent": rel(*parents),
        "Description": [["Does biosecurity things."]],
        "Link": [[link]] if link else None,
        "Organization Type": [["Think tank"]],
        "Activity Type": [["Research,Policy development"]],
        "Intervention Focus": [["Vaccines,[GOVERNANCE]"]],
        "Location (City, Country, Region)": [["USA,Global"]],
        "GCBR focus": [["Yes"]],
    }
    props.update(extra)
    return block(bid, **{k: v for k, v in props.items() if v is not None})


def payload(blocks, has_more=False, schema_keys=SCHEMA_KEYS):
    return {
        "recordMap": {
            "collection": {ex.COLLECTION_ID: {"value": {"value": {
                "id": ex.COLLECTION_ID,
                "schema": {k: {"name": n, "type": "text"} for k, n in schema_keys.items()},
            }}}},
            "block": {b["value"]["value"]["id"]: b for b in blocks},
        },
        "result": {"reducerResults": {"collection_group_results": {
            "type": "results", "blockIds": [b["value"]["value"]["id"] for b in blocks],
            "hasMore": has_more}}},
    }


@pytest.fixture
def blocks():
    return [
        node("g-prev", "Prevention"),
        node("g-resp", "Response"),
        node("s-mcm", "Medical countermeasures", parent="g-resp"),
        org("o1", "Acme\xa0Bio  Lab", ["s-mcm", "g-prev"]),
        org("o2", "Deadlink Institute", ["g-resp"], link="deadlink.example"),
        org("o3", "Rejected Org", ["g-prev"], status="Rejected"),
        org("o4", "Floating Org", []),
    ]


def test_parse_rows_decodes_notion_shapes(blocks):
    rows = {r["id"]: r for r in ex.parse_rows(payload(blocks))}
    acme = rows["o1"]
    assert acme["name"] == "Acme Bio Lab"                       # NBSP + double space normalised
    assert acme["parent_ids"] == ["s-mcm", "g-prev"]            # ',' separator segments dropped
    assert acme["activity"] == ["Research", "Policy development"]
    assert acme["focus"] == ["Vaccines", "[GOVERNANCE]"]
    assert rows["s-mcm"]["is_node"] and not acme["is_node"]


def test_url_value_prefers_link_annotation():
    assert ex.url_value([["label", [["a", "https://real.example/x"]]]]) == "https://real.example/x"
    assert ex.url_value([["valthos.com"]]) == "valthos.com"


def test_schema_drift_fails_loudly(blocks):
    broken = {k: v for k, v in SCHEMA_KEYS.items() if v != "Parent"}
    with pytest.raises(ex.SchemaDriftError, match="Parent"):
        ex.parse_rows(payload(blocks, schema_keys=broken))


def test_truncated_result_fails_loudly(blocks):
    with pytest.raises(ex.SchemaDriftError, match="hasMore"):
        ex.parse_rows(payload(blocks, has_more=True))


def _extract(blocks):
    rows = ex.parse_rows(payload(blocks))
    status = {canonical_url("https://example.org"): (True, "http_200")}
    return ex.extract(rows, status, "2026-09-13")


def test_extract_filters_and_quarantines(blocks):
    entities, claims, sources, quarantine, taxonomy = _extract(blocks)

    assert set(entities) == {"acme-bio-lab", "deadlink-institute"}
    reasons = sorted(q.reason for q in quarantine)
    assert reasons[0].startswith("dead_url:")
    assert "missing_category" in reasons
    assert "not_approved:Rejected" in reasons

    cats = sorted(c.value for c in claims
                  if c.entity_id == "acme-bio-lab" and c.predicate == "covers_decision_point")
    assert cats == ["medical-countermeasures", "prevention"]
    assert [g["id"] for g in taxonomy["groups"]] == ["prevention", "response"]


def test_every_claim_cites_the_directory_and_no_url_is_constructed(blocks):
    _, claims, sources, _, _ = _extract(blocks)
    dir_sid = ex.source_id_for(ex.DIRECTORY_URL)
    assert claims and all(c.source_ids == dir_sid for c in claims)
    assert [s.url for s in sources.values()] == [canonical_url(ex.DIRECTORY_URL)]


def test_dead_website_is_tagged_not_dropped(blocks):
    entities, claims, _, _, _ = _extract(blocks)
    assert entities["deadlink-institute"].website == "https://deadlink.example/"
    dead = [c for c in claims if c.entity_id == "deadlink-institute" and c.predicate == "covers_decision_point"]
    assert dead and "website:dead" in dead[0].tags


@pytest.fixture
def written(blocks, tmp_path, monkeypatch):
    monkeypatch.setenv("ZEROTRUST_DATA_DIR", str(tmp_path))
    entities, claims, sources, _, taxonomy = _extract(blocks)
    write_entities(tmp_path / "entities_biosecurity.csv", entities.values())
    write_claims(tmp_path / "claims_biosecurity.csv", claims)
    write_sources(tmp_path / "sources_biosecurity.csv", sources.values())
    (tmp_path / "biosecurity_taxonomy.json").write_text(json.dumps(taxonomy), encoding="utf-8")
    return tmp_path


def test_validate_domain_passes(written):
    assert vd.validate("biosecurity") == 0


def test_regen_builds_columns_orgs_and_approach(written):
    ts = rg.regen()
    orgs = json.loads(re.search(r"BIO_ORGS: BioOrg\[\] = (\[.*?\n\]);", ts, re.S).group(1))
    columns = json.loads(re.search(r"BIO_COLUMNS: BioColumn\[\] = (\[.*?\n\]);", ts, re.S).group(1))

    acme = next(o for o in orgs if o["id"] == "acme-bio-lab")
    assert acme["focus"] == ["Vaccines"] and acme["approach"] == ["governance"]
    # The upstream GCBR flag is Biosecurity World's editorial call: kept in the
    # CSV claims for audit, deliberately not shipped to the frontend.
    assert "gcbr" not in acme and acme["webAlive"] is True
    assert acme["src"] == canonical_url(ex.DIRECTORY_URL)
    # Both groups have orgs filed directly under them -> each gets a General column.
    assert [c["id"] for c in columns] == ["prevention", "response", "medical-countermeasures"]
    assert "AUTO-GENERATED" in ts.splitlines()[0]


@pytest.mark.skipif(os.environ.get("ZEROTRUST_LIVE") != "1", reason="set ZEROTRUST_LIVE=1 to hit Notion")
def test_live_contract():
    rows = ex.parse_rows(ex.fetch_live())
    orgs = [r for r in rows if not r["is_node"]]
    taxonomy = ex.build_taxonomy(rows)
    assert len(orgs) > 100
    assert [g["label"] for g in taxonomy["groups"]] == list(ex.GROUP_ORDER)
    assert all(r["parent_ids"] for r in orgs if r["status"] == "Approved")
