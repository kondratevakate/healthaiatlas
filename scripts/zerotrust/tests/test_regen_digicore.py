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


def test_company_claim_needs_explicit_marker():
    con = _con()
    con.executescript(
        """
        INSERT INTO evidence VALUES
          ('E5', 'c', 'https://vendor.example/ (company page, subagent check)', 0, 'd'),
          ('E6', 'c', 'https://casestudies.example/company/vendor/', 0, 'd'),
          ('E7', 'c', 'https://vendor.example/ (company claims, subagent check)', 0, 'd');
        """
    )
    ev = r.evidence_map(con)
    assert ev["E5"]["status"] == "unconfirmed"
    assert ev["E6"]["status"] == "unconfirmed"
    assert ev["E7"]["status"] == "company claim"


def test_short_and_one_word_names_are_caught():
    con = _con()
    con.executescript("INSERT INTO mentions VALUES ('Li Wu', 'person'), ('Cher', 'person');")
    tokens, names = r.person_names(con), r.full_person_names(con)
    assert {"Li", "Wu", "Cher"} <= tokens
    out = r.redact({"desc": "Interview with Cher and Dr Li Wu."}, names, tokens)
    assert "Cher" not in out["desc"] and "Wu" not in out["desc"]
    with pytest.raises(r.PublicationError):
        r.guard_people({"desc": "Interview with Cher."}, tokens, names)


def test_surname_in_org_name_is_exempt_only_in_that_field():
    con = _con()
    tokens, names = r.person_names(con), r.full_person_names(con)
    payload = {"orgMap": [{"name": "Doerling Foundation", "desc": "Started by Mr Doerling."}]}
    out = r.redact(payload, names, tokens)
    assert out["orgMap"][0]["name"] == "Doerling Foundation"
    assert "Doerling" not in out["orgMap"][0]["desc"]
    r.guard_people(out, tokens, names)  # passes: the name field alone is exempt
    with pytest.raises(r.PublicationError):
        r.guard_people(payload, tokens, names)  # unredacted desc still fails


def test_ordinary_words_and_acronyms_are_not_names():
    con = _con()
    con.executescript("INSERT INTO mentions VALUES ('Per Young', 'person');")
    tokens, names = r.person_names(con), r.full_person_names(con)
    r.guard_people({"desc": "young people; cost per patient; the NELSON trial"}, tokens | {"Nelson"}, names)


def test_url_hits_are_warnings_not_redactions():
    con = _con()
    tokens, names = r.person_names(con), r.full_person_names(con)
    warnings = r.guard_people({"src": ["https://x.org/people/Doerling"]}, tokens, names)
    assert warnings and "Doerling" in warnings[0]
