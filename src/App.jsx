import React, { useState, useEffect, useCallback } from 'react';

// Import your page components
import WorkoutFormPage from './pages/WorkoutFormPage.jsx';
import WorkoutListPage from './pages/WorkoutListPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

// ✅ Use the correct env variable
const API_BASE_URL = import.meta.env.VITE_API_URL;

const App = () => {
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [currentPage, setCurrentPage] = useState('list');
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [workoutError, setWorkoutError] = useState('');

  // Fetch workouts
  const fetchWorkouts = useCallback(async () => {
    if (!authToken || !userId) {
      setWorkouts([]);
      return;
    }

    setIsLoadingWorkouts(true);
    setWorkoutError('');

    try {
      const response = await fetch(`${API_BASE_URL}/workouts/getMyWorkouts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const text = await response.text();
      console.log("👉 Raw Workouts Response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("❌ Could not parse response as JSON", err);
        setWorkoutError('Invalid response from server.');
        setWorkouts([]);
        return;
      }

      if (response.ok) {
        const workoutsArray = Array.isArray(data) ? data : [];
        console.log("✅ Parsed Workouts Array:", workoutsArray);

        const sortedWorkouts = workoutsArray.sort((a, b) => {
          const dateA = new Date(a.dateAdded || 0);
          const dateB = new Date(b.dateAdded || 0);
          return dateB - dateA; // Sort descending
        });

        setWorkouts(sortedWorkouts);
      } else {
        setWorkoutError(data.message || `Failed to fetch workouts: ${response.statusText}`);
        setWorkouts([]);
      }
    } catch (err) {
      console.error("❌ Error fetching workouts:", err);
      setWorkoutError('Network error or API is unreachable for workouts.');
    } finally {
      setIsLoadingWorkouts(false);
    }
  }, [authToken, userId]);

  // Refetch workouts when auth changes
  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  // Handle login/register success
  const handleAuthSuccess = (apiUserId, token) => {
    setUserId(apiUserId);
    setAuthToken(token);
    setCurrentPage('list');
  };

  // Handle logout
  const handleLogout = () => {
    setUserId(null);
    setAuthToken(null);
    setWorkouts([]);
    setCurrentPage('login');
  };

  // Refetch after adding workout
  const handleWorkoutAdded = () => {
    fetchWorkouts(); // Immediately reload workouts
    setCurrentPage('list');
  };

  if (!authToken || !userId) {
    return (
      <div className="app-container">
        <LoginPage onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-content-wrapper">
        <div className="user-info-bar">
          <p className="user-id-text">
            Your User ID: <span className="font-mono break-all">{userId || 'N/A'}</span>
          </p>
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>

        <div className="navigation-tabs">
          <button
            className={`tab-button ${currentPage === 'list' ? 'tab-button-active' : ''}`}
            onClick={() => setCurrentPage('list')}
          >
            View Workouts
          </button>
          <button
            className={`tab-button ${currentPage === 'add' ? 'tab-button-active' : ''}`}
            onClick={() => setCurrentPage('add')}
          >
            Add Workout
          </button>
        </div>

        {currentPage === 'list' && (
          <WorkoutListPage
            workouts={workouts}
            isLoading={isLoadingWorkouts}
            error={workoutError}
          />
        )}
        {currentPage === 'add' && (
          <WorkoutFormPage
            authToken={authToken}
            onWorkoutAdded={handleWorkoutAdded}
          />
        )}
      </div>
    </div>
  );
};

export default App;
