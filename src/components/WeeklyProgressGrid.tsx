import { useState, useEffect } from 'react';
import { statsService } from '../services/statsService';
import type { WeeklyProgress } from '../types/stats';

// Get local date string in YYYY-MM-DD format (avoids timezone issues with toISOString)
const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface WeeklyProgressGridProps {
  challengeId: string;
  challengeName: string;
  challengeStartDate: string;
  onLogWorkout: () => void;
  isAdmin?: boolean;
  onAdminLogWorkout?: (userId: string, userName: string, date: string) => void;
}

export function WeeklyProgressGrid({
  challengeId,
  challengeName,
  challengeStartDate,
  onLogWorkout,
  isAdmin = false,
  onAdminLogWorkout,
}: WeeklyProgressGridProps) {
  const [progress, setProgress] = useState<WeeklyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    loadProgress();
  }, [challengeId, weekOffset]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const data = await statsService.getWeeklyProgress(challengeId, weekOffset);
      setProgress(data);
      setError(null);
    } catch (err) {
      setError('Failed to load weekly progress');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get Monday-Sunday week based on weekOffset (0 = current week)
  const getWeekDays = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Adjust so Monday = 0, Sunday = 6
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + (weekOffset * 7));
    monday.setHours(0, 0, 0, 0);

    const todayStr = getLocalDateString(new Date());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dateStr = getLocalDateString(day);
      days.push({
        date: dateStr,
        dayName: day.toLocaleDateString('es-MX', { weekday: 'short' }),
        dayNum: day.getDate(),
        month: day.getMonth() + 1,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
      });
    }
    return days;
  };

  const formatWeekRange = () => {
    const days = getWeekDays();
    if (days.length === 0) return '';
    const start = days[0];
    const end = days[6];
    return `${start.dayNum}/${start.month} — ${end.dayNum}/${end.month}`;
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

  const hasWorkoutOnDay = (workoutDates: string[], dayDate: string) => {
    return workoutDates.includes(dayDate);
  };

  // Check if we can go to previous week (don't go before challenge start)
  const canGoToPreviousWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    // Calculate the Sunday of the previous week (weekOffset - 1)
    const prevWeekMonday = new Date(today);
    prevWeekMonday.setDate(today.getDate() + mondayOffset + ((weekOffset - 1) * 7));

    const prevWeekSunday = new Date(prevWeekMonday);
    prevWeekSunday.setDate(prevWeekMonday.getDate() + 6);
    prevWeekSunday.setHours(23, 59, 59, 999);

    // Parse challenge start date (handle both ISO string and YYYY-MM-DD)
    const challengeStart = new Date(challengeStartDate);
    challengeStart.setHours(0, 0, 0, 0);

    // Can go back if the previous week contains at least one day on/after challenge start
    return prevWeekSunday >= challengeStart;
  };

  const goToPreviousWeek = () => {
    if (canGoToPreviousWeek()) {
      setWeekOffset(weekOffset - 1);
    }
  };

  const goToNextWeek = () => {
    if (weekOffset < 0) {
      setWeekOffset(weekOffset + 1);
    }
  };

  const handleDayCellClick = (
    participant: { userId: string; name?: string },
    day: { date: string; isPast: boolean; isToday: boolean },
    hasWorkout: boolean
  ) => {
    // Only admins can click on past days without workouts
    if (!isAdmin || hasWorkout || !onAdminLogWorkout) return;
    if (!day.isPast && !day.isToday) return; // Don't allow future days

    onAdminLogWorkout(
      participant.userId,
      participant.name || 'Unknown',
      day.date
    );
  };

  if (loading && !progress) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={loadProgress}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!progress) return null;

  const days = getWeekDays();
  const isCurrentWeek = weekOffset === 0;

  return (
    <div className="space-y-6">
      {/* Header with Challenge Name */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">{challengeName}</h1>
        <p className="text-gray-500">
          Min {progress.minWorkoutsPerWeek} days/week · ${progress.penaltyAmount} MXN per miss
        </p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
        <button
          onClick={goToPreviousWeek}
          disabled={!canGoToPreviousWeek()}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            canGoToPreviousWeek()
              ? 'text-gray-600 hover:bg-gray-100'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          ← Prev
        </button>
        <div className="text-center">
          <p className="font-semibold text-gray-800">
            {isCurrentWeek ? 'This Week' : `Week ${Math.abs(weekOffset)} ago`}
          </p>
          <p className="text-sm text-gray-500">{formatWeekRange()}</p>
        </div>
        <button
          onClick={goToNextWeek}
          disabled={isCurrentWeek}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            isCurrentWeek
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Next →
        </button>
      </div>

      {/* Progress Grid */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-[140px_repeat(7,1fr)_80px] border-b border-gray-200">
          <div className="p-3 text-gray-500 text-xs uppercase tracking-wider font-medium">
            Name
          </div>
          {days.map((day) => (
            <div
              key={day.date}
              className={`p-3 text-center border-l border-gray-100 ${
                day.isToday ? 'bg-blue-50' : ''
              }`}
            >
              <div className={`text-xs uppercase ${day.isToday ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                {day.dayName}
              </div>
              <div className={`text-sm font-medium ${day.isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                {day.dayNum}/{day.month}
              </div>
            </div>
          ))}
          <div className="p-3 text-gray-500 text-xs uppercase tracking-wider font-medium text-center border-l border-gray-100">
            Penalty
          </div>
        </div>

        {/* Participant Rows */}
        <div className="divide-y divide-gray-100">
          {progress.participants.map((participant, index) => {
            const workoutCount = days.filter(day =>
              hasWorkoutOnDay(participant.workoutDates, day.date)
            ).length;
            const remaining = Math.max(0, progress.minWorkoutsPerWeek - workoutCount);
            const currentPenalty = remaining * progress.penaltyAmount;

            return (
              <div
                key={participant.userId}
                className="grid grid-cols-[140px_repeat(7,1fr)_80px] hover:bg-gray-50"
              >
                {/* Participant Name */}
                <div className="p-3 flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full ${getParticipantColor(index)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                  >
                    {(participant.name || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-gray-800 font-medium truncate text-sm">
                    {participant.name || 'Unknown'}
                  </span>
                </div>

                {/* Day Cells */}
                {days.map((day) => {
                  const hasWorkout = hasWorkoutOnDay(participant.workoutDates, day.date);
                  const isFutureDay = !day.isPast && !day.isToday;
                  const canAdminClick = isAdmin && !hasWorkout && (day.isPast || day.isToday);

                  return (
                    <div
                      key={day.date}
                      className={`p-3 flex items-center justify-center border-l border-gray-100 ${
                        day.isToday ? 'bg-blue-50' : ''
                      }`}
                    >
                      {hasWorkout ? (
                        <div className="w-7 h-7 rounded-md bg-green-500 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      ) : day.isToday ? (
                        <button
                          onClick={() => canAdminClick && handleDayCellClick(participant, day, hasWorkout)}
                          className={`w-7 h-7 rounded-md border-2 border-dashed border-blue-400 ${
                            canAdminClick ? 'hover:bg-blue-100 hover:border-blue-500 cursor-pointer' : ''
                          }`}
                          disabled={!canAdminClick}
                          title={canAdminClick ? `Log workout for ${participant.name || 'Unknown'}` : undefined}
                        />
                      ) : isFutureDay ? (
                        <div className="w-7 h-7 rounded-md bg-gray-100"></div>
                      ) : (
                        <button
                          onClick={() => canAdminClick && handleDayCellClick(participant, day, hasWorkout)}
                          className={`w-7 h-7 rounded-md ${
                            canAdminClick
                              ? 'bg-gray-200 hover:bg-orange-200 hover:ring-2 hover:ring-orange-400 cursor-pointer transition'
                              : 'bg-gray-200'
                          }`}
                          disabled={!canAdminClick}
                          title={canAdminClick ? `Log workout for ${participant.name || 'Unknown'}` : undefined}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Penalty */}
                <div className="p-3 flex items-center justify-center border-l border-gray-100">
                  <span
                    className={`font-bold ${
                      currentPenalty === 0 ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {currentPenalty === 0 ? '✓' : `$${currentPenalty}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Debt Summary */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {isCurrentWeek ? 'Current Week Debt' : 'Week Debt Summary'}
          </h3>
          {isCurrentWeek && (
            <span className="text-sm text-gray-500">
              {days.filter(d => !d.isPast && !d.isToday).length + 1} days left
            </span>
          )}
        </div>
        <div className="space-y-3">
          {progress.participants.map((participant, index) => {
            const workoutCount = days.filter(day =>
              hasWorkoutOnDay(participant.workoutDates, day.date)
            ).length;
            const remaining = Math.max(0, progress.minWorkoutsPerWeek - workoutCount);
            const debt = remaining * progress.penaltyAmount;

            return (
              <div
                key={participant.userId}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full ${getParticipantColor(index)} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {(participant.name || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-gray-800 font-medium">
                    {participant.name || 'Unknown'}
                  </span>
                </div>
                <span
                  className={`text-lg font-bold ${
                    debt === 0 ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {debt === 0 ? 'All good!' : `$${debt} MXN`}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t-2 border-gray-200 flex items-center justify-between">
          <span className="text-gray-600 font-semibold">Total</span>
          <span className="text-2xl font-bold text-orange-500">
            ${progress.participants.reduce((sum, p) => {
              const workoutCount = days.filter(day =>
                hasWorkoutOnDay(p.workoutDates, day.date)
              ).length;
              const remaining = Math.max(0, progress.minWorkoutsPerWeek - workoutCount);
              return sum + remaining * progress.penaltyAmount;
            }, 0)} MXN
          </span>
        </div>
      </div>

      {/* Admin hint */}
      {isAdmin && (
        <p className="text-center text-sm text-gray-500">
          As admin, click on past days without a workout to log for participants
        </p>
      )}

      {/* Log Workout Button */}
      {isCurrentWeek && (
        <button
          onClick={onLogWorkout}
          className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-3"
        >
          <span className="text-xl">+</span>
          Log Today's Workout
        </button>
      )}
    </div>
  );
}
