import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

function PitcherSelect({ onSelect }) {
  const [pitchers, setPitchers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    number: '',
    age: '',
    hand: 'R'
  });

  useEffect(() => {
    fetchPitchers();
  }, []);

  const fetchPitchers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8000/api/v1/pitchers/', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch pitchers');
      const data = await response.json();
      setPitchers(data);
    } catch (error) {
      console.error('Error fetching pitchers:', error);
      setError('Failed to load pitchers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await fetch('http://localhost:8000/api/v1/pitchers/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          number: parseInt(formData.number),
          age: parseInt(formData.age)
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create pitcher');
      }
      
      const newPitcher = await response.json();
      setPitchers([...pitchers, newPitcher]);
      setShowForm(false);
      setFormData({
        name: '',
        team: '',
        number: '',
        age: '',
        hand: 'R'
      });
    } catch (error) {
      console.error('Error creating pitcher:', error);
      setError(error.message || 'Failed to create pitcher. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Select Pitcher</h2>
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
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Team</label>
            <input
              type="text"
              value={formData.team}
              onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              className="input mt-1"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Number</label>
              <input
                type="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="input mt-1"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="input mt-1"
                required
                min="0"
                max="100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Throwing Hand</label>
            <select
              value={formData.hand}
              onChange={(e) => setFormData({ ...formData, hand: e.target.value })}
              className="input mt-1"
            >
              <option value="R">Right</option>
              <option value="L">Left</option>
            </select>
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
              Create
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : pitchers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No pitchers found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pitchers.map((pitcher) => (
            <button
              key={pitcher.id}
              onClick={() => onSelect(pitcher)}
              className="card hover:shadow-lg transition-shadow duration-200 text-left"
            >
              <h3 className="font-semibold">{pitcher.name}</h3>
              <p className="text-sm text-gray-600">{pitcher.team}</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <span>#{pitcher.number}</span>
                <span>•</span>
                <span>{pitcher.hand === 'R' ? 'Right' : 'Left'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PitcherSelect; 