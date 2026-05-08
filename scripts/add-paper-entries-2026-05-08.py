"""One-shot xlsx patch: add ~28 paper-mentioned entries to the AI Life
Sciences landscape workbook and upgrade ~5 existing Source_URL cells to
company-official primaries.

Rows are appended to the "AI Life Sciences Events" sheet matching its
existing column schema. The script is idempotent — running twice skips
existing (Company, Date, Event_Type) triples.

Source: Kondrateva & Seregina, "AI in Life Sciences 2026: A Hiring Map for
ML Researchers" (May 2026). Plus user-supplied URLs for company-official
primaries.

Backup: AI_LifeSci_Landscape_v4.bak2-2026-05-08.xlsx (separate from the
prior pass's backup).

Usage:  python scripts/add-paper-entries-2026-05-08.py
"""
from __future__ import annotations

import shutil
import sys
from datetime import datetime
from pathlib import Path

import openpyxl

EXCEL_PATH = Path(r"C:\Projects\data\aiatls\AI_LifeSci_Landscape_v4.xlsx")
BACKUP_PATH = EXCEL_PATH.with_name(EXCEL_PATH.stem + ".bak2-2026-05-08.xlsx")
SHEET = "AI Life Sciences Events"


# ---------------------------------------------------------------------------
# Source_URL upgrades — Company name -> better company-official URL.
# ---------------------------------------------------------------------------

SRC_UPGRADES: dict[str, str] = {
    "NewLimit": "https://www.newlimit.com/",
    "Retro Biosciences": "https://www.retro.bio/",
    "Altos Labs": "https://www.altoslabs.com/",
    # Owkin is added below as a new row, no upgrade entry needed.
    "Chai Discovery": "https://www.chaidiscovery.com/",
}


# ---------------------------------------------------------------------------
# New rows — each tuple maps to the column order resolved at runtime.
# ---------------------------------------------------------------------------

def D(s: str) -> datetime:
    return datetime.strptime(s, "%Y-%m-%d")


# Each entry is a dict keyed by xlsx column name.  Columns missing here
# are written as None.
NEW_ROWS = [
    # === Wave 3a — AI scientists (cluster: ai_scientists) ===
    {
        "Company": "Future House",
        "Date": D("2023-11-01"),
        "Event_Type": "Founding",
        "Source_URL": "https://www.futurehouse.org/about",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "company_page",
        "Event_Description": "Nonprofit AI-for-science research lab founded Nov 2023 by Sam Rodriques and Andrew White, funded by Eric Schmidt. Releases agentic AI for scientific discovery (Crow, Falcon, Owl, Phoenix, Robin). Wave 3a anchor per Kondrateva-Seregina 2026.",
        "Geographic_Market": "USA",
        "Entity_Type": "research_lab",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "month",
        "Build_Buy_Partner": "build",
    },
    {
        "Company": "Future House (Robin)",
        "Date": D("2025-05-20"),
        "Event_Type": "Publication",
        "Source_URL": "https://www.futurehouse.org/research-announcements/demonstrating-end-to-end-scientific-discovery-with-robin-a-multi-agent-system",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "company_page",
        "Event_Description": "Robin paper (arXiv:2505.13400) — autonomous discovery of ripasudil as therapy for dry age-related macular degeneration (dAMD). First publicly documented AI-generated novel therapeutic hypothesis with experimental validation; humans only ran the bench experiments.",
        "Geographic_Market": "USA",
        "Entity_Type": "research_lab",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "exact",
        "Build_Buy_Partner": "build",
    },
    {
        "Company": "Future House Fellowship",
        "Date": D("2026-01-01"),
        "Event_Type": "Event",
        "Source_URL": "https://www.futurehouse.org/fellowship-program",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "company_page",
        "Event_Description": "Future House Fellowship — cohort program parallel to FH research lab. ML researchers paired with bio mentors; on-ramp for ML talent into bio AI research roles.",
        "Geographic_Market": "USA",
        "Entity_Type": "research_lab",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "year",
        "Build_Buy_Partner": "build",
    },
    {
        "Company": "Edison Scientific",
        "Date": D("2025-11-01"),
        "Event_Type": "Founding",
        "Funding_Amount": "$70M",
        "Source_URL": "https://www.futurehouse.org/about",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "company_page",
        "Event_Description": "Commercial spinout of Future House — $70M seed at $250M valuation Nov 2025. First product Kosmos: next-gen AI scientist processing 1,500 papers + 42K lines of analysis code per run.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "month",
        "Build_Buy_Partner": "build",
    },
    {
        "Company": "Periodic Labs",
        "Date": D("2025-09-01"),
        "Event_Type": "Funding_Round",
        "Funding_Amount": "$300M",
        "Source_URL": "https://www.tekedia.com/periodic-labs-emerges-from-stealth-with-300m-funding-aiming-to-build-ai-scientists-for-materials-discovery",
        "Confidence": "high",
        "Reliability_Risk": 3,
        "Source_Type": "press_release",
        "Event_Description": "Stealth-exit $300M seed (a16z, NVIDIA, Bezos, Schmidt, Dean). Co-founders Liam Fedus (ex-OpenAI VP Research, ChatGPT creator) + Ekin Dogus Cubuk (ex-DeepMind, GNoME 2M crystals 2023). Materials-science autonomous lab generating training data for AI.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "month",
        "Build_Buy_Partner": "build",
    },
    {
        "Company": "Coefficient Bio",
        "Date": D("2026-04-03"),
        "Event_Type": "Acquisition",
        "Deal_Value": "$400M",
        "Source_URL": "https://www.biospace.com/business/ai-giant-anthropic-leans-into-life-sciences-with-400m-coefficient-bio-catch",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "press_release",
        "Event_Description": "Anthropic acquired Coefficient Bio for ~$400M all-stock April 2026. Founded ~8 months prior by Samuel Stanton + Nathan Frey (ex-Roche Prescient Design) and Aris Theologis (CEO, ex-Evozyne). <10 employees. Dimension lead VC reported 38,513% IRR. LBSTER + Cortex open-source repos.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "exact",
        "Build_Buy_Partner": "buy",
    },
    {
        "Company": "Anthropic Healthcare & Life Sciences",
        "Date": D("2025-10-01"),
        "Event_Type": "Product_Launch",
        "Source_URL": "https://www.biospace.com/business/ai-giant-anthropic-leans-into-life-sciences-with-400m-coefficient-bio-catch",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "press_release",
        "Event_Description": "Claude for Life Sciences launched Oct 2025 — MCP connectors to PubMed, bioRxiv, Open Targets, ChEMBL, Benchling, Medidata, ClinicalTrials.gov. Anthropic Healthcare & Life Sciences group led by Eric Kauderer-Abrams.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "month",
        "Build_Buy_Partner": "build",
    },
    {
        "Company": "Sakana AI",
        "Date": D("2026-01-01"),
        "Event_Type": "Publication",
        "Source_URL": "https://www.nature.com/articles/s41586-026-10265-5",
        "Confidence": "high",
        "Reliability_Risk": 1,
        "Source_Type": "peer_reviewed",
        "Event_Description": "'Towards end-to-end automation of AI research' Nature Vol 651 pp 914-919 (2026) by Lu, Lange, Yamada, Hu, Foerster, Ha, Clune (Sakana AI + Oxford + UBC). The AI Scientist generates research ideas, writes code, runs experiments, writes manuscript and performs its own peer review; workshop submission passed first-round review.",
        "Geographic_Market": "Global",
        "Entity_Type": "research_lab",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "month",
        "Build_Buy_Partner": "build",
    },
    {
        "Company": "Unreasonable Labs",
        "Date": D("2025-01-01"),
        "Event_Type": "Founding",
        "Source_URL": "https://www.unreasonablelabs.ai/",
        "Confidence": "medium",
        "Reliability_Risk": 4,
        "Source_Type": "company_page",
        "Event_Description": "Unreasonable.DISCOVERY engine — AI for cross-disciplinary scientific hypothesis generation. Backed by deep-tech VCs. Builds unified world models connecting literature, simulations, datasets; positioned alongside FutureHouse / Lila / Periodic in Wave 3a frontier.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "year",
        "Build_Buy_Partner": "build",
    },
    {
        "Company": "Lila Sciences",
        "Date": D("2025-09-15"),
        "Event_Type": "Funding_Round",
        "Funding_Amount": "$235M",
        "Source_URL": "https://www.fiercebiotech.com/biotech/flagships-lila-sciences-lands-235m-expand-ai-powered-autonomous-research-labs",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "press_release",
        "Event_Description": "$235M Series A at ~$1.23B valuation Sep 2025. Total funding now ~$435M. Operates autonomous research labs in Cambridge MA. CEO Geoffrey von Maltzahn, CSO George Church (Harvard CRISPR), CTO Andrew Beam. Flagship Pioneering incubation.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "ai_drug_discovery",
        "Date_Granularity": "month",
        "Build_Buy_Partner": "build",
    },
    # === Wave 3b — TechBio drug discovery (cluster: ai_drug_discovery) ===
    {
        "Company": "Owkin",
        "Date": D("2021-11-01"),
        "Event_Type": "Funding_Round",
        "Funding_Amount": "$180M",
        "Source_URL": "https://www.owkin.com/",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "company_page",
        "Event_Description": "Federated learning across hospital networks for biopharma. Founded 2016 by Thomas Clozel + Gilles Wainrib (Paris/NY). Sanofi $180M strategic investment Nov 2021 — became unicorn. >800 hospitals worldwide. K Pro agentic AI scientist for biopharma; Waiv spinout for AI diagnostics.",
        "Geographic_Market": "France/USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "ai_drug_discovery",
        "Date_Granularity": "month",
        "Build_Buy_Partner": "partner",
    },
    {
        "Company": "Insilico Medicine",
        "Date": D("2025-06-03"),
        "Event_Type": "Clinical_Trial_Result",
        "Source_URL": "https://www.prnewswire.com/news-releases/insilico-medicine-announces-nature-medicine-publication-of-phase-iia-results-evaluating-rentosertib-302472070.html",
        "Confidence": "high",
        "Reliability_Risk": 1,
        "Source_Type": "peer_reviewed",
        "Event_Description": "Phase IIa results for Rentosertib (TNIK inhibitor for IPF, n=71 patients in China) published in Nature Medicine June 2025. First AI-designed drug for an AI-discovered target to reach Phase IIa with positive results — dose-dependent improvement in forced vital capacity, manageable safety. Pharma.AI platform.",
        "Geographic_Market": "Global",
        "Entity_Type": "vendor",
        "Technology_Layer": "ai_drug_discovery",
        "Date_Granularity": "exact",
        "Build_Buy_Partner": "build",
    },
    {
        "Company": "Latent Labs",
        "Date": D("2025-07-21"),
        "Event_Type": "Product_Launch",
        "Source_URL": "https://techcrunch.com/2025/07/21/latent-labs-launches-web-based-ai-model-to-democratize-protein-design/",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "press_release",
        "Event_Description": "LatentX web platform launched Jul 2025 — generative protein-design model accessible via web. Founded 2023 by Simon Kohl (ex-DeepMind protein design lead, AlphaFold2). London + SF. $50M total funding (Radical Ventures + Sofinnova).",
        "Geographic_Market": "UK/USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "exact",
        "Build_Buy_Partner": "build",
    },
    {
        "Company": "Iambic Therapeutics",
        "Date": D("2025-01-01"),
        "Event_Type": "Clinical_Trial",
        "Source_URL": "https://www.iambic.ai/",
        "Confidence": "medium",
        "Reliability_Risk": 3,
        "Source_Type": "company_page",
        "Event_Description": "IAM1363 (selective HER2 inhibitor for solid tumors) in Phase 1. Founded 2020 by Tim Cernak (Univ. Michigan), Fred Manby, Thomas Miller. Sequoia portfolio. NeuralPLexer for protein-ligand structure prediction. Hybrid AI design + internal pipeline.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "ai_drug_discovery",
        "Date_Granularity": "year",
        "Build_Buy_Partner": "build",
    },
    # === Wave 2 — admin / clinical LLM (clusters: hospital_ops, clinical_ai_agents, frontier_labs) ===
    {
        "Company": "Tennr",
        "Date": D("2025-06-18"),
        "Event_Type": "Funding_Round",
        "Funding_Amount": "$101M",
        "Source_URL": "https://www.prnewswire.com/news-releases/healthcare-referrals-are-where-patients-get-lost-tennr-raises-101m-to-bring-the-visibility-our-system-desperately-needs-302485255.html",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "press_release",
        "Event_Description": "$101M Series C led by IVP June 2025. Founded 2021 in NY by Stanford engineers Trey Holterman, Diego Baugh, Tyler Johnson. RaeLM specialised medical LM trained on medical documentation. Healthcare referrals automation.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "hospital_ops_AI",
        "Date_Granularity": "exact",
        "Build_Buy_Partner": "buy",
    },
    {
        "Company": "Nabla",
        "Date": D("2025-06-01"),
        "Event_Type": "Funding_Round",
        "Funding_Amount": "$70M",
        "Source_URL": "https://techcrunch.com/2025/12/19/yann-lecun-confirms-his-new-world-model-startup-reportedly-seeks-5b-valuation/",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "press_release",
        "Event_Description": "Paris-based medical AI scribe. Founded 2018 by Alex LeBrun. $70M Series C June 2025; total ~$120M. LeBrun departed Dec 2025 to lead AMI Labs (Yann LeCun's world models lab). Nabla remains AMI Labs's first healthcare partner.",
        "Geographic_Market": "France",
        "Entity_Type": "vendor",
        "Technology_Layer": "hospital_ops_AI",
        "Date_Granularity": "month",
        "Build_Buy_Partner": "buy",
    },
    {
        "Company": "AMI Labs",
        "Date": D("2026-03-09"),
        "Event_Type": "Funding_Round",
        "Funding_Amount": "$1030M",
        "Source_URL": "https://amilabs.xyz/",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "company_page",
        "Event_Description": "Yann LeCun's world-models AI lab — $1.03B raise at $3.5B pre-money valuation March 2026. Founded by Yann LeCun (NYU/ex-Meta FAIR), CEO Alex LeBrun (ex-Nabla). Nabla as first healthcare partner. One of the few connections between a frontier-AI lab and a European health-AI company.",
        "Geographic_Market": "USA/France",
        "Entity_Type": "vendor",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "exact",
        "Build_Buy_Partner": "build",
    },
    {
        "Company": "OpenEvidence",
        "Date": D("2026-01-21"),
        "Event_Type": "Funding_Round",
        "Funding_Amount": "$250M",
        "Source_URL": "https://www.mobihealthnews.com/news/openevidence-scores-250m-doubles-valuation-12b",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "press_release",
        "Event_Description": "$250M Series D Jan 2026 at $12B valuation, co-led by Thrive Capital + DST Global. Founded 2022 by Daniel Nadler + Zachary Ziegler (Cambridge MA). ~15M monthly clinical consultations, used by 40%+ of US physicians daily. Total raised ~$700M over 12 months across 4 rounds.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "exact",
        "Build_Buy_Partner": "buy",
    },
    {
        "Company": "Abridge",
        "Date": D("2025-06-24"),
        "Event_Type": "Funding_Round",
        "Funding_Amount": "$300M",
        "Source_URL": "https://www.fiercehealthcare.com/ai-and-machine-learning/ambient-ai-startup-abridge-scores-300m-series-e-backed-a16z-and-khosla",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "press_release",
        "Event_Description": "$300M Series E June 2025 led by a16z + Khosla, $5.3B valuation. $117M contracted ARR Q1 2025. Deployed at 150+ health systems. Total $773M raised across all rounds. CEO Shiv Rao.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "hospital_ops_AI",
        "Date_Granularity": "exact",
        "Build_Buy_Partner": "buy",
    },
    {
        "Company": "Hippocratic AI",
        "Date": D("2025-11-03"),
        "Event_Type": "Funding_Round",
        "Funding_Amount": "$126M",
        "Source_URL": "https://www.businesswire.com/news/home/20251103432446/en/",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "press_release",
        "Event_Description": "$126M Series C Nov 2025 at $3.5B valuation led by Avenir Growth. Total funding $404M. 115M+ patient interactions across 50+ health systems, payors, pharma in 6 countries. Voice agents for non-diagnostic patient-facing tasks.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "hospital_ops_AI",
        "Date_Granularity": "exact",
        "Build_Buy_Partner": "buy",
    },
    # === Wave 1 — diagnostics imaging (cluster: diagnostics_imaging) ===
    {
        "Company": "Paige",
        "Date": D("2018-01-01"),
        "Event_Type": "Founding",
        "Source_URL": "https://paige.ai/",
        "Confidence": "medium",
        "Reliability_Risk": 3,
        "Source_Type": "company_page",
        "Event_Description": "Digital pathology AI. Founded 2018; Paige Prostate received first FDA clearance for AI-based pathology in 2021. Wave 1 anchor in pathology — alongside Aidoc (radiology), Lunit, HeartFlow.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "AIMD_imaging",
        "Date_Granularity": "year",
        "Build_Buy_Partner": "buy",
    },
    {
        "Company": "RadAI",
        "Date": D("2018-01-01"),
        "Event_Type": "Founding",
        "Source_URL": "https://www.radai.com/",
        "Confidence": "medium",
        "Reliability_Risk": 3,
        "Source_Type": "company_page",
        "Event_Description": "Radiology report generation AI. Founded 2018. AI for impression generation in radiology workflow. Wave 1 anchor named in Kondrateva-Seregina 2026 paper.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "AIMD_imaging",
        "Date_Granularity": "year",
        "Build_Buy_Partner": "buy",
    },
    # === Wave 4 — automated labs (cluster: automated_labs) ===
    {
        "Company": "Emerald Cloud Lab",
        "Date": D("2010-01-01"),
        "Event_Type": "Founding",
        "Source_URL": "https://www.emeraldcloudlab.com/",
        "Confidence": "medium",
        "Reliability_Risk": 3,
        "Source_Type": "company_page",
        "Event_Description": "Cloud laboratory data supplier. Founded 2010 — niche cloud-laboratory product for over a decade, now strategic supplier of experimental data for AI scientific companies. Wave 4 incumbent.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "year",
        "Build_Buy_Partner": "partner",
    },
    {
        "Company": "Ginkgo Bioworks",
        "Date": D("2024-01-01"),
        "Event_Type": "Event",
        "Source_URL": "https://www.ginkgobioworks.com/",
        "Confidence": "medium",
        "Reliability_Risk": 3,
        "Source_Type": "company_page",
        "Event_Description": "Synthetic biology platform (NASDAQ:DNA, public). Stock declined significantly post-IPO; Ginkgo Datapoints segment now strategic focus — generates training data for AI biology models. Wave 4 incumbent.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "year",
        "Build_Buy_Partner": "partner",
    },
    {
        "Company": "Strateos",
        "Date": D("2017-01-01"),
        "Event_Type": "Founding",
        "Source_URL": "https://strateos.com/",
        "Confidence": "medium",
        "Reliability_Risk": 4,
        "Source_Type": "company_page",
        "Event_Description": "Cloud lab platform; smaller-scale automated laboratory infrastructure for chemistry and biology workflows.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "year",
        "Build_Buy_Partner": "partner",
    },
    {
        "Company": "Culture Biosciences",
        "Date": D("2018-01-01"),
        "Event_Type": "Founding",
        "Source_URL": "https://www.culturebiosciences.com/",
        "Confidence": "medium",
        "Reliability_Risk": 4,
        "Source_Type": "company_page",
        "Event_Description": "Cloud bioreactor platform; small-scale fermentation/cell culture as a service. Wave 4 incumbent.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "year",
        "Build_Buy_Partner": "partner",
    },
    {
        "Company": "Medra",
        "Date": D("2025-12-01"),
        "Event_Type": "Funding_Round",
        "Funding_Amount": "$52M",
        "Source_URL": "https://www.medra.ai/",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "company_page",
        "Event_Description": "$52M Series A Dec 2025. 'Physical AI Scientist' robotic platform for autonomous lab work — gene editing, cell culture, biochem/genomics. Combines physical robotics + scientific AI for closed-loop experimental optimization via natural language.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "month",
        "Build_Buy_Partner": "build",
    },
    {
        "Company": "XtalPi",
        "Date": D("2025-09-28"),
        "Event_Type": "Pharma_Deal",
        "Deal_Value": "$5990M",
        "Source_URL": "https://en.xtalpi.com/xtalpi-and-dovetree-announce-landmark-6-billion-ai-drug-discovery-collaboration/",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "press_release",
        "Event_Description": "$5.99B upfront + milestone deal with DoveTree Medicines Sep 2025 — largest AI drug discovery deal of its kind to date. Now serves nearly 4 of every 5 top-20 global pharma. HKEX:2228 since June 2024 (Chapter 18C first listing, ~$115M USD).",
        "Geographic_Market": "China/USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "ai_drug_discovery",
        "Date_Granularity": "exact",
        "Build_Buy_Partner": "partner",
    },
    # === Longevity / aging cluster (paper §8 §3) ===
    {
        "Company": "Life Biosciences",
        "Date": D("2017-01-01"),
        "Event_Type": "Founding",
        "Source_URL": "https://www.lifebiosciences.com/",
        "Confidence": "medium",
        "Reliability_Risk": 3,
        "Source_Type": "company_page",
        "Event_Description": "Partial cellular reprogramming for age-related diseases. Founded 2017. Named in Kondrateva-Seregina 2026 paper §8 alongside Retro / Altos / NewLimit as longevity research targets.",
        "Geographic_Market": "USA",
        "Entity_Type": "vendor",
        "Technology_Layer": "ai_drug_discovery",
        "Date_Granularity": "year",
        "Build_Buy_Partner": "build",
    },
    {
        "Company": "Sinclair lab / Agarwal et al. (K-Dense)",
        "Date": D("2025-09-12"),
        "Event_Type": "Publication",
        "Source_URL": "https://www.biorxiv.org/content/10.1101/2025.09.08.674588v1",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "peer_reviewed",
        "Event_Description": "bioRxiv preprint Sep 12 2025: 'Guided multi-agent AI invents highly accurate, uncertainty-aware transcriptomic aging clocks'. Authors: Vinayak Agarwal, Orion Li, Christopher A. Petty, Timothy Kassis, Paul W.K. Rothemund, David A. Sinclair, Ashwin Gopinath. K-Dense system: multi-agent AI for aging biomarker discovery — bridges Wave 3a methodology with longevity application.",
        "Geographic_Market": "USA",
        "Entity_Type": "open_source_tool",
        "Technology_Layer": "AI_drug_design",
        "Date_Granularity": "exact",
        "Build_Buy_Partner": "build",
    },
    # === Policy initiatives (cluster: policy_initiatives) ===
    {
        "Company": "US White House Genesis Mission",
        "Date": D("2025-11-24"),
        "Event_Type": "Regulatory_Milestone",
        "Source_URL": "https://www.whitehouse.gov/presidential-actions/2025/11/launching-the-genesis-mission/",
        "Confidence": "high",
        "Reliability_Risk": 1,
        "Source_Type": "regulator",
        "Event_Description": "Executive Order Nov 24 2025 — American Science and Security Platform. Federal compute + datasets + AI tools across DOE labs for advanced manufacturing, biotech, critical materials, nuclear energy, quantum, semiconductors. AI agents to automate research workflows.",
        "Geographic_Market": "USA",
        "Entity_Type": "regulator",
        "Technology_Layer": "policy_initiatives",
        "Date_Granularity": "exact",
    },
    {
        "Company": "UK Government AI for Science Strategy",
        "Date": D("2025-01-01"),
        "Event_Type": "Regulatory_Milestone",
        "Source_URL": "https://www.gov.uk/government/publications/ai-for-science-strategy/ai-for-science-strategy",
        "Confidence": "high",
        "Reliability_Risk": 2,
        "Source_Type": "regulator",
        "Event_Description": "UK national AI for Science Strategy publication — government direction for AI-driven research infrastructure investment.",
        "Geographic_Market": "UK",
        "Entity_Type": "regulator",
        "Technology_Layer": "policy_initiatives",
        "Date_Granularity": "year",
    },
]


def _row_key(company, date_val, event_type):
    """Triple used to test idempotency on re-run."""
    if isinstance(date_val, datetime):
        date_str = date_val.strftime("%Y-%m-%d")
    else:
        date_str = str(date_val)
    return (str(company).strip(), date_str, str(event_type).strip())


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

    # --- Source_URL upgrades --------------------------------------------------
    company_col = col_idx["Company"]
    src_col = col_idx["Source_URL"]

    upgrades_applied = 0
    upgrade_seen = {c: False for c in SRC_UPGRADES}
    for row_idx in range(2, ws.max_row + 1):
        company = ws.cell(row=row_idx, column=company_col).value
        if company is None:
            continue
        company = str(company).strip()
        if company in SRC_UPGRADES:
            upgrade_seen[company] = True
            new_url = SRC_UPGRADES[company]
            if ws.cell(row=row_idx, column=src_col).value != new_url:
                ws.cell(row=row_idx, column=src_col).value = new_url
                upgrades_applied += 1
                print(f"  upgrade row {row_idx:3d}  {company:<40s}  → {new_url}")

    upgrades_skipped = [c for c, seen in upgrade_seen.items() if not seen]

    # --- Idempotent appends ---------------------------------------------------
    date_col = col_idx["Date"]
    et_col = col_idx["Event_Type"]
    existing_keys = set()
    for row_idx in range(2, ws.max_row + 1):
        company = ws.cell(row=row_idx, column=company_col).value
        date_val = ws.cell(row=row_idx, column=date_col).value
        et_val = ws.cell(row=row_idx, column=et_col).value
        if company is None:
            continue
        existing_keys.add(_row_key(company, date_val, et_val))

    appended = 0
    skipped_dup = []
    for row in NEW_ROWS:
        key = _row_key(row["Company"], row["Date"], row["Event_Type"])
        if key in existing_keys:
            skipped_dup.append(row["Company"] + " / " + key[2])
            continue

        next_row = ws.max_row + 1
        for col_name, col_n in col_idx.items():
            if col_name in row:
                ws.cell(row=next_row, column=col_n).value = row[col_name]
        appended += 1
        print(f"  append row {next_row:3d}  {row['Company']:<40s}  ({row['Event_Type']})")

    wb.save(EXCEL_PATH)

    print()
    print(f"Source_URL upgrades applied: {upgrades_applied}")
    if upgrades_skipped:
        print(f"  upgrade targets not found in xlsx ({len(upgrades_skipped)}):")
        for c in upgrades_skipped:
            print(f"    - {c}")
    print(f"Rows appended: {appended}")
    if skipped_dup:
        print(f"Rows skipped as duplicates ({len(skipped_dup)}):")
        for c in skipped_dup:
            print(f"  - {c}")


if __name__ == "__main__":
    main()
