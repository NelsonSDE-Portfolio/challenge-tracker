import { useState, useRef, useCallback } from 'react';
import { workoutService } from '../services/workoutService';
import type { WeeklyProgress } from '../types/stats';

const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface CompactWeeklyGridProps {
  progress: WeeklyProgress;
  challengeId: string;
  challengeStartDate: string;
  weekOffset: number;
  onWeekChange: (offset: number) => void;
  onDataChange: () => void;
  isAdmin?: boolean;
  onViewWorkout: (userId: string, userName: string, date: string) => void;
}

const avatarGradients = [
  'var(--gradient-primary)',
  'var(--gradient-secondary)',
  'var(--gradient-gold)',
  'linear-gradient(135deg, #FF6B35, #00C49A)',
  'linear-gradient(135deg, #FF3B30, #FF6B35)',
];

export function CompactWeeklyGrid({
  progress,
  challengeId,
  challengeStartDate,
  weekOffset,
  onWeekChange,
  onDataChange,
  isAdmin = false,
  onViewWorkout,
}: CompactWeeklyGridProps) {
  // Track optimistic updates locally so the grid updates instantly
  const [addedWorkouts, setAddedWorkouts] = useState<Set<string>>(new Set());
  const [removedWorkouts, setRemovedWorkouts] = useState<Set<string>>(new Set());
  const [scrolledRight, setScrolledRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrolledRight(el.scrollLeft + el.clientWidth >= el.scrollWidth - 10);
  }, []);

  const getWeekDays = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + (weekOffset * 7));
    monday.setHours(0, 0, 0, 0);

    const todayStr = getLocalDateString();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dateStr = getLocalDateString(day);
      days.push({
        date: dateStr,
        dayName: day.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
        dayNum: day.getDate(),
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
      });
    }
    return days;
  };

  const canGoToPreviousWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const prevWeekMonday = new Date(today);
    prevWeekMonday.setDate(today.getDate() + mondayOffset + ((weekOffset - 1) * 7));

    const prevWeekSunday = new Date(prevWeekMonday);
    prevWeekSunday.setDate(prevWeekMonday.getDate() + 6);
    prevWeekSunday.setHours(23, 59, 59, 999);

    const challengeStart = new Date(challengeStartDate);
    challengeStart.setHours(0, 0, 0, 0);

    return prevWeekSunday >= challengeStart;
  };

  const formatWeekRange = () => {
    const days = getWeekDays();
    if (days.length === 0) return '';
    const start = new Date(days[0].date + 'T12:00:00');
    const end = new Date(days[6].date + 'T12:00:00');
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const hasWorkoutOnDay = (userId: string, workoutDates: string[], dayDate: string) => {
    const key = `${userId}:${dayDate}`;
    if (removedWorkouts.has(key)) return false;
    return workoutDates.includes(dayDate) || addedWorkouts.has(key);
  };

  // Uncheck — admin removes a workout for one participant on a day
  const handleUncheck = async (
    participant: { userId: string },
    day: { date: string },
  ) => {
    if (!isAdmin) return;
    const key = `${participant.userId}:${day.date}`;
    // Optimistic — remove checkmark immediately
    setRemovedWorkouts((prev) => new Set(prev).add(key));
    setAddedWorkouts((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    try {
      await workoutService.adminDeleteByDate(challengeId, participant.userId, day.date);
      onDataChange();
    } catch (err) {
      console.error('Failed to uncheck workout:', err);
      // Revert
      setRemovedWorkouts((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  // Single cell click — admin logs workout for one participant
  const handleCellClick = async (
    participant: { userId: string; name?: string },
    day: { date: string; isPast: boolean; isToday: boolean },
    hasWorkout: boolean,
  ) => {
    if (!isAdmin || hasWorkout) return;
    if (!day.isPast && !day.isToday) return;

    const cellKey = `${participant.userId}:${day.date}`;
    // Optimistic update — show checkmark immediately
    setAddedWorkouts((prev) => new Set(prev).add(cellKey));
    setRemovedWorkouts((prev) => {
      const next = new Set(prev);
      next.delete(cellKey);
      return next;
    });
    try {
      await workoutService.adminCreate(challengeId, {
        userId: participant.userId,
        date: day.date,
        note: `Added by admin`,
      });
      // Silently refresh stats in background
      onDataChange();
    } catch (err) {
      console.error('Failed to log workout:', err);
      // Revert optimistic update on failure
      setAddedWorkouts((prev) => {
        const next = new Set(prev);
        next.delete(cellKey);
        return next;
      });
    }
  };

  // Bulk column click — admin logs workout for ALL missing participants on that day
  const handleBulkCheckDay = async (dayDate: string) => {
    if (!isAdmin) return;

    const missingParticipants = progress.participants.filter(
      (p) => !hasWorkoutOnDay(p.userId, p.workoutDates, dayDate),
    );
    if (missingParticipants.length === 0) return;

    // Optimistic update — mark all as done immediately
    const newKeys = missingParticipants.map((p) => `${p.userId}:${dayDate}`);
    setAddedWorkouts((prev) => {
      const next = new Set(prev);
      newKeys.forEach((k) => next.add(k));
      return next;
    });
    setRemovedWorkouts((prev) => {
      const next = new Set(prev);
      newKeys.forEach((k) => next.delete(k));
      return next;
    });

    try {
      await Promise.all(
        missingParticipants.map((p) =>
          workoutService.adminCreate(challengeId, {
            userId: p.userId,
            date: dayDate,
            note: 'Checked by admin',
          }),
        ),
      );
      // Silently refresh stats in background
      onDataChange();
    } catch (err) {
      console.error('Failed to bulk log workouts:', err);
      // Revert optimistic update on failure
      setAddedWorkouts((prev) => {
        const next = new Set(prev);
        newKeys.forEach((k) => next.delete(k));
        return next;
      });
    }
  };

  const days = getWeekDays();
  const isCurrentWeek = weekOffset === 0;

  // Calculate week number relative to challenge start (Week 1 = first week)
  const getWeekNumber = () => {
    const challengeStart = new Date(challengeStartDate);
    challengeStart.setHours(0, 0, 0, 0);

    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const viewedMonday = new Date(today);
    viewedMonday.setDate(today.getDate() + mondayOffset + (weekOffset * 7));
    viewedMonday.setHours(0, 0, 0, 0);

    const startDay = challengeStart.getDay();
    const startMondayOffset = startDay === 0 ? -6 : 1 - startDay;
    const challengeMonday = new Date(challengeStart);
    challengeMonday.setDate(challengeStart.getDate() + startMondayOffset);
    challengeMonday.setHours(0, 0, 0, 0);

    const diffMs = viewedMonday.getTime() - challengeMonday.getTime();
    const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, diffWeeks + 1);
  };

  const weekNumber = getWeekNumber();

  // Count how many participants are missing a workout on a given day
  const getMissingCount = (dayDate: string) => {
    return progress.participants.filter((p) => !hasWorkoutOnDay(p.userId, p.workoutDates, dayDate)).length;
  };

  return (
    <div className="card overflow-hidden fade-in-up">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid hsl(var(--border))' }}
      >
        <button
          onClick={() => canGoToPreviousWeek() && onWeekChange(weekOffset - 1)}
          disabled={!canGoToPreviousWeek()}
          aria-label="Previous week"
          className="btn-press p-1.5"
          style={{
            color: canGoToPreviousWeek() ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground) / 0.3)',
            borderRadius: 'var(--radius)',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            Week {weekNumber}{isCurrentWeek ? ' - Weekly Progress' : ''}
          </h2>
          {isCurrentWeek && (
            <span
              className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: 'hsl(var(--primary) / 0.15)',
                color: 'hsl(var(--primary))',
                borderRadius: 'var(--radius)',
              }}
            >
              Live
            </span>
          )}
        </div>

        <button
          onClick={() => weekOffset < 0 && onWeekChange(weekOffset + 1)}
          disabled={isCurrentWeek}
          aria-label="Next week"
          className="btn-press p-1.5"
          style={{
            color: !isCurrentWeek ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground) / 0.3)',
            borderRadius: 'var(--radius)',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week range subtitle */}
      <div
        className="text-center text-sm font-medium px-5 py-2"
        style={{
          color: 'hsl(var(--muted-foreground))',
          borderBottom: '1px solid hsl(var(--border) / 0.5)',
        }}
      >
        {formatWeekRange()}
      </div>

      {/* Table */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`overflow-x-auto scroll-fade-right${scrolledRight ? ' scrolled-right' : ''}`}
      >
        <table className="w-full min-w-[500px]">
          <thead>
            <tr>
              <th
                className="text-left pb-3 pt-4 px-5 text-xs font-medium w-28"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                Participant
              </th>
              {days.map((day) => {
                const isActionable = isAdmin && (day.isPast || day.isToday);
                const missingCount = getMissingCount(day.date);
                const allDone = missingCount === 0;

                return (
                  <th
                    key={day.date}
                    className={`pb-3 pt-4 text-xs font-medium text-center w-12 ${isActionable && !allDone ? 'group' : ''}`}
                    style={{ color: day.isToday ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                  >
                    {isActionable && !allDone ? (
                      <button
                        onClick={() => handleBulkCheckDay(day.date)}
                        className="btn-press w-full flex flex-col items-center gap-0.5 relative"
                        title={`Check all ${missingCount} missing`}
                      >
                        <span>{day.dayName}</span>
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                          style={{
                            background: 'hsl(var(--primary) / 0.15)',
                            color: 'hsl(var(--primary))',
                          }}
                        >
                          {missingCount}
                        </div>
                      </button>
                    ) : (
                      <>
                        {day.dayName}
                        {day.isToday && (
                          <div
                            className="w-1 h-1 rounded-full mx-auto mt-1"
                            style={{ background: 'hsl(var(--primary))' }}
                          />
                        )}
                        {isActionable && allDone && (
                          <div className="flex justify-center mt-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24" style={{ color: 'hsl(var(--accent))' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </>
                    )}
                  </th>
                );
              })}
              <th
                className="pb-3 pt-4 text-xs font-medium text-center px-3"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                Done
              </th>
            </tr>
          </thead>
          <tbody>
            {progress.participants.map((participant, index) => {
              const weekDone = days.filter((day) =>
                hasWorkoutOnDay(participant.userId, participant.workoutDates, day.date)
              ).length;

              return (
                <tr
                  key={participant.userId}
                  style={{ borderTop: '1px solid hsl(var(--border) / 0.5)' }}
                >
                  {/* Participant */}
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: avatarGradients[index % avatarGradients.length],
                          color: 'white',
                          opacity: participant.pendingInvite ? 0.5 : 1,
                        }}
                      >
                        {(participant.name || 'U')[0].toUpperCase()}
                      </div>
                      <span
                        className="text-sm font-medium truncate"
                        style={{
                          color: participant.pendingInvite
                            ? 'hsl(var(--muted-foreground))'
                            : 'hsl(var(--foreground))',
                        }}
                      >
                        {participant.name?.split(' ')[0] || 'Unknown'}
                      </span>
                      {participant.pendingInvite && (
                        <span
                          className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded"
                          style={{
                            background: 'hsl(var(--warning) / 0.15)',
                            color: 'hsl(var(--warning))',
                          }}
                        >
                          Pending
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Day Cells */}
                  {days.map((day) => {
                    const hasWorkout = hasWorkoutOnDay(participant.userId, participant.workoutDates, day.date);
                    const isFutureDay = !day.isPast && !day.isToday;
                    const canClick = isAdmin && !hasWorkout && (day.isPast || day.isToday);

                    const canUncheck = isAdmin && hasWorkout && (day.isPast || day.isToday);

                    return (
                      <td key={day.date} className="py-3 text-center">
                        {hasWorkout ? (
                          canUncheck ? (
                            <button
                              onClick={() => handleUncheck(participant, day)}
                              className="btn-press w-7 h-7 rounded-full mx-auto flex items-center justify-center transition-all group/cell"
                              style={{ background: 'hsl(var(--accent) / 0.15)' }}
                              title="Click to uncheck"
                            >
                              <svg
                                className="w-3.5 h-3.5 group-hover/cell:hidden"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ color: 'hsl(var(--accent))' }}
                                strokeWidth={3}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <svg
                                className="w-3.5 h-3.5 hidden group-hover/cell:block"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ color: 'hsl(var(--destructive))' }}
                                strokeWidth={2}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => onViewWorkout(
                                participant.userId,
                                participant.name?.split(' ')[0] || 'Unknown',
                                day.date,
                              )}
                              className="btn-press w-7 h-7 rounded-full mx-auto flex items-center justify-center transition-opacity hover:opacity-70"
                              style={{ background: 'hsl(var(--accent) / 0.15)' }}
                              title="View workout details"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                style={{ color: 'hsl(var(--accent))' }}
                                strokeWidth={3}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )
                        ) : day.isToday ? (
                          <button
                            onClick={() => canClick && handleCellClick(participant, day, hasWorkout)}
                            className="btn-press w-7 h-7 rounded-full mx-auto border-2 border-dashed transition-all"
                            style={{ borderColor: 'hsl(var(--primary) / 0.4)' }}
                            disabled={!canClick}
                          />
                        ) : isFutureDay ? (
                          <div
                            className="w-7 h-7 rounded-full mx-auto"
                            style={{ background: 'hsl(var(--muted) / 0.3)' }}
                          />
                        ) : (
                          <button
                            onClick={() => canClick && handleCellClick(participant, day, hasWorkout)}
                            className="btn-press w-7 h-7 rounded-full mx-auto flex items-center justify-center transition-all hover:opacity-70"
                            style={{ background: 'hsl(var(--destructive) / 0.1)' }}
                            disabled={!canClick}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              style={{ color: 'hsl(var(--destructive) / 0.6)' }}
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </td>
                    );
                  })}

                  {/* Week count */}
                  <td className="py-3 text-center px-3">
                    <span
                      className="stat-number text-sm"
                      style={{
                        color: weekDone >= progress.minWorkoutsPerWeek
                          ? 'hsl(var(--accent))'
                          : 'hsl(var(--foreground))',
                      }}
                    >
                      {weekDone}/{progress.minWorkoutsPerWeek}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-3 text-xs"
        style={{
          borderTop: '1px solid hsl(var(--border) / 0.5)',
          color: 'hsl(var(--muted-foreground))',
        }}
      >
        <span>
          {isCurrentWeek && `${progress.daysRemaining} day${progress.daysRemaining !== 1 ? 's' : ''} remaining this week`}
        </span>
        {progress.totalPenalty > 0 ? (
          <span
            className="px-2 py-1 text-xs font-medium"
            style={{
              background: 'hsl(var(--warning) / 0.15)',
              color: 'hsl(var(--warning))',
              borderRadius: 'var(--radius)',
            }}
          >
            ${progress.totalPenalty} debt
          </span>
        ) : (
          <span
            className="px-2 py-1 text-xs font-medium flex items-center gap-1"
            style={{
              background: 'hsl(var(--accent) / 0.15)',
              color: 'hsl(var(--accent))',
              borderRadius: 'var(--radius)',
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            On track!
          </span>
        )}
      </div>

      {/* Admin hint */}
      {isAdmin && (
        <div
          className="text-center text-xs py-3"
          style={{
            borderTop: '1px solid hsl(var(--border) / 0.5)',
            color: 'hsl(var(--muted-foreground) / 0.7)',
          }}
        >
          Click day headers to check all, or individual cells for one participant
        </div>
      )}

    </div>
  );
}
