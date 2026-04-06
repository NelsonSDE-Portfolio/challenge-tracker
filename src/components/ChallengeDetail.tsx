import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { challengeService } from '../services/challengeService';
import { UnifiedDashboard } from './UnifiedDashboard';
import type { Challenge } from '../types/challenge';

export function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadChallenge(id);
    }
  }, [id]);

  const loadChallenge = async (challengeId: string) => {
    try {
      setLoading(true);
      const data = await challengeService.getById(challengeId);
      setChallenge(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeUpdate = () => {
    if (id) {
      loadChallenge(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Challenge not found'}</p>
          <Link
            to=".."
            className="text-emerald-400 hover:text-emerald-300 transition"
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
