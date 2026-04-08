import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsService } from '../services/statsService';
import { HeroActionCard } from './HeroActionCard';
import { QuickStatsBar } from './QuickStatsBar';
import { CompactWeeklyGrid } from './CompactWeeklyGrid';
import { DebtScoreboard } from './DebtScoreboard';
import { AdminPanel } from './AdminPanel';
import type { Challenge } from '../types/challenge';
import type { ChallengeStats, MyStats, AllWeeksDebt, WeeklyProgress } from '../types/stats';

interface UnifiedDashboardProps {
  challenge: Challenge;
  onChallengeUpdate: () => void;
}

export function UnifiedDashboard({ challenge, onChallengeUpdate }: UnifiedDashboardProps) {
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [challengeStats, setChallengeStats] = useState<ChallengeStats | null>(null);
  const [allWeeksDebt, setAllWeeksDebt] = useState<AllWeeksDebt | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    loadAllData();
  }, [challenge._id]);

  useEffect(() => {
    loadWeeklyProgress();
  }, [challenge._id, weekOffset]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [stats, personal, debt, weekly] = await Promise.all([
        statsService.getChallengeStats(challenge._id),
        statsService.getMyStats(challenge._id),
        statsService.getAllWeeksDebt(challenge._id),
        statsService.getWeeklyProgress(challenge._id, 0),
      ]);
      setChallengeStats(stats);
      setMyStats(personal);
      setAllWeeksDebt(debt);
      setWeeklyProgress(weekly);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyProgress = async () => {
    try {
      const weekly = await statsService.getWeeklyProgress(challenge._id, weekOffset);
      setWeeklyProgress(weekly);
    } catch (err) {
      console.error('Failed to load weekly progress:', err);
    }
  };

  const handleWorkoutLogged = () => {
    loadAllData();
    onChallengeUpdate();
  };

  const copyInviteLink = async () => {
    if (!challenge?.inviteCode) return;
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/join/${challenge.inviteCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: Challenge['status']) => {
    const styles = {
      active: {
        background: 'hsl(var(--primary) / 0.2)',
        color: 'hsl(var(--primary))',
        border: '1px solid hsl(var(--primary) / 0.3)',
      },
      upcoming: {
        background: 'hsl(var(--warning) / 0.2)',
        color: 'hsl(var(--warning))',
        border: '1px solid hsl(var(--warning) / 0.3)',
      },
      completed: {
        background: 'hsl(var(--muted))',
        color: 'hsl(var(--muted-foreground))',
        border: '1px solid hsl(var(--border))',
      },
    };
    const style = styles[status];
    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
        style={style}
      >
        {status === 'active' && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
        )}
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'hsl(var(--background))' }}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Animated loader */}
          <div className="relative">
            <div
              className="w-16 h-16 rounded-full animate-spin"
              style={{
                background: 'var(--gradient-primary)',
                mask: 'radial-gradient(circle at center, transparent 60%, black 61%)',
                WebkitMask: 'radial-gradient(circle at center, transparent 60%, black 61%)',
              }}
            />
            <div
              className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse"
              style={{ background: 'var(--gradient-primary)' }}
            />
          </div>
          <p
            className="text-sm font-medium"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'hsl(var(--background))' }}
      >
        <div className="glass text-center p-8 rounded-2xl max-w-md mx-4">
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'hsl(var(--destructive) / 0.1)',
              border: '1px solid hsl(var(--destructive) / 0.2)',
            }}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'hsl(var(--destructive))' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p
            className="font-semibold mb-2"
            style={{ color: 'hsl(var(--destructive))' }}
          >
            {error}
          </p>
          <p
            className="text-sm mb-6"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Please try again or check your connection.
          </p>
          <button
            onClick={loadAllData}
            className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
            style={{
              background: 'var(--gradient-primary)',
              color: 'white',
            }}
          >
            Try Again
          </button>
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

      {/* Header */}
      <div
        className="sticky top-0 z-30"
        style={{
          background: 'hsl(var(--background) / 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid hsl(var(--border))',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to=".."
              className="flex items-center gap-2 transition-colors duration-300 group"
              style={{ color: 'hsl(var(--muted-foreground))' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'hsl(var(--foreground))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
              }}
            >
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              {getStatusBadge(challenge.status)}
              {challenge.isAdmin && (
                <>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'hsl(var(--primary) / 0.1)',
                      color: 'hsl(var(--primary))',
                      border: '1px solid hsl(var(--primary) / 0.2)',
                    }}
                  >
                    Invite
                  </button>
                  <button
                    onClick={() => setShowAdminPanel(!showAdminPanel)}
                    className="p-2 rounded-xl transition-all duration-300"
                    style={{
                      background: 'hsl(var(--muted))',
                      color: 'hsl(var(--muted-foreground))',
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Challenge Title */}
        <div className="text-center fade-in-up">
          <h1
            className="text-3xl font-black mb-2"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            {challenge.name}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span
              className="px-3 py-1 rounded-lg"
              style={{
                background: 'hsl(var(--primary) / 0.1)',
                color: 'hsl(var(--primary))',
                border: '1px solid hsl(var(--primary) / 0.2)',
              }}
            >
              {challenge.rules.minWorkoutsPerWeek} workouts/week
            </span>
            <span
              className="px-3 py-1 rounded-lg"
              style={{
                background: 'hsl(var(--destructive) / 0.1)',
                color: 'hsl(var(--destructive))',
                border: '1px solid hsl(var(--destructive) / 0.2)',
              }}
            >
              ${challenge.rules.penaltyAmount} MXN per miss
            </span>
          </div>
        </div>

        {/* Hero Action Card - Log Workout */}
        {challenge.status === 'active' && myStats && weeklyProgress && (
          <HeroActionCard
            challengeId={challenge._id}
            myStats={myStats}
            minWorkoutsPerWeek={challenge.rules.minWorkoutsPerWeek}
            weeklyProgress={weeklyProgress}
            onWorkoutLogged={handleWorkoutLogged}
          />
        )}

        {/* Quick Stats Bar */}
        {myStats && challengeStats && (
          <QuickStatsBar
            myStats={myStats}
            challengeStats={challengeStats}
          />
        )}

        {/* Weekly Progress Grid */}
        {weeklyProgress && (
          <CompactWeeklyGrid
            progress={weeklyProgress}
            challengeStartDate={challenge.startDate}
            weekOffset={weekOffset}
            onWeekChange={setWeekOffset}
            isAdmin={challenge.isAdmin}
          />
        )}

        {/* Debt Scoreboard */}
        {allWeeksDebt && (
          <DebtScoreboard allWeeksDebt={allWeeksDebt} />
        )}
      </div>

      {/* Admin Panel Slide-out */}
      {showAdminPanel && challenge.isAdmin && (
        <AdminPanel
          challenge={challenge}
          onClose={() => setShowAdminPanel(false)}
          onChallengeUpdate={onChallengeUpdate}
        />
      )}

      {/* Invite Modal */}
      {showInviteModal && challenge.inviteCode && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'hsl(var(--foreground) / 0.5)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="glass rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  Invite Friends
                </h3>
                <p
                  className="text-sm"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Share this link or code
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="text-xs font-medium block mb-2"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Invite Code
                </label>
                <div
                  className="rounded-xl p-4 font-mono text-center text-2xl tracking-[0.3em] font-bold"
                  style={{
                    background: 'hsl(var(--primary) / 0.1)',
                    color: 'hsl(var(--primary))',
                    border: '1px solid hsl(var(--primary) / 0.2)',
                  }}
                >
                  {challenge.inviteCode}
                </div>
              </div>

              <div>
                <label
                  className="text-xs font-medium block mb-2"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Invite Link
                </label>
                <div
                  className="rounded-xl p-4 text-sm break-all"
                  style={{
                    background: 'hsl(var(--muted))',
                    color: 'hsl(var(--muted-foreground))',
                  }}
                >
                  {`${window.location.origin}/join/${challenge.inviteCode}`}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300"
                style={{
                  background: 'hsl(var(--muted))',
                  color: 'hsl(var(--muted-foreground))',
                }}
              >
                Close
              </button>
              <button
                onClick={copyInviteLink}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white',
                }}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
