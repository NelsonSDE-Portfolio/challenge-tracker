export interface ChallengeRules {
  minWorkoutsPerWeek: number;
  penaltyAmount: number;
}

export interface Participant {
  userId: string;
  role: 'admin' | 'player';
  joinedAt: string;
  name?: string;
  email?: string;
  pendingInvite?: boolean;
}

export interface Challenge {
  _id: string;
  name: string;
  description?: string;
  rules: ChallengeRules;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  participants?: Participant[];
  participantCount?: number;
  isAdmin?: boolean;
  createdAt?: string;
}

export interface InviteResponse {
  invitedUserId: string;
  pending: boolean;
  message: string;
}

export interface CreateChallengeData {
  name: string;
  description?: string;
  rules: ChallengeRules;
  startDate: string;
  endDate: string;
}

export interface UpdateChallengeData {
  name?: string;
  description?: string;
  rules?: Partial<ChallengeRules>;
  endDate?: string;
}
