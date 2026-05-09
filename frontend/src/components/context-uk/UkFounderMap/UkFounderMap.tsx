import {
  Map,
  BarChart3,
  ScrollText,
  Pill,
  Hospital,
  FlaskConical,
  TrendingUp,
  AlertOctagon,
  Lightbulb,
} from 'lucide-react';
import { HeadlineContrast } from './HeadlineContrast';
import { RegulatoryGrammar } from './RegulatoryGrammar';
import { NiceRejection } from './NiceRejection';
import { NhsDeployments } from './NhsDeployments';
import { AirlockCohort } from './AirlockCohort';
import { FundingRounds } from './FundingRounds';
import { BabylonCase } from './BabylonCase';
import { UkFounderFrame } from './UkFounderFrame';

function SubBlockHeader({
  icon: Icon,
  label,
  intro,
}: {
  icon: typeof Map;
  label: string;
  intro: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-mono text-[11px] uppercase tracking-widest font-semibold text-foreground">
          {label}
        </h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed italic max-w-3xl">{intro}</p>
    </div>
  );
}

const AIRLOCK_INTRO =
  "Phase 1 cohort — Philips, Newton's Tree, Automedica, OncoFlow — flagged the four open questions current UK regulation has yet to codify: synthetic data, explainability, LLM hallucination, post-market continuous monitoring.";

export function UkFounderMap() {
  return (
    <section>
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-widest font-mono italic text-muted-foreground mb-2">
          ★ <span style={{ color: 'hsl(14 90% 55%)' }}>UK Founder Reality</span> · 2026 ·
          post-Brexit three-layer architecture, NICE as global HTA benchmark, Babylon as bridge
          case to US SPAC era
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Map className="h-5 w-5" style={{ color: 'hsl(220 80% 35%)' }} />
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            UK Founder Map
          </h2>
        </div>
        <p className="text-sm text-foreground/85 leading-relaxed max-w-3xl">
          The US tab argues <em>which spoke kills you</em>; the UAE tab argues <em>the floor is
          too low for venture scale</em>; the EU tab argues <em>regulatory grammar is the moat
          AND the wall</em>; the UK tab argues <em>three layers (MHRA / NICE / NHS) on different
          timelines and decision logic — Babylon is the bridge case to US SPAC era, NICE is a
          global HTA benchmark disproportionate to UK market size.</em>
        </p>
      </header>

      {/* 1. Headline contrast — UK vs US */}
      <div className="mb-10">
        <SubBlockHeader
          icon={BarChart3}
          label="Scale"
          intro="UK led European digital health Q3 2025 at $409m (41% of regional total). Same order of magnitude as EU; ~1/3 of US. Fundable, with a different operating model."
        />
        <HeadlineContrast />
      </div>

      {/* 2. Regulatory architecture — 4 layers */}
      <div className="mb-10">
        <SubBlockHeader
          icon={ScrollText}
          label="Regulatory architecture"
          intro="MHRA + UK MDR + NICE ESF/DTAC + UK GDPR/DUA. Genuinely independent post-Brexit — not 'EU minus EMA'. AI Airlock is the Class IIa+ adaptive-AI proving ground."
        />
        <RegulatoryGrammar />
      </div>

      {/* 3. NICE rejection sequence (EU-bridge HTA case) */}
      <div className="mb-10">
        <SubBlockHeader
          icon={Pill}
          label="The NICE rejection sequence — EU-bridge HTA case"
          intro="Kisunla / Leqembi 2024–2026 sequence is the cleanest case of NICE acting as a de facto global HTA benchmark. The decision logic, not just the decision, has become an export."
        />
        <NiceRejection />
      </div>

      {/* 4. NHS deployments */}
      <div className="mb-10">
        <SubBlockHeader
          icon={Hospital}
          label="NHS deployments — verified vs vendor-claim"
          intro="Brainomix 107/107 stroke centres; Annalise across 40+ Trusts; Skin Analytics DERM via NICE EVA. Vendor-claim positions (Lunit, deepc) are flagged where NHSE primary procurement could not be located."
        />
        <NhsDeployments />
      </div>

      {/* 5. AI Airlock cohort */}
      <div className="mb-10">
        <SubBlockHeader
          icon={FlaskConical}
          label="AI Airlock — Phase 1 cohort"
          intro={AIRLOCK_INTRO}
        />
        <AirlockCohort />
      </div>

      {/* 6. Capital signals */}
      <div className="mb-10">
        <SubBlockHeader
          icon={TrendingUp}
          label="Capital signals — 2024–2026"
          intro="Two large-scale wins (Isomorphic $600m, Cera $150m) with operator-clinician founders. Three exit failures (BenevolentAI delist, Exscientia merger, Babylon) frame the IPO closure for UK healthcare AI."
        />
        <FundingRounds />
      </div>

      {/* 7. Babylon case study */}
      <div className="mb-10">
        <SubBlockHeader
          icon={AlertOctagon}
          label="Babylon — the bridge case to US SPAC era"
          intro="A transatlantic regulatory + capital + clinical-governance failure, not a single-cause AI-quality story. Six chronological sections; click to expand."
        />
        <BabylonCase />
      </div>

      {/* 8. Founder frame */}
      <div>
        <SubBlockHeader
          icon={Lightbulb}
          label="What this means"
          intro="Seven action situations stack independently. Plan evidence generation 18–36 months ahead of NHS scaling. Realistic exit is acquisition by US/global, not London IPO."
        />
        <UkFounderFrame />
      </div>
    </section>
  );
}
