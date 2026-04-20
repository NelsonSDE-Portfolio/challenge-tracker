import { useState } from 'react';
import axios from 'axios';
import { challengeService } from '../services/challengeService';

interface JoinChallengeFormProps {
  onSuccess: (challengeId: string) => void;
  onCancel: () => void;
  initialCode?: string;
}

export function JoinChallengeForm({ onSuccess, onCancel, initialCode = '' }: JoinChallengeFormProps) {
  const [inviteCode, setInviteCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const challenge = await challengeService.join(inviteCode.trim());
      onSuccess(challenge._id);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        if (err.response?.status === 409) {
          // Already a participant - redirect to challenge
          try {
            const data = await challengeService.getByInviteCode(inviteCode.trim());
            onSuccess(data.challenge._id);
            return;
          } catch {
            setError(message || 'You are already in this challenge');
          }
        } else {
          setError(message || 'Failed to join challenge');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h2
        className="text-lg font-bold mb-1"
        style={{ color: 'hsl(var(--foreground))' }}
      >
        Join a Challenge
      </h2>
      <p
        className="text-sm mb-5"
        style={{ color: 'hsl(var(--muted-foreground))' }}
      >
        Enter the invite code shared by the challenge admin
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              background: 'hsl(var(--destructive) / 0.1)',
              border: '1px solid hsl(var(--destructive) / 0.3)',
              color: 'hsl(var(--destructive))',
            }}
          >
            {error}
          </div>
        )}

        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            Invite Code
          </label>
          <input
            type="text"
            required
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-lg font-mono text-center tracking-widest focus:outline-none focus:ring-2"
            style={{
              background: 'hsl(var(--muted))',
              color: 'hsl(var(--foreground))',
              border: 'none',
            }}
            placeholder="abc123def456"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-200"
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
            disabled={loading || !inviteCode.trim()}
            className="flex-1 px-4 py-2.5 text-sm font-bold transition-all duration-200 disabled:opacity-50"
            style={{
              background: 'var(--gradient-primary)',
              color: 'white',
              borderRadius: 'var(--radius)',
            }}
          >
            {loading ? 'Joining...' : 'Join Challenge'}
          </button>
        </div>
      </form>
    </div>
  );
}
