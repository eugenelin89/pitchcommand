export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  PITCHERS: `${API_BASE_URL}/api/v1/pitchers`,
  GAMES: `${API_BASE_URL}/api/v1/games`,
  PITCHES: `${API_BASE_URL}/api/v1/pitches`,
  PREDICT: `${API_BASE_URL}/api/v1/predict`,
  INNINGS: `${API_BASE_URL}/api/v1/innings`,
  GAME_STATE: `${API_BASE_URL}/api/v1/game-state`,
};
