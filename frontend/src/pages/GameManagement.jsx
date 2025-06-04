import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

function GameManagement() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [gameInnings, setGameInnings] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    home_team: '',
    away_team: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8000/api/v1/games/');
      if (!response.ok) throw new Error('Failed to fetch games');
      const data = await response.json();
      setGames(data);
      
      // Fetch innings for each game
      const inningsData = {};
      for (const game of data) {
        const inningsResponse = await fetch(`http://localhost:8000/api/v1/games/${game.id}/innings`);
        if (inningsResponse.ok) {
          const innings = await inningsResponse.json();
          inningsData[game.id] = innings;
        }
      }
      setGameInnings(inningsData);
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('Failed to load games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await fetch('http://localhost:8000/api/v1/games/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString()
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create game');
      }
      
      const newGame = await response.json();
      setGames([...games, newGame]);
      setShowForm(false);
      setFormData({
        home_team: '',
        away_team: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      
      // Fetch innings for the new game
      const inningsResponse = await fetch(`http://localhost:8000/api/v1/games/${newGame.id}/innings`);
      if (inningsResponse.ok) {
        const innings = await inningsResponse.json();
        setGameInnings(prev => ({ ...prev, [newGame.id]: innings }));
      }
    } catch (error) {
      console.error('Error creating game:', error);
      setError(error.message || 'Failed to create game. Please try again.');
    }
  };

  const nextInning = async (gameId) => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:8000/api/v1/games/${gameId}/next-inning`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to advance inning');
      }
      
      // Refresh innings for this game
      const inningsResponse = await fetch(`http://localhost:8000/api/v1/games/${gameId}/innings`);
      if (inningsResponse.ok) {
        const innings = await inningsResponse.json();
        setGameInnings(prev => ({ ...prev, [gameId]: innings }));
      }
    } catch (error) {
      console.error('Error advancing inning:', error);
      setError(error.message || 'Failed to advance inning. Please try again.');
    }
  };

  const prevInning = async (gameId) => {
    try {
      setError(null);
      const response = await fetch(`http://localhost:8000/api/v1/games/${gameId}/prev-inning`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to go back an inning');
      }
      
      // Refresh innings for this game
      const inningsResponse = await fetch(`http://localhost:8000/api/v1/games/${gameId}/innings`);
      if (inningsResponse.ok) {
        const innings = await inningsResponse.json();
        setGameInnings(prev => ({ ...prev, [gameId]: innings }));
      }
    } catch (error) {
      console.error('Error going back an inning:', error);
      setError(error.message || 'Failed to go back an inning. Please try again.');
    }
  };

  const getCurrentInning = (gameId) => {
    const innings = gameInnings[gameId] || [];
    if (innings.length === 0) return null;
    return innings[innings.length - 1];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Games</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          New Game
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Home Team</label>
            <input
              type="text"
              value={formData.home_team}
              onChange={(e) => setFormData({ ...formData, home_team: e.target.value })}
              className="input mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Away Team</label>
            <input
              type="text"
              value={formData.away_team}
              onChange={(e) => setFormData({ ...formData, away_team: e.target.value })}
              className="input mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input mt-1"
              rows={3}
              placeholder="Optional game description..."
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Game
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No games found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {games.map((game) => {
            const currentInning = getCurrentInning(game.id);
            return (
              <div key={game.id} className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      {game.home_team} vs {game.away_team}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(game.date).toLocaleDateString()}
                    </p>
                    {game.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {game.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => prevInning(game.id)}
                      className="btn btn-secondary text-sm"
                      title="Previous Inning"
                    >
                      <ChevronDownIcon className="h-5 w-5" />
                    </button>
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {currentInning ? `${currentInning.half === 'top' ? 'Top' : 'Bottom'} ${currentInning.inning_number}` : 'No Innings'}
                      </div>
                    </div>
                    <button
                      onClick={() => nextInning(game.id)}
                      className="btn btn-secondary text-sm"
                      title="Next Inning"
                    >
                      <ChevronUpIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GameManagement; 