import type { MyStats, ChallengeStats } from '../types/stats';

interface QuickStatsBarProps {
  myStats: MyStats;
  challengeStats: ChallengeStats;
}

export function QuickStatsBar({ myStats, challengeStats }: QuickStatsBarProps) {
  const stats = [
    {
      label: 'Week',
      value: challengeStats.currentWeek,
      total: challengeStats.totalWeeks,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'var(--gradient-primary)',
      type: 'default',
    },
    {
      label: 'Streak',
      value: myStats.currentStreak,
      suffix: myStats.currentStreak > 0 ? '🔥' : '',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: myStats.currentStreak > 0 ? 'var(--gradient-gold)' : undefined,
      type: myStats.currentStreak === 0 ? 'muted' : 'default',
    },
    {
      label: 'Your Debt',
      value: myStats.debt === 0 ? '$0 ✓' : `$${myStats.debt}`,
      icon: myStats.debt === 0 ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      gradient: myStats.debt === 0 ? 'var(--gradient-primary)' : undefined,
      type: myStats.debt > 0 ? 'danger' : 'default',
    },
    {
      label: 'Workouts',
      value: myStats.totalWorkouts,
      suffix: 'total',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      gradient: 'var(--gradient-secondary)',
      type: 'default',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="glass rounded-xl p-4 hover:-translate-y-0.5 transition-transform duration-300 fade-in-up"
        >
          {/* Header with icon and label */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: stat.gradient || 'hsl(var(--muted))',
              }}
            >
              <span
                className={stat.gradient ? 'text-white' : ''}
                style={{ color: stat.gradient ? undefined : 'hsl(var(--muted-foreground))' }}
              >
                {stat.icon}
              </span>
            </div>
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {stat.label}
            </span>
          </div>

          {/* Value */}
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-2xl font-bold font-mono-tab"
              style={{
                color:
                  stat.type === 'danger'
                    ? 'hsl(var(--destructive))'
                    : stat.type === 'muted'
                    ? 'hsl(var(--muted-foreground))'
                    : 'hsl(var(--foreground))',
              }}
            >
              {stat.value}
            </span>
            {stat.total && (
              <span
                className="text-lg font-medium"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                /{stat.total}
              </span>
            )}
            {stat.suffix && !stat.total && (
              <span
                className="text-sm"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                {stat.suffix}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
