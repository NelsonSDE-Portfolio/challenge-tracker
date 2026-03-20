export interface WorkoutLog {
  _id: string;
  userId: string;
  date: string;
  photoUrl?: string;
  source: 'self' | 'admin';
  addedBy?: string;
  note?: string;
  createdAt: string;
}

export interface CreateWorkoutData {
  date: string;
  photoUrl: string;
  note?: string;
}

export interface AdminCreateWorkoutData {
  userId: string;
  date: string;
  photoUrl?: string;
  note?: string;
}

export interface WorkoutStats {
  totalWorkouts: number;
  weeklyWorkouts: number;
  weekStart: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
}
