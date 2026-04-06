import type { WeeklyProgress } from '../types/stats';

const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface CompactWeeklyGridProps {
  progress: WeeklyProgress;
  challengeStartDate: string;
  weekOffset: number;
  onWeekChange: (offset: number) => void;
  isAdmin?: boolean;
  onAdminLogWorkout?: (userId: string, userName: string, date: string) => void;
}

const avatarGradients = [
  'var(--gradient-primary)',
  'var(--gradient-secondary)',
  'var(--gradient-gold)',
  'linear-gradient(135deg, hsl(186 100% 45%), hsl(270 60% 55%))',
  'linear-gradient(135deg, hsl(330 70% 55%), hsl(4 80% 55%))',
];

export function CompactWeeklyGrid({
  progress,
  challengeStartDate,
  weekOffset,
  onWeekChange,
  isAdmin = false,
  onAdminLogWorkout,
}: CompactWeeklyGridProps) {
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

  const hasWorkoutOnDay = (workoutDates: string[], dayDate: string) => {
    return workoutDates.includes(dayDate);
  };

  const handleDayCellClick = (
    participant: { userId: string; name?: string },
    day: { date: string; isPast: boolean; isToday: boolean },
    hasWorkout: boolean
  ) => {
    if (!isAdmin || hasWorkout || !onAdminLogWorkout) return;
    if (!day.isPast && !day.isToday) return;
    onAdminLogWorkout(participant.userId, participant.name || 'Unknown', day.date);
  };

  const days = getWeekDays();
  const isCurrentWeek = weekOffset === 0;

  return (
    <div className="glass rounded-2xl overflow-hidden fade-in-up">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid hsl(var(--border))' }}
      >
        <button
          onClick={() => canGoToPreviousWeek() && onWeekChange(weekOffset - 1)}
          disabled={!canGoToPreviousWeek()}
          className="p-1.5 rounded-lg transition-colors"
          style={{
            color: canGoToPreviousWeek() ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground) / 0.3)',
            background: canGoToPreviousWeek() ? undefined : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (canGoToPreviousWeek()) e.currentTarget.style.background = 'hsl(var(--muted))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            {isCurrentWeek ? 'Weekly Progress' : `Week ${progress.weekNumber}`}
          </h2>
          {isCurrentWeek && (
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: 'hsl(var(--primary) / 0.2)',
                color: 'hsl(var(--primary))',
                border: '1px solid hsl(var(--primary) / 0.3)',
              }}
            >
              Live
            </span>
          )}
        </div>

        <button
          onClick={() => weekOffset < 0 && onWeekChange(weekOffset + 1)}
          disabled={isCurrentWeek}
          className="p-1.5 rounded-lg transition-colors"
          style={{
            color: !isCurrentWeek ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground) / 0.3)',
          }}
          onMouseEnter={(e) => {
            if (!isCurrentWeek) e.currentTarget.style.background = 'hsl(var(--muted))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr>
              <th
                className="text-left pb-3 pt-4 px-5 text-xs font-medium w-28"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                Participant
              </th>
              {days.map((day) => (
                <th
                  key={day.date}
                  className="pb-3 pt-4 text-xs font-medium text-center w-12"
                  style={{ color: day.isToday ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                >
                  {day.dayName}
                  {day.isToday && (
                    <div
                      className="w-1 h-1 rounded-full mx-auto mt-1"
                      style={{ background: 'hsl(var(--primary))' }}
                    />
                  )}
                </th>
              ))}
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
              const weekDone = participant.workoutDates.filter((d) =>
                days.some((day) => day.date === d)
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
                        }}
                      >
                        {(participant.name || 'U')[0].toUpperCase()}
                      </div>
                      <span
                        className="text-sm font-medium truncate"
                        style={{ color: 'hsl(var(--foreground))' }}
                      >
                        {participant.name?.split(' ')[0] || 'Unknown'}
                      </span>
                    </div>
                  </td>

                  {/* Day Cells */}
                  {days.map((day) => {
                    const hasWorkout = hasWorkoutOnDay(participant.workoutDates, day.date);
                    const isFutureDay = !day.isPast && !day.isToday;
                    const canAdminClick = isAdmin && !hasWorkout && (day.isPast || day.isToday);

                    return (
                      <td key={day.date} className="py-3 text-center">
                        {hasWorkout ? (
                          <div
                            className="w-7 h-7 rounded-full mx-auto flex items-center justify-center glow-accent"
                            style={{ background: 'hsl(var(--accent) / 0.2)' }}
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
                          </div>
                        ) : day.isToday ? (
                          <button
                            onClick={() => canAdminClick && handleDayCellClick(participant, day, hasWorkout)}
                            className="w-7 h-7 rounded-full mx-auto border-2 border-dashed transition-all"
                            style={{
                              borderColor: 'hsl(var(--primary) / 0.4)',
                            }}
                            disabled={!canAdminClick}
                          />
                        ) : isFutureDay ? (
                          <div
                            className="w-7 h-7 rounded-full mx-auto"
                            style={{ background: 'hsl(var(--muted) / 0.3)' }}
                          />
                        ) : (
                          <button
                            onClick={() => canAdminClick && handleDayCellClick(participant, day, hasWorkout)}
                            className="w-7 h-7 rounded-full mx-auto flex items-center justify-center transition-all"
                            style={{
                              background: 'hsl(var(--destructive) / 0.1)',
                            }}
                            disabled={!canAdminClick}
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
                      className="text-sm font-bold font-mono-tab"
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
            className="px-2 py-1 rounded-lg text-xs font-medium"
            style={{
              background: 'hsl(var(--warning) / 0.15)',
              color: 'hsl(var(--warning))',
            }}
          >
            ${progress.totalPenalty} MXN debt
          </span>
        ) : (
          <span
            className="px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
            style={{
              background: 'hsl(var(--accent) / 0.15)',
              color: 'hsl(var(--accent))',
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
          <span className="flex items-center justify-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Click on missed days to log workouts for participants
          </span>
        </div>
      )}
    </div>
  );
}
