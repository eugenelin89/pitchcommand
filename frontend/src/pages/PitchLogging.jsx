import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowPathIcon, ChartBarIcon, ArrowUpIcon, ArrowDownIcon, ChevronUpIcon, ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';

// Match backend enums exactly
const PITCH_TYPES = {
  FB: 'FB',  // Fastball
  CB: 'CB',  // Curveball
};

// Display names for pitch types
const PITCH_TYPE_DISPLAY = {
  FB: 'Fastball',
  CB: 'Curveball',
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

// Add display names for pitch results
const PITCH_RESULT_DISPLAY = {
  swinging_strike: 'Swinging Strike',
  called_strike: 'Called Strike',
  foul: 'Foul',
  ball: 'Ball',
  in_play: 'In Play'
};

// Add display names for play results
const PLAY_RESULT_DISPLAY = {
  groundout: 'Groundout',
  flyout: 'Flyout',
  single: 'Single',
  double: 'Double',
  triple: 'Triple',
  homerun: 'Homerun',
  error: 'Error',
  sacrifice: 'Sacrifice',
  strikeout: 'K'
};

function PitchLogging({ pitcher: initialPitcher, onPitcherChange }) {
  const navigate = useNavigate();
  const [count, setCount] = useState('0-0');
  const [outs, setOuts] = useState(0);
  const [pitchHistory, setPitchHistory] = useState([]);
  const [recentPitches, setRecentPitches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);
  const [currentInning, setCurrentInning] = useState({ inning_number: 1, half: 'top', id: null });
  const [loading, setLoading] = useState(false);
  const [pitcher, setPitcher] = useState(initialPitcher);
  const [showPitcherSelect, setShowPitcherSelect] = useState(false);
  const [availablePitchers, setAvailablePitchers] = useState([]);
  const [showCreatePitcher, setShowCreatePitcher] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [shouldInitializeGame, setShouldInitializeGame] = useState(true);
  const [newPitcher, setNewPitcher] = useState({
    name: '',
    team: '',
    number: '',
    hand: 'R',
    age: ''
  });
  const [formData, setFormData] = useState({
    pitch_type: '',
    location: '',
    pitch_result: '',
    play_result: '',
    hitter_handedness: 'R',
    notes: ''
  });
  const [lastPitchContext, setLastPitchContext] = useState({
    pitch_result: null,
    play_result: null,
    location: null,
    hitter_handedness: 'R',
  });

  useEffect(() => {
    if (pitcher?.game) {
      setCurrentGame(pitcher.game);
      if (shouldInitializeGame) {
        initializeGameState();
        setShouldInitializeGame(false);
      }
    }
  }, [pitcher]);

  useEffect(() => {
    // Only fetch predictions if we have a valid pitch history
    if (pitchHistory.length > 0) {
      fetchPredictions();
    }
  }, [pitchHistory]);

  const fetchPitchers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/pitchers');
      if (!response.ok) throw new Error('Failed to fetch pitchers');
      const data = await response.json();
      setAvailablePitchers(data);
    } catch (error) {
      console.error('Error fetching pitchers:', error);
      setError('Failed to load pitchers. Please try again.');
    }
  };

  const handleCreatePitcher = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/v1/pitchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPitcher,
          number: parseInt(newPitcher.number),
          age: parseInt(newPitcher.age)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create pitcher');
      }

      const createdPitcher = await response.json();
      setPitcher(createdPitcher);
      setShowCreatePitcher(false);
      setShowPitcherSelect(false);
      onPitcherChange(createdPitcher);
    } catch (error) {
      console.error('Error creating pitcher:', error);
      setError(error.message || 'Failed to create pitcher. Please try again.');
    }
  };

  const fetchPredictions = async () => {
    try {
      // Only send valid pitch types from the history
      const validPitchHistory = pitchHistory
        .filter(pitch => Object.values(PITCH_TYPES).includes(pitch))
        .slice(-3);  // Send last 3 pitches

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
          game_id: pitcher.game.id,
          inning_id: currentInning.id,
          last_n_pitches: validPitchHistory,
          count,
          last_pitch_result: lastPitchContext.pitch_result,
          last_play_result: lastPitchContext.play_result,
          last_location: lastPitchContext.location,
          hitter_handedness: lastPitchContext.hitter_handedness
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

  const fetchRecentPitches = async () => {
    try {
      console.log('Fetching recent pitches for pitcher:', pitcher.id);
      const response = await fetch(`http://localhost:8000/api/v1/pitches/pitcher/${pitcher.id}?limit=10`);
      if (!response.ok) throw new Error('Failed to fetch recent pitches');
      const data = await response.json();
      console.log('Received pitches:', data);
      
      // Fetch inning details for each pitch
      const pitchesWithInnings = await Promise.all(
        data.map(async (pitch) => {
          try {
            const inningResponse = await fetch(`http://localhost:8000/api/v1/innings/${pitch.inning_id}`);
            if (!inningResponse.ok) throw new Error('Failed to fetch inning details');
            const inning = await inningResponse.json();
            return { ...pitch, inning };
          } catch (error) {
            console.error('Error fetching inning details:', error);
            return pitch;
          }
        })
      );
      
      // Sort pitches by sequence number in descending order
      const sortedPitches = pitchesWithInnings.sort((a, b) => b.sequence_number - a.sequence_number);
      console.log('Sorted pitches with innings:', sortedPitches);
      setRecentPitches(sortedPitches);
    } catch (error) {
      console.error('Error fetching recent pitches:', error);
      setError('Failed to load recent pitches. Please try again.');
    }
  };

  const fetchCurrentInning = async () => {
    try {
      // First try to get the existing inning
      const response = await fetch(`http://localhost:8000/api/v1/innings/game/${pitcher.game.id}`);
      if (!response.ok) throw new Error('Failed to fetch innings');
      const innings = await response.json();
      
      // Find the current inning or create it if it doesn't exist
      const existingInning = innings.find(i => 
        i.inning_number === currentInning.inning_number && 
        i.half === currentInning.half
      );
      
      if (existingInning) {
        setCurrentInning(prev => ({ ...prev, id: existingInning.id }));
      } else {
        // Create the inning
        const createResponse = await fetch('http://localhost:8000/api/v1/innings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            game_id: pitcher.game.id,
            inning_number: currentInning.inning_number,
            half: currentInning.half
          }),
        });
        
        if (!createResponse.ok) throw new Error('Failed to create inning');
        const newInning = await createResponse.json();
        setCurrentInning(prev => ({ ...prev, id: newInning.id }));
      }
    } catch (error) {
      console.error('Error handling inning:', error);
      setError('Failed to handle inning. Please try again.');
    }
  };

  const nextInning = async () => {
    console.log('Advancing to next inning...');
    let newInning;
    
    if (currentInning.half === 'top') {
      // If we're in top, go to bottom of same inning
      newInning = {
        ...currentInning,
        half: 'bottom'
      };
    } else {
      // If we're in bottom, go to top of next inning
      newInning = {
        inning_number: currentInning.inning_number + 1,
        half: 'top',
        id: null
      };
    }
    
    setCurrentInning(newInning);
    await fetchCurrentInning();
    console.log('Successfully advanced to next inning:', newInning);
  };

  const prevInning = async () => {
    console.log('Going back an inning...');
    let newInning;
    
    if (currentInning.half === 'bottom') {
      // If we're in bottom, go to top of same inning
      newInning = {
        ...currentInning,
        half: 'top'
      };
    } else if (currentInning.inning_number > 1) {
      // If we're in top and not in inning 1, go to bottom of previous inning
      newInning = {
        inning_number: currentInning.inning_number - 1,
        half: 'bottom',
        id: null
      };
    } else {
      // If we're in top of inning 1, stay there
      return;
    }
    
    if (newInning !== currentInning) {
      setCurrentInning(newInning);
      await fetchCurrentInning();
      console.log('Successfully went back to inning:', newInning);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentInning.id) {
      setError('No inning available');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get the last pitch for this pitcher in this game to determine sequence number
      const lastPitchResponse = await fetch(`http://localhost:8000/api/v1/pitches/pitcher/${pitcher.id}?limit=1`);
      if (!lastPitchResponse.ok) throw new Error('Failed to fetch last pitch');
      const lastPitches = await lastPitchResponse.json();
      const sequenceNumber = lastPitches.length > 0 ? lastPitches[0].sequence_number + 1 : 1;

      const requestBody = {
        pitcher_id: pitcher.id,
        game_id: pitcher.game.id,
        inning_id: currentInning.id,
        sequence_number: sequenceNumber,  // Add sequence number
        count,
        outs,
        pitch_type: formData.pitch_type,
        location: formData.location || null,
        pitch_result: formData.pitch_result,
        hitter_handedness: formData.hitter_handedness,
        ...(formData.pitch_result === PITCH_RESULTS.IN_PLAY && formData.play_result
          ? { play_result: formData.play_result }
          : {}),
        notes: formData.notes
      };
      
      console.log('Logging pitch:', requestBody);
      const response = await fetch('http://localhost:8000/api/v1/pitches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to log pitch');
      }
      
      const loggedPitch = await response.json();
      console.log('Pitch logged successfully:', loggedPitch);
      
      // Store the last pitch's context before clearing the form
      const newLastPitchContext = {
        pitch_result: formData.pitch_result,
        play_result: formData.pitch_result === PITCH_RESULTS.IN_PLAY ? formData.play_result : null,
        location: formData.location,
        hitter_handedness: formData.hitter_handedness,
      };
      setLastPitchContext(newLastPitchContext);
      
      // Update pitch history with the new pitch
      const newPitchHistory = [...pitchHistory, formData.pitch_type].slice(-5);
      setPitchHistory(newPitchHistory);
      
      // Update outs based on pitch result
      let newOuts = outs;
      let shouldIncrementOuts = false;

      // Check for strikeout - either current count is 0-2 or will become 0-2 after this strike
      if (formData.pitch_result === PITCH_RESULTS.SWINGING_STRIKE) {
        const [balls, strikes] = count.split('-').map(Number);
        if (strikes === 2 || (strikes + 1 >= 3)) {
          shouldIncrementOuts = true;
          console.log('Strikeout detected - will increment outs');
        }
      } 
      // Check for out in play
      else if (formData.pitch_result === PITCH_RESULTS.IN_PLAY && 
        [PLAY_RESULTS.GROUNDOUT, PLAY_RESULTS.FLYOUT, PLAY_RESULTS.SACRIFICE].includes(formData.play_result)) {
        shouldIncrementOuts = true;
        console.log('Out in play detected - will increment outs');
      }

      if (shouldIncrementOuts) {
        newOuts = outs + 1;
        console.log(`Incrementing outs from ${outs} to ${newOuts}`);
        
        // If this was the third out, advance inning
        if (newOuts === 3) {
          console.log('Third out reached - advancing inning');
          if (currentInning.half === 'bottom') {
            // If in bottom, go to top of next inning
            const nextInning = {
              inning_number: currentInning.inning_number + 1,
              half: 'top',
              id: null
            };
            console.log('Advancing to top of next inning:', nextInning);
            setCurrentInning(nextInning);
            await fetchCurrentInning();
            newOuts = 0; // Reset outs after advancing inning
          } else {
            // If in top, go to bottom of same inning
            const nextInning = {
              ...currentInning,
              half: 'bottom',
              id: null
            };
            console.log('Advancing to bottom of same inning:', nextInning);
            setCurrentInning(nextInning);
            await fetchCurrentInning();
            newOuts = 0; // Reset outs after advancing inning
          }
        }
        
        setOuts(newOuts);
      }
      
      // Update count based on pitch result
      const [balls, strikes] = count.split('-').map(Number);
      let newCount = count;
      
      if (formData.pitch_result === PITCH_RESULTS.IN_PLAY) {
        // Reset count for any play result
        newCount = '0-0';
      } else if (formData.pitch_result === PITCH_RESULTS.BALL) {
        // Ball
        if (balls + 1 >= 4) {
          newCount = '0-0'; // Walk
        } else {
          newCount = `${balls + 1}-${strikes}`;
        }
      } else if ([PITCH_RESULTS.SWINGING_STRIKE, PITCH_RESULTS.CALLED_STRIKE].includes(formData.pitch_result)) {
        // Strike
        if (strikes + 1 >= 3) {
          newCount = '0-0'; // Strikeout
        } else {
          newCount = `${balls}-${strikes + 1}`;
        }
      } else if (formData.pitch_result === PITCH_RESULTS.FOUL) {
        // Foul ball only counts as a strike if there are less than 2 strikes
        if (strikes < 2) {
          newCount = `${balls}-${strikes + 1}`;
        }
      }
      
      setCount(newCount);
      
      // Clear form data
      setFormData({
        pitch_type: '',
        location: '',
        pitch_result: '',
        play_result: '',
        hitter_handedness: formData.hitter_handedness,
        notes: ''
      });

      // Immediately fetch updated recent pitches
      console.log('Fetching updated recent pitches...');
      await fetchRecentPitches();
      
      // Then fetch predictions with the updated context
      console.log('Fetching predictions...');
      await fetchPredictions();
      
    } catch (error) {
      console.error('Error logging pitch:', error);
      setError(error.message || 'Failed to log pitch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to fetch recent pitches when pitcher changes
  useEffect(() => {
    if (pitcher?.id) {
      console.log('Pitcher changed, fetching recent pitches...');
      fetchRecentPitches();
    }
  }, [pitcher?.id]);

  // Add useEffect to fetch recent pitches when currentInning changes
  useEffect(() => {
    if (pitcher?.id && currentInning?.inning_number) {
      console.log('Inning changed, fetching recent pitches...');
      fetchRecentPitches();
    }
  }, [currentInning?.inning_number]);

  const renderStrikeZone = () => {
    const rows = ['high', 'middle', 'low'];
    const cols = ['in', 'middle', 'away'];
    
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, hitter_handedness: 'R' })}
            className={`px-3 py-2 rounded ${
              formData.hitter_handedness === 'R'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Righty
          </button>
          
          <div className="w-48 aspect-[4/3] border-2 border-gray-400 rounded-lg overflow-hidden">
            <div className="grid grid-rows-3 grid-cols-3 h-full">
              {rows.map((row) =>
                cols.map((col) => {
                  const location = `${row}_${col}`;
                  const isSelected = formData.location === location;
                  return (
                    <button
                      key={location}
                      type="button"
                      onClick={() => setFormData({ ...formData, location })}
                      className={`
                        border border-gray-300 transition-colors
                        ${isSelected ? 'bg-primary-600 text-white' : 'bg-white hover:bg-gray-50'}
                        ${row === 'high' ? 'border-t-0' : ''}
                        ${row === 'low' ? 'border-b-0' : ''}
                        ${col === 'in' ? 'border-l-0' : ''}
                        ${col === 'away' ? 'border-r-0' : ''}
                      `}
                      title={location.replace('_', ' ')}
                    />
                  );
                })
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, hitter_handedness: 'L' })}
            className={`px-3 py-2 rounded ${
              formData.hitter_handedness === 'L'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lefty
          </button>
        </div>
      </div>
    );
  };

  const renderPredictionStrikeZone = (location) => {
    const rows = ['high', 'middle', 'low'];
    const cols = ['in', 'middle', 'away'];
    
    return (
      <div className="w-32 aspect-[4/3] border-2 border-gray-400 rounded-lg overflow-hidden">
        <div className="grid grid-rows-3 grid-cols-3 h-full">
          {rows.map((row) =>
            cols.map((col) => {
              const zoneLocation = `${row}_${col}`;
              const isSelected = location === zoneLocation;
              return (
                <div
                  key={zoneLocation}
                  className={`
                    border border-gray-300 transition-colors
                    ${isSelected ? 'bg-primary-600' : 'bg-white'}
                    ${row === 'high' ? 'border-t-0' : ''}
                    ${row === 'low' ? 'border-b-0' : ''}
                    ${col === 'in' ? 'border-l-0' : ''}
                    ${col === 'away' ? 'border-r-0' : ''}
                  `}
                  title={zoneLocation.replace('_', ' ')}
                />
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderSmallStrikeZone = (location) => {
    const rows = ['high', 'middle', 'low'];
    const cols = ['in', 'middle', 'away'];
    
    return (
      <div className="w-16 aspect-[4/3] border border-gray-300 rounded overflow-hidden">
        <div className="grid grid-rows-3 grid-cols-3 h-full">
          {rows.map((row) =>
            cols.map((col) => {
              const zoneLocation = `${row}_${col}`;
              const isSelected = location === zoneLocation;
              return (
                <div
                  key={zoneLocation}
                  className={`
                    border border-gray-200 transition-colors
                    ${isSelected ? 'bg-primary-600' : 'bg-white'}
                    ${row === 'high' ? 'border-t-0' : ''}
                    ${row === 'low' ? 'border-b-0' : ''}
                    ${col === 'in' ? 'border-l-0' : ''}
                    ${col === 'away' ? 'border-r-0' : ''}
                  `}
                  title={zoneLocation.replace('_', ' ')}
                />
              );
            })
          )}
        </div>
      </div>
    );
  };

  const initializeGameState = async () => {
    try {
      console.log('Initializing game state...');
      // Fetch the last pitch for this game
      const response = await fetch(`http://localhost:8000/api/v1/pitches/pitcher/${pitcher.id}?limit=1`);
      if (!response.ok) throw new Error('Failed to fetch last pitch');
      const pitches = await response.json();
      
      if (pitches.length > 0) {
        const lastPitch = pitches[0];
        console.log('Last pitch found:', lastPitch);
        
        // Get the inning details
        const inningResponse = await fetch(`http://localhost:8000/api/v1/innings/${lastPitch.inning_id}`);
        if (!inningResponse.ok) throw new Error('Failed to fetch inning details');
        const inning = await inningResponse.json();
        
        // Set the current inning
        setCurrentInning({
          inning_number: inning.inning_number,
          half: inning.half,
          id: inning.id
        });
        
        // Set the count from the last pitch
        setCount(lastPitch.count);
        
        // Set the outs
        let newOuts = parseInt(lastPitch.outs) || 0;
        console.log('Initial outs from last pitch:', newOuts);
        
        // Check if the last pitch was an out
        const wasOut = 
          (lastPitch.pitch_result === PITCH_RESULTS.SWINGING_STRIKE && lastPitch.count.split('-')[1] === '2') ||
          (lastPitch.pitch_result === PITCH_RESULTS.IN_PLAY && 
           [PLAY_RESULTS.GROUNDOUT, PLAY_RESULTS.FLYOUT, PLAY_RESULTS.SACRIFICE].includes(lastPitch.play_result));
        
        if (wasOut) {
          newOuts = (newOuts + 1) % 3;
          console.log('Last pitch was an out, incrementing outs to:', newOuts);
          
          // If this was the third out, advance the inning
          if (newOuts === 0) {
            console.log('Last pitch was the third out, advancing inning...');
            const nextInningHalf = inning.half === 'top' ? 'bottom' : 'top';
            const nextInningNumber = inning.half === 'bottom' ? inning.inning_number + 1 : inning.inning_number;
            
            // Create or get the next inning
            const nextInningResponse = await fetch('http://localhost:8000/api/v1/innings', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                game_id: pitcher.game.id,
                inning_number: nextInningNumber,
                half: nextInningHalf
              }),
            });
            
            if (!nextInningResponse.ok) throw new Error('Failed to create next inning');
            const nextInning = await nextInningResponse.json();
            
            setCurrentInning({
              inning_number: nextInning.inning_number,
              half: nextInning.half,
              id: nextInning.id
            });
          }
        }
        
        console.log('Setting final outs value:', newOuts);
        setOuts(newOuts);
        
        // Set the pitch history
        const historyResponse = await fetch(`http://localhost:8000/api/v1/pitches/pitcher/${pitcher.id}?limit=5`);
        if (!historyResponse.ok) throw new Error('Failed to fetch pitch history');
        const history = await historyResponse.json();
        setPitchHistory(history.map(p => p.pitch_type));
        
        // Set the last pitch context
        setLastPitchContext({
          pitch_result: lastPitch.pitch_result,
          play_result: lastPitch.play_result,
          location: lastPitch.location,
          hitter_handedness: lastPitch.hitter_handedness
        });
      } else {
        // No pitches yet, start with inning 1 top and 0 outs
        console.log('No pitches found, starting with 0 outs');
        setOuts(0);
        setCount('0-0');
        await fetchCurrentInning();
      }
      
      // Fetch recent pitches
      await fetchRecentPitches();
      
    } catch (error) {
      console.error('Error initializing game state:', error);
      setError('Failed to initialize game state. Please try again.');
    }
  };

  const handlePitcherSelect = async (selectedPitcher) => {
    try {
      // If we have a current game, create a new pitcher object with the game data
      if (currentGame) {
        const updatedPitcher = {
          ...selectedPitcher,
          game: currentGame
        };
        setPitcher(updatedPitcher);
        setShowPitcherSelect(false);
        onPitcherChange(updatedPitcher);
        // Don't reset count, outs, or inning when changing pitchers during a game
      } else {
        // If no current game, just set the pitcher and reset game state
        setPitcher(selectedPitcher);
        setShowPitcherSelect(false);
        onPitcherChange(selectedPitcher);
        // Reset game state only when starting a new game
        setCount('0-0');
        setOuts(0);
        setCurrentInning({ inning_number: 1, half: 'top', id: null });
        setShouldInitializeGame(true);  // Allow initialization for new game
      }
    } catch (error) {
      console.error('Error selecting pitcher:', error);
      setError('Failed to select pitcher. Please try again.');
    }
  };

  if (!pitcher) {
    return (
      <div className="text-center py-12">
        <button
          onClick={() => {
            setShowPitcherSelect(true);
            fetchPitchers();
          }}
          className="btn btn-primary"
        >
          Select Pitcher
        </button>
      </div>
    );
  }

  // Only show the no game message if we don't have a current game
  if (!pitcher.game && !currentGame) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">No game data available. Please start a new game.</div>
        <button
          onClick={() => {
            setShowPitcherSelect(true);
            fetchPitchers();
          }}
          className="btn btn-primary"
        >
          Select Different Pitcher
        </button>
      </div>
    );
  }

  // Use currentGame if pitcher.game is not available
  const gameData = pitcher.game || currentGame;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">
              {gameData.home_team} vs {gameData.away_team}
            </h2>
            <p className="text-sm text-gray-600">
              {new Date(gameData.date).toLocaleDateString()}
            </p>
            {gameData.description && (
              <p className="text-sm text-gray-600 mt-1">
                {gameData.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm font-medium text-primary-600">
                {pitcher.name} • {pitcher.team}
              </p>
              <button
                onClick={() => {
                  setShowPitcherSelect(true);
                  fetchPitchers();
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Change
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOuts(prev => (prev - 1 + 3) % 3)}
                className="btn btn-secondary text-sm"
                title="Decrease Outs"
              >
                <ChevronDownIcon className="h-5 w-5" />
              </button>
              <div className="text-center">
                <div className="text-sm font-medium">Outs</div>
                <div className="text-lg font-bold">{outs}</div>
              </div>
              <button
                onClick={() => setOuts(prev => (prev + 1) % 3)}
                className="btn btn-secondary text-sm"
                title="Increase Outs"
              >
                <ChevronUpIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevInning}
                className="btn btn-secondary text-sm"
                title="Previous Inning"
              >
                <ChevronDownIcon className="h-5 w-5" />
              </button>
              <div className="text-center">
                <div className="text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <span>{currentInning.inning_number}</span>
                    {currentInning.half === 'top' ? (
                      <ArrowUpIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={nextInning}
                className="btn btn-secondary text-sm"
                title="Next Inning"
              >
                <ChevronUpIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Pitcher Selection Modal */}
      {showPitcherSelect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Select Pitcher</h3>
            <div className="space-y-4">
              {availablePitchers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePitcherSelect(p)}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-600">{p.team} • #{p.number}</div>
                </button>
              ))}
              <button
                onClick={() => {
                  setShowCreatePitcher(true);
                  setShowPitcherSelect(false);
                }}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5 text-gray-400" />
                <span>Create New Pitcher</span>
              </button>
            </div>
            <button
              onClick={() => setShowPitcherSelect(false)}
              className="mt-4 w-full btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Create Pitcher Modal */}
      {showCreatePitcher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Create New Pitcher</h3>
            <form onSubmit={handleCreatePitcher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newPitcher.name}
                  onChange={(e) => setNewPitcher({ ...newPitcher, name: e.target.value })}
                  className="input mt-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Team</label>
                <input
                  type="text"
                  value={newPitcher.team}
                  onChange={(e) => setNewPitcher({ ...newPitcher, team: e.target.value })}
                  className="input mt-1 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Number</label>
                <input
                  type="number"
                  value={newPitcher.number}
                  onChange={(e) => setNewPitcher({ ...newPitcher, number: e.target.value })}
                  className="input mt-1 w-full"
                  min="0"
                  max="99"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Throwing Hand</label>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPitcher({ ...newPitcher, hand: 'R' })}
                    className={`flex-1 p-2 rounded ${
                      newPitcher.hand === 'R'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Right
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPitcher({ ...newPitcher, hand: 'L' })}
                    className={`flex-1 p-2 rounded ${
                      newPitcher.hand === 'L'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Left
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  value={newPitcher.age}
                  onChange={(e) => setNewPitcher({ ...newPitcher, age: e.target.value })}
                  className="input mt-1 w-full"
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 btn btn-primary"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePitcher(false);
                    setShowPitcherSelect(true);
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
                    {PITCH_TYPE_DISPLAY[key]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              {renderStrikeZone()}
              <div className="mt-2 text-sm text-gray-500 text-center w-48 mx-auto">
                {formData.location ? formData.location.replace('_', ' ') : 'Select a location (Catcher\'s View)'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Pitch Result</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {Object.entries(PITCH_RESULTS).map(([key, value]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, pitch_result: value })}
                    className={`p-2 rounded ${
                      formData.pitch_result === value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {key.toLowerCase().replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {formData.pitch_result === PITCH_RESULTS.IN_PLAY && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Play Result</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {Object.entries(PLAY_RESULTS).map(([key, value]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData({ ...formData, play_result: value })}
                      className={`p-2 rounded ${
                        formData.play_result === value
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {key.toLowerCase().replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input mt-1"
                rows={3}
                placeholder="Optional notes about the pitch..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={!formData.pitch_type || !formData.pitch_result || loading}
            >
              {loading ? 'Logging...' : 'Log Pitch'}
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
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{PITCH_TYPE_DISPLAY[pred.pitch_type] || pred.pitch_type}</span>
                    <span className="text-sm text-gray-600">
                      {(pred.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  {pred.location && (
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-1">Predicted Location</div>
                        {renderPredictionStrikeZone(pred.location)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Confidence: {(pred.location_confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
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
            <div className="overflow-y-auto max-h-[400px] border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inning
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pitch Type
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pitch Result
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Play Result
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPitches.map((pitch) => (
                    <tr key={pitch.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {pitch.sequence_number}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {pitch.inning ? (
                          <div className="flex items-center gap-1">
                            <span>{pitch.inning.inning_number}</span>
                            {pitch.inning.half === 'top' ? (
                              <ArrowUpIcon className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {PITCH_TYPE_DISPLAY[pitch.pitch_type] || pitch.pitch_type}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {pitch.location ? (
                          <div className="flex items-center gap-2">
                            {renderSmallStrikeZone(pitch.location)}
                            <span className="text-xs text-gray-400">
                              {pitch.location.replace('_', ' ')}
                            </span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          pitch.pitch_result === 'swinging_strike' || pitch.pitch_result === 'called_strike'
                            ? 'bg-green-100 text-green-800'
                            : pitch.pitch_result === 'ball'
                            ? 'bg-blue-100 text-blue-800'
                            : pitch.pitch_result === 'foul'
                            ? 'bg-yellow-100 text-yellow-800'
                            : pitch.pitch_result === 'in_play'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {PITCH_RESULT_DISPLAY[pitch.pitch_result] || pitch.pitch_result}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {pitch.pitch_result === 'in_play' && pitch.play_result ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            pitch.play_result === 'homerun'
                              ? 'bg-red-100 text-red-800'
                              : pitch.play_result === 'triple'
                              ? 'bg-orange-100 text-orange-800'
                              : pitch.play_result === 'double'
                              ? 'bg-yellow-100 text-yellow-800'
                              : pitch.play_result === 'single'
                              ? 'bg-green-100 text-green-800'
                              : pitch.play_result === 'error'
                              ? 'bg-red-100 text-red-800'
                              : pitch.play_result === 'sacrifice'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {PLAY_RESULT_DISPLAY[pitch.play_result] || pitch.play_result}
                          </span>
                        ) : (pitch.pitch_result === 'swinging_strike' || pitch.pitch_result === 'called_strike') && pitch.count === '0-2' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            K
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PitchLogging; 