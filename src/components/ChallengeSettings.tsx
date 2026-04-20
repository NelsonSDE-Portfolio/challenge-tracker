import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  const hasRulesChanged =
    minWorkoutsPerWeek !== challenge.rules.minWorkoutsPerWeek ||
    penaltyAmount !== challenge.rules.penaltyAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Challenge name is required.');
      return;
    }

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
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to update settings');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  const handleDeleteChallenge = async (keepData: boolean) => {
    try {
      setDeleteLoading(true);
      await challengeService.delete(challenge._id, keepData);
      navigate('..');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to delete challenge');
      } else {
        setError('An unexpected error occurred');
      }
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-bold"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          Challenge Settings
        </h2>
        <button
          onClick={onCancel}
          className="text-sm transition hover:opacity-70"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Challenge Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm focus:ring-2 focus:outline-none transition"
            style={{
              background: 'hsl(var(--muted))',
              border: `1px solid ${!name.trim() && submitting ? 'hsl(var(--destructive))' : 'hsl(var(--border))'}`,
              color: 'hsl(var(--foreground))',
              borderRadius: 'var(--radius)',
            }}
            minLength={3}
            maxLength={100}
          />
          {!name.trim() && submitting && (
            <p className="text-xs mt-1 font-medium" style={{ color: 'hsl(var(--destructive))' }}>Please fill out this field.</p>
          )}
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm focus:ring-2 focus:outline-none transition"
            style={{
              background: 'hsl(var(--muted))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              borderRadius: 'var(--radius)',
            }}
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Min Workouts/Week
            </label>
            <input
              type="number"
              value={minWorkoutsPerWeek || ''}
              onChange={(e) => setMinWorkoutsPerWeek(e.target.value === '' ? 1 : Number(e.target.value))}
              className="w-full px-3 py-2 text-sm focus:ring-2 focus:outline-none transition"
              style={{
                background: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
                borderRadius: 'var(--radius)',
              }}
              min={1}
              max={7}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Penalty Amount ($)
            </label>
            <input
              type="number"
              value={penaltyAmount || ''}
              onChange={(e) => setPenaltyAmount(e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full px-3 py-2 text-sm focus:ring-2 focus:outline-none transition"
              style={{
                background: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
                borderRadius: 'var(--radius)',
              }}
              min={0}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 text-sm focus:ring-2 focus:outline-none transition"
            style={{
              background: 'hsl(var(--muted))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              borderRadius: 'var(--radius)',
            }}
            min={new Date(challenge.startDate).toISOString().split('T')[0]}
          />
        </div>

        {showConfirm && hasRulesChanged && (
          <div
            className="rounded-lg p-4"
            style={{
              background: 'hsl(var(--warning) / 0.1)',
              border: '1px solid hsl(var(--warning) / 0.3)',
            }}
          >
            <p
              className="text-sm font-medium mb-2"
              style={{ color: 'hsl(var(--warning))' }}
            >
              Warning: Changing rules will recalculate debt
            </p>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Changing the minimum workouts or penalty amount will affect all
              participants' debt calculations. Are you sure you want to continue?
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm" style={{ color: 'hsl(var(--destructive))' }}>
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setShowConfirm(false);
              onCancel();
            }}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition hover:opacity-80"
            style={{
              background: 'hsl(var(--muted))',
              color: 'hsl(var(--muted-foreground))',
            }}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 text-white rounded-lg font-medium transition hover:opacity-90 disabled:opacity-50"
            style={{
              background: showConfirm
                ? 'hsl(var(--warning))'
                : 'var(--gradient-primary)',
            }}
          >
            {submitting
              ? 'Saving...'
              : showConfirm
              ? 'Confirm Changes'
              : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div
        className="mt-8 rounded-xl p-4"
        style={{
          border: '1px solid hsl(var(--destructive) / 0.3)',
          background: 'hsl(var(--destructive) / 0.05)',
        }}
      >
        <h3
          className="text-sm font-bold uppercase tracking-wider mb-3"
          style={{ color: 'hsl(var(--destructive))' }}
        >
          Danger Zone
        </h3>
        <p className="text-sm mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Permanently delete this challenge. This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
            style={{
              background: 'hsl(var(--destructive) / 0.1)',
              color: 'hsl(var(--destructive))',
              border: '1px solid hsl(var(--destructive) / 0.3)',
            }}
          >
            Delete Challenge
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
              Delete challenge and all data?
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleDeleteChallenge(true)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80 disabled:opacity-50"
                style={{
                  background: 'hsl(var(--warning) / 0.1)',
                  color: 'hsl(var(--warning))',
                  border: '1px solid hsl(var(--warning) / 0.3)',
                }}
              >
                {deleteLoading ? 'Processing...' : 'Archive (keep data)'}
              </button>
              <button
                onClick={() => handleDeleteChallenge(false)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80 disabled:opacity-50"
                style={{
                  background: 'hsl(var(--destructive))',
                  color: 'white',
                }}
              >
                {deleteLoading ? 'Processing...' : 'Delete permanently'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium transition hover:opacity-80"
                style={{
                  background: 'hsl(var(--muted))',
                  color: 'hsl(var(--muted-foreground))',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
