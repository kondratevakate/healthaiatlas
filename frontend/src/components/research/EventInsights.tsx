import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, Loader2, AlertCircle, RotateCcw, Lock, ShieldAlert, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthContext';
import { SignInModal } from '@/components/auth/SignInModal';
import {
  SYSTEM_PROMPT,
  COMPACT_SYSTEM_PROMPT,
  FEW_SHOTS,
  SUGGESTED_QUESTIONS,
  AI_INSIGHTS_CONFIG,
  contextPreamble,
  type AIMessage,
  type UserContext,
} from '@/data/aiInsightsPrompt';

interface ChatItem extends AIMessage {
  id: string;
}

interface Props {
  /**
   * "card" (default): bordered Card with internal header — for the desktop sidebar.
   * "flat": no Card border, no internal header — for the mobile bottom sheet,
   * which already has its own SheetTitle.
   */
  variant?: 'card' | 'flat';
}

const DISCLOSURE_ACK_KEY = 'discovery-copilot-disclosure-ack-v1';
const FREE_USES_KEY = 'discovery-copilot-free-uses-v1';
const FREE_USES_LIMIT = 3;
const USER_CONTEXT_KEY = 'discovery-copilot-user-context-v1';

function readUserContext(): UserContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_CONTEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.role === 'string' && typeof parsed.goal === 'string' && typeof parsed.domain === 'string') {
      return parsed as UserContext;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeUserContext(ctx: UserContext) {
  localStorage.setItem(USER_CONTEXT_KEY, JSON.stringify(ctx));
}
// Per-authenticated-user daily cap. Cheap protection so a leaked client-bundle
// API key can't be drained instantly. Real rate limits should also be set on
// the provider account (e.g. OpenRouter monthly cap).
const SIGNED_IN_DAILY_LIMIT = 30;
const SIGNED_IN_DAILY_KEY = 'discovery-copilot-signed-uses-v1';

interface SignedDailyState {
  date: string;
  count: number;
}

function readSignedDaily(): SignedDailyState {
  if (typeof window === 'undefined') return { date: '', count: 0 };
  try {
    const raw = localStorage.getItem(SIGNED_IN_DAILY_KEY);
    if (!raw) return { date: '', count: 0 };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.date === 'string' && typeof parsed.count === 'number') {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return { date: '', count: 0 };
}

function writeSignedDaily(state: SignedDailyState) {
  localStorage.setItem(SIGNED_IN_DAILY_KEY, JSON.stringify(state));
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// Detect Pollinations' transient deprecation/maintenance notice that occasionally
// shows up as the response body. Treat as a transient error.
function isProviderNotice(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes('pollinations legacy text api') ||
    t.includes('is being deprecated') ||
    (t.includes('important notice') && t.includes('migrate'))
  );
}

// Strip the markdown/decoration that the system prompt forbids but models
// sometimes still emit. Keeps plain "- " bullets and prose.
function sanitizeReply(text: string): string {
  return text
    // **bold** and __bold__
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // *italic* / _italic_ — only when the asterisk is clearly a delimiter
    .replace(/(^|[\s(])\*(\S(?:.*?\S)?)\*(?=[\s).,!?:;]|$)/g, '$1$2')
    .replace(/(^|[\s(])_(\S(?:.*?\S)?)_(?=[\s).,!?:;]|$)/g, '$1$2')
    // ATX headers
    .replace(/^#{1,6}\s+/gm, '')
    // Horizontal rules
    .replace(/^\s*[-*_]{3,}\s*$/gm, '')
    // Bullet markers other than "- " — normalise to "- "
    .replace(/^[•–—•·]\s+/gm, '- ')
    // Leftover triple-asterisk runs
    .replace(/\*{2,}/g, '')
    // Collapse 3+ blank lines down to 2
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Diagnostic map: each attempt records "ok" or a short failure reason
// (HTTP status, exception message, "skipped", "notice"). Surfaced in the
// final error so the user can see which endpoint failed how.
type Diag = Map<string, string>;

// Wraps a promise with a per-attempt timeout. Resolves to null on timeout or rejection.
function withTimeout<T>(
  p: Promise<T>,
  ms: number,
  controller: AbortController,
  diag: Diag,
  label: string,
): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      diag.set(label, 'timeout (12s)');
      controller.abort();
      resolve(null);
    }, ms);
    p.then((r) => {
      clearTimeout(timer);
      resolve(r);
    }).catch(() => {
      clearTimeout(timer);
      resolve(null);
    });
  });
}

// ── Pollinations chat completion (POST root) ─────────────────────────────
async function tryPollinationsPost(
  history: AIMessage[],
  model: string,
  systemPrompt: string,
  signal: AbortSignal,
  diag: Diag,
  label: string,
): Promise<string | null> {
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...FEW_SHOTS,
    ...history,
  ];

  let res: Response;
  try {
    res = await fetch(AI_INSIGHTS_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        model,
        messages,
        max_tokens: AI_INSIGHTS_CONFIG.maxTokens,
        temperature: AI_INSIGHTS_CONFIG.temperature,
        private: true,
        stream: false,
      }),
    });
  } catch (e) {
    diag.set(label, e instanceof Error && e.name === 'AbortError' ? 'aborted' : `fetch error (${e instanceof Error ? e.message : 'unknown'})`);
    return null;
  }
  if (!res.ok) {
    diag.set(label, `HTTP ${res.status}`);
    return null;
  }

  const ct = res.headers.get('content-type') ?? '';
  let content = '';
  if (ct.includes('application/json')) {
    try {
      const data = await res.json();
      content =
        data?.choices?.[0]?.message?.content ??
        data?.message?.content ??
        (typeof data === 'string' ? data : '');
    } catch {
      diag.set(label, 'invalid JSON');
      return null;
    }
  } else {
    content = await res.text();
  }
  content = (content ?? '').trim();
  if (!content) {
    diag.set(label, 'empty response');
    return null;
  }
  if (isProviderNotice(content)) {
    diag.set(label, 'maintenance notice');
    return null;
  }
  diag.set(label, 'ok');
  return content;
}

// ── Pollinations GET — single-prompt fallback (URL length-bound) ────────
async function tryPollinationsGet(
  history: AIMessage[],
  compactSystemPrompt: string,
  signal: AbortSignal,
  diag: Diag,
  label: string,
): Promise<string | null> {
  const recent = history.slice(-4);
  const prompt = [
    compactSystemPrompt,
    '',
    ...recent.map((m) => `${m.role.toUpperCase()}: ${m.content}`),
    'ASSISTANT:',
  ].join('\n');

  const url = `${AI_INSIGHTS_CONFIG.fallbackEndpoint}/${encodeURIComponent(prompt)}?model=${encodeURIComponent(AI_INSIGHTS_CONFIG.fallbackModel)}&private=true`;
  if (url.length > 7500) {
    diag.set(label, 'URL too long');
    return null;
  }

  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (e) {
    diag.set(label, e instanceof Error && e.name === 'AbortError' ? 'aborted' : `fetch error`);
    return null;
  }
  if (!res.ok) {
    diag.set(label, `HTTP ${res.status}`);
    return null;
  }
  const text = (await res.text()).trim();
  if (!text) {
    diag.set(label, 'empty response');
    return null;
  }
  if (isProviderNotice(text)) {
    diag.set(label, 'maintenance notice');
    return null;
  }
  diag.set(label, 'ok');
  return text;
}

// ── Authenticated OpenAI-compatible endpoint ─────────────────────────────
// Two supported modes:
//   1. Direct provider (OpenRouter / Groq / Together): VITE_AI_INSIGHTS_URL
//      points at the provider, VITE_AI_INSIGHTS_API_KEY holds the bearer token.
//      This function sends Authorization: Bearer <key>.
//   2. Proxy mode (recommended for prod): VITE_AI_INSIGHTS_URL points at our
//      Cloudflare Worker (00_infra/insights-proxy). Key is empty — the Worker
//      adds the upstream bearer token server-side. This function sends NO
//      Authorization header. The Worker's CORS allowlist enforces who can call.
async function tryAuthenticatedOpenAI(
  history: AIMessage[],
  systemPrompt: string,
  signal: AbortSignal,
  diag: Diag,
  label: string,
): Promise<string | null> {
  const key = AI_INSIGHTS_CONFIG.apiKey;
  const url = AI_INSIGHTS_CONFIG.endpoint;
  const isCustomUrl = !!url && !url.includes('text.pollinations.ai');
  if (!key && !isCustomUrl) {
    diag.set(label, 'skipped (no key and default URL)');
    return null;
  }

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...FEW_SHOTS,
    ...history,
  ];

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key) {
    headers.Authorization = `Bearer ${key}`;
    // OpenRouter likes these but tolerates absence:
    headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : '';
    headers['X-Title'] = 'HealthAI Atlas Discovery copilot';
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      signal,
      headers,
      body: JSON.stringify({
        model: AI_INSIGHTS_CONFIG.model,
        messages,
        max_tokens: AI_INSIGHTS_CONFIG.maxTokens,
        temperature: AI_INSIGHTS_CONFIG.temperature,
      }),
    });
  } catch (e) {
    diag.set(label, e instanceof Error && e.name === 'AbortError' ? 'aborted' : 'fetch error');
    return null;
  }
  if (!res.ok) {
    diag.set(label, `HTTP ${res.status}`);
    return null;
  }
  let data: { choices?: { message?: { content?: string } }[] };
  try {
    data = await res.json();
  } catch {
    diag.set(label, 'invalid JSON');
    return null;
  }
  const content = (data?.choices?.[0]?.message?.content ?? '').trim();
  if (!content) {
    diag.set(label, 'empty response');
    return null;
  }
  if (isProviderNotice(content)) {
    diag.set(label, 'notice');
    return null;
  }
  diag.set(label, 'ok');
  return content;
}

// ── Hack Club AI — anonymous OpenAI-compatible endpoint ─────────────────
async function tryHackClub(
  history: AIMessage[],
  compactSystemPrompt: string,
  signal: AbortSignal,
  diag: Diag,
  label: string,
): Promise<string | null> {
  const messages = [
    { role: 'system' as const, content: compactSystemPrompt },
    ...history.slice(-6),
  ];
  let res: Response;
  try {
    res = await fetch(AI_INSIGHTS_CONFIG.hackClubEndpoint, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        max_tokens: AI_INSIGHTS_CONFIG.maxTokens,
        temperature: AI_INSIGHTS_CONFIG.temperature,
      }),
    });
  } catch (e) {
    diag.set(label, e instanceof Error && e.name === 'AbortError' ? 'aborted' : 'fetch error (CORS?)');
    return null;
  }
  if (!res.ok) {
    diag.set(label, `HTTP ${res.status}`);
    return null;
  }
  let data: { choices?: { message?: { content?: string } }[] };
  try {
    data = await res.json();
  } catch {
    diag.set(label, 'invalid JSON');
    return null;
  }
  const content = (data?.choices?.[0]?.message?.content ?? '').trim();
  if (!content) {
    diag.set(label, 'empty response');
    return null;
  }
  if (isProviderNotice(content)) {
    diag.set(label, 'notice');
    return null;
  }
  diag.set(label, 'ok');
  return content;
}

// ── HuggingFace router (modern OpenAI-compatible chat completions) ───────
async function tryHuggingFaceChat(
  history: AIMessage[],
  modelId: string,
  compactSystemPrompt: string,
  signal: AbortSignal,
  diag: Diag,
  label: string,
): Promise<string | null> {
  const key = AI_INSIGHTS_CONFIG.hfApiKey;
  if (!key) {
    diag.set(label, 'skipped (no VITE_HUG_API_KEY)');
    return null;
  }

  const messages = [
    { role: 'system' as const, content: compactSystemPrompt },
    ...history.slice(-6),
  ];

  let res: Response;
  try {
    res = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        max_tokens: AI_INSIGHTS_CONFIG.maxTokens,
        temperature: AI_INSIGHTS_CONFIG.temperature,
      }),
    });
  } catch (e) {
    diag.set(label, e instanceof Error && e.name === 'AbortError' ? 'aborted' : 'fetch error (CORS?)');
    return null;
  }
  if (!res.ok) {
    let body = '';
    try {
      body = (await res.text()).slice(0, 80);
    } catch {
      /* ignore */
    }
    diag.set(label, `HTTP ${res.status}${body ? ` — ${body.replace(/\n/g, ' ')}` : ''}`);
    return null;
  }
  let data: { choices?: { message?: { content?: string } }[] };
  try {
    data = await res.json();
  } catch {
    diag.set(label, 'invalid JSON');
    return null;
  }
  const content = (data?.choices?.[0]?.message?.content ?? '').trim();
  if (!content) {
    diag.set(label, 'empty response');
    return null;
  }
  if (isProviderNotice(content)) {
    diag.set(label, 'notice');
    return null;
  }
  diag.set(label, 'ok');
  return content;
}

// ── HuggingFace legacy Inference API — last-resort fallback ──────────────
async function tryHuggingFace(
  history: AIMessage[],
  modelId: string,
  compactSystemPrompt: string,
  signal: AbortSignal,
  diag: Diag,
  label: string,
): Promise<string | null> {
  const recent = history.slice(-4);
  const conversation = recent
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');
  const prompt = `<s>[INST] ${compactSystemPrompt}

${conversation}

Now write the next assistant turn. Keep it under 180 words. [/INST]`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (AI_INSIGHTS_CONFIG.hfApiKey) {
    headers.Authorization = `Bearer ${AI_INSIGHTS_CONFIG.hfApiKey}`;
  }

  let res: Response;
  try {
    res = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: AI_INSIGHTS_CONFIG.maxTokens,
          temperature: AI_INSIGHTS_CONFIG.temperature,
          return_full_text: false,
        },
        options: {
          wait_for_model: !!AI_INSIGHTS_CONFIG.hfApiKey,
          use_cache: true,
        },
      }),
    });
  } catch (e) {
    diag.set(label, e instanceof Error && e.name === 'AbortError' ? 'aborted' : 'fetch error');
    return null;
  }
  if (!res.ok) {
    diag.set(label, `HTTP ${res.status}`);
    return null;
  }
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    diag.set(label, 'invalid JSON');
    return null;
  }
  if (data && typeof data === 'object' && 'error' in data) {
    const err = (data as { error?: string }).error;
    diag.set(label, `model error: ${String(err).slice(0, 80)}`);
    return null;
  }

  let text = '';
  if (Array.isArray(data) && data[0] && typeof (data[0] as { generated_text?: string }).generated_text === 'string') {
    text = (data[0] as { generated_text: string }).generated_text;
  } else if (data && typeof (data as { generated_text?: string }).generated_text === 'string') {
    text = (data as { generated_text: string }).generated_text;
  }
  text = text.trim();
  if (!text) {
    diag.set(label, 'empty response');
    return null;
  }
  if (isProviderNotice(text)) {
    diag.set(label, 'notice');
    return null;
  }
  diag.set(label, 'ok');
  return text;
}

// Build the system message including the user's self-described context.
// The context is a single short paragraph appended to the base system prompt.
function buildSystemPrompt(ctx: UserContext | null, base: string): string {
  if (!ctx) return base;
  return `${base}

About the person you're answering:
${contextPreamble(ctx)}`;
}

// Fire all attempts in parallel; first non-null wins. Siblings are aborted on win.
async function askInsight(history: AIMessage[], userContext: UserContext | null): Promise<string> {
  const diag: Diag = new Map();
  const fullSystem = buildSystemPrompt(userContext, SYSTEM_PROMPT);
  const compactSystem = buildSystemPrompt(userContext, COMPACT_SYSTEM_PROMPT);

  type Attempt = { label: string; run: (signal: AbortSignal, diag: Diag, label: string) => Promise<string | null> };

  const hfChatModels = [
    'meta-llama/Llama-3.3-70B-Instruct:fastest',
    'openai/gpt-oss-120b:fastest',
    'Qwen/Qwen2.5-72B-Instruct:fastest',
    'deepseek-ai/DeepSeek-R1:fastest',
  ];

  const attempts: Attempt[] = [
    {
      label: 'openai-compat (custom URL+key)',
      run: (s, d, l) => tryAuthenticatedOpenAI(history, fullSystem, s, d, l),
    },
    {
      label: 'hackclub',
      run: (s, d, l) => tryHackClub(history, compactSystem, s, d, l),
    },
    {
      label: 'pollinations:openai-fast',
      run: (s, d, l) => tryPollinationsPost(history, 'openai-fast', fullSystem, s, d, l),
    },
    {
      label: 'pollinations:openai',
      run: (s, d, l) => tryPollinationsPost(history, 'openai', fullSystem, s, d, l),
    },
    {
      label: 'pollinations:get',
      run: (s, d, l) => tryPollinationsGet(history, compactSystem, s, d, l),
    },
    ...hfChatModels.map((m) => ({
      label: `hf-router:${m}`,
      run: (s: AbortSignal, d: Diag, l: string) =>
        tryHuggingFaceChat(history, m, compactSystem, s, d, l),
    })),
    {
      label: 'hf-legacy:mistral',
      run: (s, d, l) => tryHuggingFace(history, 'mistralai/Mistral-7B-Instruct-v0.3', compactSystem, s, d, l),
    },
    {
      label: 'hf-legacy:gemma',
      run: (s, d, l) => tryHuggingFace(history, 'google/gemma-2-2b-it', compactSystem, s, d, l),
    },
  ];

  const controllers = attempts.map(() => new AbortController());
  const timed = attempts.map((a, i) =>
    withTimeout(a.run(controllers[i].signal, diag, a.label), 12000, controllers[i], diag, a.label),
  );

  return new Promise<string>((resolve, reject) => {
    let pending = timed.length;
    let settled = false;

    timed.forEach((p, i) => {
      p.then((result) => {
        if (settled) return;
        if (result) {
          settled = true;
          controllers.forEach((c, j) => {
            if (j !== i) c.abort();
          });
          resolve(result);
        } else {
          pending--;
          if (pending === 0 && !settled) {
            const lines = Array.from(diag.entries()).map(([k, v]) => `  ${k}: ${v}`);
            const cfg = [
              `VITE_HUG_API_KEY=${AI_INSIGHTS_CONFIG.hfApiKey ? `set (${AI_INSIGHTS_CONFIG.hfApiKey.slice(0, 6)}…)` : 'empty'}`,
              `VITE_AI_INSIGHTS_API_KEY=${AI_INSIGHTS_CONFIG.apiKey ? 'set' : 'empty'}`,
            ].join(', ');
            reject(
              new Error(
                `All endpoints failed.\n\nPer-attempt status:\n${lines.join('\n')}\n\nConfig: ${cfg}\n\nTroubleshooting:\n  • If VITE_HUG_API_KEY is empty, place .env.local in frontend/ (not the repo root) and restart the dev server.\n  • Run "cd frontend && node --env-file=.env.local scripts/test-hf-token.mjs" to verify your token works directly.`,
              ),
            );
          }
        }
      });
    });
  });
}

export function EventInsights({ variant = 'card' }: Props) {
  const { isAuthenticated, user, authEnabled } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);
  const [items, setItems] = useState<ChatItem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disclosureAcked, setDisclosureAcked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DISCLOSURE_ACK_KEY) === '1';
  });
  const [anonUsesUsed, setAnonUsesUsed] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const raw = localStorage.getItem(FREE_USES_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  });
  const [signedDaily, setSignedDaily] = useState<SignedDailyState>(() => readSignedDaily());
  const [userContext, setUserContext] = useState<UserContext | null>(() => readUserContext());
  const [editingContext, setEditingContext] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const usesLeft = Math.max(0, FREE_USES_LIMIT - anonUsesUsed);
  const anonOutOfQuota = !isAuthenticated && usesLeft <= 0;

  // Reset the signed-in daily counter at midnight (local time, by date string).
  const today = todayStr();
  const signedTodayCount = signedDaily.date === today ? signedDaily.count : 0;
  const signedDailyLeft = Math.max(0, SIGNED_IN_DAILY_LIMIT - signedTodayCount);
  const signedOutOfQuota = isAuthenticated && signedDailyLeft <= 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items, loading]);

  const ackDisclosure = () => {
    localStorage.setItem(DISCLOSURE_ACK_KEY, '1');
    setDisclosureAcked(true);
  };

  const send = async (userText: string) => {
    const text = userText.trim();
    if (!text || loading) return;
    if (!isAuthenticated && usesLeft <= 0) {
      if (authEnabled) setSignInOpen(true);
      else setError(`Daily limit reached (${FREE_USES_LIMIT} questions). Try again tomorrow.`);
      return;
    }
    if (isAuthenticated && signedDailyLeft <= 0) {
      setError(`Daily limit reached (${SIGNED_IN_DAILY_LIMIT} questions). Resets at midnight local time.`);
      return;
    }

    const userItem: ChatItem = { id: `u-${Date.now()}`, role: 'user', content: text };
    const nextItems = [...items, userItem];
    setItems(nextItems);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const history: AIMessage[] = nextItems.map(({ role, content }) => ({ role, content }));
      const reply = await askInsight(history, userContext);
      const cleaned = sanitizeReply(reply);
      const aiItem: ChatItem = { id: `a-${Date.now()}`, role: 'assistant', content: cleaned };
      setItems((prev) => [...prev, aiItem]);
      // Count successful replies against the right quota.
      if (!isAuthenticated) {
        setAnonUsesUsed((prev) => {
          const next = prev + 1;
          localStorage.setItem(FREE_USES_KEY, String(next));
          return next;
        });
      } else {
        const next: SignedDailyState = {
          date: today,
          count: signedTodayCount + 1,
        };
        setSignedDaily(next);
        writeSignedDaily(next);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const reset = () => {
    setItems([]);
    setError(null);
    setLoading(false);
  };

  const isEmpty = items.length === 0 && !loading && !error;
  const isFlat = variant === 'flat';

  // ── Body content shared between card and flat variants ──
  const body = (
    <div
      className={cn(
        'flex flex-col gap-3',
        isFlat ? 'h-full' : '',
      )}
    >
      {/* Auth gate — shown only after the anonymous quota is exhausted */}
      {anonOutOfQuota ? (
        <div className="border border-border bg-secondary/30 p-4 flex flex-col items-start gap-3">
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="space-y-1">
              <div className="text-sm font-medium">
                You've used your {FREE_USES_LIMIT} free questions
              </div>
              <p className="text-xs text-muted-foreground">
                {authEnabled
                  ? 'Sign in to keep going (dev build — mock auth has no real backend).'
                  : 'Free-tier daily quota reached. Try again tomorrow — accounts and higher limits are not live yet.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full">
            {authEnabled && (
              <Button size="sm" onClick={() => setSignInOpen(true)} className="flex-1 sm:flex-initial">
                Sign in to continue
              </Button>
            )}
            {import.meta.env.DEV && (
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => {
                  localStorage.removeItem(FREE_USES_KEY);
                  setAnonUsesUsed(0);
                }}
              >
                Reset quota (dev)
              </Button>
            )}
          </div>
        </div>
      ) : !disclosureAcked ? (
        <div className="border border-warning/40 bg-warning/10 p-4 space-y-2">
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 mt-0.5 text-warning shrink-0" />
            <div className="space-y-1">
              <div className="text-sm font-medium">Heads up — free public model</div>
              <p className="text-xs text-muted-foreground">
                Replies come from a free, open-weights model served by a third party. Treat it like
                any public LLM:
              </p>
              <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
                <li>Don't paste personal, patient, or confidential information.</li>
                <li>Verify any specific names, dates, or numbers before acting on them.</li>
                <li>Conversations are not encrypted end-to-end and may be logged by the provider.</li>
              </ul>
            </div>
          </div>
          <Button size="sm" onClick={ackDisclosure} className="w-full sm:w-auto">
            I understand — open the copilot
          </Button>
        </div>
      ) : !userContext || editingContext ? (
        <IntakeForm
          initial={userContext}
          onSubmit={(ctx) => {
            writeUserContext(ctx);
            setUserContext(ctx);
            setEditingContext(false);
          }}
          onSkip={
            userContext
              ? () => setEditingContext(false)
              : () => {
                  // Allow skipping the intake — store a minimal "other / other" context
                  // so we don't keep nagging. The user can always edit later.
                  const fallback: UserContext = { role: 'other', goal: 'other', domain: '' };
                  writeUserContext(fallback);
                  setUserContext(fallback);
                }
          }
        />
      ) : (
        <>
          {/* Chat history */}
          <div
            ref={scrollRef}
            className={cn(
              'border border-border bg-secondary/20 p-3 overflow-y-auto text-sm',
              isFlat ? 'flex-1 min-h-[200px]' : 'h-[280px]',
            )}
          >
            {isEmpty ? (
              <div className="text-xs text-muted-foreground space-y-3">
                <p>
                  Ask about an event, compare events, or get prep advice. Replies are short and
                  opinionated.
                </p>
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase tracking-widest font-mono">Try</div>
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => void send(q)}
                      className="block w-full text-left text-xs px-3 py-2.5 border border-border bg-background hover:border-foreground/40 hover:text-foreground transition-colors min-h-[40px]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'text-xs whitespace-pre-wrap leading-relaxed',
                      m.role === 'user'
                        ? 'border-l-2 border-foreground pl-2 text-foreground'
                        : 'border-l-2 border-primary pl-2 text-foreground/90',
                    )}
                  >
                    <div className="text-[9px] uppercase tracking-widest font-mono text-muted-foreground mb-0.5">
                      {m.role === 'user' ? user?.name ?? 'You' : 'Copilot'}
                    </div>
                    {m.content}
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Thinking…
                  </div>
                )}
                {error && (
                  <div className="flex items-start gap-2 text-xs text-destructive border border-destructive/40 bg-destructive/5 p-2">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">Copilot couldn't answer.</div>
                      <div className="text-muted-foreground mt-0.5">{error}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User context summary + edit button */}
          {userContext && userContext.domain && (
            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span className="truncate">
                Context: <span className="text-foreground">{userContext.role}</span> · {userContext.domain}
              </span>
              <button
                type="button"
                onClick={() => setEditingContext(true)}
                className="inline-flex items-center gap-1 text-primary hover:underline shrink-0"
              >
                <Pencil className="h-3 w-3" />
                edit
              </button>
            </div>
          )}

          {/* Quota badge */}
          {!isAuthenticated ? (
            <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
              <span>
                {usesLeft} of {FREE_USES_LIMIT} free question{usesLeft === 1 ? '' : 's'} left
              </span>
              {authEnabled && (
                <button
                  type="button"
                  onClick={() => setSignInOpen(true)}
                  className="text-primary hover:underline"
                >
                  Sign in for more
                </button>
              )}
            </div>
          ) : (
            <div className="text-[11px] font-mono text-muted-foreground">
              {signedDailyLeft} of {SIGNED_IN_DAILY_LIMIT} questions left today
            </div>
          )}

          {/* Input */}
          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about an event…"
              className="h-10 text-sm"
              disabled={loading}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            <Button type="submit" size="sm" disabled={loading || !input.trim()} className="h-10 px-4">
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-[10px] text-muted-foreground font-mono leading-snug">
            Free open model · {AI_INSIGHTS_CONFIG.maxTokens}-token cap · responses can be wrong; do
            not paste personal info; verify before acting.
          </p>
        </>
      )}
    </div>
  );

  if (isFlat) {
    return (
      <>
        {body}
        {authEnabled && <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />}
      </>
    );
  }

  return (
    <>
      <Card className="border-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between gap-2 text-base">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Discovery copilot
            </span>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                aria-label="Reset conversation"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">{body}</CardContent>
      </Card>
      {authEnabled && <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />}
    </>
  );
}

interface IntakeFormProps {
  initial: UserContext | null;
  onSubmit: (ctx: UserContext) => void;
  onSkip: () => void;
}

const ROLE_OPTIONS: Array<{ value: UserContext['role']; label: string }> = [
  { value: 'founder', label: 'Founder' },
  { value: 'business', label: 'BD / Strategy' },
  { value: 'investor', label: 'Investor' },
  { value: 'student', label: 'Student / Researcher' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'jobseeker', label: 'Job seeker' },
  { value: 'other', label: 'Other' },
];

const GOAL_OPTIONS: Array<{ value: UserContext['goal']; label: string }> = [
  { value: 'attend', label: 'Pick events to attend' },
  { value: 'partners', label: 'Find partners' },
  { value: 'sell', label: 'Sell into UAE healthcare' },
  { value: 'invest', label: 'Source investments' },
  { value: 'hire', label: 'Hire / get hired' },
  { value: 'learn', label: 'Learn the landscape' },
  { value: 'other', label: 'Other' },
];

function IntakeForm({ initial, onSubmit, onSkip }: IntakeFormProps) {
  const [role, setRole] = useState<UserContext['role']>(initial?.role ?? 'founder');
  const [goal, setGoal] = useState<UserContext['goal']>(initial?.goal ?? 'attend');
  const [domain, setDomain] = useState(initial?.domain ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ role, goal, domain: domain.trim(), notes: notes.trim() || undefined });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-primary/30 bg-primary/5 p-3 space-y-3"
    >
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          You are
        </label>
        <div className="flex flex-wrap gap-1">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              className={cn(
                'px-2 py-1 text-[11px] border transition-colors',
                role === opt.value
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          Goal here
        </label>
        <div className="flex flex-wrap gap-1">
          {GOAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setGoal(opt.value)}
              className={cn(
                'px-2 py-1 text-[11px] border transition-colors',
                goal === opt.value
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          Domain or topic <span className="opacity-60">(free text)</span>
        </label>
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="e.g. AI radiology, IVF, process mining, telehealth"
          className="h-9 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
          Anything else? <span className="opacity-60">(optional)</span>
        </label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. early-stage, no UAE pilot yet"
          className="h-9 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" size="sm" className="flex-1 sm:flex-initial">
          Save and start
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
          {initial ? 'Cancel' : 'Skip'}
        </Button>
      </div>
    </form>
  );
}
