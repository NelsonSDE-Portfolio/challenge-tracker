import { useState } from 'react';
import { challengeService } from '../services/challengeService';
import type { Challenge } from '../types/challenge';

interface ChallengeSettingsProps {
  challenge: Challenge;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ChallengeSettings({
  challenge,
  onSuccess,
  onCancel,
}: ChallengeSettingsProps) {
  const [name, setName] = useState(challenge.name);
  const [description, setDescription] = useState(challenge.description || '');
  const [minWorkoutsPerWeek, setMinWorkoutsPerWeek] = useState(
    challenge.rules.minWorkoutsPerWeek,
  );
  const [penaltyAmount, setPenaltyAmount] = useState(challenge.rules.penaltyAmount);
  const [endDate, setEndDate] = useState(
    new Date(challenge.endDate).toISOString().split('T')[0],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const hasRulesChanged =
    minWorkoutsPerWeek !== challenge.rules.minWorkoutsPerWeek ||
    penaltyAmount !== challenge.rules.penaltyAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If rules changed and we haven't confirmed yet
    if (hasRulesChanged && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    setError(null);

    try {
      setSubmitting(true);

      await challengeService.update(challenge._id, {
        name,
        description: description || undefined,
        rules: {
          minWorkoutsPerWeek,
          penaltyAmount,
        },
        endDate,
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Challenge Settings</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Challenge Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            minLength={3}
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Workouts/Week
            </label>
            <input
              type="number"
              value={minWorkoutsPerWeek}
              onChange={(e) => setMinWorkoutsPerWeek(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={1}
              max={7}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Penalty Amount ($)
            </label>
            <input
              type="number"
              value={penaltyAmount}
              onChange={(e) => setPenaltyAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={0}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min={new Date(challenge.startDate).toISOString().split('T')[0]}
            required
          />
        </div>

        {showConfirm && hasRulesChanged && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              Warning: Changing rules will recalculate debt
            </p>
            <p className="text-sm text-yellow-700">
              Changing the minimum workouts or penalty amount will affect all
              participants' debt calculations. Are you sure you want to continue?
            </p>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setShowConfirm(false);
              onCancel();
            }}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 ${
              showConfirm
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting
              ? 'Saving...'
              : showConfirm
              ? 'Confirm Changes'
              : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
