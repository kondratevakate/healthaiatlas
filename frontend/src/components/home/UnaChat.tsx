// Una chat intake (roadmap F0) — home page.
//
//   • One idea per screen: a question, a reply, then nothing else. No marketing,
//     no chips, no persona picker, no assessment UI.
//   • The visitor's text is sent to a Cloudflare Worker that holds the model
//     key and the abuse caps. Nothing is persisted here: the transcript lives
//     in React state only, and the single sessionStorage entry is an opaque
//     session id with no content in it. No analytics event ever carries
//     message text — there are no analytics calls in this file at all.
//   • Caps are mirrored client-side purely so the UI can fail gracefully:
//     1,500 chars per message, 6 turns per session, 12 messages in context.
//     The worker enforces the real limits; this only avoids sending requests
//     that are certain to be rejected.
//   • 429 → show the wait. kill-switch (`degraded: true`) → one static line and
//     a real way to reach a human; the worker's `formUrl` is deliberately NOT
//     rendered, because there is no endpoint behind it to receive a form.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  CONTACT_LINKEDIN_URL,
  UNA_CHAT_ENDPOINT,
  UNA_CHAT_MAX_CHARS,
  UNA_CHAT_MAX_MESSAGES,
  UNA_CHAT_MAX_TURNS,
  UNA_CHAT_TIMEOUT_MS,
} from '@/data/constants';
import { domains } from '@/data/domains';

type Role = 'user' | 'assistant';

interface Turn {
  role: Role;
  content: string;
}

type Status =
  | 'idle'
  | 'sending'
  | 'rateLimited'
  | 'degraded'
  | 'blocked'
  | 'error'
  | 'closed';

type Notice = 'none' | 'empty' | 'overLimit';

interface WorkerOk {
  content?: string;
  disclaimer?: string;
  degraded?: boolean;
  formUrl?: string;
}

interface WorkerErr {
  error?: string;
  reason?: string;
  retryAfter?: number | string;
}

const SESSION_STORAGE_KEY = 'una.chat.sessionId';

// One id per browser tab-session. It lets the worker count turns per session;
// it holds no personal data and is never sent anywhere else.
function getSessionId(): string {
  const fallback = `una-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const fresh =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : fallback;
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return fallback;
  }
}

const fmt = (template: string, n: string | number) => template.replace('{n}', String(n));

// The only "orientation surface" the Atlas already has: a domain row in the
// Directory. If Una's reply names one, point at it — one link, no new UI.
function matchDomain(reply: string, language: 'en' | 'ar') {
  const haystack = reply.toLowerCase();
  return (
    domains.find((d) => {
      if (d.id === 'overview') return false;
      if (haystack.includes(d.name[language].toLowerCase())) return true;
      return haystack.includes(d.id.replace(/-/g, ' '));
    }) ?? null
  );
}

export default function UnaChat() {
  const { t, language } = useLanguage();

  const [sessionId] = useState<string>(getSessionId);
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [notice, setNotice] = useState<Notice>('none');
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [turnsUsed, setTurnsUsed] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const turnsLeft = UNA_CHAT_MAX_TURNS - turnsUsed;
  const composerHidden =
    status === 'closed' || status === 'degraded' || status === 'blocked' || status === 'rateLimited';

  const lastReply = useMemo(() => {
    for (let i = transcript.length - 1; i >= 0; i -= 1) {
      if (transcript[i].role === 'assistant') return transcript[i].content;
    }
    return null;
  }, [transcript]);

  const suggestedDomain = useMemo(
    () => (lastReply ? matchDomain(lastReply, language) : null),
    [lastReply, language],
  );

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const raw = event.target.value;
    // Hard stop at the worker's limit. Whether the browser's own maxLength
    // clamps the text or this handler does, the visitor is told why the
    // characters stopped appearing.
    if (raw.length >= UNA_CHAT_MAX_CHARS) {
      setNotice('overLimit');
      setDraft(raw.slice(0, UNA_CHAT_MAX_CHARS));
      return;
    }
    if (notice === 'overLimit') setNotice('none');
    setDraft(raw);
  };

  const send = useCallback(async () => {
    const text = draft.trim();
    if (status === 'sending') return;
    if (text.length === 0) {
      setNotice('empty');
      inputRef.current?.focus();
      return;
    }
    if (text.length > UNA_CHAT_MAX_CHARS) {
      setNotice('overLimit');
      return;
    }
    if (turnsUsed >= UNA_CHAT_MAX_TURNS) {
      setStatus('closed');
      return;
    }

    const nextTranscript: Turn[] = [...transcript, { role: 'user', content: text }];
    setTranscript(nextTranscript);
    setDraft('');
    setNotice('none');
    setStatus('sending');

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), UNA_CHAT_TIMEOUT_MS);

    try {
      const response = await fetch(UNA_CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        // Message text goes straight to the worker and nowhere else.
        body: JSON.stringify({
          sessionId,
          messages: nextTranscript.slice(-UNA_CHAT_MAX_MESSAGES),
        }),
      });

      if (response.status === 429) {
        let seconds: number | null = null;
        try {
          const err = (await response.json()) as WorkerErr;
          const raw = err?.retryAfter;
          if (typeof raw === 'number') seconds = raw;
          else if (typeof raw === 'string' && Number.isFinite(Number(raw))) seconds = Number(raw);
        } catch {
          seconds = null;
        }
        if (seconds === null) {
          const header = Number(response.headers.get('retry-after'));
          seconds = Number.isFinite(header) && header > 0 ? header : null;
        }
        setRetryAfter(seconds);
        setStatus('rateLimited');
        return;
      }

      if (response.status === 403 || response.status === 400) {
        setStatus('blocked');
        return;
      }

      if (!response.ok) {
        setStatus('error');
        return;
      }

      const data = (await response.json()) as WorkerOk;
      if (typeof data?.disclaimer === 'string' && data.disclaimer.length > 0) {
        setDisclaimer(data.disclaimer);
      }

      // kill-switch: no chat, no dead form — one static line and a human.
      if (data?.degraded === true) {
        setStatus('degraded');
        return;
      }

      const content = typeof data?.content === 'string' ? data.content.trim() : '';
      if (content.length === 0) {
        setStatus('error');
        return;
      }

      setTranscript((prev) => [...prev, { role: 'assistant', content }]);
      const used = turnsUsed + 1;
      setTurnsUsed(used);
      setStatus(used >= UNA_CHAT_MAX_TURNS ? 'closed' : 'idle');
    } catch {
      if (controller.signal.aborted) return;
      setStatus('error');
    } finally {
      window.clearTimeout(timeout);
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [draft, sessionId, status, transcript, turnsUsed]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter') return;
    if (event.shiftKey || (event.nativeEvent as KeyboardEvent).isComposing) return;
    event.preventDefault();
    void send();
  };

  const canSend =
    status !== 'sending' &&
    turnsLeft > 0 &&
    draft.trim().length > 0 &&
    draft.length <= UNA_CHAT_MAX_CHARS;

  return (
    <section id="una" className="border-b border-border">
      <div className="container py-10 md:py-14">
        <h2 className="heading-lg">{t('una.title')}</h2>
        <p className="mt-2 max-w-2xl text-body-sm text-muted-foreground">{t('una.desc')}</p>

        {/* One live region for the whole exchange: the reply, the waits and the
            failures are all announced once, in order. */}
        <div aria-live="polite" className="mt-6 max-w-2xl">
          {transcript.length > 0 ? (
            <div className="space-y-5">
              {transcript.map((turn, i) => (
                <div key={`${i}-${turn.role}`} className="border-s-2 border-border ps-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {turn.role === 'user' ? t('una.you') : t('una.reply')}
                  </p>
                  <p
                    data-testid={turn.role === 'assistant' ? 'una-reply' : undefined}
                    className="mt-1 whitespace-pre-wrap text-body-sm text-foreground"
                  >
                    {turn.content}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {status === 'sending' ? (
            <p data-testid="una-status" className="mt-5 text-sm text-muted-foreground">
              {t('una.sending')}
            </p>
          ) : null}

          {status === 'rateLimited' ? (
            <p data-testid="una-status" className="mt-5 text-sm text-foreground">
              {retryAfter !== null && retryAfter < 60
                ? fmt(t('una.rateLimitSeconds'), Math.max(1, Math.ceil(retryAfter)))
                : fmt(t('una.rateLimit'), Math.max(1, Math.ceil((retryAfter ?? 3600) / 60)))}
            </p>
          ) : null}

          {status === 'degraded' ? (
            <p data-testid="una-status" className="mt-5 text-sm text-foreground">
              {t('una.degraded')}{' '}
              <a
                href={CONTACT_LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center underline decoration-1 underline-offset-4 hover:no-underline"
              >
                {t('una.degraded.action')}
              </a>
            </p>
          ) : null}

          {status === 'blocked' ? (
            <p data-testid="una-status" className="mt-5 text-sm text-foreground">
              {t('una.blocked')}
            </p>
          ) : null}

          {status === 'error' ? (
            <p data-testid="una-status" className="mt-5 text-sm text-foreground">
              {t('una.error')}
            </p>
          ) : null}

          {status === 'closed' ? (
            <p data-testid="una-status" className="mt-5 text-sm text-foreground">
              {t('una.closed')}
            </p>
          ) : null}

          {suggestedDomain ? (
            <p className="mt-5 text-sm">
              <Link
                to={`/directory?domain=${suggestedDomain.id}`}
                className="inline-flex min-h-[44px] items-center underline decoration-1 underline-offset-4 hover:no-underline"
              >
                {t('una.next')}: {suggestedDomain.name[language]}
              </Link>
            </p>
          ) : null}

          {disclaimer ? (
            <p data-testid="una-disclaimer" className="mt-5 text-xs text-muted-foreground">
              {disclaimer}
            </p>
          ) : null}
        </div>

        {composerHidden ? null : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send();
            }}
            className="mt-6 max-w-2xl"
          >
            <label htmlFor="una-input" className="block text-sm font-medium text-foreground">
              {t('una.label')}
            </label>
            <textarea
              id="una-input"
              ref={inputRef}
              data-testid="una-input"
              value={draft}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              rows={4}
              maxLength={UNA_CHAT_MAX_CHARS}
              disabled={status === 'sending'}
              placeholder={t('una.placeholder')}
              className="mt-2 block w-full resize-y border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <p className="text-xs text-muted-foreground">
                {fmt(t('una.counter'), draft.length)}
                <span className="px-2" aria-hidden="true">
                  ·
                </span>
                {t('una.hint')}
                {turnsUsed > 0 ? (
                  <span className="block">{fmt(t('una.turn'), turnsUsed)}</span>
                ) : null}
              </p>
              <button
                type="submit"
                data-testid="una-send"
                disabled={!canSend}
                className="inline-flex h-11 min-w-[7rem] items-center justify-center border border-foreground px-5 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === 'sending' ? t('una.sending') : t('una.send')}
              </button>
            </div>

            {notice === 'empty' ? (
              <p data-testid="una-notice" className="mt-2 text-xs text-muted-foreground">
                {t('una.empty')}
              </p>
            ) : null}
            {notice === 'overLimit' ? (
              <p data-testid="una-notice" className="mt-2 text-xs text-muted-foreground">
                {t('una.overLimit')}
              </p>
            ) : null}

            <p className="mt-4 text-xs text-muted-foreground">{t('una.caution')}</p>
          </form>
        )}
      </div>
    </section>
  );
}
