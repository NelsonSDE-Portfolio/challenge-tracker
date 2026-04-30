import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { statsService } from '../services/statsService';
import { challengeService } from '../services/challengeService';
import { HeroActionCard } from './HeroActionCard';
import { QuickStatsBar } from './QuickStatsBar';
import { CompactWeeklyGrid } from './CompactWeeklyGrid';
import { DebtScoreboard } from './DebtScoreboard';
import { AdminPanel } from './AdminPanel';
import { SectionNav } from './SectionNav';
import { WorkoutDetailModal } from './WorkoutDetailModal';
import type { Challenge, Participant } from '../types/challenge';
import type { ChallengeStats, MyStats, AllWeeksDebt, WeeklyProgress } from '../types/stats';

interface UnifiedDashboardProps {
  challenge: Challenge;
  onChallengeUpdate: () => void;
}

export function UnifiedDashboard({ challenge, onChallengeUpdate }: UnifiedDashboardProps) {
  const navigate = useNavigate();
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [challengeStats, setChallengeStats] = useState<ChallengeStats | null>(null);
  const [allWeeksDebt, setAllWeeksDebt] = useState<AllWeeksDebt | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [leaveDeleteData, setLeaveDeleteData] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [workoutDetail, setWorkoutDetail] = useState<{
    userId: string;
    userName: string;
    date: string;
  } | null>(null);

  // Close modals and menus on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showOverflowMenu) setShowOverflowMenu(false);
        else if (showInviteModal) setShowInviteModal(false);
        else if (showLeaveModal) { setShowLeaveModal(false); setLeaveDeleteData(false); }
        else if (showAdminPanel) setShowAdminPanel(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showOverflowMenu, showInviteModal, showLeaveModal, showAdminPanel]);

  useEffect(() => {
    loadAllData();
  }, [challenge._id]);

  useEffect(() => {
    loadWeeklyProgress();
  }, [challenge._id, weekOffset]);

  const loadAllData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [stats, personal, debt, weekly] = await Promise.all([
        statsService.getChallengeStats(challenge._id),
        statsService.getMyStats(challenge._id),
        statsService.getAllWeeksDebt(challenge._id),
        statsService.getWeeklyProgress(challenge._id, weekOffset),
      ]);
      setChallengeStats(stats);
      setMyStats(personal);
      setAllWeeksDebt(debt);
      setWeeklyProgress(weekly);
      setError(null);
    } catch (err) {
      if (!silent) setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Silent refresh — no loading state, no re-mount
  const refreshDataSilently = () => loadAllData(true);

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

  const loadParticipants = async () => {
    try {
      const list = await challengeService.getParticipants(challenge._id);
      setParticipants(list);
    } catch (err) {
      console.error('Failed to load participants:', err);
    }
  };

  const handleOpenInvite = () => {
    setInviteError(null);
    setInviteSuccess(null);
    setShowInviteModal(true);
    loadParticipants();
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      const res = await challengeService.invite(
        challenge._id,
        inviteEmail.trim(),
        inviteName.trim() || undefined,
      );
      setInviteSuccess(
        res.pending
          ? `Pending invite created for ${inviteEmail.trim()}. They'll join automatically when they sign up.`
          : `${inviteEmail.trim()} was added to the challenge.`,
      );
      setInviteEmail('');
      setInviteName('');
      await loadParticipants();
      onChallengeUpdate();
      loadAllData();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } | string } } })
          ?.response?.data?.error;
      setInviteError(
        typeof message === 'string'
          ? message
          : message?.message || 'Failed to send invite',
      );
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRevokeInvite = async (userId: string) => {
    try {
      await challengeService.revokeInvite(challenge._id, userId);
      await loadParticipants();
      onChallengeUpdate();
      loadAllData();
    } catch (err) {
      console.error('Failed to revoke invite:', err);
    }
  };

  const handleLeaveChallenge = async () => {
    try {
      setLeaveLoading(true);
      await challengeService.leave(challenge._id, leaveDeleteData);
      setShowLeaveModal(false);
      navigate('..');
    } catch (err) {
      console.error('Failed to leave challenge:', err);
      setLeaveLoading(false);
    }
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
            onClick={() => loadAllData()}
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
      {/* Header — consistent with dashboard */}
      <header style={{ borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link
              to=".."
              className="flex items-center gap-2 group py-2 px-3 -ml-3 rounded-lg transition-colors"
              style={{ color: 'hsl(var(--foreground))' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--muted))'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg
                className="w-5 h-5 transition-transform duration-150 group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-semibold">Challenges</span>
            </Link>
            <div className="flex items-center gap-2">
              {getStatusBadge(challenge.status)}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9',
                  },
                }}
              />
              {/* Overflow menu */}
              <div className="relative">
                <button
                  onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                  aria-label="More options"
                  className="btn-press w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    background: showOverflowMenu ? 'hsl(var(--muted))' : 'transparent',
                    color: 'hsl(var(--muted-foreground))',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
                  </svg>
                </button>

                {showOverflowMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowOverflowMenu(false)}
                    />
                    <div
                      className="absolute right-0 top-full mt-2 w-48 z-50 py-1 rounded-xl shadow-lg fade-in-up"
                      style={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    >
                      {challenge.isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              setShowOverflowMenu(false);
                              handleOpenInvite();
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-3 transition-colors"
                            style={{ color: 'hsl(var(--foreground))' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--muted))'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: 'hsl(var(--primary))' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Invite Friends
                          </button>
                          <button
                            onClick={() => {
                              setShowOverflowMenu(false);
                              if (adminMode) {
                                setAdminMode(false);
                                setShowAdminPanel(false);
                              } else {
                                setAdminMode(true);
                              }
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-3 transition-colors"
                            style={{ color: adminMode ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--muted))'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: adminMode ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {adminMode ? 'Exit Admin Mode' : 'Admin Mode'}
                          </button>
                          <div
                            className="my-1"
                            style={{ borderTop: '1px solid hsl(var(--border))' }}
                          />
                        </>
                      )}
                      <button
                        onClick={() => {
                          setShowOverflowMenu(false);
                          setShowLeaveModal(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-3 transition-colors"
                        style={{ color: 'hsl(var(--destructive))' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--destructive) / 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Leave Challenge
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Section Navigation */}
      <SectionNav
        sections={[
          { id: 'section-overview', label: 'Overview' },
          { id: 'section-schedule', label: 'Schedule' },
          { id: 'section-leaderboard', label: 'Leaderboard' },
        ]}
      />

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
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

        {/* Overview Section */}
        <div id="section-overview">
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
            <div className="mt-6">
              <QuickStatsBar
                myStats={myStats}
                challengeStats={challengeStats}
              />
            </div>
          )}
        </div>

        {/* Schedule Section */}
        <div id="section-schedule">
          {weeklyProgress && (
            <CompactWeeklyGrid
              progress={weeklyProgress}
              challengeId={challenge._id}
              challengeStartDate={challenge.startDate}
              weekOffset={weekOffset}
              onWeekChange={setWeekOffset}
              onDataChange={refreshDataSilently}
              isAdmin={adminMode}
              onViewWorkout={(userId, userName, date) =>
                setWorkoutDetail({ userId, userName, date })
              }
            />
          )}
        </div>

        {/* Leaderboard Section */}
        <div id="section-leaderboard">
          {allWeeksDebt && (
            <DebtScoreboard allWeeksDebt={allWeeksDebt} />
          )}
        </div>

        {/* Admin Tools — only in admin mode */}
        {adminMode && (
          <div className="card p-4 fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                  Admin Tools
                </p>
                <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Manage participants, settings, and data
                </p>
              </div>
              <button
                onClick={() => setShowAdminPanel(true)}
                className="btn-press px-4 py-2 text-xs font-bold text-white"
                style={{
                  background: 'var(--gradient-primary)',
                  borderRadius: 'var(--radius)',
                }}
              >
                Open Panel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Panel Slide-out */}
      {showAdminPanel && adminMode && (
        <AdminPanel
          challenge={challenge}
          onClose={() => setShowAdminPanel(false)}
          onChallengeUpdate={onChallengeUpdate}
        />
      )}

      {/* Leave Challenge Modal */}
      {showLeaveModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'hsl(var(--foreground) / 0.5)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowLeaveModal(false)}
        >
          <div
            className="glass rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'hsl(var(--destructive) / 0.1)',
                  border: '1px solid hsl(var(--destructive) / 0.2)',
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'hsl(var(--destructive))' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h3
                  className="text-xl font-bold"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  Leave Challenge
                </h3>
                <p
                  className="text-sm"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Are you sure you want to leave this challenge?
                </p>
              </div>
            </div>

            <label
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
              style={{
                background: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
              }}
            >
              <input
                type="checkbox"
                checked={leaveDeleteData}
                onChange={(e) => setLeaveDeleteData(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <div>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                  Delete my workout data
                </p>
                <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Remove all your logged workouts from this challenge
                </p>
              </div>
            </label>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowLeaveModal(false);
                  setLeaveDeleteData(false);
                }}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300"
                style={{
                  background: 'hsl(var(--muted))',
                  color: 'hsl(var(--muted-foreground))',
                }}
                disabled={leaveLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveChallenge}
                disabled={leaveLoading}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:opacity-90 disabled:opacity-50"
                style={{
                  background: 'hsl(var(--destructive))',
                  color: 'white',
                }}
              >
                {leaveLoading ? 'Leaving...' : 'Leave Challenge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Friend Modal — admin only */}
      {showInviteModal && challenge.isAdmin && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'hsl(var(--foreground) / 0.5)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="glass rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 fade-in-up max-h-[90vh] overflow-y-auto"
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
                  Invite a friend
                </h3>
                <p
                  className="text-sm"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  They'll join automatically when they sign up with this email.
                </p>
              </div>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3 mb-4">
              <div>
                <label
                  className="text-xs font-medium block mb-2"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'hsl(var(--muted))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
              </div>
              <div>
                <label
                  className="text-xs font-medium block mb-2"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Display name (optional)
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Alex"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: 'hsl(var(--muted))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
              </div>

              {inviteError && (
                <p className="text-xs" style={{ color: 'hsl(var(--destructive))' }}>
                  {inviteError}
                </p>
              )}
              {inviteSuccess && (
                <p className="text-xs" style={{ color: 'hsl(var(--accent))' }}>
                  {inviteSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={inviteLoading || !inviteEmail.trim()}
                className="w-full px-4 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {inviteLoading ? 'Sending...' : 'Send invite'}
              </button>
            </form>

            {participants.filter((p) => p.pendingInvite).length > 0 && (
              <div className="border-t pt-4" style={{ borderColor: 'hsl(var(--border))' }}>
                <p
                  className="text-xs font-medium uppercase tracking-wider mb-3"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  Pending invites
                </p>
                <ul className="space-y-2">
                  {participants
                    .filter((p) => p.pendingInvite)
                    .map((p) => (
                      <li
                        key={p.userId}
                        className="flex items-center justify-between rounded-lg p-3"
                        style={{ background: 'hsl(var(--muted) / 0.5)' }}
                      >
                        <div className="min-w-0">
                          <p
                            className="text-sm font-medium truncate"
                            style={{ color: 'hsl(var(--foreground))' }}
                          >
                            {p.name || p.email}
                          </p>
                          {p.name && p.email && (
                            <p
                              className="text-xs truncate"
                              style={{ color: 'hsl(var(--muted-foreground))' }}
                            >
                              {p.email}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRevokeInvite(p.userId)}
                          className="text-xs font-medium px-2 py-1 rounded-md"
                          style={{
                            color: 'hsl(var(--destructive))',
                            background: 'hsl(var(--destructive) / 0.1)',
                          }}
                        >
                          Revoke
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setShowInviteModal(false)}
              className="w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                background: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Workout Detail Modal */}
      {workoutDetail && (
        <WorkoutDetailModal
          challengeId={challenge._id}
          userId={workoutDetail.userId}
          userName={workoutDetail.userName}
          date={workoutDetail.date}
          onClose={() => setWorkoutDetail(null)}
        />
      )}
    </div>
  );
}
