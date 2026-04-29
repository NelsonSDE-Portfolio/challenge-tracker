import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { useAuth } from './hooks/useAuth';
import { ClerkAuthProvider } from './components/ClerkAuthProvider';
import { ChallengeList } from './components/ChallengeList';
import { ChallengeDetail } from './components/ChallengeDetail';
import { CreateChallengeForm } from './components/CreateChallengeForm';
import { JoinChallengeForm } from './components/JoinChallengeForm';
import { JoinChallengePage } from './pages/JoinChallengePage';
import { LandingPage } from './pages/LandingPage';
import { ShareWorkoutPage } from './pages/ShareWorkoutPage';
import { isEmbedded, BackToPortfolioButton } from './components/BackToPortfolioButton';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

function ChallengeDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
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

  if (isLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ background: 'hsl(var(--background))' }}
      >
        <div style={{ borderBottom: '1px solid hsl(var(--border))' }}>
          <div className="max-w-3xl mx-auto px-6 py-6">
            <div className="skeleton h-5 w-48 mb-2" />
            <div className="skeleton h-7 w-36" />
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-3">
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
    >
      <BackToPortfolioButton />

      {/* Header — motivational statement, not just a title */}
      <header
        style={{ borderBottom: '1px solid hsl(var(--border))' }}
      >
        <div
          className="max-w-3xl mx-auto px-6 py-6"
          style={{ paddingLeft: isEmbedded() ? '6rem' : undefined }}
        >
          <div className="flex items-center justify-between">
            <div>
              <a
                href={import.meta.env.VITE_PORTFOLIO_URL || 'https://nelsonriera.com'}
                className="inline-flex items-center gap-1 text-xs font-medium mb-2 group"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <svg className="w-3 h-3 transition-transform duration-150 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Portfolio
              </a>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {greeting()}, <span style={{ color: 'hsl(var(--foreground))' }}>{user?.name || user?.email}</span>
              </p>
              <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                Your Challenges
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{
                  background: 'var(--gradient-primary)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-6">
        {showCreate ? (
          <div className="max-w-md mx-auto fade-in-up">
            <CreateChallengeForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        ) : showJoin ? (
          <div className="max-w-md mx-auto fade-in-up">
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
        <ErrorBoundary>
        <Routes>
          <Route path="/share/:shareToken" element={<ShareWorkoutPage />} />
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
                <BackToPortfolioButton />
                <header style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                  <div
                    className="max-w-3xl mx-auto px-6 py-6"
                    style={{ paddingLeft: isEmbedded() ? '6rem' : undefined }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center"
                        style={{
                          background: 'var(--gradient-secondary)',
                          borderRadius: 'var(--radius)',
                        }}
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                      <div>
                        <h1 className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                          Join Challenge
                        </h1>
                        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          You've been invited
                        </p>
                      </div>
                    </div>
                  </div>
                </header>
                <main className="max-w-3xl mx-auto px-6 py-6">
                  <JoinChallengePage />
                </main>
              </div>
            }
          />
        </Routes>
        </ErrorBoundary>
      </div>
    </ClerkAuthProvider>
  );
}

export default App;
