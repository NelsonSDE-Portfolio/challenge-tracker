import { api } from '../lib/api';
import type {
  Challenge,
  CreateChallengeData,
  InviteResponse,
  Participant,
  UpdateChallengeData,
} from '../types/challenge';

interface ChallengesResponse {
  challenges: Challenge[];
}

interface ChallengeResponse {
  challenge: Challenge;
  message?: string;
}

export const challengeService = {
  async getAll(): Promise<Challenge[]> {
    const response = await api.get<ChallengesResponse>('/challenges');
    return response.data.challenges;
  },

  async getById(id: string): Promise<Challenge> {
    const response = await api.get<ChallengeResponse>(`/challenges/${id}`);
    return response.data.challenge;
  },

  async create(data: CreateChallengeData): Promise<Challenge> {
    const response = await api.post<ChallengeResponse>('/challenges', data);
    return response.data.challenge;
  },

  async update(id: string, data: UpdateChallengeData): Promise<Challenge> {
    const response = await api.put<ChallengeResponse>(`/challenges/${id}`, data);
    return response.data.challenge;
  },

  async invite(
    challengeId: string,
    email: string,
    name?: string,
  ): Promise<InviteResponse> {
    const response = await api.post<InviteResponse>(
      `/challenges/${challengeId}/invites`,
      { email, name },
    );
    return response.data;
  },

  async revokeInvite(challengeId: string, userId: string): Promise<void> {
    await api.delete(`/challenges/${challengeId}/invites/${userId}`);
  },

  async getParticipants(challengeId: string): Promise<Participant[]> {
    const response = await api.get<{ participants: Participant[] }>(
      `/challenges/${challengeId}/participants`,
    );
    return response.data.participants;
  },

  async leave(challengeId: string, deleteData: boolean = false): Promise<void> {
    await api.post(`/challenges/${challengeId}/leave?deleteData=${deleteData}`);
  },

  async delete(challengeId: string, keepData: boolean = false): Promise<void> {
    await api.delete(`/challenges/${challengeId}?keepData=${keepData}`);
  },

  async removeParticipant(challengeId: string, userId: string, deleteData: boolean = false): Promise<void> {
    await api.delete(`/challenges/${challengeId}/participants/${userId}?deleteData=${deleteData}`);
  },
};
