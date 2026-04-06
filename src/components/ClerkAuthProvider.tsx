import { useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setTokenGetter } from '../lib/api';

interface ClerkAuthProviderProps {
  children: React.ReactNode;
}

export function ClerkAuthProvider({ children }: ClerkAuthProviderProps) {
  const { getToken, isLoaded } = useAuth();
  const isSetup = useRef(false);

  // Set up token getter synchronously on first render when Clerk is loaded
  if (isLoaded && !isSetup.current) {
    setTokenGetter(async () => {
      try {
        return await getToken();
      } catch {
        return null;
      }
    });
    isSetup.current = true;
  }

  return <>{children}</>;
}
