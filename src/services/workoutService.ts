import { api } from '../lib/api';
import type {
  WorkoutLog,
  CreateWorkoutData,
  AdminCreateWorkoutData,
  PresignedUrlResponse,
  PublicWorkout,
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
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
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

  async getByUserAndDate(
    challengeId: string,
    userId: string,
    date: string,
  ): Promise<WorkoutLog | null> {
    const response = await api.get<{ workouts: WorkoutLog[] }>(
      `/challenges/${challengeId}/workouts`,
      { params: { userId } },
    );
    return response.data.workouts.find((w) => {
      const workoutDate = new Date(w.date);
      const y = workoutDate.getFullYear();
      const m = String(workoutDate.getMonth() + 1).padStart(2, '0');
      const d = String(workoutDate.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}` === date;
    }) || null;
  },

  async share(
    challengeId: string,
    workoutId: string,
  ): Promise<{ shareToken: string }> {
    const response = await api.post<{ shareToken: string }>(
      `/challenges/${challengeId}/workouts/${workoutId}/share`,
    );
    return response.data;
  },

  async getPublicWorkout(shareToken: string): Promise<PublicWorkout> {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4002/api/v1';
    const response = await fetch(`${apiUrl}/public/workouts/${shareToken}`);
    if (!response.ok) throw new Error('Workout not found');
    return response.json();
  },
};
