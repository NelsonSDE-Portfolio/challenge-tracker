import { useState, useEffect, useMemo } from 'react';
import { workoutService } from '../services/workoutService';
import type { WorkoutLog } from '../types/workout';

interface WorkoutCalendarProps {
  challengeId: string;
  startDate: string;
  endDate: string;
  minWorkoutsPerWeek: number;
}

export function WorkoutCalendar({
  challengeId,
  startDate,
  endDate,
  minWorkoutsPerWeek,
}: WorkoutCalendarProps) {
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, [challengeId]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const data = await workoutService.getMine(challengeId);
      setWorkouts(data);
    } catch (err) {
      console.error('Failed to load workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  const workoutDates = useMemo(() => {
    const dates = new Set<string>();
    workouts.forEach((w) => {
      const date = new Date(w.date).toISOString().split('T')[0];
      dates.add(date);
    });
    return dates;
  }, [workouts]);

  const workoutsByDate = useMemo(() => {
    const map = new Map<string, WorkoutLog>();
    workouts.forEach((w) => {
      const date = new Date(w.date).toISOString().split('T')[0];
      map.set(date, w);
    });
    return map;
  }, [workouts]);

  const challengeStart = new Date(startDate);
  const challengeEnd = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDayClass = (dayDate: Date) => {
    const dateStr = dayDate.toISOString().split('T')[0];
    const hasWorkout = workoutDates.has(dateStr);
    const isToday = dayDate.getTime() === today.getTime();
    const isPast = dayDate < today;
    const isInChallenge = dayDate >= challengeStart && dayDate <= challengeEnd;

    let classes = 'w-10 h-10 rounded-full flex items-center justify-center text-sm transition ';

    if (!isInChallenge) {
      classes += 'text-gray-300 ';
    } else if (hasWorkout) {
      classes += 'bg-green-500 text-white font-medium cursor-pointer hover:bg-green-600 ';
    } else if (isToday) {
      classes += 'ring-2 ring-blue-500 text-blue-600 font-medium ';
    } else if (isPast) {
      classes += 'bg-red-100 text-red-600 ';
    } else {
      classes += 'text-gray-700 ';
    }

    return classes;
  };

  const handleDayClick = (dayDate: Date) => {
    const dateStr = dayDate.toISOString().split('T')[0];
    const workout = workoutsByDate.get(dateStr);
    if (workout) {
      setSelectedWorkout(workout);
    }
  };

  const weeklyProgress = useMemo(() => {
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    let count = 0;
    for (let i = 0; i <= dayOfWeek; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      if (workoutDates.has(dateStr)) {
        count++;
      }
    }

    return { count, required: minWorkoutsPerWeek };
  }, [workoutDates, minWorkoutsPerWeek]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Weekly Progress */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">This Week</span>
          <span className="text-sm text-gray-500">
            {weeklyProgress.count}/{weeklyProgress.required} workouts
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              weeklyProgress.count >= weeklyProgress.required
                ? 'bg-green-500'
                : 'bg-blue-500'
            }`}
            style={{
              width: `${Math.min(100, (weeklyProgress.count / weeklyProgress.required) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-semibold text-gray-800">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first of the month */}
        {Array.from({ length: startingDay }).map((_, i) => (
          <div key={`empty-${i}`} className="w-10 h-10" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

          return (
            <div key={day} className="flex justify-center">
              <button
                onClick={() => handleDayClick(dayDate)}
                className={getDayClass(dayDate)}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Logged</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-100"></div>
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full ring-2 ring-blue-500"></div>
          <span>Today</span>
        </div>
      </div>

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            {selectedWorkout.photoUrl && (
              <img
                src={selectedWorkout.photoUrl}
                alt="Workout proof"
                className="w-full h-48 object-cover rounded-t-lg"
              />
            )}
            <div className="p-4">
              <h3 className="font-bold text-gray-800">
                {new Date(selectedWorkout.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              {selectedWorkout.note && (
                <p className="text-gray-600 mt-1">{selectedWorkout.note}</p>
              )}
              {selectedWorkout.source === 'admin' && (
                <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Added by Admin
                </span>
              )}
              <button
                onClick={() => setSelectedWorkout(null)}
                className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
