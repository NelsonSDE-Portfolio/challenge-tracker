import { api } from '../lib/api';
import type {
  WorkoutLog,
  CreateWorkoutData,
  AdminCreateWorkoutData,
  PresignedUrlResponse,
} from '../types/workout';

interface WorkoutResponse {
  workout: WorkoutLog;
  message?: string;
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
    // Content-Type is signed in the presigned URL, so we must send
    // the matching header. Use a Blob to ensure the exact MIME type.
    const blob = new Blob([file], { type: file.type });
    await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
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

  async adminDeleteByDate(
    challengeId: string,
    userId: string,
    date: string,
  ): Promise<void> {
    await api.delete(`/challenges/${challengeId}/workouts/admin/${userId}/${date}`);
  },

};
