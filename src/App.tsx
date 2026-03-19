import { useAuth } from './hooks/useAuth';
import './App.css';

function App() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="challenge-tracker">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold">Challenge Tracker</h1>
        <p className="mt-2 opacity-90">Track your challenges and goals</p>
        {isAuthenticated && user && (
          <p className="mt-1 text-sm opacity-75">
            Logged in as {user.name || user.email}
          </p>
        )}
      </header>

      <main className="mt-6 p-6 bg-white rounded-lg shadow">
        {isAuthenticated ? (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Welcome, {user?.name || user?.email}!
              </h2>
              <p className="text-gray-600">
                Your challenges will appear here once you create or join one.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Create Challenge
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Start a new accountability challenge with friends
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Create New Challenge
                </button>
              </div>

              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Join Challenge
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Have an invite code? Join an existing challenge
                </p>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                  Join with Code
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Please log in to access Challenge Tracker
            </p>
            <p className="text-gray-400 mt-2">
              This microfrontend requires authentication
            </p>
          </div>
        )}
      </main>

      <footer className="mt-6 text-center text-sm text-gray-500">
        <p>Challenge Tracker - A Module Federation remote app</p>
      </footer>
    </div>
  );
}

export default App;
