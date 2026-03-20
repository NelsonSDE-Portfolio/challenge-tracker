import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { challengeService } from '../services/challengeService';
import type { Challenge } from '../types/challenge';

interface ChallengeListProps {
  onCreateClick: () => void;
  onJoinClick: () => void;
}

export function ChallengeList({ onCreateClick, onJoinClick }: ChallengeListProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, []);

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
      active: 'bg-green-100 text-green-800',
      upcoming: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={loadChallenges}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-5xl mb-4">🏆</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No challenges yet
        </h3>
        <p className="text-gray-500 mb-6">
          Create a new challenge or join an existing one to get started!
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCreateClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Challenge
          </button>
          <button
            onClick={onJoinClick}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Join with Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Your Challenges</h2>
        <div className="flex gap-2">
          <button
            onClick={onJoinClick}
            className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
          >
            Join with Code
          </button>
          <button
            onClick={onCreateClick}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Create
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {challenges.map((challenge) => (
          <Link
            key={challenge._id}
            to={`/challenges/${challenge._id}`}
            className="block bg-white rounded-lg shadow hover:shadow-md transition p-4 border border-gray-100"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800">{challenge.name}</h3>
              {getStatusBadge(challenge.status)}
            </div>
            {challenge.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {challenge.description}
              </p>
            )}
            <div className="flex justify-between text-sm text-gray-500">
              <span>
                {challenge.rules.minWorkoutsPerWeek}x/week • ${challenge.rules.penaltyAmount}/miss
              </span>
              <span>{challenge.participantCount} participants</span>
            </div>
            {challenge.isAdmin && (
              <div className="mt-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  Admin
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
