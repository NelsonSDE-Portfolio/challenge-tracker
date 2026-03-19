import './App.css'

function App() {
  return (
    <div className="challenge-tracker">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold">Challenge Tracker</h1>
        <p className="mt-2 opacity-90">Track your challenges and goals</p>
      </header>

      <main className="mt-6 p-6 bg-white rounded-lg shadow">
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            Challenge Tracker is loading...
          </p>
          <p className="text-gray-400 mt-2">
            This microfrontend is loaded via Module Federation
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
