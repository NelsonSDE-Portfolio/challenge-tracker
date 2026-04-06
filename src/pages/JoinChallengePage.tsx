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
      navigate(`../${joinedChallenge._id}`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Already a participant
        if (challenge) {
          navigate(`../${challenge._id}`);
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
        <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Invalid Invite Link
        </h2>
        <p className="text-slate-400 mb-6">
          {error || 'This invite link is not valid or has expired.'}
        </p>
        <Link
          to=".."
          className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          Go to Challenges
        </Link>
      </div>
    );
  }

  if (isAlreadyParticipant) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="text-emerald-400 text-5xl mb-4">✓</div>
        <h2 className="text-xl font-semibold text-white mb-2">
          You're Already In!
        </h2>
        <p className="text-slate-400 mb-6">
          You're already a participant in <strong className="text-white">{challenge.name}</strong>
        </p>
        <Link
          to={`../${challenge._id}`}
          className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          Go to Challenge
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-emerald-500 p-6 text-white text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-xl font-bold">You're Invited!</h2>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-2">
            {challenge.name}
          </h3>
          {challenge.description && (
            <p className="text-slate-400 mb-4">{challenge.description}</p>
          )}

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Workouts Required</span>
              <span className="font-medium text-white">
                {challenge.rules.minWorkoutsPerWeek}x per week
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Penalty</span>
              <span className="font-medium text-white">
                ${challenge.rules.penaltyAmount} per miss
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Duration</span>
              <span className="font-medium text-white">
                {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Participants</span>
              <span className="font-medium text-white">
                {challenge.participantCount} joined
              </span>
            </div>
          </div>

          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50"
          >
            {joining ? 'Joining...' : 'Join Challenge'}
          </button>

          <p className="text-center text-sm text-slate-500 mt-4">
            <Link to=".." className="text-emerald-400 hover:text-emerald-300">
              Go back to challenges
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
