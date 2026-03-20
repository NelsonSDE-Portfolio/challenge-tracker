import { api } from '../lib/api';
import type {
  WorkoutLog,
  CreateWorkoutData,
  AdminCreateWorkoutData,
  WorkoutStats,
  PresignedUrlResponse,
} from '../types/workout';

interface WorkoutsResponse {
  workouts: WorkoutLog[];
  count?: number;
}

interface WorkoutResponse {
  workout: WorkoutLog;
  message?: string;
}

interface StatsResponse {
  totalWorkouts: number;
  weeklyWorkouts: number;
  weekStart: string;
}

export const workoutService = {
  async getPresignedUrl(
    challengeId: string,
    contentType: string = 'image/jpeg',
  ): Promise<PresignedUrlResponse> {
    const response = await api.post<PresignedUrlResponse>('/upload/presigned-url', {
      challengeId,
      contentType,
    });
    return response.data;
  },

  async uploadPhoto(uploadUrl: string, file: File): Promise<void> {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
  },

  async create(
    challengeId: string,
    data: CreateWorkoutData,
  ): Promise<WorkoutLog> {
    const response = await api.post<WorkoutResponse>(
      `/challenges/${challengeId}/workouts`,
      data,
    );
    return response.data.workout;
  },

  async adminCreate(
    challengeId: string,
    data: AdminCreateWorkoutData,
  ): Promise<WorkoutLog> {
    const response = await api.post<WorkoutResponse>(
      `/challenges/${challengeId}/workouts/admin`,
      data,
    );
    return response.data.workout;
  },

  async getAll(challengeId: string): Promise<WorkoutLog[]> {
    const response = await api.get<WorkoutsResponse>(
      `/challenges/${challengeId}/workouts`,
    );
    return response.data.workouts;
  },

  async getMine(challengeId: string): Promise<WorkoutLog[]> {
    const response = await api.get<WorkoutsResponse>(
      `/challenges/${challengeId}/workouts/mine`,
    );
    return response.data.workouts;
  },

  async getByUser(challengeId: string, userId: string): Promise<WorkoutLog[]> {
    const response = await api.get<WorkoutsResponse>(
      `/challenges/${challengeId}/workouts`,
      { params: { userId } },
    );
    return response.data.workouts;
  },

  async getStats(challengeId: string): Promise<WorkoutStats> {
    const response = await api.get<StatsResponse>(
      `/challenges/${challengeId}/workouts/stats`,
    );
    return response.data;
  },

  async getById(challengeId: string, workoutId: string): Promise<WorkoutLog> {
    const response = await api.get<WorkoutResponse>(
      `/challenges/${challengeId}/workouts/${workoutId}`,
    );
    return response.data.workout;
  },

  getPhotoUrl(key: string): string {
    // For development, use S3 public URL pattern
    // In production, this would be a presigned read URL
    const bucket = import.meta.env.VITE_S3_BUCKET || 'challenge-tracker-photos';
    const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  },
};
