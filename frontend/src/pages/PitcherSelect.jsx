import { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { API_ENDPOINTS } from "../config/api";

function PitcherSelect({ onSelect }) {
  const [pitchers, setPitchers] = useState([]);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    team: "",
    number: "",
    hand: "R",
    age: "",
  });

  useEffect(() => {
    fetchPitchers();
    fetchGames();
  }, []);

  const fetchPitchers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PITCHERS);
      if (!response.ok) throw new Error("Failed to fetch pitchers");
      const data = await response.json();
      setPitchers(data);
    } catch (error) {
      console.error("Error fetching pitchers:", error);
      setError("Failed to load pitchers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GAMES);
      if (!response.ok) throw new Error("Failed to fetch games");
      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error("Error fetching games:", error);
      setError("Failed to load games. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.PITCHERS, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create pitcher");
      }

      const newPitcher = await response.json();
      setPitchers([...pitchers, newPitcher]);
      setShowForm(false);
      setFormData({
        name: "",
        team: "",
        number: "",
        hand: "R",
        age: "",
      });
    } catch (error) {
      console.error("Error creating pitcher:", error);
      setError(error.message || "Failed to create pitcher. Please try again.");
    }
  };

  const handlePitcherSelect = (pitcher) => {
    if (!selectedGame) {
      setError("Please select a game first");
      return;
    }
    onSelect({ ...pitcher, game: selectedGame });
  };

  const formatHandedness = (handedness) => {
    if (!handedness) return "Unknown";
    return handedness.charAt(0).toUpperCase() + handedness.slice(1) + "-handed";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Select Game and Pitcher</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          New Pitcher
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
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Team
            </label>
            <input
              type="text"
              value={formData.team}
              onChange={(e) =>
                setFormData({ ...formData, team: e.target.value })
              }
              className="input mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number
            </label>
            <input
              type="number"
              value={formData.number}
              onChange={(e) =>
                setFormData({ ...formData, number: e.target.value })
              }
              className="input mt-1"
              min="0"
              max="99"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Throwing Hand
            </label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hand: "R" })}
                className={`flex-1 p-2 rounded ${
                  formData.hand === "R"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Right
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hand: "L" })}
                className={`flex-1 p-2 rounded ${
                  formData.hand === "L"
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Left
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              className="input mt-1"
              min="0"
              max="100"
              required
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
              Create Pitcher
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Select Game</h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : games.length === 0 ? (
            <p className="text-gray-600">
              No games available. Create a game first.
            </p>
          ) : (
            <div className="space-y-2">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedGame?.id === game.id
                      ? "bg-primary-50 border-primary-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium">
                    {game.home_team} vs {game.away_team}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(game.date).toLocaleDateString()}
                  </div>
                  {game.description && (
                    <div className="text-sm text-gray-600 mt-1">
                      {game.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-medium mb-4">Select Pitcher</h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : pitchers.length === 0 ? (
            <p className="text-gray-600">
              No pitchers found. Create one to get started!
            </p>
          ) : (
            <div className="space-y-2">
              {pitchers.map((pitcher) => (
                <button
                  key={pitcher.id}
                  onClick={() => handlePitcherSelect(pitcher)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{pitcher.name}</div>
                  <div className="text-sm text-gray-600">
                    {pitcher.team} • {formatHandedness(pitcher.hand)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PitcherSelect;
