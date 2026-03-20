import { api } from '../lib/api';
import type { ChallengeStats, MyStats, ParticipantStats } from '../types/stats';

interface ChallengeStatsResponse {
  stats: ChallengeStats;
}

interface MyStatsResponse {
  stats: MyStats;
}

interface LeaderboardResponse {
  leaderboard: ParticipantStats[];
}

interface ParticipantStatsResponse {
  stats: ParticipantStats;
}

export const statsService = {
  async getChallengeStats(challengeId: string): Promise<ChallengeStats> {
    const response = await api.get<ChallengeStatsResponse>(
      `/challenges/${challengeId}/stats`,
    );
    return response.data.stats;
  },

  async getMyStats(challengeId: string): Promise<MyStats> {
    const response = await api.get<MyStatsResponse>(
      `/challenges/${challengeId}/stats/me`,
    );
    return response.data.stats;
  },

  async getLeaderboard(challengeId: string): Promise<ParticipantStats[]> {
    const response = await api.get<LeaderboardResponse>(
      `/challenges/${challengeId}/stats/leaderboard`,
    );
    return response.data.leaderboard;
  },

  async getParticipantStats(
    challengeId: string,
    userId: string,
  ): Promise<ParticipantStats> {
    const response = await api.get<ParticipantStatsResponse>(
      `/challenges/${challengeId}/stats/participants/${userId}`,
    );
    return response.data.stats;
  },

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(0)}`;
  },

  formatStreak(weeks: number): string {
    if (weeks === 0) return 'No streak';
    if (weeks === 1) return '1 week';
    return `${weeks} weeks`;
  },
};
