import { useState } from 'react';
import type { AllWeeksDebt } from '../types/stats';

interface DebtScoreboardProps {
  allWeeksDebt: AllWeeksDebt;
}

const avatarGradients = [
  'var(--gradient-primary)',
  'var(--gradient-secondary)',
  'var(--gradient-gold)',
  'linear-gradient(135deg, #FF6B35, #00C49A)',
  'linear-gradient(135deg, #FF3B30, #FF6B35)',
];


export function DebtScoreboard({ allWeeksDebt }: DebtScoreboardProps) {
  const [expanded, setExpanded] = useState(false);

  const rankGradients = [
    'var(--gradient-gold)',
    'var(--gradient-silver)',
    'var(--gradient-bronze)',
  ];

  const getMedalElement = (rank: number) => {
    if (rank < 3) {
      return (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{
            background: rankGradients[rank],
            color: 'white',
          }}
        >
          {rank + 1}
        </div>
      );
    }

    return (
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{
          background: 'hsl(var(--muted))',
          color: 'hsl(var(--muted-foreground))',
        }}
      >
        {rank + 1}
      </div>
    );
  };

  // Sort participants by total workouts (most first)
  const sortedParticipants = [...allWeeksDebt.participants].sort(
    (a, b) => b.totalWorkouts - a.totalWorkouts
  );

  // Calculate total streak for each participant
  const getStreak = (participant: typeof allWeeksDebt.participants[0]) => {
    let streak = 0;
    // Iterate weeks in reverse to find current streak
    const reversedWeeks = [...participant.weeks].reverse();
    for (const week of reversedWeeks) {
      if (week.workoutsLogged >= week.workoutsRequired) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <div className="glass rounded-2xl fade-in-up">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid hsl(var(--border))' }}
      >
        <h2 className="text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>
          Leaderboard
        </h2>
        <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Sorted by workouts
        </span>
      </div>

      {/* Participants List */}
      <div className="space-y-2 p-5">
        {sortedParticipants.map((participant, index) => {
          const streak = getStreak(participant);
          const originalIndex = allWeeksDebt.participants.findIndex(
            p => p.userId === participant.userId
          );
          const isFirst = index === 0;

          return (
            <div
              key={participant.userId}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:-translate-y-0.5 ${
                isFirst ? '' : ''
              }`}
              style={{
                background: isFirst ? 'hsl(var(--primary) / 0.05)' : undefined,
                border: isFirst ? '1px solid hsl(var(--primary) / 0.1)' : undefined,
              }}
              onMouseEnter={(e) => {
                if (!isFirst) e.currentTarget.style.background = 'hsl(var(--muted) / 0.3)';
              }}
              onMouseLeave={(e) => {
                if (!isFirst) e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Rank */}
              {getMedalElement(index)}

              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  background: avatarGradients[originalIndex % avatarGradients.length],
                  color: 'white',
                }}
              >
                {(participant.name || 'U')[0].toUpperCase()}
              </div>

              {/* Name & Stats */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="font-semibold text-sm truncate"
                    style={{
                      color: participant.pendingInvite
                        ? 'hsl(var(--muted-foreground))'
                        : 'hsl(var(--foreground))',
                    }}
                  >
                    {participant.name || 'Unknown'}
                  </span>
                  {participant.pendingInvite && (
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{
                        background: 'hsl(var(--warning) / 0.15)',
                        color: 'hsl(var(--warning))',
                      }}
                    >
                      Pending
                    </span>
                  )}
                  {streak > 0 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{
                        background: 'hsl(var(--warning) / 0.1)',
                        color: 'hsl(var(--warning))',
                      }}
                    >
                      🔥{streak}
                    </span>
                  )}
                </div>
              </div>

              {/* Workout Count & Debt Status */}
              <div className="text-right flex items-center gap-4">
                <div>
                  <p
                    className="text-sm font-bold font-mono-tab"
                    style={{ color: 'hsl(var(--foreground))' }}
                  >
                    {participant.totalWorkouts}
                  </p>
                  <p
                    className="text-[10px] uppercase"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    workouts
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {participant.totalDebt === 0 ? (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
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
                  ) : (
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: 'hsl(var(--destructive))' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span
                        className="text-sm font-bold font-mono-tab"
                        style={{ color: 'hsl(var(--destructive))' }}
                      >
                        ${participant.totalDebt}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mx-auto py-4 text-sm transition-colors"
        style={{ color: 'hsl(var(--muted-foreground))' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'hsl(var(--foreground))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
        }}
      >
        <span>Week-by-week breakdown</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Week-by-Week Table */}
      {expanded && (
        <div
          className="overflow-hidden fade-in-up"
          style={{ borderTop: '1px solid hsl(var(--border) / 0.5)' }}
        >
          <div className="pt-4 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th
                    className="text-left pb-2 text-xs font-medium"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    Name
                  </th>
                  {allWeeksDebt.weekHeaders.map((week) => (
                    <th
                      key={week.weekNumber}
                      className="pb-2 text-xs font-medium text-center"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                    >
                      W{week.weekNumber}
                    </th>
                  ))}
                  <th
                    className="pb-2 text-xs font-medium text-center"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {allWeeksDebt.participants.map((participant) => (
                  <tr
                    key={participant.userId}
                    style={{ borderTop: '1px solid hsl(var(--border) / 0.3)' }}
                  >
                    <td
                      className="py-2 font-medium"
                      style={{ color: 'hsl(var(--foreground))' }}
                    >
                      {participant.name?.split(' ')[0] || 'Unknown'}
                    </td>
                    {participant.weeks.map((week) => (
                      <td
                        key={week.weekNumber}
                        className="py-2 text-center font-mono-tab font-bold"
                        style={{
                          color:
                            week.workoutsLogged >= week.workoutsRequired
                              ? 'hsl(var(--accent))'
                              : 'hsl(var(--destructive))',
                        }}
                      >
                        {week.workoutsLogged}/{week.workoutsRequired}
                      </td>
                    ))}
                    <td
                      className="py-2 text-center font-mono-tab font-bold"
                      style={{ color: 'hsl(var(--foreground))' }}
                    >
                      {participant.totalWorkouts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Grand Total Footer */}
            <div
              className="mt-4 pt-3 flex items-center justify-between"
              style={{ borderTop: '1px solid hsl(var(--border) / 0.5)' }}
            >
              <span
                className="text-sm"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                Grand Total Debt Pool
              </span>
              <span
                className={`text-2xl font-bold font-mono-tab ${
                  allWeeksDebt.grandTotal > 0 ? '' : 'gradient-text-primary'
                }`}
                style={{
                  color: allWeeksDebt.grandTotal > 0 ? 'hsl(var(--destructive))' : undefined,
                }}
              >
                ${allWeeksDebt.grandTotal} MXN
              </span>
            </div>
          </div>
          <div className="h-4" />
        </div>
      )}
    </div>
  );
}
