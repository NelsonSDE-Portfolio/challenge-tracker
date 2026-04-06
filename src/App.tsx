import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ClerkAuthProvider } from './components/ClerkAuthProvider';
import { ChallengeList } from './components/ChallengeList';
import { ChallengeDetail } from './components/ChallengeDetail';
import { CreateChallengeForm } from './components/CreateChallengeForm';
import { JoinChallengeForm } from './components/JoinChallengeForm';
import { JoinChallengePage } from './pages/JoinChallengePage';
import './App.css';

// Check if running inside portfolio (embedded via Module Federation)
const isEmbedded = () => {
  try {
    return window.location.pathname.includes('/projects/challenge-tracker');
  } catch {
    return false;
  }
};

function BackToPortfolioButton() {
  if (!isEmbedded()) return null;

  return (
    <a
      href="/"
      className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition glass"
      style={{
        color: 'hsl(var(--muted-foreground))',
      }}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Portfolio
    </a>
  );
}

function ChallengeDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const navigate = useNavigate();

  const handleCreateSuccess = (challengeId: string) => {
    setShowCreate(false);
    navigate(challengeId);
  };

  const handleJoinSuccess = (challengeId: string) => {
    setShowJoin(false);
    navigate(challengeId);
  };

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'hsl(var(--background))' }}
      >
        <div className="glass text-center p-8 rounded-2xl max-w-md mx-4 fade-in-up">
          <div
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'var(--gradient-secondary)' }}
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            Please Log In
          </h2>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>
            You need to be logged in to access Challenge Tracker
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
    >
      {/* Ambient background glow (subtle for light mode) */}
      <div
        className="fixed top-0 left-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'hsl(186 100% 50%)', opacity: 0.1 }}
      />
      <div
        className="fixed bottom-0 right-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'hsl(270 60% 55%)', opacity: 0.05 }}
      />

      <BackToPortfolioButton />

      {/* Header */}
      <header
        className="relative"
        style={{ borderBottom: '1px solid hsl(var(--border))' }}
      >
        <div className="max-w-4xl mx-auto px-6 py-8" style={{ paddingLeft: isEmbedded() ? '6rem' : undefined }}>
          <div className="flex items-center gap-4 mb-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h1
                className="text-3xl font-black"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                Challenge Tracker
              </h1>
              <p
                className="text-sm"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                Track your accountability challenges
              </p>
            </div>
          </div>
          {user && (
            <p
              className="text-sm mt-4"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Logged in as <span style={{ color: 'hsl(var(--foreground))' }}>{user.name || user.email}</span>
            </p>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {showCreate ? (
          <div className="max-w-md mx-auto">
            <CreateChallengeForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        ) : showJoin ? (
          <div className="max-w-md mx-auto">
            <JoinChallengeForm
              onSuccess={handleJoinSuccess}
              onCancel={() => setShowJoin(false)}
            />
          </div>
        ) : (
          <ChallengeList
            onCreateClick={() => setShowCreate(true)}
            onJoinClick={() => setShowJoin(true)}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ClerkAuthProvider>
      <div className="challenge-tracker">
        <Routes>
          <Route path="/" element={<ChallengeDashboard />} />
          <Route
            path="/:id"
            element={
              <>
                <BackToPortfolioButton />
                <ChallengeDetail />
              </>
            }
          />
          <Route
            path="/join/:inviteCode"
            element={
              <div
                className="min-h-screen"
                style={{ background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
              >
                {/* Ambient background glow */}
                <div
                  className="fixed top-0 left-0 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
                  style={{ background: 'hsl(270 60% 55%)', opacity: 0.1 }}
                />
                <BackToPortfolioButton />
                <header
                  className="relative"
                  style={{ borderBottom: '1px solid hsl(var(--border))' }}
                >
                  <div className="max-w-4xl mx-auto px-6 py-8" style={{ paddingLeft: isEmbedded() ? '6rem' : undefined }}>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'var(--gradient-secondary)' }}
                      >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                      <div>
                        <h1
                          className="text-3xl font-black"
                          style={{ color: 'hsl(var(--foreground))' }}
                        >
                          Join Challenge
                        </h1>
                        <p
                          className="text-sm"
                          style={{ color: 'hsl(var(--muted-foreground))' }}
                        >
                          You've been invited!
                        </p>
                      </div>
                    </div>
                  </div>
                </header>
                <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
                  <JoinChallengePage />
                </main>
              </div>
            }
          />
        </Routes>
      </div>
    </ClerkAuthProvider>
  );
}

export default App;
