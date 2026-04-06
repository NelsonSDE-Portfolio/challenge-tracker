import { useState } from 'react';
import { ChallengeSettings } from './ChallengeSettings';
import { AdminDashboard } from './AdminDashboard';
import { AdminAddWorkout } from './AdminAddWorkout';
import type { Challenge } from '../types/challenge';

interface AdminPanelProps {
  challenge: Challenge;
  onClose: () => void;
  onChallengeUpdate: () => void;
}

type AdminView = 'dashboard' | 'settings' | 'addWorkout';

export function AdminPanel({ challenge, onClose, onChallengeUpdate }: AdminPanelProps) {
  const [view, setView] = useState<AdminView>('dashboard');
  const [addWorkoutData, setAddWorkoutData] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  const handleAddWorkout = (userId: string, userName: string) => {
    setAddWorkoutData({ userId, userName });
    setView('addWorkout');
  };

  const handleAddWorkoutSuccess = () => {
    setAddWorkoutData(null);
    setView('dashboard');
    onChallengeUpdate();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">Admin Panel</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 px-4 py-3 border-b border-slate-800">
          <button
            onClick={() => setView('dashboard')}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              view === 'dashboard'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView('settings')}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              view === 'settings'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {view === 'dashboard' && (
            <div className="admin-dashboard-dark">
              <AdminDashboard
                challengeId={challenge._id}
                minWorkoutsPerWeek={challenge.rules.minWorkoutsPerWeek}
                onAddWorkout={handleAddWorkout}
              />
            </div>
          )}

          {view === 'settings' && (
            <div className="settings-dark">
              <ChallengeSettings
                challenge={challenge}
                onSuccess={() => {
                  setView('dashboard');
                  onChallengeUpdate();
                }}
                onCancel={() => setView('dashboard')}
              />
            </div>
          )}

          {view === 'addWorkout' && addWorkoutData && (
            <div className="add-workout-dark">
              <AdminAddWorkout
                challengeId={challenge._id}
                userId={addWorkoutData.userId}
                userName={addWorkoutData.userName}
                onSuccess={handleAddWorkoutSuccess}
                onCancel={() => {
                  setAddWorkoutData(null);
                  setView('dashboard');
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Dark theme overrides for existing components */}
      <style>{`
        .admin-dashboard-dark .bg-white {
          background-color: rgb(30 41 59) !important;
        }
        .admin-dashboard-dark .text-gray-800,
        .admin-dashboard-dark .text-gray-700,
        .admin-dashboard-dark .text-gray-600 {
          color: rgb(226 232 240) !important;
        }
        .admin-dashboard-dark .text-gray-500,
        .admin-dashboard-dark .text-gray-400 {
          color: rgb(148 163 184) !important;
        }
        .admin-dashboard-dark .border-gray-200,
        .admin-dashboard-dark .border-gray-100 {
          border-color: rgb(51 65 85) !important;
        }
        .admin-dashboard-dark .bg-gray-50,
        .admin-dashboard-dark .bg-gray-100 {
          background-color: rgb(51 65 85) !important;
        }
        .admin-dashboard-dark .shadow {
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.3) !important;
        }

        .settings-dark .bg-white {
          background-color: rgb(30 41 59) !important;
        }
        .settings-dark .text-gray-800,
        .settings-dark .text-gray-700,
        .settings-dark .text-gray-600 {
          color: rgb(226 232 240) !important;
        }
        .settings-dark .text-gray-500,
        .settings-dark .text-gray-400 {
          color: rgb(148 163 184) !important;
        }
        .settings-dark .border-gray-200,
        .settings-dark .border-gray-300 {
          border-color: rgb(51 65 85) !important;
        }
        .settings-dark input,
        .settings-dark textarea {
          background-color: rgb(51 65 85) !important;
          border-color: rgb(71 85 105) !important;
          color: white !important;
        }

        .add-workout-dark .bg-white {
          background-color: rgb(30 41 59) !important;
        }
        .add-workout-dark .text-gray-800,
        .add-workout-dark .text-gray-700,
        .add-workout-dark .text-gray-600 {
          color: rgb(226 232 240) !important;
        }
        .add-workout-dark .text-gray-500 {
          color: rgb(148 163 184) !important;
        }
        .add-workout-dark .border-gray-300 {
          border-color: rgb(51 65 85) !important;
        }
        .add-workout-dark input {
          background-color: rgb(51 65 85) !important;
          border-color: rgb(71 85 105) !important;
          color: white !important;
        }
      `}</style>
    </>
  );
}
