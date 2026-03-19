// Hook to access auth from localStorage (shared with host)
// The auth state is stored in localStorage by the host app and can be read by the remote

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');

  let user: User | null = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch {
      user = null;
    }
  }

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
  };
}

export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function getAuthUser(): User | null {
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}
