import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.tsx'

// Extend Window interface for Module Federation
declare global {
  interface Window {
    __FEDERATION__?: boolean;
  }
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// In standalone mode, we need ClerkProvider
// When loaded as a remote in the host, ClerkProvider comes from the host
const isStandalone = !window.__FEDERATION__;

function Root() {
  if (isStandalone) {
    if (!PUBLISHABLE_KEY) {
      return (
        <div className="p-8 text-center text-red-500">
          Missing VITE_CLERK_PUBLISHABLE_KEY environment variable
        </div>
      );
    }
    return (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <BrowserRouter basename="/challenges">
          <App />
        </BrowserRouter>
      </ClerkProvider>
    );
  }

  // When loaded as remote, App is wrapped by host's providers
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
