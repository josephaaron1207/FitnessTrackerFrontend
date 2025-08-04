import React, { useState, useEffect } from 'react';
import WorkoutFormPage from './pages/WorkoutFormPage.jsx';
import WorkoutListPage from './pages/WorkoutListPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const App = () => {
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [currentPage, setCurrentPage] = useState('list');
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [workoutError, setWorkoutError] = useState('');

  useEffect(() => {
    const fetchWorkouts = async () => {
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
        console.log("👉 Raw workouts response:", text);

        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("❌ Failed to parse workouts JSON:", text);
          setWorkoutError("Unexpected response format from API.");
          setWorkouts([]);
          return;
        }

        if (response.ok) {
          const workoutsArray = Array.isArray(data) ? data : [];
          const sortedWorkouts = workoutsArray.sort((a, b) => {
            const dateA = new Date(a.dateAdded || 0);
            const dateB = new Date(b.dateAdded || 0);
            return dateB.getTime() - dateA.getTime();
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
    };

    fetchWorkouts();
  }, [authToken, userId]);

  const handleAuthSuccess = (apiUserId, token) => {
    setUserId(apiUserId);
    setAuthToken(token);
    setCurrentPage('list');
  };

  const handleLogout = () => {
    setUserId(null);
    setAuthToken(null);
    setWorkouts([]);
    setCurrentPage('login');
  };

  const handleWorkoutAdded = () => {
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
          <button onClick={handleLogout} className="logout-button">
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
