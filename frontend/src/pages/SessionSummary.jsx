import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { API_ENDPOINTS } from "../config/api";

function SessionSummary() {
  const { pitcherId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [pitcherId]);

  const fetchSummary = async () => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.PITCHES}/pitcher/${pitcherId}/summary`
      );
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No data available for this session.</p>
      </div>
    );
  }

  const totalPitches = Object.values(summary.pitch_distribution).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/log")}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Back to Logging
        </button>
        <h2 className="text-xl font-semibold">Session Summary</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Pitch Distribution</h3>
          <div className="space-y-4">
            {Object.entries(summary.pitch_distribution).map(([type, count]) => (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{type}</span>
                  <span className="text-gray-600">
                    {count} ({((count / totalPitches) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full"
                    style={{ width: `${(count / totalPitches) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium mb-4">Prediction Accuracy</h3>
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">
                {(summary.prediction_accuracy * 100).toFixed(1)}%
              </div>
              <p className="text-gray-600 mt-2">Prediction Accuracy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionSummary;
