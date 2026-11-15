"""Publication rules of regen_digicore: unconfirmed rows dropped, no person names out."""
import sqlite3

import pytest

from scripts.zerotrust import regen_digicore as r


def _con():
    con = sqlite3.connect(":memory:")
    con.executescript(
        """
        CREATE TABLE evidence(evidence_id TEXT, claim TEXT, source TEXT, verified INT, checked_on TEXT);
        INSERT INTO evidence VALUES
          ('E1', 'c', 'https://example.org/a ; note', 1, 'd'),
          ('E2', 'c', 'digicore-rwe-workshop-2026/Session 2_Some Speaker.pdf p.3', 1, 'd'),
          ('E3', 'c', 'https://vendor.example/ (company claim)', 0, 'd'),
          ('E4', 'c', 'author notes', 0, 'd');
        CREATE TABLE mentions(canonical TEXT, type TEXT);
        INSERT INTO mentions VALUES ('Jane Doerling', 'person'), ('R. Exampleton', 'person');
        CREATE TABLE use_cases(speaker TEXT);
        INSERT INTO use_cases VALUES ('Some Speaker');
        """
    )
    return con


def test_row_meta_keeps_confirmed_and_company_claims_only():
    ev = r.evidence_map(_con())
    assert r.row_meta(ev, "E1")["src"] == ["https://example.org/a"]
    assert r.row_meta(ev, "E1,E3")["status"] == "company claim"
    assert r.row_meta(ev, "E1,E4") is None  # any unconfirmed source drops the row
    assert r.row_meta(ev, "") is None
    assert r.row_meta(ev, "E1", "text [CONFIRM]") is None


def test_slide_sources_do_not_leak_file_names():
    ev = r.evidence_map(_con())
    meta = r.row_meta(ev, "E2")
    assert meta == {"status": "confirmed", "src": [], "slides": True}


def test_unknown_evidence_id_fails_loudly():
    with pytest.raises(r.PublicationError):
        r.row_meta(r.evidence_map(_con()), "E99")


def test_redact_then_guard_removes_people():
    con = _con()
    tokens = r.person_names(con)
    payload = {"rows": [{"desc": "Founded by Jane Doerling; editor Ricardo Exampleton; led by K. Smith.",
                         "src": ["https://x.org/Doerling"], "name": "Doerling Foundation"}]}
    out = r.redact(payload, r.full_person_names(con), tokens)
    desc = out["rows"][0]["desc"]
    assert "Doerling" not in desc and "Exampleton" not in desc and "Smith" not in desc
    assert out["rows"][0]["src"] == ["https://x.org/Doerling"]  # URLs stay verbatim
    with pytest.raises(r.PublicationError):
        r.guard_people(payload, tokens, set())
