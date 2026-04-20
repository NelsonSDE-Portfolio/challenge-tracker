import { useState } from 'react';
import { ChallengeSettings } from './ChallengeSettings';
import { AdminDashboard } from './AdminDashboard';
import { AdminAddWorkout } from './AdminAddWorkout';
import type { Challenge } from '../types/challenge';

interface AdminPanelProps {
  challenge: Challenge;
  onClose: () => void;
  onChallengeUpdate: () => void;
}

type AdminView = 'dashboard' | 'settings' | 'addWorkout';

export function AdminPanel({ challenge, onClose, onChallengeUpdate }: AdminPanelProps) {
  const [view, setView] = useState<AdminView>('dashboard');
  const [addWorkoutData, setAddWorkoutData] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  const handleAddWorkout = (userId: string, userName: string) => {
    setAddWorkoutData({ userId, userName });
    setView('addWorkout');
  };

  const handleAddWorkoutSuccess = () => {
    setAddWorkoutData(null);
    setView('dashboard');
    onChallengeUpdate();
  };

  const tabStyle = (active: boolean) => ({
    background: active ? 'var(--gradient-primary)' : 'hsl(var(--muted))',
    color: active ? 'white' : 'hsl(var(--muted-foreground))',
    borderRadius: 'var(--radius)',
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed inset-y-0 right-0 w-full max-w-md z-50 flex flex-col"
        style={{
          background: 'hsl(var(--background))',
          borderLeft: '1px solid hsl(var(--border))',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid hsl(var(--border))' }}
        >
          <h2 className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            Admin
          </h2>
          <button
            onClick={onClose}
            aria-label="Close admin panel"
            className="btn-press p-1.5 transition hover:opacity-70"
            style={{
              color: 'hsl(var(--muted-foreground))',
              borderRadius: 'var(--radius)',
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-2 px-4 py-2"
          style={{ borderBottom: '1px solid hsl(var(--border))' }}
        >
          <button
            onClick={() => setView('dashboard')}
            className="btn-press px-3 py-1.5 text-xs font-bold"
            style={tabStyle(view === 'dashboard')}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView('settings')}
            className="btn-press px-3 py-1.5 text-xs font-bold"
            style={tabStyle(view === 'settings')}
          >
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {view === 'dashboard' && (
            <AdminDashboard
              challengeId={challenge._id}
              minWorkoutsPerWeek={challenge.rules.minWorkoutsPerWeek}
              onAddWorkout={handleAddWorkout}
              onChallengeUpdate={onChallengeUpdate}
            />
          )}
          {view === 'settings' && (
            <ChallengeSettings
              challenge={challenge}
              onSuccess={() => { setView('dashboard'); onChallengeUpdate(); }}
              onCancel={() => setView('dashboard')}
            />
          )}
          {view === 'addWorkout' && addWorkoutData && (
            <AdminAddWorkout
              challengeId={challenge._id}
              userId={addWorkoutData.userId}
              userName={addWorkoutData.userName}
              onSuccess={handleAddWorkoutSuccess}
              onCancel={() => { setAddWorkoutData(null); setView('dashboard'); }}
            />
          )}
        </div>
      </div>
    </>
  );
}
