import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { challengeService } from '../services/challengeService';
import type { Challenge } from '../types/challenge';

export function JoinChallengePage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadyParticipant, setIsAlreadyParticipant] = useState(false);

  useEffect(() => {
    if (inviteCode) {
      loadChallengeInfo(inviteCode);
    }
  }, [inviteCode]);

  const loadChallengeInfo = async (code: string) => {
    try {
      setLoading(true);
      const data = await challengeService.getByInviteCode(code);
      setChallenge(data.challenge);
      setIsAlreadyParticipant(data.isAlreadyParticipant);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid invite code');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode) return;

    try {
      setJoining(true);
      const joinedChallenge = await challengeService.join(inviteCode);
      navigate(`/challenges/${joinedChallenge._id}`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Already a participant
        if (challenge) {
          navigate(`/challenges/${challenge._id}`);
        }
      } else {
        setError(err.response?.data?.message || 'Failed to join challenge');
      }
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="text-red-500 text-5xl mb-4">😕</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Invalid Invite Link
        </h2>
        <p className="text-gray-600 mb-6">
          {error || 'This invite link is not valid or has expired.'}
        </p>
        <Link
          to="/challenges"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Challenges
        </Link>
      </div>
    );
  }

  if (isAlreadyParticipant) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          You're Already In!
        </h2>
        <p className="text-gray-600 mb-6">
          You're already a participant in <strong>{challenge.name}</strong>
        </p>
        <Link
          to={`/challenges/${challenge._id}`}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Challenge
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-xl font-bold">You're Invited!</h2>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {challenge.name}
          </h3>
          {challenge.description && (
            <p className="text-gray-600 mb-4">{challenge.description}</p>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Workouts Required</span>
              <span className="font-medium">
                {challenge.rules.minWorkoutsPerWeek}x per week
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Penalty</span>
              <span className="font-medium">
                ${challenge.rules.penaltyAmount} per miss
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Duration</span>
              <span className="font-medium">
                {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Participants</span>
              <span className="font-medium">
                {challenge.participantCount} joined
              </span>
            </div>
          </div>

          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
          >
            {joining ? 'Joining...' : 'Join Challenge'}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            <Link to="/challenges" className="text-blue-600 hover:text-blue-700">
              Go back to challenges
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
