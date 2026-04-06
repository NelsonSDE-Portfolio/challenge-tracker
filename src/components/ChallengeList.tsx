import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { challengeService } from '../services/challengeService';
import type { Challenge } from '../types/challenge';

interface ChallengeListProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
}

export function ChallengeList({ onCreateClick, onJoinClick }: ChallengeListProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch when Clerk is loaded and user is signed in
    if (isLoaded && isSignedIn) {
      loadChallenges();
    }
  }, [isLoaded, isSignedIn]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await challengeService.getAll();
      setChallenges(data);
      setError(null);
    } catch (err) {
      setError('Failed to load challenges');
      console.error(err);
    } finally {
      setLoading(false);
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
        className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
        style={style}
      >
        {status === 'active' && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1 animate-pulse" />
        )}
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full animate-spin"
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass text-center py-12 px-6 rounded-2xl mx-auto max-w-md">
        <div
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: 'hsl(var(--destructive) / 0.1)',
            border: '1px solid hsl(var(--destructive) / 0.2)',
          }}
        >
          <svg
            className="w-7 h-7"
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
        <button
          onClick={loadChallenges}
          className="mt-4 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
          style={{
            background: 'var(--gradient-primary)',
            color: 'white',
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="glass text-center py-12 px-6 rounded-2xl mx-auto max-w-md fade-in-up">
        <div
          className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'var(--gradient-secondary)' }}
        >
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          No challenges yet
        </h3>
        <p
          className="mb-8"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          Create a new challenge or join an existing one to get started!
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCreateClick}
            className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
            style={{
              background: 'var(--gradient-primary)',
              color: 'white',
            }}
          >
            Create Challenge
          </button>
          <button
            onClick={onJoinClick}
            className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105"
            style={{
              background: 'var(--gradient-secondary)',
              color: 'white',
            }}
          >
            Join with Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2
          className="text-xl font-bold"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          Your Challenges
        </h2>
        <div className="flex gap-3">
          <button
            onClick={onJoinClick}
            className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105"
            style={{
              background: 'hsl(var(--secondary) / 0.1)',
              color: 'hsl(var(--secondary))',
              border: '1px solid hsl(var(--secondary) / 0.2)',
            }}
          >
            Join with Code
          </button>
          <button
            onClick={onCreateClick}
            className="px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 hover:scale-105"
            style={{
              background: 'var(--gradient-primary)',
              color: 'white',
            }}
          >
            + Create
          </button>
        </div>
      </div>

      {/* Challenge Cards */}
      <div className="grid gap-4 stagger-children">
        {challenges.map((challenge) => (
          <Link
            key={challenge._id}
            to={challenge._id}
            relative="path"
            className="glass block group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-0.5 gradient-border"
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3
                  className="font-bold text-lg"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  {challenge.name}
                </h3>
                {getStatusBadge(challenge.status)}
              </div>

              {challenge.description && (
                <p
                  className="text-sm mb-4 line-clamp-2"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  {challenge.description}
                </p>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{
                      background: 'hsl(var(--primary) / 0.1)',
                      color: 'hsl(var(--primary))',
                      border: '1px solid hsl(var(--primary) / 0.2)',
                    }}
                  >
                    {challenge.rules.minWorkoutsPerWeek}x/week
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{
                      background: 'hsl(var(--destructive) / 0.1)',
                      color: 'hsl(var(--destructive))',
                      border: '1px solid hsl(var(--destructive) / 0.2)',
                    }}
                  >
                    ${challenge.rules.penaltyAmount}/miss
                  </span>
                </div>

                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {challenge.participantCount}
                </div>
              </div>

              {challenge.isAdmin && (
                <div
                  className="mt-3 pt-3"
                  style={{ borderTop: '1px solid hsl(var(--border))' }}
                >
                  <span
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: 'hsl(var(--primary) / 0.1)',
                      color: 'hsl(var(--primary))',
                      border: '1px solid hsl(var(--primary) / 0.2)',
                    }}
                  >
                    Admin
                  </span>
                </div>
              )}
            </div>

            {/* Hover arrow indicator */}
            <div
              className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
