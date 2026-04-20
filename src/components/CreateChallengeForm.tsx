import { useState } from 'react';
import axios from 'axios';
import { challengeService } from '../services/challengeService';
import type { CreateChallengeData } from '../types/challenge';

interface CreateChallengeFormProps {
  onSuccess: (challengeId: string) => void;
  onCancel: () => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs mt-1 font-medium" style={{ color: 'hsl(var(--destructive))' }}>
      {message}
    </p>
  );
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!formData.name || formData.name.trim().length < 3) errors.name = 'Please enter a name (at least 3 characters).';
    if (!formData.startDate) errors.startDate = 'Please fill out this field.';
    if (!formData.endDate) errors.endDate = 'Please fill out this field.';
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) errors.endDate = 'End date must be after start date.';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

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

  const inputStyle = (field?: string) => ({
    background: 'hsl(var(--muted))',
    border: `1px solid ${submitted && field && fieldErrors[field] ? 'hsl(var(--destructive))' : 'hsl(var(--border))'}`,
    color: 'hsl(var(--foreground))',
    borderRadius: 'var(--radius)',
  });

  return (
    <div className="card p-6">
      <h2
        className="text-lg font-bold mb-5"
        style={{ color: 'hsl(var(--foreground))' }}
      >
        Create Challenge
      </h2>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <div
            className="p-3 text-sm"
            style={{
              background: 'hsl(var(--destructive) / 0.08)',
              border: '1px solid hsl(var(--destructive) / 0.2)',
              color: 'hsl(var(--destructive))',
              borderRadius: 'var(--radius)',
            }}
          >
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Challenge Name *
          </label>
          <input
            type="text"
            maxLength={100}
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (submitted) setFieldErrors((prev) => ({ ...prev, name: '' }));
            }}
            className="w-full px-3 py-2 text-sm focus:ring-2 focus:outline-none transition"
            style={inputStyle('name')}
            placeholder="e.g., 30-Day Fitness Challenge"
          />
          <FieldError message={submitted ? fieldErrors.name : undefined} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Description
          </label>
          <textarea
            maxLength={500}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-sm focus:ring-2 focus:outline-none transition"
            style={inputStyle()}
            rows={2}
            placeholder="What's this challenge about?"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
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
              className="w-full px-3 py-2 text-sm focus:ring-2 focus:outline-none transition"
              style={inputStyle()}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>{n}x per week</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Penalty ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>$</span>
              <input
                type="number"
                min={0}
                value={formData.rules.penaltyAmount || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rules: { ...formData.rules, penaltyAmount: e.target.value === '' ? 0 : Number(e.target.value) },
                  })
                }
                className="w-full pl-7 pr-3 py-2 text-sm focus:ring-2 focus:outline-none transition"
                style={inputStyle()}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => {
                setFormData({ ...formData, startDate: e.target.value });
                if (submitted) setFieldErrors((prev) => ({ ...prev, startDate: '' }));
              }}
              className="w-full px-3 py-2 text-sm focus:ring-2 focus:outline-none transition"
              style={inputStyle('startDate')}
            />
            <FieldError message={submitted ? fieldErrors.startDate : undefined} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              End Date *
            </label>
            <input
              type="date"
              value={formData.endDate}
              min={formData.startDate}
              onChange={(e) => {
                setFormData({ ...formData, endDate: e.target.value });
                if (submitted) setFieldErrors((prev) => ({ ...prev, endDate: '' }));
              }}
              className="w-full px-3 py-2 text-sm focus:ring-2 focus:outline-none transition"
              style={inputStyle('endDate')}
            />
            <FieldError message={submitted ? fieldErrors.endDate : undefined} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn-press flex-1 px-4 py-2.5 text-sm font-medium transition"
            style={{
              background: 'hsl(var(--muted))',
              color: 'hsl(var(--muted-foreground))',
              borderRadius: 'var(--radius)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-press flex-1 px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-50"
            style={{
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius)',
            }}
          >
            {loading ? 'Creating...' : 'Create Challenge'}
          </button>
        </div>
      </form>
    </div>
  );
}
