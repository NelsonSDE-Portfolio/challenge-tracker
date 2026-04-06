import { useState, useEffect } from 'react';
import { statsService } from '../services/statsService';
import type { ParticipantStats } from '../types/stats';

interface LeaderboardProps {
  challengeId: string;
  minWorkoutsPerWeek: number;
  onParticipantClick?: (userId: string) => void;
}

export function Leaderboard({
  challengeId,
  minWorkoutsPerWeek,
  onParticipantClick,
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<ParticipantStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [challengeId]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await statsService.getLeaderboard(challengeId);
      // Sort by total workouts (most first) instead of debt
      const sorted = [...data].sort((a, b) => b.totalWorkouts - a.totalWorkouts);
      setLeaderboard(sorted);
      setError(null);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  const getParticipantColor = (index: number) => {
    const colors = [
      'bg-green-500',
      'bg-blue-500',
      'bg-orange-500',
      'bg-purple-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-cyan-500',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={loadLeaderboard}
          className="mt-2 text-blue-600 text-sm hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">Leaderboard</h2>
        <p className="text-sm text-gray-500">Ranked by total workout days</p>
      </div>

      <div className="divide-y divide-gray-100">
        {leaderboard.map((participant, index) => (
          <div
            key={participant.userId}
            onClick={() => onParticipantClick?.(participant.userId)}
            className={`p-4 flex items-center gap-4 ${
              onParticipantClick ? 'hover:bg-gray-50 cursor-pointer' : ''
            }`}
          >
            <div className="w-8 text-center text-lg">
              {getRankEmoji(index)}
            </div>

            <div
              className={`w-10 h-10 rounded-full ${getParticipantColor(index)} flex items-center justify-center text-white font-bold flex-shrink-0`}
            >
              {(participant.name || participant.email || 'U')[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-800 truncate">
                  {participant.name || participant.email || 'Unknown User'}
                </p>
                {participant.isAdmin && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </div>
              <div className="flex gap-4 text-xs text-gray-500 mt-1">
                <span>
                  {participant.weeklyWorkouts}/{minWorkoutsPerWeek} this week
                </span>
                {participant.currentStreak > 0 && (
                  <span className="text-orange-600">
                    🔥 {participant.currentStreak} week streak
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-2xl text-blue-600">
                {participant.totalWorkouts}
              </p>
              <p className="text-xs text-gray-500">days trained</p>
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>No participants yet</p>
        </div>
      )}
    </div>
  );
}
