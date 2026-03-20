import { useState, useEffect } from 'react';
import { statsService } from '../services/statsService';
import type { ChallengeStats, MyStats } from '../types/stats';

interface StatsOverviewProps {
  challengeId: string;
  minWorkoutsPerWeek: number;
}

export function StatsOverview({ challengeId, minWorkoutsPerWeek }: StatsOverviewProps) {
  const [challengeStats, setChallengeStats] = useState<ChallengeStats | null>(null);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [challengeId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [challenge, personal] = await Promise.all([
        statsService.getChallengeStats(challengeId),
        statsService.getMyStats(challengeId),
      ]);
      setChallengeStats(challenge);
      setMyStats(personal);
      setError(null);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !challengeStats || !myStats) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">{error || 'Failed to load stats'}</p>
        <button
          onClick={loadStats}
          className="mt-2 text-blue-600 text-sm hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const progressPercent = challengeStats.totalRequiredWorkouts > 0
    ? Math.round((challengeStats.totalWorkouts / challengeStats.totalRequiredWorkouts) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Personal Stats Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={`text-3xl font-bold ${myStats.debt === 0 ? 'text-green-300' : 'text-red-300'}`}>
              {myStats.debt === 0 ? '✓ $0' : `$${myStats.debt}`}
            </p>
            <p className="text-sm opacity-80">Current Debt</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{myStats.totalWorkouts}</p>
            <p className="text-sm opacity-80">Total Workouts</p>
          </div>
          <div>
            <p className="text-3xl font-bold">
              {myStats.weeklyWorkouts}/{minWorkoutsPerWeek}
            </p>
            <p className="text-sm opacity-80">This Week</p>
          </div>
          <div>
            <p className="text-3xl font-bold">
              {myStats.currentStreak > 0 ? `🔥 ${myStats.currentStreak}` : '0'}
            </p>
            <p className="text-sm opacity-80">Week Streak</p>
          </div>
        </div>
      </div>

      {/* Challenge Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Challenge Progress</h3>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {challengeStats.totalWorkouts} / {challengeStats.totalRequiredWorkouts} workouts completed
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-gray-800">
              Week {challengeStats.currentWeek}
            </p>
            <p className="text-sm text-gray-500">
              of {challengeStats.totalWeeks} weeks
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-gray-800">
              {challengeStats.weeksRemaining}
            </p>
            <p className="text-sm text-gray-500">Weeks remaining</p>
          </div>
        </div>
      </div>

      {/* Total Debt Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Debt Summary</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Group Debt</p>
            <p className={`text-3xl font-bold ${
              challengeStats.totalDebt === 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${challengeStats.totalDebt}
            </p>
          </div>
          {challengeStats.totalDebt === 0 ? (
            <div className="text-4xl">🎉</div>
          ) : (
            <div className="text-right">
              <p className="text-sm text-gray-500">Your Share</p>
              <p className={`text-xl font-bold ${
                myStats.debt === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${myStats.debt}
              </p>
            </div>
          )}
        </div>

        {myStats.debt === 0 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 text-center">
              🌟 You have no debt! Keep up the great work!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
