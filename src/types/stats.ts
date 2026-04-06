export interface ParticipantStats {
  userId: string;
  name?: string;
  email?: string;
  totalWorkouts: number;
  weeklyWorkouts: number;
  currentStreak: number;
  debt: number;
  isAdmin: boolean;
}

export interface ChallengeStats {
  totalDebt: number;
  totalWorkouts: number;
  totalRequiredWorkouts: number;
  weeksCompleted: number;
  weeksRemaining: number;
  currentWeek: number;
  totalWeeks: number;
}

export interface MyStats {
  totalWorkouts: number;
  weeklyWorkouts: number;
  currentStreak: number;
  debt: number;
}

export interface RecentWorkout {
  _id: string;
  userId: string;
  userName?: string;
  date: string;
  photoUrl?: string;
  source: 'self' | 'admin';
  createdAt: string;
}

export interface BehindParticipant {
  userId: string;
  name?: string;
  weeklyWorkouts: number;
  required: number;
  shortfall: number;
}

export interface AdminDashboard {
  stats: ChallengeStats & { participants: ParticipantStats[] };
  recentActivity: RecentWorkout[];
  behindParticipants: BehindParticipant[];
}

export interface WeeklyParticipantProgress {
  userId: string;
  name?: string;
  workoutDates: string[];
  weeklyPenalty: number;
}

export interface WeeklyProgress {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  daysRemaining: number;
  minWorkoutsPerWeek: number;
  penaltyAmount: number;
  participants: WeeklyParticipantProgress[];
  totalPenalty: number;
}

export interface WeekDebtEntry {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  debt: number;
  workoutsLogged: number;
  workoutsRequired: number;
}

export interface ParticipantDebtSummary {
  userId: string;
  name?: string;
  weeks: WeekDebtEntry[];
  totalDebt: number;
  totalWorkouts: number;
}

export interface AllWeeksDebt {
  participants: ParticipantDebtSummary[];
  weekHeaders: { weekNumber: number; weekStart: string; weekEnd: string }[];
  grandTotal: number;
  penaltyAmount: number;
  minWorkoutsPerWeek: number;
}
