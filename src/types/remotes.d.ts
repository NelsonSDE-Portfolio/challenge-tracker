// Type declarations for Module Federation remotes

declare module 'portfolioHost/AuthContext' {
  import type { Context } from 'react';

  interface User {
    id: string;
    email: string;
    name?: string;
  }

  interface AuthContextValue {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
  }

  export const AuthContext: Context<AuthContextValue | null>;
  export function useAuth(): AuthContextValue;
  export function AuthProvider(props: { children: React.ReactNode }): JSX.Element;
}

declare module 'portfolioHost/authStore' {
  interface User {
    id: string;
    email: string;
    name?: string;
  }

  interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => void;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
    checkAuth: () => void;
    clearError: () => void;
  }

  export function useAuthStore(): AuthState;
}
