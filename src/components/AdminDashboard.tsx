import { useState, useEffect } from 'react';
import { statsService } from '../services/statsService';
import type { AdminDashboard as AdminDashboardData, ParticipantStats } from '../types/stats';

interface AdminDashboardProps {
  challengeId: string;
  minWorkoutsPerWeek: number;
  onAddWorkout: (userId: string, userName: string) => void;
}

export function AdminDashboard({
  challengeId,
  minWorkoutsPerWeek,
  onAddWorkout,
}: AdminDashboardProps) {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [challengeId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await statsService.getAdminDashboard(challengeId);
      setDashboard(data);
      setError(null);
    } catch (err) {
      setError('Failed to load admin dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500 text-sm">{error || 'Failed to load dashboard'}</p>
        <button
          onClick={loadDashboard}
          className="mt-2 text-blue-600 text-sm hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Behind This Week Alert */}
      {dashboard.behindParticipants.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <span className="text-xl">&#9888;</span>
            Behind This Week ({dashboard.behindParticipants.length})
          </h3>
          <div className="space-y-2">
            {dashboard.behindParticipants.map((p) => (
              <div
                key={p.userId}
                className="flex items-center justify-between bg-white rounded-lg p-3"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {p.name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {p.weeklyWorkouts}/{p.required} workouts ({p.shortfall} behind)
                  </p>
                </div>
                <button
                  onClick={() => onAddWorkout(p.userId, p.name || 'Unknown')}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                >
                  Add Entry
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Participants */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">All Participants</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {dashboard.stats.participants.map((participant: ParticipantStats) => (
            <div
              key={participant.userId}
              className="p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-800">
                    {participant.name || participant.email || 'Unknown User'}
                  </p>
                  {participant.isAdmin && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                  <span>{participant.totalWorkouts} total</span>
                  <span>
                    {participant.weeklyWorkouts}/{minWorkoutsPerWeek} this week
                  </span>
                  {participant.currentStreak > 0 && (
                    <span className="text-orange-600">
                      {participant.currentStreak} week streak
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      participant.debt === 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {participant.debt === 0 ? 'No debt' : `$${participant.debt}`}
                  </p>
                </div>
                <button
                  onClick={() =>
                    onAddWorkout(
                      participant.userId,
                      participant.name || participant.email || 'Unknown',
                    )
                  }
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Recent Activity</h3>
        </div>
        {dashboard.recentActivity.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {dashboard.recentActivity.map((activity) => (
              <div key={activity._id} className="p-4 flex items-center gap-4">
                {activity.photoUrl ? (
                  <img
                    src={activity.photoUrl}
                    alt="Workout"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                    <span className="text-xs">No photo</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {activity.userName || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  {activity.source === 'admin' && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
