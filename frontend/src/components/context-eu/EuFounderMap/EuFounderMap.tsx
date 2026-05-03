import { Map, BarChart3, ScrollText, Pill, FlaskConical, Building2, Lightbulb } from 'lucide-react';
import { HeadlineContrast } from './HeadlineContrast';
import { RegulatoryGrammar } from './RegulatoryGrammar';
import { AlzheimersBridge } from './AlzheimersBridge';
import { CEEArbitrage } from './CEEArbitrage';
import { PharmaGravity } from './PharmaGravity';
import { SwissAnimal } from './SwissAnimal';
import { EuFounderFrame } from './EuFounderFrame';

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

export function EuFounderMap() {
  return (
    <section>
      <header className="mb-6">
        <div
          className="text-[10px] uppercase tracking-widest font-mono italic text-muted-foreground mb-2"
        >
          ★ <span style={{ color: 'hsl(14 90% 55%)' }}>EU Founder Reality</span> · 2026 · the regulatory grammar is the moat AND the wall
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Map className="h-5 w-5" style={{ color: 'hsl(180 70% 40%)' }} />
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            EU + Switzerland Founder Map
          </h2>
        </div>
        <p className="text-sm text-foreground/85 leading-relaxed max-w-3xl">
          The US tab argues <em>which spoke kills you</em>; the UAE tab argues <em>the floor is too
          low for venture scale</em>; the EU tab argues <em>the regulatory grammar is the moat AND
          the wall — pharma-AI is the green lane, generic radiology AI is being consolidated, and
          Switzerland is a separate animal.</em>
        </p>
      </header>

      {/* 1. Headline contrast — EU vs US */}
      <div className="mb-10">
        <SubBlockHeader
          icon={BarChart3}
          label="Scale"
          intro="Europe operates at ~1/3 of US digital-health VC scale — same order of magnitude, unlike UAE. Fundable, but with a different operating model."
        />
        <HeadlineContrast />
      </div>

      {/* 2. Four-layer rulebook */}
      <div className="mb-10">
        <SubBlockHeader
          icon={ScrollText}
          label="Compliance grammar"
          intro="Four layers stack between 2024–2027. AI Act + EHDS are EU-specific; HTAR and MDR/IVDR are operational baselines. No equivalent stack exists in US."
        />
        <RegulatoryGrammar />
      </div>

      {/* 3. Alzheimer's bridge case */}
      <div className="mb-10">
        <SubBlockHeader
          icon={Pill}
          label="The Alzheimer's bridge case"
          intro="Three drugs across FDA / CMS / EMA / EC / NICE produced different outcomes — proof that EU+EC together set a stricter approval bar where benefit is modest and ARIA risk is non-trivial."
        />
        <AlzheimersBridge />
      </div>

      {/* 4. CEE arbitrage */}
      <div className="mb-10">
        <SubBlockHeader
          icon={FlaskConical}
          label="CEE clinical-trial arbitrage"
          intro="Operational cost arbitrage 20–50% below Western Europe — within the same EMA regulatory regime. Cheaper evidence, identical approval bar."
        />
        <CEEArbitrage />
      </div>

      {/* 5. Pharma-AI gravity + RadNet consolidation */}
      <div className="mb-10">
        <SubBlockHeader
          icon={Building2}
          label="Pharma-AI gravity"
          intro="Europe's competitive moat — AI attached to biology, drug discovery, and pharma evidence. Strategic-acquirer exit channel that US venture market doesn't replicate."
        />
        <PharmaGravity />
      </div>

      {/* 6. Switzerland — separate panel */}
      <div className="mb-10">
        <SwissAnimal />
      </div>

      {/* 7. Founder takeaways */}
      <div>
        <SubBlockHeader
          icon={Lightbulb}
          label="What this means"
          intro="Seven action situations stack independently. Reimbursement is country-specific and is the actual graveyard, not regulation."
        />
        <EuFounderFrame />
      </div>
    </section>
  );
}
