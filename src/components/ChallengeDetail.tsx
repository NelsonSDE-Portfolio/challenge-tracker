import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { challengeService } from '../services/challengeService';
import { UnifiedDashboard } from './UnifiedDashboard';
import type { Challenge } from '../types/challenge';

export function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const { isLoaded, isSignedIn } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for Clerk to load and user to be signed in before fetching
    if (id && isLoaded && isSignedIn) {
      loadChallenge(id);
    }
  }, [id, isLoaded, isSignedIn]);

  const loadChallenge = async (challengeId: string) => {
    try {
      setLoading(true);
      const data = await challengeService.getById(challengeId);
      setChallenge(data);
      setError(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load challenge');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeUpdate = () => {
    if (id) {
      loadChallenge(id);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div
        className="min-h-screen"
        style={{ background: 'hsl(var(--background))' }}
      >
        <div style={{ borderBottom: '1px solid hsl(var(--border))' }}>
          <div className="max-w-3xl mx-auto px-6 py-6">
            <div className="skeleton h-5 w-24 mb-2" />
            <div className="skeleton h-7 w-48" />
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          <div className="skeleton h-32 w-full" />
          <div className="skeleton h-24 w-full" />
          <div className="skeleton h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'hsl(var(--background))' }}
      >
        <div className="card text-center p-8 max-w-sm mx-4">
          <p className="font-semibold mb-2" style={{ color: 'hsl(var(--destructive))' }}>
            {error || 'Challenge not found'}
          </p>
          <Link
            to=".."
            className="text-sm font-medium transition hover:opacity-70"
            style={{ color: 'hsl(var(--primary))' }}
          >
            Back to challenges
          </Link>
        </div>
      </div>
    );
  }

  return (
    <UnifiedDashboard
      challenge={challenge}
      onChallengeUpdate={handleChallengeUpdate}
    />
  );
}
