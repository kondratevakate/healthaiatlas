"""Import AI Life Sciences landscape v4 Excel into typed TypeScript data file.

Source:  C:/Projects/data/aiatls/AI_LifeSci_Landscape_v4.xlsx
Target:  frontend/src/data/aiLifeSciences.ts

The Excel is the single source of truth for the AI Life Sciences hub.
Cluster taxonomy is editorial (frozen from user-supplied snapshots), not
derived from the Excel's Technology_Layer column. Mapping rules:
  1. COMPANY_TO_CLUSTER takes precedence (handles cases where the Excel
     mis-tags a company, e.g. Neuralink under clinical_decision_support).
  2. LAYER_TO_CLUSTER is the fallback.
  3. Unmappable rows are dropped with a printed warning.

Compliance: every emitted entry has a primary-source URL. Rows without
Source_URL are dropped (we do not ship un-evidenced claims).

Usage:  python scripts/import-ai-life-sciences.py
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

import openpyxl

REPO_ROOT = Path(__file__).resolve().parents[1]
EXCEL_PATH = Path(r"C:\Projects\data\aiatls\AI_LifeSci_Landscape_v4.xlsx")
OUT_PATH = REPO_ROOT / "frontend" / "src" / "data" / "aiLifeSciences.ts"


# ---------------------------------------------------------------------------
# Cluster taxonomy — frozen from the user's two snapshot images.
# Each cluster carries hand-curated highlights + a manual revenue estimate.
# ---------------------------------------------------------------------------

CLUSTERS = [
    # In-frame (main treemap)
    dict(
        id="diagnostics_imaging", label="Diagnostics & imaging AI",
        family="care_delivery", off_frame=False,
        revenue_usd_m=6000,
        highlights=[
            "~75% of FDA-cleared AI medical devices",
            "Radiology, ophthalmology, cardio, pathology",
            "Aidoc, Viz.ai, RapidAI, Heartflow, PathAI, Lunit",
            "Mayo: 3-year pancreatic pre-diagnosis",
            "~$5–7B revenue (2025)",
        ],
    ),
    dict(
        id="hospital_ops", label="Hospital ops / RCM / scribes",
        family="care_delivery", off_frame=False,
        revenue_usd_m=1200,
        highlights=[
            "Microsoft Dragon Copilot ~32%",
            "Abridge 30%, Ambience 13%",
            "Suki 10%, Nabla 4%, Freed 4%",
            "Epic ambient launched Sep 2025 (~$80/mo)",
            "$1B+ VC raised in 2025",
            "JAMA: ~13 min/day saved per clinician",
        ],
    ),
    dict(
        id="surgical_robotics", label="Surgical robotics",
        family="care_delivery", off_frame=False,
        revenue_usd_m=8000,
        highlights=[
            "Intuitive Surgical (incumbent)",
            "Figure, NVIDIA GR00T (humanoid pipeline)",
            "Aleph Surgical (SPC-backed)",
            "Strut Motors (SPC-backed)",
        ],
    ),
    dict(
        id="mental_consumer", label="Mental + consumer",
        family="care_delivery", off_frame=False,
        revenue_usd_m=200,
        highlights=[
            "Legion Health (FDA refills)",
            "Jimini, Bravely (mental health)",
            "Aspect (PCOS + CGM)",
            "Rarus, Novami",
        ],
    ),
    dict(
        id="clinical_ai_agents", label="Clinical AI agents",
        family="care_delivery", off_frame=False,
        revenue_usd_m=400,
        highlights=[
            "OpenAI, DeepMind, Anthropic clinician copilots",
            "Big-lab decision support layer",
            "Open Evidence, Hippocratic AI, K Health",
            "Cheatham (Breyer) thesis",
        ],
    ),
    dict(
        id="ai_drug_discovery", label="AI drug discovery + vertical operators",
        family="discovery_rd", off_frame=False,
        revenue_usd_m=300,
        highlights=[
            "Isomorphic Labs (ISM8969 FDA-cleared)",
            "Recursion–Exscientia merged",
            "Insilico, XtalPi, Pathos AI, Insitro",
            "Lilly: #14→#1 on CB Insights",
            "$3B+ pharma deal value (Novartis-Iso)",
        ],
    ),
    dict(
        id="pure_ml_biology", label="Pure ML for biology",
        family="discovery_rd", off_frame=False,
        revenue_usd_m=50,
        highlights=[
            "EvolutionaryScale (ESM3, $142M)",
            "Chai Discovery ($225M+)",
            "Profluent ($150M)",
            "Latent Labs ($50M, S. Kohl)",
        ],
    ),
    dict(
        id="longevity_aging", label="Longevity / aging",
        family="therapeutic", off_frame=False,
        revenue_usd_m=None,  # pre-revenue
        highlights=[
            "Altos Labs ($3B, 2022)",
            "Retro Biosciences ($180M)",
            "Loyal ($58M), NewLimit ($40M)",
            "Calico (Alphabet, internal)",
            "LBF8 alum: Powerhouse, Matter Bio",
            "Lilly GLP-1 (A. Adams)",
        ],
    ),
    dict(
        id="bci_neurotech", label="BCI / neurotech",
        family="therapeutic", off_frame=False,
        revenue_usd_m=None,  # pre-revenue
        highlights=[
            "Neuralink ($363M+) @ CCAD UAE",
            "Synchron ($145M)",
            "Precision Neuro ($102M)",
            "Paradromics, Inbrain (noninvasive BCI)",
        ],
    ),
    dict(
        id="ai_infra", label="AI infra / research",
        family="ai_infra", off_frame=False,
        revenue_usd_m=None,
        highlights=[
            "Zyphra (ZAYA1 + Maia + AMD inference cloud)",
            "Sentra, MAPPA, Vmax",
            "General-purpose AI infra (not bio-specific)",
        ],
    ),
    dict(
        id="regulatory", label="Regulatory frameworks",
        family="meta", off_frame=False,
        revenue_usd_m=None,
        highlights=[
            "FDA Elsa internal tool",
            "EU AI Act + MDR",
            "NMPA (China), PMDA (Japan), MFDS (Korea)",
            "Cross-jurisdiction harmonisation",
        ],
    ),
    # Off-frame (capital flows outside main VC count)
    dict(
        id="frontier_labs", label="Frontier AI labs (general-purpose)",
        family="ai_infra", off_frame=True,
        revenue_usd_m=10000,
        highlights=[
            "Anthropic, OpenAI, DeepMind, Mistral, xAI",
            "$100B+ aggregate VC, general-purpose",
            "Bio touch: Claude HC, AlphaFold, Med-PaLM",
        ],
    ),
    dict(
        id="pharma_corp_rd", label="Pharma corporate AI R&D",
        family="discovery_rd", off_frame=True,
        revenue_usd_m=None,
        highlights=[
            "Lilly (T. Fuchs CAIO), Novartis, Roche",
            "Sanofi, AstraZeneca, Pfizer internal",
            "~$10B+ corp spend (est., not VC)",
        ],
    ),
    dict(
        id="china_biotech", label="China AI biotech",
        family="discovery_rd", off_frame=True,
        revenue_usd_m=None,
        highlights=[
            "DeepSeek med, Alibaba, SenseTime, BGI",
            "Tencent health, Insilico HK programs",
            "APAC biotech 2024: $2.5B (mostly non-VC)",
        ],
    ),
    dict(
        id="public_market", label="Public market AI biotech",
        family="meta", off_frame=True,
        revenue_usd_m=None,
        highlights=[
            "Insilico HKEX IPO ($293M, Dec 2025)",
            "Caris Life Sciences ($494M IPO)",
            "Recursion (NASDAQ), Eikon (2026 IPO)",
        ],
    ),
]

CLUSTER_IDS = {c["id"] for c in CLUSTERS}

FAMILY_COLORS = {
    "care_delivery": "hsl(8 60% 30%)",
    "discovery_rd": "hsl(165 50% 25%)",
    "therapeutic": "hsl(265 35% 35%)",
    "ai_infra": "hsl(215 50% 30%)",
    "meta": "hsl(0 0% 25%)",
}


# ---------------------------------------------------------------------------
# Company → cluster mapping. Always wins over the layer fallback.
# ---------------------------------------------------------------------------

COMPANY_TO_CLUSTER = {
    # Diagnostics & imaging
    "Aidoc": "diagnostics_imaging",
    "Viz.ai": "diagnostics_imaging",
    "Heartflow": "diagnostics_imaging",
    "Lunit": "diagnostics_imaging",
    "PathAI": "diagnostics_imaging",
    "Mayo Clinic": "diagnostics_imaging",
    "Lumexa Imaging": "diagnostics_imaging",
    "Truveta": "diagnostics_imaging",
    "Digital Diagnostics / IDx": "diagnostics_imaging",
    "SOPHiA GENETICS": "diagnostics_imaging",
    "Caris Life Sciences": "public_market",
    "Isensee et al. / DKFZ": "pure_ml_biology",
    "Rajpurkar et al. / Stanford": "pure_ml_biology",
    "MedSAM team": "pure_ml_biology",
    "University Hospital Basel / TotalSegment": "pure_ml_biology",

    # Hospital ops / scribes
    "Abridge": "hospital_ops",
    "Ambience Healthcare": "hospital_ops",
    "Suki AI": "hospital_ops",
    "Microsoft Dragon Copilot": "hospital_ops",
    "Epic Systems": "hospital_ops",
    "Olive AI": "hospital_ops",
    "CodaMetrix": "hospital_ops",
    "Cohere Health": "hospital_ops",
    "Innovaccer": "hospital_ops",
    "Qventus": "hospital_ops",
    "Commure": "hospital_ops",
    "Heidi Health": "hospital_ops",
    "Veterans Health Administration": "hospital_ops",
    "Academic Studies": "hospital_ops",
    "JAMA Network Open / ambient scribe QI study": "hospital_ops",
    "NEJM AI / ambient scribe RCT": "hospital_ops",
    "Reuters / ambient scribe legal risks": "hospital_ops",
    "BIDMC / PhysioNet": "hospital_ops",
    "Stanford CRFM": "hospital_ops",
    "Stanford BMIR": "hospital_ops",

    # Surgical robotics
    "Intuitive Surgical": "surgical_robotics",
    "Figure": "surgical_robotics",
    "NVIDIA": "surgical_robotics",
    "Aleph Surgical": "surgical_robotics",
    "Strut Motors": "surgical_robotics",

    # Mental + consumer
    "Legion Health": "mental_consumer",
    "Aspect Health": "mental_consumer",
    "Bravely": "mental_consumer",
    "Jimini Health": "mental_consumer",
    "Rarus Health": "mental_consumer",

    # Clinical AI agents
    "Hippocratic AI": "clinical_ai_agents",
    "Hippocratic AI / BCG": "clinical_ai_agents",
    "OpenEvidence": "clinical_ai_agents",
    "Glass Health": "clinical_ai_agents",
    "Assort Health": "clinical_ai_agents",
    "Stanford / Harvard": "clinical_ai_agents",
    "MedHallu benchmark": "clinical_ai_agents",
    "npj Digital Medicine summarisation study": "clinical_ai_agents",
    "Novartis": "clinical_ai_agents",  # clinical_development_agent

    # Frontier labs (off-frame)
    "OpenAI": "frontier_labs",
    "Anthropic": "frontier_labs",
    "Google DeepMind": "frontier_labs",
    "Microsoft AI": "frontier_labs",
    "Thinking Machines Lab": "frontier_labs",
    "OpenAI / Los Alamos National Laboratory": "frontier_labs",

    # Pharma corp R&D (off-frame)
    "Eli Lilly": "pharma_corp_rd",
    "Roche": "pharma_corp_rd",
    "Roche / Genentech": "pharma_corp_rd",
    "AstraZeneca": "pharma_corp_rd",
    "AstraZeneca / CSPC": "pharma_corp_rd",
    "Takeda": "pharma_corp_rd",
    "Pfizer": "pharma_corp_rd",
    "Novartis / Isomorphic Labs": "pharma_corp_rd",

    # Public market biotech (off-frame)
    "Frontier AI labs (aggregate)": "frontier_labs",
    "Pharma corporate AI R&D (aggregate)": "pharma_corp_rd",
    "China AI biotech (aggregate)": "china_biotech",
    "Public market AI biotech (aggregate)": "public_market",

    # AI drug discovery (verticals)
    "Isomorphic Labs": "ai_drug_discovery",
    "Recursion Pharmaceuticals": "ai_drug_discovery",
    "Insilico Medicine": "ai_drug_discovery",
    "Lila Sciences": "ai_drug_discovery",
    "BenevolentAI": "ai_drug_discovery",
    "XtalPi": "ai_drug_discovery",
    "Eikon Therapeutics": "ai_drug_discovery",
    "Exscientia": "ai_drug_discovery",
    "Generate Biomedicines": "ai_drug_discovery",
    "Numab Therapeutics": "ai_drug_discovery",
    "Xaira Therapeutics": "ai_drug_discovery",
    "Pathos AI": "ai_drug_discovery",
    "insitro": "ai_drug_discovery",
    "Insitro": "ai_drug_discovery",
    "Iambic Therapeutics": "ai_drug_discovery",
    "Genesis Therapeutics": "ai_drug_discovery",
    "Atomwise": "ai_drug_discovery",
    "Terray Therapeutics": "ai_drug_discovery",
    "Formation Bio": "ai_drug_discovery",
    "Absci": "ai_drug_discovery",
    "Nimbus Therapeutics": "ai_drug_discovery",
    "Vividion Therapeutics": "ai_drug_discovery",
    "HAYA Therapeutics": "ai_drug_discovery",
    "Cradle": "ai_drug_discovery",
    "Endogena Therapeutics": "ai_drug_discovery",
    "Araris Biotech": "ai_drug_discovery",
    "NUCLIDIUM": "ai_drug_discovery",
    "Adaptyv Biosystems": "ai_drug_discovery",
    "Reconnect Labs": "ai_drug_discovery",
    "ALP Bio": "ai_drug_discovery",
    "Switzerland TechBio sector": "ai_drug_discovery",
    "Schrödinger / Nimbus / Takeda": "ai_drug_discovery",
    "Schrõdinger / Nimbus / Takeda": "ai_drug_discovery",
    "EMBL-EBI": "ai_drug_discovery",
    "BindingDB": "ai_drug_discovery",
    "EMBL-EBI / Wellcome Sanger / GSK": "ai_drug_discovery",
    "Harvard / MIT / Pfizer (TDC)": "ai_drug_discovery",
    "Buttenschoen et al. / Oxford": "ai_drug_discovery",
    "Epoch AI / Arc Institute": "ai_drug_discovery",

    # Pure ML for biology
    "EvolutionaryScale": "pure_ml_biology",
    "Chai Discovery": "pure_ml_biology",
    "Profluent Bio": "pure_ml_biology",
    "Latent Labs": "pure_ml_biology",
    "Meta / CZI Biohub": "pure_ml_biology",
    "InstaDeep / EMBL-EBI": "pure_ml_biology",
    "Boltz project": "pure_ml_biology",
    "Arc Institute / Evo2": "pure_ml_biology",
    "Google DeepMind / Isomorphic Labs": "pure_ml_biology",

    # Longevity
    "Altos Labs": "longevity_aging",
    "Retro Biosciences": "longevity_aging",
    "Loyal": "longevity_aging",
    "NewLimit": "longevity_aging",
    "Longevity Biotech Fellowship": "longevity_aging",

    # BCI
    "Neuralink": "bci_neurotech",
    "Synchron": "bci_neurotech",
    "Precision Neuroscience": "bci_neurotech",

    # AI infra
    "Zyphra": "ai_infra",
    "Sentra": "ai_infra",
    "Vmax (research)": "ai_infra",
    "MAPPA (research framework)": "ai_infra",
    "South Park Commons": "ai_infra",

    # Regulatory
    "FDA": "regulatory",
    "European Commission": "regulatory",
    "NMPA (China)": "regulatory",
    "PMDA (Japan)": "regulatory",
    "MFDS (Korea)": "regulatory",
    "CMS": "regulatory",
    "Healthcare AI sector (aggregate)": "regulatory",
}

LAYER_TO_CLUSTER = {
    "drug_discovery_AI": "ai_drug_discovery",
    "AI_drug_design": "ai_drug_discovery",
    "AI_first_biotech": "ai_drug_discovery",
    "AIfirstbiotech": "ai_drug_discovery",
    "small_molecule_clinical": "ai_drug_discovery",
    "smallmoleculedataset": "ai_drug_discovery",
    "bindingaffinitydataset": "ai_drug_discovery",
    "targetidentificationplatform": "ai_drug_discovery",
    "drugdiscoverybenchmark": "ai_drug_discovery",
    "dockingvalidationbenchmark": "ai_drug_discovery",
    "computational_chemistry": "ai_drug_discovery",
    "biologicalfoundationmodel": "pure_ml_biology",
    "life_science_foundation_model": "pure_ml_biology",
    "genomicsfoundationmodel": "pure_ml_biology",
    "genomics_foundation_model": "pure_ml_biology",
    "foundation_model_for_omics": "pure_ml_biology",
    "structure_interaction_model": "pure_ml_biology",
    "imaging_foundation_model": "pure_ml_biology",
    "imagingfoundationmodel": "pure_ml_biology",
    "clinical_documentation_AI": "hospital_ops",
    "ambientscribe": "hospital_ops",
    "ambientscribeRCT": "hospital_ops",
    "hybridCDSscribe": "hospital_ops",
    "EHRdataset": "hospital_ops",
    "EHRinstructionbenchmark": "hospital_ops",
    "EHRfoundationbenchmark": "hospital_ops",
    "RWE_platform": "diagnostics_imaging",
    "radiology_AI": "diagnostics_imaging",
    "computational_pathology": "diagnostics_imaging",
    "autonomousDiagnosticAI": "diagnostics_imaging",
    "clinicogenomic_multimodal": "diagnostics_imaging",
    "conversational_AI": "clinical_ai_agents",
    "clinical_agent": "clinical_ai_agents",
    "evidence_grounded_LLM": "clinical_ai_agents",
    "evidencegroundedLLM": "clinical_ai_agents",
    "clinical_decision_support": "clinical_ai_agents",
    "clinical_development_agent": "clinical_ai_agents",
    "clinicaltaskbenchmark": "clinical_ai_agents",
    "clinicianbenchmark": "clinical_ai_agents",
    "clinical_benchmark": "clinical_ai_agents",
    "evaluation_benchmark": "clinical_ai_agents",
    "eval_framework": "clinical_ai_agents",
    "workflow_AI_infrastructure": "ai_infra",
    "infrastructure": "ai_infra",
    "regulatory": "regulatory",
}


# ---------------------------------------------------------------------------
# Value normalisation tables
# ---------------------------------------------------------------------------

def norm_lower(v):
    if v is None:
        return None
    s = str(v).strip()
    return s if s else None


def norm_underscore(v):
    """RD → R&D, globalavailable → global_available, peerreviewed → peer_reviewed."""
    if v is None:
        return None
    s = str(v).strip()
    table = {
        "RD": "R&D",
        "globalavailable": "global_available",
        "USonly": "US_only",
        "peerreviewed": "peer_reviewed",
        "preclinicalpredictive": "preclinical_predictive",
        "investorannouncement": "investor_announcement",
        "internalbenchmark": "internal_benchmark",
        "companyannouncement": "company_announcement",
        "vendorclaim": "vendor_claim",
        "newsreport": "news_report",
        "vendorannouncement": "vendor_announcement",
        "FDAcleared": "FDA_cleared",
        "exactdate": "exact_date",
        "yearonly": "year_only",
        "pressreleaseonly": "press_release_only",
        "FDApublicreview": "FDA_public_review",
        "publicresourceknown": "public_resource_known",
        "journalismonly": "journalism_only",
        "benchmarkonly": "benchmark_only",
        "operationsonly": "operations_only",
        "noresearchonly": "research_only",
        "researchonly": "research_only",
        "frontierlab": "frontier_lab",
        "openbenchmark": "open_benchmark",
        "opendataset": "open_dataset",
        "opensourcetool": "open_source_tool",
        "clinicalagentcompany": "clinical_agent_company",
        "safetystudy": "safety_study",
        "vendorcase_study": "vendor_case_study",
        "vendor_case_study": "vendor_case_study",
        "trustandgrounding": "trust_and_grounding",
        "pipelinerisk": "pipeline_risk",
        "safetyinfrastructure": "safety_infrastructure",
        "regulatorycommercialization": "regulatory_commercialization",
        "evaluationinfrastructure": "evaluation_infrastructure",
        "workflowefficiency": "workflow_efficiency",
        "RDproductivity": "R&D_productivity",
        "MedicalAffairs": "Medical_Affairs",
        "MedicalAffairs HEOR": "Medical_Affairs_HEOR",
        "MedicalAffairs Legal": "Medical_Affairs_Legal",
        "BD RD": "BD_R&D",
        "imagingcorelab": "imaging_core_lab",
        "clinicaloperations": "clinical_operations",
        "clinicaloperations CMO": "clinical_operations_CMO",
        "computationalchemist": "computational_chemist",
        "computationalresearcher": "computational_researcher",
        "computationalbiologist": "computational_biologist",
    }
    return table.get(s, s)


def parse_amount_to_usd_m(s):
    """'$1.0B' → 1000.0, '$293M' → 293.0, None → 0."""
    if s is None:
        return 0.0
    s = str(s).strip().replace(",", "")
    if not s:
        return 0.0
    s = s.replace("$", "")
    if s.lower() in ("none", "n/a", "—", "-"):
        return 0.0
    suffix = s[-1] if s and s[-1] in "BMKbmk" else ""
    body = s[:-1] if suffix else s
    try:
        n = float(body)
    except ValueError:
        return 0.0
    mult = {"B": 1000, "M": 1, "K": 0.001}.get(suffix.upper(), 1)
    return n * mult


def date_to_decimal_year(d):
    if d is None:
        return None
    if isinstance(d, datetime):
        # decimal year = year + (day_of_year - 1) / days_in_year
        is_leap = d.year % 4 == 0 and (d.year % 100 != 0 or d.year % 400 == 0)
        days = 366 if is_leap else 365
        return d.year + (d.timetuple().tm_yday - 1) / days
    return None


def normalise_geo(v):
    if v is None:
        return None
    s = str(v).strip()
    table = {
        "US": "USA",
        "UK / USA": "UK/USA",
        "USA / UK": "USA/UK",
        "Switzerland / USA": "Switzerland/USA",
        "China / USA": "China/USA",
        "Asia / Global": "Asia",
        "USA / Australia": "USA/Australia",
    }
    return table.get(s, s)


def normalise_entity_type(v):
    if v is None:
        return "vendor"
    s = str(v).strip()
    table = {
        "frontierlab": "frontier_lab",
        "openbenchmark": "open_benchmark",
        "opendataset": "open_dataset",
        "opensourcetool": "open_source_tool",
        "open_source_tool": "open_source_tool",
        "AIfirstbiotech": "AI_first_biotech",
        "AI_first_biotech": "AI_first_biotech",
        "clinicalagentcompany": "clinical_agent_company",
        "safetystudy": "safety_study",
        "benchmark": "open_benchmark",
        "evidence": "evidence",
    }
    return table.get(s, s)


# ---------------------------------------------------------------------------
# TS emission helpers
# ---------------------------------------------------------------------------

def ts_string(s):
    if s is None:
        return "''"
    s = str(s)
    # Clean mojibake (en-dash imported as �)
    s = s.replace("�", "—")
    s = s.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ").replace("\r", "")
    s = re.sub(r"\s+", " ", s).strip()
    return f"'{s}'"


def ts_value(v):
    if v is None:
        return "undefined"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        if isinstance(v, float) and v.is_integer():
            return str(int(v))
        return f"{v:.4f}".rstrip("0").rstrip(".") if isinstance(v, float) else str(v)
    if isinstance(v, list):
        return "[" + ", ".join(ts_value(x) for x in v) + "]"
    return ts_string(v)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if not EXCEL_PATH.exists():
        sys.exit(f"Excel not found: {EXCEL_PATH}")

    file_hash = hashlib.md5(EXCEL_PATH.read_bytes()).hexdigest()[:12]

    wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
    ws = wb["AI Life Sciences Events"]
    headers = [c.value for c in ws[1]]
    raw_rows = list(ws.iter_rows(min_row=2, values_only=True))

    def col(row, name):
        return row[headers.index(name)]

    # Filter + map rows
    bubbles = []
    cluster_agg = defaultdict(lambda: {
        "vc_disclosed_usd_m": 0.0,
        "ma_value_usd_m": 0.0,
        "ipo_proceeds_usd_m": 0.0,
        "fda_clearances": 0,
        "pharma_deal_value_usd_m": 0.0,
        "event_count": 0,
        "companies": set(),
    })
    dropped = []

    for row in raw_rows:
        company = col(row, "Company")
        if not company:
            continue
        company = str(company).strip()
        # Strip mojibake artefacts in company names
        company = company.replace("�", "—")

        src = col(row, "Source_URL")
        if not src or str(src).strip().lower() in ("", "none", "n/a"):
            dropped.append((company, "no source URL"))
            continue
        src = str(src).strip()

        layer_raw = col(row, "Technology_Layer")
        layer = norm_underscore(layer_raw)

        cluster = COMPANY_TO_CLUSTER.get(company)
        if not cluster:
            cluster = LAYER_TO_CLUSTER.get(layer)
        if not cluster or cluster not in CLUSTER_IDS:
            dropped.append((company, f"unmapped (layer={layer})"))
            continue

        event_type = col(row, "Event_Type") or "Event"
        date = col(row, "Date")
        d_year = date_to_decimal_year(date)
        if d_year is None:
            dropped.append((company, "no date"))
            continue

        funding_amt = parse_amount_to_usd_m(col(row, "Funding_Amount"))
        deal_value = parse_amount_to_usd_m(col(row, "Deal_Value"))
        amount_for_bubble = max(funding_amt, deal_value)

        desc = col(row, "Event_Description") or ""
        product = col(row, "Product_Name") or ""

        confidence = norm_lower(col(row, "Confidence")) or "medium"
        source_type = norm_lower(col(row, "Source_Type")) or "unknown"
        # Drop lowest-rigor entries
        if confidence == "low" and source_type == "unknown":
            dropped.append((company, "low confidence + unknown source"))
            continue

        reliability = col(row, "Reliability_Risk")
        try:
            reliability = int(reliability) if reliability is not None else None
        except (TypeError, ValueError):
            reliability = None

        stance = norm_lower(col(row, "Build_Buy_Partner"))
        if stance and stance not in ("build", "buy", "partner"):
            stance = None

        date_gran = norm_underscore(col(row, "Date_Granularity"))
        if date_gran and "exact" in date_gran:
            date_gran = "exact"
        elif date_gran and "month" in date_gran:
            date_gran = "month"
        elif date_gran and "year" in date_gran:
            date_gran = "year"
        else:
            date_gran = "year"

        entity_type = normalise_entity_type(col(row, "Entity_Type"))
        geo = normalise_geo(col(row, "Geographic_Market"))

        regulatory_status = norm_underscore(col(row, "Regulatory_Status")) or ""

        # Drug-discovery cluster swimlane mapping (modality + dp).
        # For non-drug clusters we leave dp/mod empty so they don't render in
        # the legacy modality-matrix view.
        mod, dp = derive_mod_dp(cluster, layer, desc, event_type, product, regulatory_status)

        bubbles.append(dict(
            c=company,
            p=str(product).strip() if product else "",
            dp=dp,
            d=round(d_year, 4),
            a=round(amount_for_bubble, 1),
            mod=mod,
            e="official" if confidence == "high" else "observed",
            et=event_type,
            desc=str(desc).strip(),
            src=src,
            cluster=cluster,
            entityType=entity_type,
            stance=stance,
            reliability=reliability,
            confidence=confidence,
            dateGranularity=date_gran,
            geo=geo,
        ))

        # Aggregate to cluster signals
        agg = cluster_agg[cluster]
        agg["event_count"] += 1
        agg["companies"].add(company)
        if event_type == "Funding_Round":
            agg["vc_disclosed_usd_m"] += funding_amt
        elif event_type == "Acquisition":
            agg["ma_value_usd_m"] += max(funding_amt, deal_value)
        elif event_type == "IPO":
            agg["ipo_proceeds_usd_m"] += funding_amt
        elif event_type in ("FDA_Clearance",):
            agg["fda_clearances"] += 1
        elif event_type == "Pharma_Deal":
            agg["pharma_deal_value_usd_m"] += deal_value
        if regulatory_status in ("FDA_cleared", "FDAcleared"):
            agg["fda_clearances"] += 1

    # Pretty-print drops summary
    if dropped:
        print(f"Dropped {len(dropped)} rows:", file=sys.stderr)
        from collections import Counter
        reasons = Counter(reason for _, reason in dropped)
        for reason, n in reasons.most_common():
            print(f"  {n:4d}  {reason}", file=sys.stderr)

    print(f"Imported {len(bubbles)} entries across {len(cluster_agg)} clusters.")

    # Build cluster output with merged signal aggregates
    cluster_out = []
    for c in CLUSTERS:
        cid = c["id"]
        a = cluster_agg.get(cid, {
            "vc_disclosed_usd_m": 0.0, "ma_value_usd_m": 0.0,
            "ipo_proceeds_usd_m": 0.0, "fda_clearances": 0,
            "pharma_deal_value_usd_m": 0.0, "event_count": 0,
            "companies": set(),
        })
        cluster_out.append({
            **c,
            "color": FAMILY_COLORS[c["family"]],
            "signals": {
                "revenue_usd_m": c["revenue_usd_m"],
                "vc_disclosed_usd_m": round(a["vc_disclosed_usd_m"], 1),
                "ma_value_usd_m": round(a["ma_value_usd_m"], 1),
                "ipo_proceeds_usd_m": round(a["ipo_proceeds_usd_m"], 1),
                "fda_clearances": a["fda_clearances"],
                "pharma_deal_value_usd_m": round(a["pharma_deal_value_usd_m"], 1),
                "event_count": a["event_count"],
            },
            "company_count": len(a["companies"]),
        })

    # Validation gates
    for c in cluster_out:
        if c["signals"]["event_count"] == 0:
            print(f"WARN: cluster {c['id']} has 0 events", file=sys.stderr)

    write_ts(bubbles, cluster_out, file_hash)
    print(f"Wrote {OUT_PATH}")


def derive_mod_dp(cluster, layer, desc, event_type, product, reg_status):
    """Best-effort map an Excel row onto the legacy modality + decision-point
    axes. Used only for drug-discovery cluster entries where the swimlane's
    drug-pipeline framing applies. Returns ('', '') for non-drug clusters."""
    if cluster != "ai_drug_discovery" and cluster != "pure_ml_biology":
        return "", ""

    text = f"{desc} {product} {layer or ''}".lower()

    # Modality
    if any(k in text for k in ("alphafold", "structure prediction", "boltz", "esm", "esmfold")):
        mod = "protein_structure"
    elif any(k in text for k in ("protein design", "rfdiffusion", "generate biomedicines", "chroma", "evolutionaryscale", "esm3", "profluent", "latent labs")):
        mod = "protein_design"
    elif any(k in text for k in ("rna ", "mrna", "atomic ai", "rna-target")):
        mod = "rna_mrna"
    elif any(k in text for k in ("crispr", "gene-editor", "genomics foundation", "evo2", "nucleotide")):
        mod = "genomics"
    elif any(k in text for k in ("multi-omics", "rwe ")):
        mod = "multi_omics"
    elif any(k in text for k in ("platform", "bionemo", "knowledge graph", "lila ", "infrastructure")):
        mod = "platform"
    else:
        mod = "small_molecule"

    # Decision point — reuse drug-pipeline taxonomy
    if any(k in text for k in ("phase 1", "phase 2", "phase 3", "clinical trial", "in human", "first-in-human", "ind ", "fda cleared", "fda_cleared")):
        dp = "clinical_trial_design"
    elif any(k in text for k in ("admet", "toxicity")):
        dp = "admet"
    elif any(k in text for k in ("structure prediction", "alphafold")):
        dp = "structure_prediction"
    elif any(k in text for k in ("protein design", "generate biomedicines", "esm3", "rfdiffusion")):
        dp = "protein_design"
    elif any(k in text for k in ("hit ", "hit identification", "screening")):
        dp = "hit_id"
    elif any(k in text for k in ("lead optimization", "lead opt")):
        dp = "lead_optimization"
    elif any(k in text for k in ("target ", "target id", "target identification")):
        dp = "target_id"
    elif any(k in text for k in ("biomarker", "diagnostic")):
        dp = "biomarker_discovery"
    elif any(k in text for k in ("multi-omics", "rwe")):
        dp = "multi_omics"
    elif any(k in text for k in ("preclinical",)):
        dp = "preclinical"
    elif event_type in ("Founding", "IPO", "Acquisition", "Pharma_Deal", "Funding_Round"):
        # Corporate/financial events — anchor on platform/generative_design
        dp = "generative_design"
    else:
        dp = "generative_design"

    return mod, dp


def write_ts(bubbles, clusters, file_hash):
    """Emit the typed TypeScript data file."""
    bubbles_sorted = sorted(bubbles, key=lambda b: (b["d"], b["c"], b["et"]))

    lines = []
    lines.append("// AI Frontiers in Life Sciences — global landscape data.")
    lines.append("// AUTO-GENERATED by scripts/import-ai-life-sciences.py")
    lines.append(f"// Source: AI_LifeSci_Landscape_v4.xlsx  (md5: {file_hash})")
    lines.append("// To regenerate: python scripts/import-ai-life-sciences.py")
    lines.append("//")
    lines.append("// Compliance rule: every entry has a primary-source URL.")
    lines.append("// Cluster taxonomy is editorial (frozen from user-supplied snapshots).")
    lines.append("")

    lines.append("export interface LSBubble {")
    lines.append("  c: string; p: string; dp: string; d: number; a: number;")
    lines.append("  mod: string; e: string; et: string; desc: string; src?: string;")
    lines.append("  cluster: string;")
    lines.append("  entityType: string;")
    lines.append("  stance?: 'build' | 'buy' | 'partner';")
    lines.append("  reliability?: number;")
    lines.append("  confidence?: 'high' | 'medium' | 'low';")
    lines.append("  dateGranularity?: 'exact' | 'month' | 'year';")
    lines.append("  geo?: string;")
    lines.append("}")
    lines.append("")
    lines.append("export interface LSReliability { c: string; d: string; p: string; src?: string; }")
    lines.append("")
    lines.append("export type LSClusterFamily = 'care_delivery' | 'discovery_rd' | 'therapeutic' | 'ai_infra' | 'meta';")
    lines.append("")
    lines.append("export interface LSClusterSignals {")
    lines.append("  revenue_usd_m: number | null;")
    lines.append("  vc_disclosed_usd_m: number;")
    lines.append("  ma_value_usd_m: number;")
    lines.append("  ipo_proceeds_usd_m: number;")
    lines.append("  fda_clearances: number;")
    lines.append("  pharma_deal_value_usd_m: number;")
    lines.append("  event_count: number;")
    lines.append("}")
    lines.append("")
    lines.append("export interface LSCluster {")
    lines.append("  id: string;")
    lines.append("  label: string;")
    lines.append("  family: LSClusterFamily;")
    lines.append("  color: string;")
    lines.append("  offFrame: boolean;")
    lines.append("  highlights: string[];")
    lines.append("  signals: LSClusterSignals;")
    lines.append("  companyCount: number;")
    lines.append("}")
    lines.append("")

    # Modality/DP order tables (preserved from previous schema for swimlane + matrix)
    lines.append("export const LS_MODALITY_LABELS: Record<string, string> = {")
    for k, v in [
        ("protein_structure", "Protein structure"),
        ("protein_design", "Protein design"),
        ("small_molecule", "Small-molecule discovery"),
        ("rna_mrna", "RNA / mRNA"),
        ("genomics", "Genomics / CRISPR"),
        ("multi_omics", "Multi-omics & RWE"),
        ("platform", "Platform / tooling"),
    ]:
        lines.append(f"  {k}: {ts_string(v)},")
    lines.append("};")
    lines.append("")
    lines.append("export const LS_MODALITY_COLORS: Record<string, string> = {")
    for k, v in [
        ("protein_structure", "hsl(180 70% 40%)"),
        ("protein_design", "hsl(195 70% 45%)"),
        ("small_molecule", "hsl(160 55% 40%)"),
        ("rna_mrna", "hsl(340 60% 55%)"),
        ("genomics", "hsl(280 50% 50%)"),
        ("multi_omics", "hsl(30 70% 50%)"),
        ("platform", "hsl(220 15% 45%)"),
    ]:
        lines.append(f"  {k}: {ts_string(v)},")
    lines.append("};")
    lines.append("")
    lines.append("export const LS_DP_ORDER = [")
    for k in [
        "target_id", "structure_prediction", "generative_design", "hit_id",
        "lead_optimization", "admet", "preclinical", "clinical_trial_design",
        "biomarker_discovery", "multi_omics",
    ]:
        lines.append(f"  {ts_string(k)},")
    lines.append("];")
    lines.append("")
    lines.append("export const LS_DP_LABELS: Record<string, string> = {")
    for k, v in [
        ("target_id", "Target ID"),
        ("structure_prediction", "Structure Prediction"),
        ("generative_design", "Generative Design"),
        ("hit_id", "Hit Identification"),
        ("lead_optimization", "Lead Optimization"),
        ("admet", "ADMET"),
        ("preclinical", "Preclinical"),
        ("clinical_trial_design", "Clinical Trials"),
        ("biomarker_discovery", "Biomarker Discovery"),
        ("multi_omics", "Multi-omics"),
    ]:
        lines.append(f"  {k}: {ts_string(v)},")
    lines.append("};")
    lines.append("")
    lines.append("export const LS_ET_LABELS: Record<string, string> = {")
    for k, v in [
        ("Model_Release", "Model release"),
        ("Product_Launch", "Product launch"),
        ("Publication", "Publication"),
        ("Funding_Round", "Funding"),
        ("IPO", "IPO"),
        ("Acquisition", "M&A"),
        ("Pharma_Deal", "Pharma deal"),
        ("Partnership", "Partnership"),
        ("Founding", "Founded"),
        ("Clinical_Trial", "Clinical trial"),
        ("Clinical_Trial_Result", "Trial result"),
        ("Regulatory", "Regulatory"),
        ("Regulatory_Milestone", "Regulatory"),
        ("FDA_Clearance", "FDA clearance"),
        ("Strategic_Investment", "Strategic invest."),
        ("Reliability_Gap", "Reliability gap"),
        ("Event", "Event"),
    ]:
        lines.append(f"  {k}: {ts_string(v)},")
    lines.append("};")
    lines.append("")

    # Family colors
    lines.append("export const LS_FAMILY_COLORS: Record<LSClusterFamily, string> = {")
    for k, v in FAMILY_COLORS.items():
        lines.append(f"  {k}: {ts_string(v)},")
    lines.append("};")
    lines.append("")
    lines.append("export const LS_FAMILY_LABELS: Record<LSClusterFamily, string> = {")
    for k, v in [
        ("care_delivery", "Care delivery"),
        ("discovery_rd", "Discovery / R&D"),
        ("therapeutic", "Therapeutic"),
        ("ai_infra", "AI infra"),
        ("meta", "Meta / regulatory"),
    ]:
        lines.append(f"  {k}: {ts_string(v)},")
    lines.append("};")
    lines.append("")

    # Bubbles
    lines.append("export const LS_BUBBLES: LSBubble[] = [")
    for b in bubbles_sorted:
        kvs = []
        kvs.append(f"c: {ts_string(b['c'])}")
        kvs.append(f"p: {ts_string(b['p'])}")
        kvs.append(f"dp: {ts_string(b['dp'])}")
        kvs.append(f"d: {b['d']}")
        kvs.append(f"a: {b['a']}")
        kvs.append(f"mod: {ts_string(b['mod'])}")
        kvs.append(f"e: {ts_string(b['e'])}")
        kvs.append(f"et: {ts_string(b['et'])}")
        kvs.append(f"desc: {ts_string(b['desc'])}")
        if b["src"]:
            kvs.append(f"src: {ts_string(b['src'])}")
        kvs.append(f"cluster: {ts_string(b['cluster'])}")
        kvs.append(f"entityType: {ts_string(b['entityType'])}")
        if b["stance"]:
            kvs.append(f"stance: {ts_string(b['stance'])}")
        if b["reliability"] is not None:
            kvs.append(f"reliability: {b['reliability']}")
        if b["confidence"]:
            kvs.append(f"confidence: {ts_string(b['confidence'])}")
        if b["dateGranularity"]:
            kvs.append(f"dateGranularity: {ts_string(b['dateGranularity'])}")
        if b["geo"]:
            kvs.append(f"geo: {ts_string(b['geo'])}")
        lines.append("  { " + ", ".join(kvs) + " },")
    lines.append("];")
    lines.append("")

    # Clusters
    lines.append("export const LS_CLUSTERS: LSCluster[] = [")
    for c in clusters:
        lines.append("  {")
        lines.append(f"    id: {ts_string(c['id'])},")
        lines.append(f"    label: {ts_string(c['label'])},")
        lines.append(f"    family: {ts_string(c['family'])} as LSClusterFamily,")
        lines.append(f"    color: {ts_string(c['color'])},")
        lines.append(f"    offFrame: {'true' if c['off_frame'] else 'false'},")
        highlights = ", ".join(ts_string(h) for h in c["highlights"])
        lines.append(f"    highlights: [{highlights}],")
        s = c["signals"]
        rev = "null" if s["revenue_usd_m"] is None else str(s["revenue_usd_m"])
        lines.append("    signals: {")
        lines.append(f"      revenue_usd_m: {rev},")
        lines.append(f"      vc_disclosed_usd_m: {s['vc_disclosed_usd_m']},")
        lines.append(f"      ma_value_usd_m: {s['ma_value_usd_m']},")
        lines.append(f"      ipo_proceeds_usd_m: {s['ipo_proceeds_usd_m']},")
        lines.append(f"      fda_clearances: {s['fda_clearances']},")
        lines.append(f"      pharma_deal_value_usd_m: {s['pharma_deal_value_usd_m']},")
        lines.append(f"      event_count: {s['event_count']},")
        lines.append("    },")
        lines.append(f"    companyCount: {c['company_count']},")
        lines.append("  },")
    lines.append("];")
    lines.append("")

    # Reliability alerts (preserved editorial copy)
    lines.append("export const LS_RELIABILITY: LSReliability[] = [")
    for r in [
        dict(c="AlphaFold accuracy on novel folds",
             d="CASP15 (2022) showed AlphaFold-class methods still struggle on protein–protein complexes with strict CAPRI criteria; structure ≠ function and downstream wet-lab validation remains essential.",
             p="AlphaFold 2 / 3, ESMFold",
             src="https://onlinelibrary.wiley.com/doi/10.1002/prot.26594"),
        dict(c="AI-discovered drugs translation rate",
             d="Boston Consulting Group review of AI-native pipelines: Phase 1 success rates appear higher than industry average, but Phase 2 attrition is in line with historical norms — small samples and selection bias caveats apply.",
             p="Industry-wide",
             src="https://www.bcg.com/publications/2022/adopting-ai-in-pharmaceutical-discovery"),
        dict(c="Generative protein safety",
             d="Open-source CRISPR-like editors (e.g. OpenCRISPR-1) raise dual-use concerns; Profluent ships under research-only terms, but governance norms for AI-designed biology are still emerging.",
             p="OpenCRISPR-1 and successors",
             src="https://www.science.org/content/article/ai-can-design-new-crispr-like-genome-editors"),
        dict(c="Ambient scribe legal exposure",
             d="Reuters and others have flagged growing legal/discovery risk from ambient-scribe transcripts entering EHRs without clear governance — a non-technical reliability gap that scales with deployment.",
             p="Hospital-ops cluster",
             src="https://www.reuters.com/business/healthcare-pharmaceuticals/"),
    ]:
        lines.append("  {")
        lines.append(f"    c: {ts_string(r['c'])},")
        lines.append(f"    d: {ts_string(r['d'])},")
        lines.append(f"    p: {ts_string(r['p'])},")
        if r.get("src"):
            lines.append(f"    src: {ts_string(r['src'])},")
        lines.append("  },")
    lines.append("];")
    lines.append("")

    # Stats — derived from the Excel
    n_milestones = len(bubbles_sorted)
    n_companies = len({b["c"] for b in bubbles_sorted})
    n_clusters = len([c for c in clusters if not c["off_frame"]])
    earliest = min(int(b["d"]) for b in bubbles_sorted) if bubbles_sorted else 2014
    lines.append("export const LS_STATS = [")
    lines.append(f"  {{ n: '{n_milestones}', l: 'Milestones' }},")
    lines.append(f"  {{ n: '{n_companies}', l: 'Companies' }},")
    lines.append(f"  {{ n: '{n_clusters}', l: 'Clusters' }},")
    lines.append(f"  {{ n: '{len(LAYER_TO_CLUSTER)}', l: 'Layers' }},")
    lines.append(f"  {{ n: '{earliest}', l: 'Earliest' }},")
    lines.append("];")
    lines.append("")

    OUT_PATH.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
