import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { challengeService } from '../services/challengeService';
import type { Challenge } from '../types/challenge';

export function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadChallenge(id);
    }
  }, [id]);

  const loadChallenge = async (challengeId: string) => {
    try {
      setLoading(true);
      const data = await challengeService.getById(challengeId);
      setChallenge(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load challenge');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = async () => {
    if (!challenge?.inviteCode) return;
    const url = challengeService.getInviteUrl(challenge.inviteCode);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: Challenge['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      upcoming: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error || 'Challenge not found'}</p>
        <Link
          to="/challenges"
          className="text-blue-600 hover:text-blue-700"
        >
          Back to challenges
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            to="/challenges"
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← Back to challenges
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{challenge.name}</h1>
          {challenge.description && (
            <p className="text-gray-600 mt-1">{challenge.description}</p>
          )}
        </div>
        {getStatusBadge(challenge.status)}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {challenge.rules.minWorkoutsPerWeek}
          </p>
          <p className="text-sm text-gray-500">Workouts/Week</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            ${challenge.rules.penaltyAmount}
          </p>
          <p className="text-sm text-gray-500">Per Miss</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {challenge.participants?.length || 0}
          </p>
          <p className="text-sm text-gray-500">Participants</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm font-medium text-gray-800">
            {formatDate(challenge.startDate)}
          </p>
          <p className="text-xs text-gray-500">to</p>
          <p className="text-sm font-medium text-gray-800">
            {formatDate(challenge.endDate)}
          </p>
        </div>
      </div>

      {/* Admin Actions */}
      {challenge.isAdmin && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Admin Actions</h3>
              <p className="text-sm text-blue-700">
                Share the invite link with friends
              </p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Share Invite Link
            </button>
          </div>
        </div>
      )}

      {/* Participants */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Participants</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {challenge.participants?.map((participant) => (
            <div
              key={participant.userId}
              className="p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {(participant.name || participant.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {participant.name || participant.email || 'Unknown User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Joined {formatDate(participant.joinedAt)}
                  </p>
                </div>
              </div>
              {participant.role === 'admin' && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Admin
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder for workout logging */}
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-gray-400 text-4xl mb-3">💪</div>
        <h3 className="font-medium text-gray-700 mb-2">Workout Logging</h3>
        <p className="text-gray-500 text-sm">
          Workout logging will be available in the next update
        </p>
      </div>

      {/* Invite Modal */}
      {showInviteModal && challenge.inviteCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Invite Friends
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Share this link or code with friends to invite them:
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Invite Code</label>
                <div className="bg-gray-100 rounded-lg p-3 font-mono text-center text-lg tracking-wider">
                  {challenge.inviteCode}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Invite Link</label>
                <div className="bg-gray-100 rounded-lg p-3 text-sm break-all">
                  {challengeService.getInviteUrl(challenge.inviteCode)}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Close
              </button>
              <button
                onClick={copyInviteLink}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
