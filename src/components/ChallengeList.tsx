import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { challengeService } from '../services/challengeService';
import type { Challenge } from '../types/challenge';

interface ChallengeListProps {
  onCreateClick: () => void;
}

export function ChallengeList({ onCreateClick }: ChallengeListProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadChallenges();
    }
  }, [isLoaded, isSignedIn]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await challengeService.getAll();
      setChallenges(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load challenges');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: Challenge['status']) => {
    const map = {
      active: {
        borderColor: '#FF6B35',
        badge: { background: '#FF6B35', color: 'white' },
        label: 'Active',
      },
      upcoming: {
        borderColor: '#00C49A',
        badge: { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' },
        label: 'Upcoming',
      },
      completed: {
        borderColor: '#1DB954',
        badge: { background: '#1DB954', color: 'white' },
        label: 'Completed',
      },
    };
    return map[status];
  };

  // Skeleton loading — no spinners
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="skeleton h-5 w-40" />
              <div className="skeleton h-5 w-16 rounded" />
            </div>
            <div className="skeleton h-4 w-full mb-2" />
            <div className="flex gap-2 mt-4">
              <div className="skeleton h-6 w-20 rounded" />
              <div className="skeleton h-6 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-10 px-6 max-w-md mx-auto fade-in-up">
        <p className="font-semibold mb-1" style={{ color: 'hsl(var(--destructive))' }}>
          {error}
        </p>
        <p className="text-sm mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Check your connection and try again.
        </p>
        <button
          onClick={loadChallenges}
          className="btn-press px-5 py-2.5 text-sm font-bold text-white"
          style={{
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius)',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state — invitation, not error
  if (challenges.length === 0) {
    return (
      <div className="card text-center py-12 px-6 max-w-md mx-auto fade-in-up">
        <div
          className="w-12 h-12 mx-auto flex items-center justify-center mb-5"
          style={{
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius)',
          }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3
          className="text-lg font-bold mb-2"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          No challenges yet
        </h3>
        <p
          className="text-sm mb-8"
          style={{ color: 'hsl(var(--primary))' }}
        >
          Ready to hold yourself accountable? Let's fix that.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onCreateClick}
            className="btn-press px-5 py-2.5 text-sm font-bold text-white"
            style={{
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius)',
            }}
          >
            Create Challenge
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in-up">
      {/* Action bar */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onCreateClick}
          className="btn-press px-4 py-2 text-sm font-bold text-white"
          style={{
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius)',
          }}
        >
          + New Challenge
        </button>
      </div>

      {/* Challenge Cards — solid, grounded, accent left border */}
      <div className="space-y-3 stagger-children">
        {challenges.map((challenge) => {
          const status = getStatusStyle(challenge.status);
          return (
            <Link
              key={challenge._id}
              to={challenge._id}
              relative="path"
              className="card block group transition-colors duration-150 hover:bg-[hsl(0_0%_99%)]"
              style={{ borderLeft: `3px solid ${status.borderColor}` }}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                    {challenge.name}
                  </h3>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
                    style={{
                      ...status.badge,
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    {status.label}
                  </span>
                </div>

                {challenge.description && (
                  <p
                    className="text-sm mb-3 line-clamp-1"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    {challenge.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-medium px-2 py-0.5"
                      style={{
                        background: 'hsl(var(--muted))',
                        color: 'hsl(var(--muted-foreground))',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      {challenge.rules.minWorkoutsPerWeek}x/week
                    </span>
                    <span
                      className="text-xs font-medium px-2 py-0.5"
                      style={{
                        background: 'hsl(var(--destructive) / 0.08)',
                        color: 'hsl(var(--destructive))',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      ${challenge.rules.penaltyAmount}/miss
                    </span>
                    {challenge.isAdmin && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
                        style={{
                          background: 'hsl(var(--primary) / 0.1)',
                          color: 'hsl(var(--primary))',
                          borderRadius: 'var(--radius)',
                        }}
                      >
                        Admin
                      </span>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {challenge.participantCount}
                    <svg className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
