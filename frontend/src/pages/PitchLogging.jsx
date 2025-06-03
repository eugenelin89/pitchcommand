import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// Match backend enums exactly
const PITCH_TYPES = {
  FB: 'FB',  // Fastball
  SL: 'SL',  // Slider
  CH: 'CH',  // Changeup
  CB: 'CB',  // Curveball
  CT: 'CT',  // Cutter
};

const PITCH_RESULTS = {
  SWINGING_STRIKE: 'swinging_strike',
  CALLED_STRIKE: 'called_strike',
  FOUL: 'foul',
  BALL: 'ball',
  IN_PLAY: 'in_play',
};

const PLAY_RESULTS = {
  GROUNDOUT: 'groundout',
  FLYOUT: 'flyout',
  SINGLE: 'single',
  DOUBLE: 'double',
  TRIPLE: 'triple',
  HOMERUN: 'homerun',
  ERROR: 'error',
  SACRIFICE: 'sacrifice',
};

const LOCATIONS = ['high_in', 'high_middle', 'high_away', 'middle_in', 'middle_middle', 'middle_away', 'low_in', 'low_middle', 'low_away'];

function PitchLogging({ pitcher, onPitcherChange }) {
  const navigate = useNavigate();
  const [count, setCount] = useState('0-0');
  const [pitchHistory, setPitchHistory] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    pitch_type: '',
    location: '',
    pitch_result: '',
    play_result: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Only fetch predictions if we have a valid pitch history
    if (pitchHistory.length > 0) {
      fetchPredictions();
    }
  }, [pitchHistory]); // Only depend on pitchHistory changes

  const fetchPredictions = async () => {
    try {
      // Only send valid pitch types from the history
      const validPitchHistory = pitchHistory
        .filter(pitch => Object.values(PITCH_TYPES).includes(pitch))
        .slice(-3);

      // Don't fetch predictions if we don't have any valid pitches
      if (validPitchHistory.length === 0) {
        setPredictions([]);
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pitcher_id: pitcher.id,
          last_n_pitches: validPitchHistory,
          count,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch predictions:', response.status, errorData);
        setPredictions([]);
        return;
      }
      
      const data = await response.json();
      setPredictions(data.predictions || []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setPredictions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Only include play_result if pitch_result is 'in_play'
      const requestBody = {
        pitcher_id: pitcher.id,
        count,
        pitch_type: formData.pitch_type,
        location: formData.location || null,
        pitch_result: formData.pitch_result,
        ...(formData.pitch_result === PITCH_RESULTS.IN_PLAY && formData.play_result
          ? { play_result: formData.play_result }
          : {}),
      };
      
      console.log('Sending request with data:', requestBody);
      
      const response = await fetch('http://localhost:8000/api/v1/pitches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Validation error details:', errorData);
        
        // Handle validation errors
        if (response.status === 422) {
          const validationErrors = errorData.detail;
          if (Array.isArray(validationErrors)) {
            // Format validation errors into a readable message
            const errorMessage = validationErrors
              .map(err => `${err.loc[err.loc.length - 1]}: ${err.msg}`)
              .join('\n');
            throw new Error(errorMessage);
          }
        }
        
        throw new Error(errorData.detail || 'Failed to log pitch');
      }
      
      const data = await response.json();
      
      // Only add valid pitch types to history
      if (Object.values(PITCH_TYPES).includes(formData.pitch_type)) {
        setPitchHistory(prev => [...prev, formData.pitch_type]);
      }
      
      setFormData({
        pitch_type: '',
        location: '',
        pitch_result: '',
        play_result: '',
      });
      
      // Update count
      const [balls, strikes] = count.split('-').map(Number);
      if (formData.pitch_result === PITCH_RESULTS.BALL) {
        setCount(`${balls + 1}-${strikes}`);
      } else if ([PITCH_RESULTS.SWINGING_STRIKE, PITCH_RESULTS.CALLED_STRIKE].includes(formData.pitch_result)) {
        // If this would result in a strikeout, reset to 0-0
        if (strikes + 1 >= 3) {
          setCount('0-0');
        } else {
          setCount(`${balls}-${strikes + 1}`);
        }
      } else if (formData.pitch_result === PITCH_RESULTS.FOUL) {
        // Foul ball only counts as a strike if there are less than 2 strikes
        if (strikes < 2) {
          setCount(`${balls}-${strikes + 1}`);
        }
        // If there are already 2 strikes, the count stays the same
      }
    } catch (error) {
      console.error('Error logging pitch:', error);
      setError(error.message || 'Failed to log pitch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">{pitcher.name}</h2>
          <p className="text-sm text-gray-600">{pitcher.team}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/summary/${pitcher.id}`)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <ChartBarIcon className="h-5 w-5" />
            Summary
          </button>
          <button
            onClick={() => onPitcherChange(null)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Switch Pitcher
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Log Pitch</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Count</label>
              <div className="mt-1 grid grid-cols-4 gap-1">
                {['0-0', '1-0', '2-0', '3-0', '0-1', '1-1', '2-1', '3-1', '0-2', '1-2', '2-2', '3-2'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCount(c)}
                    className={`px-2 py-1 text-sm rounded ${
                      count === c
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Pitch Type</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {Object.entries(PITCH_TYPES).map(([key, value]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, pitch_type: value })}
                    className={`p-2 rounded ${
                      formData.pitch_type === value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input mt-1"
              >
                <option value="">Select location</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Pitch Result</label>
              <select
                value={formData.pitch_result}
                onChange={(e) => setFormData({ ...formData, pitch_result: e.target.value })}
                className="input mt-1"
                required
              >
                <option value="">Select result</option>
                {Object.entries(PITCH_RESULTS).map(([key, value]) => (
                  <option key={value} value={value}>
                    {key.toLowerCase().replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {formData.pitch_result === PITCH_RESULTS.IN_PLAY && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Play Result</label>
                <select
                  value={formData.play_result}
                  onChange={(e) => setFormData({ ...formData, play_result: e.target.value })}
                  className="input mt-1"
                  required
                >
                  <option value="">Select result</option>
                  {Object.entries(PLAY_RESULTS).map(([key, value]) => (
                    <option key={value} value={value}>
                      {key.toLowerCase().replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={!formData.pitch_type || !formData.pitch_result || isSubmitting}
            >
              {isSubmitting ? 'Logging...' : 'Log Pitch'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium mb-4">Predictions</h3>
          <div className="space-y-4">
            {Array.isArray(predictions) && predictions.length > 0 ? (
              predictions.map((pred, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">{pred.pitch_type}</span>
                  <span className="text-sm text-gray-600">
                    {(pred.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">
                No predictions available
              </div>
            )}
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Pitches</h4>
            <div className="flex gap-2">
              {pitchHistory.slice(-5).map((pitch, index) => (
                <div
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {pitch}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PitchLogging; 