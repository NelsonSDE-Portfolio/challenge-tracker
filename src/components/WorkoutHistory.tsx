import { useState, useEffect } from 'react';
import { workoutService } from '../services/workoutService';
import type { WorkoutLog } from '../types/workout';

interface WorkoutHistoryProps {
  challengeId: string;
  userId?: string;
  userName?: string;
  showHeader?: boolean;
}

export function WorkoutHistory({
  challengeId,
  userId,
  userName,
  showHeader = true,
}: WorkoutHistoryProps) {
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, [challengeId, userId]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const data = userId
        ? await workoutService.getByUser(challengeId, userId)
        : await workoutService.getMine(challengeId);
      setWorkouts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load workout history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={loadWorkouts}
          className="mt-2 text-blue-600 text-sm hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {showHeader && (
        <h3 className="font-semibold text-gray-800 mb-3">
          {userName ? `${userName}'s Workouts` : 'Your Workouts'}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({workouts.length} total)
          </span>
        </h3>
      )}

      {workouts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No workouts logged yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <div
              key={workout._id}
              onClick={() => setSelectedWorkout(workout)}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition"
            >
              {workout.photoUrl ? (
                <img
                  src={workout.photoUrl}
                  alt="Workout proof"
                  className="w-14 h-14 rounded-lg object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No photo</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800">
                  {formatDate(workout.date)}
                </p>
                {workout.note && (
                  <p className="text-sm text-gray-500 truncate">{workout.note}</p>
                )}
                {workout.source === 'admin' && (
                  <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1">
                    Added by Admin
                  </span>
                )}
              </div>

              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            {selectedWorkout.photoUrl && (
              <img
                src={selectedWorkout.photoUrl}
                alt="Workout proof"
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {formatDate(selectedWorkout.date)}
                  </h3>
                  {selectedWorkout.note && (
                    <p className="text-gray-600 mt-1">{selectedWorkout.note}</p>
                  )}
                </div>
                {selectedWorkout.source === 'admin' && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Added by Admin
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500">
                Logged on{' '}
                {new Date(selectedWorkout.createdAt).toLocaleString()}
              </p>

              <button
                onClick={() => setSelectedWorkout(null)}
                className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
