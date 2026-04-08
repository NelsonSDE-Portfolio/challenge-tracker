import { api } from '../lib/api';
import type {
  Challenge,
  CreateChallengeData,
  UpdateChallengeData,
} from '../types/challenge';

interface ChallengesResponse {
  challenges: Challenge[];
}

interface ChallengeResponse {
  challenge: Challenge;
  message?: string;
}

interface InviteResponse {
  challenge: Challenge;
  isAlreadyParticipant: boolean;
}

interface JoinResponse {
  challenge: Challenge;
  message: string;
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

  async getByInviteCode(inviteCode: string): Promise<InviteResponse> {
    const response = await api.get<InviteResponse>(
      `/challenges/invite/${inviteCode}`
    );
    return response.data;
  },

  async join(inviteCode: string): Promise<Challenge> {
    const response = await api.post<JoinResponse>('/challenges/join', {
      inviteCode,
    });
    return response.data.challenge;
  },
};
