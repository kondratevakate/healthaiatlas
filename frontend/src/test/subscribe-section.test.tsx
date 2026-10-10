// subscribe-section.test.tsx ────────────────────────────────────────────────
//
// Newsletter signup form (components/home/SubscribeSection.tsx).
// A bad merge once left this file with duplicate declarations, so this test
// renders it and walks the paths that matter for GDPR and honesty:
//   • no endpoint configured -> nothing is sent, user is told it's not live
//   • no consent tick        -> nothing is sent
//   • consent + endpoint     -> email + consent timestamp are POSTed
//   • server error           -> user is NOT told they're subscribed
// ────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const toast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({ toast: (...a: unknown[]) => toast(...a) }));

const ENDPOINT = 'https://signup.example.test/subscribe';

async function mount(signupUrl: string) {
  vi.stubEnv('VITE_NEWSLETTER_SIGNUP_URL', signupUrl);
  vi.resetModules();
  // Fresh module graph so SIGNUP_URL is re-read; provider must come from it too.
  const { LanguageProvider } = await import('@/contexts/LanguageContext');
  const { SubscribeSection } = await import('@/components/home/SubscribeSection');
  render(
    <MemoryRouter>
      <LanguageProvider>
        <SubscribeSection />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

function fillAndSubmit({ consent }: { consent: boolean }) {
  fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
    target: { value: 'reader@example.test' },
  });
  if (consent) fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.submit(screen.getByPlaceholderText('Enter your email').closest('form')!);
}

describe('SubscribeSection', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Radix Checkbox measures itself; jsdom has no ResizeObserver.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    toast.mockClear();
    localStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('without an endpoint sends nothing and says signup is not live', async () => {
    await mount('');
    fillAndSubmit({ consent: true });
    await waitFor(() => expect(toast).toHaveBeenCalled());
    expect(toast.mock.calls[0][0].title).toBe('Signup not live yet');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('without consent sends nothing', async () => {
    await mount(ENDPOINT);
    fillAndSubmit({ consent: false });
    await waitFor(() => expect(toast).toHaveBeenCalled());
    expect(toast.mock.calls[0][0].title).toBe('Consent required');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('with consent posts email and consent timestamp, then confirms', async () => {
    fetchMock.mockResolvedValue({ ok: true });
    await mount(ENDPOINT);
    fillAndSubmit({ consent: true });
    await waitFor(() => expect(screen.getByText(/Your email is on the list/)).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(ENDPOINT);
    const body = JSON.parse(init.body);
    expect(body.email).toBe('reader@example.test');
    expect(Number.isNaN(Date.parse(body.consent_at))).toBe(false);
    // Only a flag is kept locally, never the address.
    expect(JSON.stringify({ ...localStorage })).not.toContain('reader@example.test');
  });

  it('on server error does not claim the user is subscribed', async () => {
    fetchMock.mockResolvedValue({ ok: false });
    await mount(ENDPOINT);
    fillAndSubmit({ consent: true });
    await waitFor(() => expect(toast).toHaveBeenCalled());
    expect(toast.mock.calls[0][0].title).toBe("Couldn't save your email");
    expect(screen.queryByText(/Your email is on the list/)).toBeNull();
  });
});
