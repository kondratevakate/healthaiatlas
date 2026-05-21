import { useMemo } from 'react';
import { ExternalLink, X } from 'lucide-react';
import {
  AI_ARCHITECTURES,
  AI_REVENUE_PRODUCTS,
  AI_REVENUE_DISCLAIMER,
  AI_SOURCES_BY_ID,
  ALL_FAMILIES,
  CONFIDENCE_COLORS,
  FAMILY_COLORS,
  type AIRevenueProduct,
  type AISource,
  type ConfidenceTier,
} from '@/data/aiArchitectureRevenue';
import { cn } from '@/lib/utils';

interface ArchitectureSidebarProps {
  selectedArchId: string | null;
  onClose: () => void;
}

function fmtMoney(v: number): string {
  if (v >= 1000) return `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}B`;
  if (v >= 1) return `$${v.toFixed(0)}M`;
  return v > 0 ? '<$1M' : '$0';
}

function ConfidenceBadge({ tier }: { tier: ConfidenceTier }) {
  return (
    <span
      className="inline-flex items-center px-1 py-px font-mono text-[8px] uppercase tracking-widest text-background"
      style={{ backgroundColor: CONFIDENCE_COLORS[tier] }}
      title={
        tier === 'PRIMARY'
          ? 'SEC filing, earnings release, Stanford AI Index, arxiv, Nature'
          : tier === 'SECONDARY'
            ? 'Specific article in major outlet (TechCrunch, Reuters, Bloomberg, WSJ, FT, Axios)'
            : 'Analyst estimate (Sacra, The Information, named analysts). Not audited fact.'
      }
    >
      {tier}
    </span>
  );
}

function SourceLine({ source }: { source: AISource }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group rounded-sm border border-border/60 hover:border-foreground/40 p-2 transition-colors"
    >
      <div className="flex items-center gap-1.5 flex-wrap mb-1">
        <ConfidenceBadge tier={source.confidence} />
        <span className="font-mono text-[10px] text-muted-foreground">
          {source.claimId} · {source.publisher}
          {source.retrieved ? ` · ${source.retrieved}` : ''}
        </span>
      </div>
      <div className="text-[11px] text-foreground/90 leading-snug line-clamp-3 group-hover:line-clamp-none">
        {source.exactQuoteOrBasis}
      </div>
      <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-muted-foreground group-hover:text-primary">
        <ExternalLink className="h-2.5 w-2.5" />
        <span className="truncate">{source.url.replace(/^https?:\/\//, '')}</span>
      </div>
    </a>
  );
}

function ProductRow({ product }: { product: AIRevenueProduct }) {
  const source = product.revenueSourceClaim
    ? AI_SOURCES_BY_ID[product.revenueSourceClaim]
    : undefined;
  return (
    <li className="border-b border-border/50 pb-2 last:border-b-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <div className="min-w-0">
          <div className="font-medium truncate">{product.name}</div>
          <div className="text-[10px] text-muted-foreground font-mono truncate">
            {product.company}
          </div>
        </div>
        <div className="font-mono text-foreground tabular-nums flex-shrink-0">
          {fmtMoney(product.revenueM)}
        </div>
      </div>
      {product.notes && (
        <div className="text-[10px] text-muted-foreground italic mt-0.5">
          {product.notes}
        </div>
      )}
      {source && (
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          <ConfidenceBadge tier={source.confidence} />
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-muted-foreground hover:text-primary inline-flex items-center gap-0.5"
          >
            {source.claimId} · {source.publisher}
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      )}
    </li>
  );
}

function ArchDetail({ archId, onClose }: { archId: string; onClose: () => void }) {
  const arch = useMemo(
    () => AI_ARCHITECTURES.find((a) => a.archId === archId),
    [archId],
  );
  const products = useMemo(
    () =>
      AI_REVENUE_PRODUCTS.filter((p) => p.primaryArchId === archId).sort(
        (a, b) => b.revenueM - a.revenueM,
      ),
    [archId],
  );

  // Collect distinct source claims for products attributed to this arch.
  // Hook must run before any early return — Rules of Hooks.
  const productSources = useMemo(() => {
    const seen = new Set<string>();
    const out: AISource[] = [];
    for (const p of products) {
      if (p.revenueSourceClaim && !seen.has(p.revenueSourceClaim)) {
        const s = AI_SOURCES_BY_ID[p.revenueSourceClaim];
        if (s) {
          seen.add(p.revenueSourceClaim);
          out.push(s);
        }
      }
    }
    return out;
  }, [products]);

  if (!arch) return null;

  const color = FAMILY_COLORS[arch.family];
  const totalProductRevenue = products.reduce((s, p) => s + (p.revenueM || 0), 0);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {arch.archId} · {arch.family} · {arch.paperYear}
          </div>
          <h3 className="font-serif text-lg font-semibold leading-tight mt-1 break-words">
            {arch.name}
          </h3>
          {arch.authors && (
            <div className="text-[11px] text-muted-foreground mt-0.5 italic">
              {arch.authors}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-sm border p-2">
          <div className="font-serif text-base font-semibold">
            {fmtMoney(arch.attributableRevenueM)}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
            Est. revenue
          </div>
        </div>
        <div className="rounded-sm border p-2">
          <div className="font-serif text-base font-semibold">
            {arch.paperCountK}K
          </div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
            Papers
          </div>
        </div>
        <div className="rounded-sm border p-2">
          <div className="font-serif text-base font-semibold">
            {products.length}
          </div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">
            Products
          </div>
        </div>
      </div>

      <a
        href={arch.paperUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
        style={{ borderLeft: `3px solid ${color}`, paddingLeft: 10 }}
      >
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Canonical paper
        </div>
        <div className="flex items-baseline gap-1.5 text-xs font-medium text-foreground group-hover:text-primary transition-colors">
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
          <span className="leading-snug">{arch.paperTitle ?? arch.name}</span>
        </div>
      </a>

      {arch.attributableRevenueM === 0 && (
        <div className="rounded-sm border-l-2 border-foreground/30 bg-secondary/40 p-2 text-xs text-muted-foreground leading-relaxed">
          Attribution = $0 reflects no public confirmation of production
          deployment. Absence-of-evidence, not evidence-of-absence.
        </div>
      )}

      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Products attributed · {fmtMoney(totalProductRevenue)} combined
        </div>
        {products.length === 0 ? (
          <div className="text-xs text-muted-foreground italic">
            No products attributed in this dataset.
          </div>
        ) : (
          <ul className="space-y-2">
            {products.map((p) => (
              <ProductRow key={p.productId} product={p} />
            ))}
          </ul>
        )}
      </div>

      {productSources.length > 0 && (
        <div className="border-t pt-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Revenue claims · {productSources.length} verified
          </div>
          <div className="space-y-1.5">
            {productSources.map((s) => (
              <SourceLine key={s.claimId} source={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DefaultPanel() {
  return (
    <div className="p-4 space-y-5">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Family legend
        </div>
        <ul className="space-y-1.5">
          {ALL_FAMILIES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs">
              <span
                aria-hidden="true"
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: FAMILY_COLORS[f] }}
              />
              <span className="text-foreground">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t pt-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          Confidence tiers
        </div>
        <ul className="space-y-1.5 text-xs">
          <li className="flex items-start gap-2">
            <ConfidenceBadge tier="PRIMARY" />
            <span className="text-muted-foreground">
              SEC filing, earnings release, named-officer post, Stanford AI Index, arxiv / Nature DOI.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <ConfidenceBadge tier="SECONDARY" />
            <span className="text-muted-foreground">
              Specific article in TechCrunch, Reuters, Bloomberg, WSJ, FT, Axios reporting the claim.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <ConfidenceBadge tier="ANALYST" />
            <span className="text-muted-foreground">
              Sacra, The Information, named analysts. Treated as estimate, not audited fact.
            </span>
          </li>
        </ul>
      </div>

      <div className="border-t pt-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          {AI_REVENUE_DISCLAIMER.headline}
        </div>
        <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
          {AI_REVENUE_DISCLAIMER.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <p className="text-[10px] italic pt-1 border-t border-border/50 mt-2">
            {AI_REVENUE_DISCLAIMER.footerMeta}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ArchitectureSidebar({
  selectedArchId,
  onClose,
}: ArchitectureSidebarProps) {
  return (
    <div className={cn('h-full overflow-y-auto')}>
      {selectedArchId ? (
        <ArchDetail archId={selectedArchId} onClose={onClose} />
      ) : (
        <DefaultPanel />
      )}
    </div>
  );
}
