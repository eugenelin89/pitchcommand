import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PitcherSelect from './pages/PitcherSelect';
import PitchLogging from './pages/PitchLogging';
import SessionSummary from './pages/SessionSummary';

function App() {
  const [selectedPitcher, setSelectedPitcher] = useState(null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">PitchCommand</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route 
              path="/" 
              element={
                selectedPitcher ? (
                  <Navigate to="/log" replace />
                ) : (
                  <PitcherSelect onSelect={setSelectedPitcher} />
                )
              } 
            />
            <Route 
              path="/log" 
              element={
                selectedPitcher ? (
                  <PitchLogging 
                    pitcher={selectedPitcher} 
                    onPitcherChange={setSelectedPitcher} 
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/summary/:pitcherId" 
              element={<SessionSummary />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 