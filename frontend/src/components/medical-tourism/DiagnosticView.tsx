import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STAGES } from '@/data/medicalTourism';

type Answer = 'y' | 'p' | 'n';

const ANSWER_LABELS: Record<Answer, string> = { y: 'Yes', p: 'Partial', n: 'No' };

export function DiagnosticView() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [openStage, setOpenStage] = useState<string | null>(STAGES[0].id);

  const stageScore = (stageIdx: number) => {
    const s = STAGES[stageIdx];
    let total = 0, max = 0;
    s.questions.forEach(q => {
      max += q.weight * 2;
      const a = answers[q.id];
      if (a === 'y') total += q.weight * 2;
      else if (a === 'p') total += q.weight;
    });
    return max ? Math.round((total / max) * 100) : 0;
  };

  const overall = useMemo(() => {
    const sum = STAGES.reduce((acc, _, i) => acc + stageScore(i), 0);
    return Math.round(sum / STAGES.length);
  }, [answers]);

  const allDone = STAGES.every(s => s.questions.every(q => answers[q.id]));

  const recommendations = useMemo(() => {
    if (!allDone) return [];
    const items: Array<{ name: string; type: string; effort: string; impact: string; players: string[]; stage: string; stageScore: number; priority: number }> = [];
    STAGES.forEach((s, i) => {
      const sc = stageScore(i);
      s.products.forEach(p => {
        const impactWeight = p.impact === 'high' ? 3 : p.impact === 'medium' ? 2 : 1;
        const effortWeight = p.effort === 'low' ? 1 : p.effort === 'medium' ? 2 : 3;
        const priority = ((100 - sc) * impactWeight) / effortWeight;
        items.push({ ...p, stage: s.short, stageScore: sc, priority });
      });
    });
    return items.sort((a, b) => b.priority - a.priority);
  }, [answers, allDone]);

  const scoreLevel = (s: number) =>
    s >= 75 ? 'text-foreground' : s >= 50 ? 'text-foreground/70' : s >= 25 ? 'text-foreground/50' : 'text-muted-foreground';

  const totalQuestions = STAGES.reduce((a, s) => a + s.questions.length, 0);
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-4">
      {/* Intro / framing */}
      <div className="border-l-4 border-primary bg-secondary/30 p-4 space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
          Self-Assessment for clinics
        </div>
        <h3 className="text-base font-semibold tracking-tight">
          Is your clinic ready to receive international patients?
        </h3>
        <p className="text-xs text-muted-foreground max-w-2xl">
          {totalQuestions} questions across {STAGES.length} stages of the international patient
          journey — from how patients first find you, through inquiry, estimate, trust-building,
          logistics, and post-care. Answer each as <em className="text-foreground not-italic">Yes</em>,{' '}
          <em className="text-foreground not-italic">Partial</em>, or{' '}
          <em className="text-foreground not-italic">No</em>. Once complete, you'll see a prioritized
          list of buy-or-build recommendations ranked by impact and effort.
        </p>
        <p className="text-[11px] text-muted-foreground">
          Your answers stay in your browser — nothing is sent anywhere.
        </p>
      </div>

      {/* Overall */}
      <div className="border border-border p-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            Overall readiness for international patients
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {allDone
              ? 'Complete — recommendations below'
              : `${answeredCount} of ${totalQuestions} answered`}
          </div>
        </div>
        <div className={cn('text-4xl font-mono font-semibold', scoreLevel(overall))}>{overall}%</div>
      </div>

      {/* Stages accordion */}
      <div className="space-y-2">
        {STAGES.map((stage, idx) => {
          const sc = stageScore(idx);
          const open = openStage === stage.id;
          return (
            <div key={stage.id} className="border border-border">
              <button
                onClick={() => setOpenStage(open ? null : stage.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-foreground/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg text-muted-foreground">{stage.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium text-foreground">
                      {idx + 1}. {stage.label}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{stage.desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('text-sm font-mono', scoreLevel(sc))}>{sc}%</span>
                  <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
                </div>
              </button>
              {open && (
                <div className="border-t border-border p-3 space-y-2">
                  {stage.questions.map(q => (
                    <div key={q.id} className="flex items-center justify-between gap-3 py-1">
                      <div className="text-xs text-foreground flex-1">
                        {q.text}
                        <span className="ml-2 text-[10px] text-muted-foreground font-mono">w{q.weight}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {(['y', 'p', 'n'] as Answer[]).map(a => (
                          <button
                            key={a}
                            onClick={() => setAnswers(prev => ({ ...prev, [q.id]: a }))}
                            className={cn(
                              'px-2.5 py-1 text-[10px] font-mono border transition-colors',
                              answers[q.id] === a
                                ? 'bg-foreground text-background border-foreground'
                                : 'border-border text-muted-foreground hover:border-foreground/40'
                            )}
                          >
                            {ANSWER_LABELS[a]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      {allDone && recommendations.length > 0 && (
        <div className="border border-foreground/30 p-4 mt-6">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mb-3">
            Prioritized recommendations
          </div>
          <div className="space-y-2">
            {recommendations.slice(0, 8).map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-2 border border-border">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground">
                    <span className="text-muted-foreground font-mono mr-2">{String(i + 1).padStart(2, '0')}</span>
                    {r.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {r.stage} · {r.players.join(', ')}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 text-[10px] font-mono">
                  <span className={cn(
                    'px-2 py-0.5 border',
                    r.type === 'buy' ? 'border-foreground/40 text-foreground' : 'border-border text-muted-foreground'
                  )}>
                    {r.type}
                  </span>
                  <span className="px-2 py-0.5 border border-border text-muted-foreground">
                    {r.effort}/{r.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
