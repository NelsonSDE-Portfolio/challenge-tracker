import { useState, useEffect } from 'react';
import { workoutService } from '../services/workoutService';
import { ACTIVITY_TYPES, MUSCLE_GROUPS } from '../constants';
import type { WorkoutLog } from '../types/workout';

interface WorkoutDetailModalProps {
  challengeId: string;
  userId: string;
  userName: string;
  date: string;
  onClose: () => void;
}

export function WorkoutDetailModal({
  challengeId,
  userId,
  userName,
  date,
  onClose,
}: WorkoutDetailModalProps) {
  const [workout, setWorkout] = useState<WorkoutLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    workoutService
      .getByUserAndDate(challengeId, userId, date)
      .then((w) => {
        if (w) setWorkout(w);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [challengeId, userId, date]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const activity = workout?.activityType
    ? ACTIVITY_TYPES.find((a) => a.value === workout.activityType)
    : null;

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const meta = workout?.metadata as Record<string, unknown> | undefined;
  const metaItems: string[] = [];
  if (meta?.durationMinutes) metaItems.push(`${meta.durationMinutes} min`);
  if (meta?.distanceKm) metaItems.push(`${meta.distanceKm} km`);
  if (meta?.distanceM) metaItems.push(`${meta.distanceM} m`);
  if (Array.isArray(meta?.muscleGroups)) {
    const labels = (meta.muscleGroups as string[]).map(
      (g) => MUSCLE_GROUPS.find((mg) => mg.value === g)?.label || g,
    );
    metaItems.push(labels.join(', '));
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'hsl(var(--foreground) / 0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 fade-in-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div
              className="w-10 h-10 rounded-full animate-spin"
              style={{
                background: 'var(--gradient-primary)',
                mask: 'radial-gradient(circle at center, transparent 60%, black 61%)',
                WebkitMask: 'radial-gradient(circle at center, transparent 60%, black 61%)',
              }}
            />
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Workout details not available
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg"
              style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
            >
              Close
            </button>
          </div>
        )}

        {workout && !loading && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  {userName}
                </h3>
                <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {dateLabel}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close workout details"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Photo */}
            {workout.photoUrl && (
              <div className="mb-4">
                <img
                  src={workout.photoUrl}
                  alt="Workout photo"
                  className="w-full h-auto rounded-xl"
                />
              </div>
            )}

            {/* Activity card */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{
                background: 'hsl(var(--muted) / 0.5)',
                borderLeft: '3px solid hsl(var(--primary))',
              }}
            >
              <div className="flex items-center gap-3 mb-1">
                {activity && <span className="text-2xl">{activity.icon}</span>}
                <span
                  className="text-base font-bold"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  {activity?.label || 'Workout'}
                </span>
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
                className="text-sm italic mb-4"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                "{workout.note}"
              </p>
            )}

            {/* Source badge */}
            {workout.source === 'admin' && (
              <p className="text-xs mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Added by admin
              </p>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-medium rounded-xl transition-all"
              style={{
                background: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
