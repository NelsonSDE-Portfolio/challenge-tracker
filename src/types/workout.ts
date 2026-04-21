export interface WorkoutLog {
  _id: string;
  userId: string;
  date: string;
  photoUrl?: string;
  source: 'self' | 'admin';
  addedBy?: string;
  note?: string;
  activityType?: string;
  metadata?: Record<string, number>;
  createdAt: string;
}

export interface CreateWorkoutData {
  date: string;
  photoUrl?: string;
  note?: string;
  activityType?: string;
  metadata?: Record<string, number>;
}

export interface AdminCreateWorkoutData {
  userId: string;
  date: string;
  photoUrl?: string;
  note?: string;
  activityType?: string;
  metadata?: Record<string, number>;
}

export interface WorkoutStats {
  totalWorkouts: number;
  weeklyWorkouts: number;
  weekStart: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  fileUrl: string;
  expiresIn: number;
}

export interface PublicWorkout {
  userName: string;
  date: string;
  activityType?: string;
  metadata?: Record<string, unknown>;
  note?: string;
  photoUrl?: string;
  challengeName: string;
  weeklyProgress: {
    current: number;
    target: number;
  };
}
