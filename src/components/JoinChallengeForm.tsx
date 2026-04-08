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
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Join a Challenge</h2>
      <p className="text-slate-400 text-sm mb-4">
        Enter the invite code shared by the challenge admin
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Invite Code
          </label>
          <input
            type="text"
            required
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-center text-lg tracking-wider"
            placeholder="abc123def456"
          />
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
            disabled={loading || !inviteCode.trim()}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Challenge'}
          </button>
        </div>
      </form>
    </div>
  );
}
