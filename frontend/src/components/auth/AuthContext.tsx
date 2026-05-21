import React, { createContext, useContext, useState, ReactNode } from 'react';

// MOCK AUTH — this is dev-only scaffolding kept in the tree for the future
// account-system phase. It MUST NOT grant any privilege in production builds:
// the Discovery copilot uses `isAuthenticated` to raise the daily quota from
// FREE_USES_LIMIT to SIGNED_IN_DAILY_LIMIT (EventInsights.tsx). With this mock
// active in prod, any string typed into SignInModal would lift that quota for
// free — a trivial cost-control bypass against the LLM provider. So signIn /
// signUp are no-ops anywhere `import.meta.env.PROD === true`.
//
// When real auth lands: replace this provider wholesale and delete the guard.

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  /** Indicates the mock auth path is reachable. Always false in production builds. */
  authEnabled: boolean;
  signIn: (email: string) => void;
  signUp: (name: string, email: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// `import.meta.env.PROD` is set by Vite at build time. Tests can override by
// stubbing `import.meta.env.PROD` via vi.stubEnv.
const AUTH_ENABLED = !import.meta.env.PROD;

function warnIfBlocked(action: string) {
  if (!AUTH_ENABLED && typeof console !== 'undefined') {
    console.error(
      `[auth] ${action}() is a no-op in production builds. ` +
        'Mock auth must not grant privileges in prod; see AuthContext.tsx.',
    );
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = (email: string) => {
    if (!AUTH_ENABLED) {
      warnIfBlocked('signIn');
      return;
    }
    setUser({
      id: 'user-1',
      name: email.split('@')[0],
      email,
    });
  };

  const signUp = (name: string, email: string) => {
    if (!AUTH_ENABLED) {
      warnIfBlocked('signUp');
      return;
    }
    setUser({
      id: 'user-1',
      name,
      email,
    });
  };

  const signOut = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      authEnabled: AUTH_ENABLED,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
