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
