import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import {
  LS_BUBBLES,
  LS_CLUSTERS,
} from '@/data/aiLifeSciences';
import { LS_CPT_CODES } from '@/data/aiLifeSciencesCPT';
import {
  LS_FDA_TOTAL,
  LS_FDA_CPT_COVERED,
  LS_FDA_UPDATED,
  LS_FDA_BY_SPECIALTY,
} from '@/data/aiLifeSciencesFDA';
import { cn } from '@/lib/utils';

// Color a specialty bar by device count: darker = more cleared devices.
// Same log-scale logic as Revenue, but in amber/orange (regulatory permits).
function specialtyColor(devices: number, maxDevices: number): string {
  const t = Math.log(devices + 1) / Math.log(maxDevices + 1);
  const s = Math.round(45 + t * 35); // 45% → 80%
  const l = Math.round(70 - t * 45); // 70% → 25%
  return `hsl(28 ${s}% ${l}%)`;
}

function textOn(devices: number, maxDevices: number): string {
  const t = Math.log(devices + 1) / Math.log(maxDevices + 1);
  return 70 - t * 45 > 50 ? 'hsl(28 60% 18%)' : 'rgba(255,255,255,0.95)';
}

export function RegulatoryView() {
  const [openSpecialty, setOpenSpecialty] = useState<string | null>(null);

  const activeCpts = LS_CPT_CODES.filter((c) => !c.deleted).length;
  const paidCodes = LS_CPT_CODES.filter((c) => !c.deleted && c.rateUsd);
  const cptWithRate = paidCodes.length;

  const maxDevices = Math.max(...LS_FDA_BY_SPECIALTY.map((s) => s.devices));
  const sorted = [...LS_FDA_BY_SPECIALTY].sort((a, b) => b.devices - a.devices);

  return (
    <div>
      {/* Caption */}
      <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
        Where AI is actually approved — and where insurance dollars actually flow. Real reimbursement
        funnels through CPT codes with a published Medicare rate. Today there are{' '}
        <span className="font-mono text-foreground">{cptWithRate}</span> of them.
      </p>
      <p className="text-xs text-muted-foreground/80 mb-5 italic leading-relaxed">
        Without a published CMS rate, a CPT code exists on paper but providers can't reliably bill
        insurance for the AI service. Devices in those specialties piggyback on generic imaging /
        pathology codes (the AI portion isn't separately monetised), or rely on hospital one-off
        contracts and NTAP add-on payments.
      </p>

      {/* Reimbursement funnel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        <div className="border border-border p-3 relative">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">1 · FDA-cleared</div>
          <div className="text-3xl font-bold font-mono text-foreground mt-1">{LS_FDA_TOTAL.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">AI medical devices · {LS_FDA_UPDATED}</div>
        </div>
        <div className="border border-border p-3 relative">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">2 · In CPT-covered specialty</div>
          <div className="text-3xl font-bold font-mono text-foreground mt-1">{LS_FDA_CPT_COVERED.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {Math.round((LS_FDA_CPT_COVERED / LS_FDA_TOTAL) * 100)}% — but billed on generic codes
          </div>
        </div>
        <div className="border border-border p-3 relative">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">3 · AI-specific CPT code</div>
          <div className="text-3xl font-bold font-mono text-foreground mt-1">{activeCpts}</div>
          <div className="text-xs text-muted-foreground mt-1">codes on paper · most rates pending</div>
        </div>
        <div
          className="border-2 p-3 relative"
          style={{ background: 'hsl(28 60% 95%)', borderColor: 'hsl(28 65% 32%)' }}
        >
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'hsl(28 65% 32%)' }}>
            4 · Paid by Medicare
          </div>
          <div className="text-3xl font-bold font-mono mt-1" style={{ color: 'hsl(28 65% 22%)' }}>
            {cptWithRate}
          </div>
          <div className="text-xs mt-1" style={{ color: 'hsl(28 50% 32%)' }}>
            where the dollars actually move
          </div>
        </div>
      </div>

      {/* The 7 paid codes — the real revenue gate */}
      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
        Codes with published Medicare reimbursement
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
        {paidCodes
          .sort((a, b) => (b.rateUsd ?? 0) - (a.rateUsd ?? 0))
          .map((c) => (
            <a
              key={c.code}
              href={c.src}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-border p-3 hover:border-primary transition-colors flex items-start gap-3"
            >
              <span className="font-mono font-bold text-foreground text-sm shrink-0 pt-0.5">{c.code}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground leading-tight">{c.short}</div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  {c.specialty} · {c.companies.split(',').slice(0, 2).join(',')}
                  {c.companies.split(',').length > 2 ? ` +${c.companies.split(',').length - 2}` : ''}
                </div>
              </div>
              <span className="font-mono font-bold text-primary shrink-0">
                ${c.rateUsd!.toLocaleString()}
              </span>
            </a>
          ))}
      </div>

      {/* The other 21 codes — three monetization paths, visual */}
      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
        Other {activeCpts - cptWithRate} codes — alternative revenue paths
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8">
        <div className="border border-border p-4 flex flex-col">
          <div className="font-mono text-xs font-bold mb-2" style={{ color: 'hsl(28 65% 32%)' }}>NTAP / TPT</div>
          <div className="text-3xl font-bold font-mono text-foreground">$1,040</div>
          <div className="text-xs text-muted-foreground mt-1">per patient · Viz.ai LVO</div>
          <div className="mt-auto pt-3 text-[11px] text-muted-foreground/70">
            CMS new-tech add-on · expires 2–3 yr
          </div>
        </div>
        <div className="border border-border p-4 flex flex-col">
          <div className="font-mono text-xs font-bold mb-2" style={{ color: 'hsl(28 65% 32%)' }}>Private payer</div>
          <div className="text-3xl font-bold font-mono text-foreground">case-by-case</div>
          <div className="text-xs text-muted-foreground mt-1">BCBS · United · Anthem</div>
          <div className="mt-auto pt-3 text-[11px] text-muted-foreground/70">
            Negotiated · not portable
          </div>
        </div>
        <div className="border border-border p-4 flex flex-col">
          <div className="font-mono text-xs font-bold mb-2" style={{ color: 'hsl(28 65% 32%)' }}>Direct-to-hospital</div>
          <div className="text-3xl font-bold font-mono text-foreground">SaaS</div>
          <div className="text-xs text-muted-foreground mt-1">hospital opex · most ARR</div>
          <div className="mt-auto pt-3 text-[11px] text-muted-foreground/70">
            Bundled in procedure · no claim
          </div>
        </div>
      </div>

      {/* Specialty breakdown — proper bar chart, the actual data story */}
      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
        FDA AI clearances by specialty
      </div>
      <div className="space-y-1.5 mb-6">
        {sorted.map((s) => {
          const width = (s.devices / maxDevices) * 100;
          const share = ((s.devices / LS_FDA_TOTAL) * 100).toFixed(s.devices < 10 ? 1 : 0);
          return (
            <button
              key={s.specialty}
              type="button"
              onClick={() => setOpenSpecialty(s.specialty)}
              className="w-full text-left flex items-center gap-3 hover:bg-muted/40 px-1 py-1 transition-colors"
            >
              <div className="w-44 shrink-0 text-sm text-foreground truncate">{s.specialty}</div>
              <div className="flex-1 relative h-7 bg-muted/20">
                <div
                  className="absolute inset-y-0 left-0 flex items-center pl-2"
                  style={{
                    width: `${Math.max(width, 2)}%`,
                    background: specialtyColor(s.devices, maxDevices),
                    color: textOn(s.devices, maxDevices),
                  }}
                >
                  <span className="text-xs font-mono font-semibold whitespace-nowrap">
                    {s.devices.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="w-12 shrink-0 text-xs font-mono text-muted-foreground text-right">{share}%</div>
              <div className="w-16 shrink-0 text-xs text-muted-foreground">
                {s.companies} co.
              </div>
              <div className="w-20 shrink-0 text-xs font-mono">
                {s.hasCptCoverage ? (
                  <span className="text-primary">CPT ✓</span>
                ) : (
                  <span className="text-muted-foreground/50">no CPT</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* CPT codes table */}
      <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
        AI-specific CPT codes (CMS Medicare 2026)
      </div>
      <div className="border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-3 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Code</th>
              <th className="text-left px-3 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Description</th>
              <th className="text-left px-3 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Specialty</th>
              <th className="text-right px-3 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Medicare rate</th>
              <th className="px-3 py-2.5 font-mono text-xs text-muted-foreground uppercase tracking-widest">Cat.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {LS_CPT_CODES.filter((c) => !c.deleted).map((c) => (
              <tr key={c.code} className={cn('hover:bg-muted/20', c.rateUsd && 'font-medium')}>
                <td className="px-3 py-2 font-mono text-foreground whitespace-nowrap">
                  <a href={c.src} target="_blank" rel="noopener noreferrer"
                    className="hover:text-primary hover:underline inline-flex items-center gap-1">
                    {c.code} <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </td>
                <td className="px-3 py-2 text-muted-foreground max-w-md">{c.short}</td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{c.specialty}</td>
                <td className="px-3 py-2 font-mono text-right whitespace-nowrap">
                  {c.rateUsd ? (
                    <span className="text-primary">${c.rateUsd.toLocaleString()}</span>
                  ) : (
                    <span className="text-muted-foreground/50">TBD</span>
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground text-center">{c.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openSpecialty && (
        <SpecialtyDetail
          specialty={openSpecialty}
          onClose={() => setOpenSpecialty(null)}
        />
      )}
    </div>
  );
}

function SpecialtyDetail({ specialty, onClose }: { specialty: string; onClose: () => void }) {
  const s = LS_FDA_BY_SPECIALTY.find((x) => x.specialty === specialty);
  if (!s) return null;

  // Pull CPT codes that match this specialty (best-effort string match)
  const codes = LS_CPT_CODES.filter(
    (c) => !c.deleted && c.specialty.toLowerCase().includes(specialty.toLowerCase().split(/[ -]/)[0]),
  );

  // Pull any bubble events tagged regulatory that mention this specialty
  const events = LS_BUBBLES.filter(
    (b) =>
      (b.et === 'FDA_Clearance' || b.et === 'Regulatory_Milestone' || b.et === 'Regulatory') &&
      (b.desc ?? '').toLowerCase().includes(specialty.toLowerCase().split(/[ -]/)[0]),
  ).slice(0, 8);

  return (
    <div
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-start gap-3 p-4 border-b border-border"
          style={{ background: 'hsl(28 65% 32%)' }}
        >
          <div className="flex-1 text-white">
            <h3 className="heading-md">{s.specialty}</h3>
            <div className="text-xs opacity-90 font-mono mt-1">
              {s.devices.toLocaleString()} FDA-cleared AI devices · {s.companies} companies ·{' '}
              {s.hasCptCoverage ? 'CPT-covered' : 'no AI-specific CPT'}
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {codes.length > 0 && (
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Active CPT codes for {s.specialty.toLowerCase()}
              </div>
              <div className="space-y-1">
                {codes.map((c) => (
                  <a
                    key={c.code}
                    href={c.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-baseline gap-3 p-2 border border-border hover:border-primary"
                  >
                    <span className="font-mono font-bold text-foreground">{c.code}</span>
                    <span className="text-sm text-muted-foreground flex-1">{c.short}</span>
                    {c.rateUsd && (
                      <span className="font-mono text-sm text-primary">${c.rateUsd.toLocaleString()}</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
          {events.length > 0 && (
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Recent regulatory events
              </div>
              <div className="space-y-2">
                {events.map((e, i) => (
                  <div key={i} className="border border-border p-2">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <span className="text-sm font-medium text-foreground">{e.c}</span>
                      <span className="text-xs font-mono text-muted-foreground">{Math.floor(e.d)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug">{e.desc}</p>
                    {e.src && (
                      <a href={e.src} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                        <ExternalLink className="w-3 h-3" /> source
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {codes.length === 0 && events.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No AI-specific CPT codes or curated regulatory events for this specialty yet — devices
              bill through existing specialty codes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
