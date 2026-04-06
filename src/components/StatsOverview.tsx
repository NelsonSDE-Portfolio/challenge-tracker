import { useState, useEffect } from 'react';
import { statsService } from '../services/statsService';
import type { ChallengeStats, MyStats, AllWeeksDebt } from '../types/stats';

interface StatsOverviewProps {
  challengeId: string;
  minWorkoutsPerWeek: number;
}

export function StatsOverview({ challengeId, minWorkoutsPerWeek }: StatsOverviewProps) {
  const [challengeStats, setChallengeStats] = useState<ChallengeStats | null>(null);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [allWeeksDebt, setAllWeeksDebt] = useState<AllWeeksDebt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [challengeId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [challenge, personal, debtData] = await Promise.all([
        statsService.getChallengeStats(challengeId),
        statsService.getMyStats(challengeId),
        statsService.getAllWeeksDebt(challengeId),
      ]);
      setChallengeStats(challenge);
      setMyStats(personal);
      setAllWeeksDebt(debtData);
      setError(null);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  if (error || !challengeStats || !myStats || !allWeeksDebt) {
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

      {/* Weekly Debt Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Debt by Week</h3>
          <p className="text-sm text-gray-500">
            Min {allWeeksDebt.minWorkoutsPerWeek} workouts/week · ${allWeeksDebt.penaltyAmount} MXN per miss
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                  Name
                </th>
                {allWeeksDebt.weekHeaders.map((week) => (
                  <th
                    key={week.weekNumber}
                    className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]"
                  >
                    <div>Week {week.weekNumber}</div>
                    <div className="text-[10px] font-normal normal-case">
                      {new Date(week.weekStart + 'T12:00:00').toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allWeeksDebt.participants.map((participant, index) => (
                <tr key={participant.userId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 sticky left-0 bg-white">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full ${getParticipantColor(index)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                      >
                        {(participant.name || 'U')[0].toUpperCase()}
                      </div>
                      <span className="text-gray-800 font-medium text-sm truncate max-w-[100px]">
                        {participant.name || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  {participant.weeks.map((week) => (
                    <td
                      key={week.weekNumber}
                      className="px-3 py-3 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className={`text-sm font-semibold ${
                            week.debt === 0 ? 'text-green-600' : 'text-red-500'
                          }`}
                        >
                          {week.debt === 0 ? '✓' : `$${week.debt}`}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {week.workoutsLogged}/{week.workoutsRequired}
                        </span>
                      </div>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center bg-gray-50">
                    <span
                      className={`text-lg font-bold ${
                        participant.totalDebt === 0 ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {participant.totalDebt === 0 ? 'All good!' : `$${participant.totalDebt}`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 border-t-2 border-gray-300">
                <td className="px-4 py-4 sticky left-0 bg-gray-100">
                  <span className="font-bold text-gray-800">TOTAL</span>
                </td>
                {allWeeksDebt.weekHeaders.map((week) => {
                  const weekTotal = allWeeksDebt.participants.reduce(
                    (sum, p) => sum + (p.weeks.find(w => w.weekNumber === week.weekNumber)?.debt || 0),
                    0
                  );
                  return (
                    <td key={week.weekNumber} className="px-3 py-4 text-center">
                      <span className={`font-semibold ${weekTotal === 0 ? 'text-green-600' : 'text-orange-500'}`}>
                        ${weekTotal}
                      </span>
                    </td>
                  );
                })}
                <td className="px-4 py-4 text-center bg-orange-50">
                  <span className="text-xl font-bold text-orange-600">
                    ${allWeeksDebt.grandTotal} MXN
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Individual Totals */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Individual Debt Summary</h3>
        <div className="space-y-3">
          {allWeeksDebt.participants.map((participant, index) => (
            <div
              key={participant.userId}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${getParticipantColor(index)} flex items-center justify-center text-white font-bold`}
                >
                  {(participant.name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <span className="text-gray-800 font-medium block">
                    {participant.name || 'Unknown'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {participant.totalWorkouts} total workouts
                  </span>
                </div>
              </div>
              <span
                className={`text-xl font-bold ${
                  participant.totalDebt === 0 ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {participant.totalDebt === 0 ? 'All good!' : `$${participant.totalDebt} MXN`}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t-2 border-gray-200 flex items-center justify-between">
          <span className="text-gray-600 font-semibold text-lg">Grand Total</span>
          <span className="text-2xl font-bold text-orange-600">
            ${allWeeksDebt.grandTotal} MXN
          </span>
        </div>
      </div>
    </div>
  );
}
