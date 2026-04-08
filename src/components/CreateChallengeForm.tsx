import { useState } from 'react';
import axios from 'axios';
import { challengeService } from '../services/challengeService';
import type { CreateChallengeData } from '../types/challenge';

interface CreateChallengeFormProps {
  onSuccess: (challengeId: string) => void;
  onCancel: () => void;
}

export function CreateChallengeForm({ onSuccess, onCancel }: CreateChallengeFormProps) {
  const [formData, setFormData] = useState<CreateChallengeData>({
    name: '',
    description: '',
    rules: {
      minWorkoutsPerWeek: 3,
      penaltyAmount: 10,
    },
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const challenge = await challengeService.create(formData);
      onSuccess(challenge._id);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to create challenge');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Create New Challenge</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Challenge Name *
          </label>
          <input
            type="text"
            required
            minLength={3}
            maxLength={100}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="e.g., 30-Day Fitness Challenge"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Description
          </label>
          <textarea
            maxLength={500}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            rows={3}
            placeholder="What's this challenge about?"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Workouts/Week *
            </label>
            <select
              value={formData.rules.minWorkoutsPerWeek}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rules: { ...formData.rules, minWorkoutsPerWeek: Number(e.target.value) },
                })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  {n}x per week
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Penalty Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400">$</span>
              <input
                type="number"
                required
                min={0}
                value={formData.rules.penaltyAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rules: { ...formData.rules, penaltyAmount: Number(e.target.value) },
                  })
                }
                className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              End Date *
            </label>
            <input
              type="date"
              required
              value={formData.endDate}
              min={formData.startDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Challenge'}
          </button>
        </div>
      </form>
    </div>
  );
}
