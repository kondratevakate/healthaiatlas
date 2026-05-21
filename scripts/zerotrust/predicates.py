"""Canonical predicates for the zero-trust claims table.

A predicate is the *kind* of fact being asserted about an entity.
Locked vocabulary — extractors must map their source columns to one of these,
or extend this file with a new predicate (with reviewer sign-off).

Why locked: Airtable filters and frontend dispatch both key off these strings.
Free-form predicates would silently fragment the dataset.

Format: predicate_id -> (value_kind, description)
  value_kind in {"text", "number", "date", "entity_ref", "url"}
"""

PREDICATES: dict[str, tuple[str, str]] = {
    # ── lifecycle / identity ──
    "founded_in_year":          ("number", "Company / org was founded in this year"),
    "headquartered_in":         ("text",   "City or country of HQ"),
    "operates_in_jurisdiction": ("text",   "Active commercial / clinical presence"),
    "ceased_operations_in":     ("date",   "Shutdown / wound down"),
    "renamed_to":               ("entity_ref", "Renamed / rebranded"),

    # ── product / capability ──
    "released_product":         ("text",   "Public release of a product / model / dataset"),
    "released_in_year":         ("number", "Year a named product was released"),
    "uses_modality":            ("text",   "Modality: small_molecule, protein, genomics, …"),
    "covers_decision_point":    ("text",   "Decision point in the workflow (target_id, admet, …)"),
    "addresses_workflow_step":  ("text",   "Cancer / clinical workflow step covered"),

    # ── funding / corporate finance ──
    "funding_round":            ("text",   "Round name: seed / A / B / C / strategic"),
    "funding_amount_usd_m":     ("number", "Round size in millions USD"),
    "lead_investor":            ("text",   "Lead investor for this round"),
    "valuation_usd_m":          ("number", "Post-money valuation in millions USD"),
    "ipo_proceeds_usd_m":       ("number", "IPO gross proceeds in millions USD"),
    "ma_value_usd_m":           ("number", "M&A deal value in millions USD"),
    "acquired_by":              ("entity_ref", "Acquirer"),

    # ── partnerships / deployments ──
    "partnered_with":           ("entity_ref", "Strategic / commercial partnership"),
    "deployed_at":              ("entity_ref", "Product is in production at this entity"),
    "pharma_deal_value_usd_m":  ("number", "Disclosed pharma deal headline value"),

    # ── regulatory ──
    "fda_clearance":            ("text",   "FDA clearance / authorization (510k, De Novo, PMA)"),
    "regulatory_event":         ("text",   "Other regulator action (EMA, NMPA, MHRA, …)"),
    "clinical_trial_phase":     ("text",   "Phase of a named trial"),
    "clinical_trial_result":    ("text",   "Topline result of a named trial"),

    # ── revenue / metrics ──
    "revenue_usd_m":            ("number", "Reported annual revenue in millions USD"),
    "users_count":              ("number", "Reported user / customer count"),
    "metric":                   ("text",   "Other reported metric — use sparingly, prefer a typed predicate"),

    # ── people ──
    "founder":                  ("text",   "Founder name"),
    "ceo":                      ("text",   "Current CEO"),

    # ── academic / scientific ──
    "publication":              ("text",   "Paper / preprint title"),
    "publication_url":          ("url",    "Paper / preprint URL"),

    # ── workforce / operations ──
    "layoffs_count":            ("number", "Layoff event headcount"),
    "headcount":                ("number", "Reported headcount"),

    # ── ecosystem / event ──
    "ecosystem_event":          ("text",   "Conference, regulation, market event with no clean predicate"),
}

VALID_PREDICATES = frozenset(PREDICATES.keys())


def is_valid(predicate: str) -> bool:
    return predicate in VALID_PREDICATES


def value_kind(predicate: str) -> str:
    return PREDICATES[predicate][0]
