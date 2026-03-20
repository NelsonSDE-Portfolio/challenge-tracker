import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ChallengeList } from './components/ChallengeList';
import { ChallengeDetail } from './components/ChallengeDetail';
import { CreateChallengeForm } from './components/CreateChallengeForm';
import { JoinChallengeForm } from './components/JoinChallengeForm';
import { JoinChallengePage } from './pages/JoinChallengePage';
import './App.css';

function ChallengeDashboard() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const navigate = useNavigate();

  const handleCreateSuccess = (challengeId: string) => {
    setShowCreate(false);
    navigate(`/challenges/${challengeId}`);
  };

  const handleJoinSuccess = (challengeId: string) => {
    setShowJoin(false);
    navigate(`/challenges/${challengeId}`);
  };

  if (showCreate) {
    return (
      <CreateChallengeForm
        onSuccess={handleCreateSuccess}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  if (showJoin) {
    return (
      <JoinChallengeForm
        onSuccess={handleJoinSuccess}
        onCancel={() => setShowJoin(false)}
      />
    );
  }

  return (
    <ChallengeList
      onCreateClick={() => setShowCreate(true)}
      onJoinClick={() => setShowJoin(true)}
    />
  );
}

function UnauthenticatedView() {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 text-5xl mb-4">🔒</div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        Please Log In
      </h2>
      <p className="text-gray-500">
        You need to be logged in to access Challenge Tracker
      </p>
    </div>
  );
}

function App() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="challenge-tracker">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <h1 className="text-3xl font-bold">Challenge Tracker</h1>
        <p className="mt-2 opacity-90">Track your accountability challenges</p>
        {isAuthenticated && user && (
          <p className="mt-1 text-sm opacity-75">
            Logged in as {user.name || user.email}
          </p>
        )}
      </header>

      <main>
        {isAuthenticated ? (
          <Routes>
            <Route path="/" element={<ChallengeDashboard />} />
            <Route path="/:id" element={<ChallengeDetail />} />
            <Route path="/join/:inviteCode" element={<JoinChallengePage />} />
          </Routes>
        ) : (
          <UnauthenticatedView />
        )}
      </main>
    </div>
  );
}

export default App;
