import { useState, useEffect } from 'react';
import { statsService } from '../services/statsService';
import { challengeService } from '../services/challengeService';
import type { AdminDashboard as AdminDashboardData, ParticipantStats } from '../types/stats';

interface AdminDashboardProps {
  challengeId: string;
  minWorkoutsPerWeek: number;
  onAddWorkout: (userId: string, userName: string) => void;
  onChallengeUpdate?: () => void;
}

export function AdminDashboard({
  challengeId,
  minWorkoutsPerWeek,
  onAddWorkout,
  onChallengeUpdate,
}: AdminDashboardProps) {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ userId: string; name: string } | null>(null);
  const [removeDeleteData, setRemoveDeleteData] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [challengeId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await statsService.getAdminDashboard(challengeId);
      setDashboard(data);
      setError(null);
    } catch (err) {
      setError('Failed to load admin dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async () => {
    if (!removeTarget) return;
    try {
      setRemoveLoading(true);
      await challengeService.removeParticipant(challengeId, removeTarget.userId, removeDeleteData);
      setRemoveTarget(null);
      setRemoveDeleteData(false);
      loadDashboard();
      onChallengeUpdate?.();
    } catch (err) {
      console.error('Failed to remove participant:', err);
    } finally {
      setRemoveLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-20 w-full" />
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-24 w-full" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="text-center py-6">
        <p className="text-sm mb-2" style={{ color: 'hsl(var(--destructive))' }}>
          {error || 'Failed to load dashboard'}
        </p>
        <button
          onClick={loadDashboard}
          className="btn-press text-sm font-medium px-4 py-1.5 text-white"
          style={{ background: 'var(--gradient-primary)', borderRadius: 'var(--radius)' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in-up">
      {/* Behind This Week */}
      {dashboard.behindParticipants.length > 0 && (
        <div
          className="card p-3"
          style={{ borderLeft: '3px solid #FF3B30' }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--destructive))' }}>
            Behind This Week ({dashboard.behindParticipants.length})
          </p>
          <div className="space-y-2">
            {dashboard.behindParticipants.map((p) => (
              <div
                key={p.userId}
                className="flex items-center justify-between py-1.5"
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                    {p.name || 'Unknown'}
                  </p>
                  <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    <span className="stat-number">{p.weeklyWorkouts}</span>/{p.required} — {p.shortfall} behind
                  </p>
                </div>
                <button
                  onClick={() => onAddWorkout(p.userId, p.name || 'Unknown')}
                  className="btn-press px-2.5 py-1 text-xs font-bold text-white"
                  style={{ background: 'var(--gradient-primary)', borderRadius: 'var(--radius)' }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participants */}
      <div className="card">
        <div className="px-3 py-2" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Participants
          </p>
        </div>
        {dashboard.stats.participants.map((p: ParticipantStats, i: number) => (
          <div
            key={p.userId}
            className="px-3 py-2.5 flex items-center justify-between"
            style={{ borderTop: i > 0 ? '1px solid hsl(var(--border))' : undefined }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>
                  {p.name || p.email || 'Unknown'}
                </p>
                {p.isAdmin && (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5" style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', borderRadius: 'var(--radius)' }}>
                    Admin
                  </span>
                )}
              </div>
              <div className="flex gap-2 text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <span><span className="stat-number">{p.totalWorkouts}</span> total</span>
                <span><span className="stat-number">{p.weeklyWorkouts}</span>/{minWorkoutsPerWeek} this week</span>
                {p.currentStreak > 0 && (
                  <span style={{ color: '#FF3B30' }}>
                    <span className="stat-number">{p.currentStreak}</span>w streak
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="stat-number text-sm"
                style={{ color: p.debt === 0 ? '#1DB954' : 'hsl(var(--destructive))' }}
              >
                {p.debt === 0 ? '—' : `$${p.debt}`}
              </span>
              <button
                onClick={() => onAddWorkout(p.userId, p.name || p.email || 'Unknown')}
                className="btn-press px-2 py-1 text-xs font-medium"
                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', borderRadius: 'var(--radius)' }}
              >
                Add
              </button>
              {!p.isAdmin && (
                <button
                  onClick={() => setRemoveTarget({ userId: p.userId, name: p.name || p.email || 'Unknown' })}
                  className="btn-press px-2 py-1 text-xs font-medium"
                  style={{
                    background: 'hsl(var(--destructive) / 0.1)',
                    color: 'hsl(var(--destructive))',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="px-3 py-2" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Recent Activity
          </p>
        </div>
        {dashboard.recentActivity.length > 0 ? (
          dashboard.recentActivity.map((activity, i) => (
            <div
              key={activity._id}
              className="px-3 py-2.5 flex items-center gap-3"
              style={{ borderTop: i > 0 ? '1px solid hsl(var(--border))' : undefined }}
            >
              {activity.photoUrl ? (
                <img src={activity.photoUrl} alt="Workout" className="w-9 h-9 object-cover" style={{ borderRadius: 'var(--radius)' }} />
              ) : (
                <div className="w-9 h-9 flex items-center justify-center text-[9px]" style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', borderRadius: 'var(--radius)' }}>
                  —
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>
                  {activity.userName || 'Unknown'}
                </p>
                <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {new Date(activity.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                {activity.source === 'admin' && (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5" style={{ background: 'hsl(var(--secondary) / 0.1)', color: 'hsl(var(--secondary))', borderRadius: 'var(--radius)' }}>
                    Admin
                  </span>
                )}
                <p className="text-[10px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {formatDate(activity.createdAt)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="px-3 py-6 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            No activity yet
          </div>
        )}
      </div>

      {/* Remove Participant Modal */}
      {removeTarget && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'hsl(var(--foreground) / 0.5)', backdropFilter: 'blur(8px)' }}
          onClick={() => {
            setRemoveTarget(null);
            setRemoveDeleteData(false);
          }}
        >
          <div
            className="glass rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              Remove {removeTarget.name}?
            </h3>
            <p className="text-sm mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
              This will remove them from the challenge.
            </p>

            <label
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors mb-4"
              style={{
                background: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
              }}
            >
              <input
                type="checkbox"
                checked={removeDeleteData}
                onChange={(e) => setRemoveDeleteData(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <div>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                  Also delete their workout data
                </p>
                <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Remove all their logged workouts from this challenge
                </p>
              </div>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRemoveTarget(null);
                  setRemoveDeleteData(false);
                }}
                disabled={removeLoading}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300"
                style={{
                  background: 'hsl(var(--muted))',
                  color: 'hsl(var(--muted-foreground))',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveParticipant}
                disabled={removeLoading}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:opacity-90 disabled:opacity-50"
                style={{
                  background: 'hsl(var(--destructive))',
                  color: 'white',
                }}
              >
                {removeLoading ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
