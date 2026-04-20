// Hook to access Clerk auth state
import { useUser } from '@clerk/clerk-react';

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
}

export function useAuth(): AuthState {
  const { user: clerkUser, isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
    };
  }

  if (!isSignedIn || !clerkUser) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }

  const user: User = {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    name: clerkUser.firstName || clerkUser.fullName || undefined,
  };

  return {
    user,
    token: null, // Token is fetched async via ClerkAuthProvider
    isAuthenticated: true,
    isLoading: false,
  };
}
