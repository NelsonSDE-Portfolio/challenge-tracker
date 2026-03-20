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
