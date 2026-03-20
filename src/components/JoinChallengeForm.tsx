import { useState } from 'react';
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
    } catch (err: any) {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Join a Challenge</h2>
      <p className="text-gray-600 text-sm mb-4">
        Enter the invite code shared by the challenge admin
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invite Code
          </label>
          <input
            type="text"
            required
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-center text-lg tracking-wider"
            placeholder="abc123def456"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
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
