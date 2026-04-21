import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SignUpButton } from '@clerk/clerk-react';
import { workoutService } from '../services/workoutService';
import { ACTIVITY_TYPES, MUSCLE_GROUPS } from '../constants';
import type { PublicWorkout } from '../types/workout';

export function ShareWorkoutPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [workout, setWorkout] = useState<PublicWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!shareToken) return;
    workoutService
      .getPublicWorkout(shareToken)
      .then(setWorkout)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [shareToken]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'hsl(var(--background))' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full animate-spin"
            style={{
              background: 'var(--gradient-primary)',
              mask: 'radial-gradient(circle at center, transparent 60%, black 61%)',
              WebkitMask: 'radial-gradient(circle at center, transparent 60%, black 61%)',
            }}
          />
        </div>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
      >
        <div className="glass text-center p-8 rounded-2xl max-w-md mx-4">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold mb-2">Workout not found</h2>
          <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
            This shared workout is no longer available.
          </p>
          <SignUpButton mode="modal">
            <button
              className="px-6 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Join Challenge Tracker
            </button>
          </SignUpButton>
        </div>
      </div>
    );
  }

  const activity = ACTIVITY_TYPES.find((a) => a.value === workout.activityType);
  const dateLabel = new Date(workout.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
  const { current, target } = workout.weeklyProgress;
  const isWeekComplete = current >= target;
  const progressPercent = Math.min((current / target) * 100, 100);

  // Build metadata display
  const metaItems: string[] = [];
  const meta = workout.metadata as Record<string, unknown> | undefined;
  if (meta?.durationMinutes) metaItems.push(`${meta.durationMinutes} min`);
  if (meta?.distanceKm) metaItems.push(`${meta.distanceKm} km`);
  if (meta?.distanceM) metaItems.push(`${meta.distanceM} m`);
  if (Array.isArray(meta?.muscleGroups)) {
    const labels = (meta.muscleGroups as string[]).map(
      (g) => MUSCLE_GROUPS.find((mg) => mg.value === g)?.label || g
    );
    metaItems.push(labels.join(', '));
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
    >
      <div className="max-w-lg mx-auto px-6 py-8 fade-in-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <span className="text-sm font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            Challenge Tracker
          </span>
        </div>

        {/* Photo */}
        {workout.photoUrl && (
          <div className="mb-6">
            <img
              src={workout.photoUrl}
              alt="Workout photo"
              className="w-full max-h-80 object-cover rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* No photo — gradient hero */}
        {!workout.photoUrl && (
          <div
            className="w-full h-48 rounded-2xl mb-6 flex items-center justify-center shadow-lg"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <div className="text-center text-white">
              <p className="text-4xl mb-2">{activity?.icon || '💪'}</p>
              <p className="text-xl font-bold">{activity?.label || 'Workout'}</p>
            </div>
          </div>
        )}

        {/* User + Date */}
        <div
          className="flex items-center justify-between mb-4"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          <span className="text-sm font-medium">{workout.userName}</span>
          <span className="text-sm">{dateLabel}</span>
        </div>

        {/* Activity Card */}
        <div
          className="glass rounded-2xl p-5 mb-4"
          style={{ borderLeft: '3px solid hsl(var(--primary))' }}
        >
          <div className="flex items-center gap-3 mb-1">
            {activity && <span className="text-2xl">{activity.icon}</span>}
            <h2 className="text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>
              {activity?.label || 'Workout'}
            </h2>
          </div>
          {metaItems.length > 0 && (
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {metaItems.join(' | ')}
            </p>
          )}
        </div>

        {/* Note */}
        {workout.note && (
          <p
            className="text-sm italic mb-6 line-clamp-2"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            "{workout.note}"
          </p>
        )}

        {/* Weekly Progress */}
        <div className="mb-8">
          <p
            className="text-xs font-medium uppercase tracking-wider mb-3"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Weekly Progress
          </p>
          <div
            className="w-full h-2.5 rounded-full overflow-hidden mb-2"
            style={{ background: 'hsl(var(--muted))' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: isWeekComplete ? 'hsl(var(--accent))' : 'var(--gradient-primary)',
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold stat-number">
              {current}/{target} workouts
            </span>
            <span
              className="text-xs font-medium"
              style={{
                color: isWeekComplete ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))',
              }}
            >
              {isWeekComplete
                ? 'Weekly goal complete!'
                : `${target - current} more to go`}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="glass rounded-2xl p-6 text-center">
          <h3
            className="text-base font-bold mb-1"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            Start your own challenge
          </h3>
          <p
            className="text-sm mb-5"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Track workouts. Stay accountable.
          </p>
          <div className="flex gap-3">
            <SignUpButton mode="modal">
              <button
                className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90"
                style={{ background: 'var(--gradient-primary)' }}
              >
                Create a Challenge
              </button>
            </SignUpButton>
            <SignUpButton mode="modal">
              <button
                className="flex-1 px-4 py-3 rounded-xl font-bold text-sm transition hover:opacity-90"
                style={{
                  background: 'hsl(var(--secondary))',
                  color: 'white',
                }}
              >
                I Have an Invite
              </button>
            </SignUpButton>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Challenge Tracker
          </p>
        </div>
      </div>
    </div>
  );
}
