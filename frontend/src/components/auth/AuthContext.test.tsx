/**
 * Regression test for AuthContext mock-auth safety.
 *
 * The auth scaffolding (AuthContext + SignInModal) is intentionally kept in the
 * tree for the future real-auth phase. Until then, mock signIn() MUST be a
 * no-op in production builds — otherwise any string typed into SignInModal
 * would flip `isAuthenticated` to true and lift the Discovery copilot quota
 * from FREE_USES_LIMIT to SIGNED_IN_DAILY_LIMIT (10x bigger), bypassing cost
 * controls on the LLM provider for free.
 *
 * If this test starts failing because real auth shipped: delete the test, not
 * the guard. The guard goes away when AuthProvider is rewritten end-to-end.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';

describe('AuthContext mock-auth production guard', () => {
  let AuthProvider: typeof import('./AuthContext').AuthProvider;
  let useAuth: typeof import('./AuthContext').useAuth;

  async function loadModuleWithProdMode(prod: boolean) {
    vi.resetModules();
    vi.stubEnv('PROD', prod);
    const mod = await import('./AuthContext');
    AuthProvider = mod.AuthProvider;
    useAuth = mod.useAuth;
  }

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('when import.meta.env.PROD === true', () => {
    beforeEach(async () => {
      await loadModuleWithProdMode(true);
    });

    it('exposes authEnabled === false', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.authEnabled).toBe(false);
    });

    it('signIn does not mutate user state (cost-control bypass guard)', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.signIn('attacker@example.com');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('[auth] signIn() is a no-op in production builds'),
      );
    });

    it('signUp does not mutate user state', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.signUp('Attacker', 'attacker@example.com');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('when import.meta.env.PROD === false (dev build)', () => {
    beforeEach(async () => {
      await loadModuleWithProdMode(false);
    });

    it('exposes authEnabled === true', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.authEnabled).toBe(true);
    });

    it('signIn does mutate user state (mock still works in dev)', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.signIn('dev@example.com');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('dev@example.com');
    });
  });
});
