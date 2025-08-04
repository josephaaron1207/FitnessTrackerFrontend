import React, { useState, useEffect } from 'react';

// Import your page components
import WorkoutFormPage from './pages/WorkoutFormPage.jsx';
import WorkoutListPage from './pages/WorkoutListPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

// API Base URL for all operations - now uses a Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // <--- UPDATED THIS LINE

// Main App component
const App = () => {
  const [authToken, setAuthToken] = useState(null); // Stores the JWT received from LoginPage
  const [userId, setUserId] = useState(null); // Stores the userId extracted from the JWT
  const [workouts, setWorkouts] = useState([]);
  const [currentPage, setCurrentPage] = useState('list'); // 'list' or 'add'
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [workoutError, setWorkoutError] = useState('');

  // Effect to fetch workouts when authToken or userId changes
  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!authToken || !userId) {
        setWorkouts([]); // Clear workouts if not authenticated
        return;
      }

      setIsLoadingWorkouts(true);
      setWorkoutError('');
      try {
        const response = await fetch(`${API_BASE_URL}/workouts/getMyWorkouts`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`, // Send the JWT
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Assuming the API returns an array of workouts directly
          const sortedWorkouts = data.sort((a, b) => {
            const dateA = new Date(a.dateAdded || 0);
            const dateB = new Date(b.dateAdded || 0);
            return dateB.getTime() - dateA.getTime(); // Sort descending
          });
          setWorkouts(sortedWorkouts);
        } else {
          const errorData = await response.json();
          setWorkoutError(errorData.message || `Failed to fetch workouts: ${response.statusText}`);
          setWorkouts([]);
        }
      } catch (err) {
        console.error("Error fetching workouts:", err);
        setWorkoutError('Network error or API is unreachable for workouts.');
      } finally {
        setIsLoadingWorkouts(false);
      }
    };

    fetchWorkouts();
  }, [authToken, userId]); // Re-fetch when token or userId changes

  // Callback from LoginPage after successful login/registration
  const handleAuthSuccess = (apiUserId, token) => {
    setUserId(apiUserId); // Set the userId obtained from your API
    setAuthToken(token); // Store the JWT
    setCurrentPage('list'); // Redirect to workout list page
  };

  const handleLogout = () => {
    setUserId(null); // Clear userId state
    setAuthToken(null); // Clear token
    setWorkouts([]); // Clear workouts
    setCurrentPage('login'); // Redirect to login page
    // If your API requires a logout call, you would add a fetch here
    // e.g., fetch(`${API_BASE_URL}/users/logout`, { method: 'POST', headers: { 'Authorization': `Bearer ${authToken}` } });
  };

  // Function to re-fetch workouts after a new one is added
  const handleWorkoutAdded = () => {
    // Trigger re-fetch by changing a state that useEffect depends on, or directly call fetchWorkouts
    // For simplicity, we'll just switch to list page and let useEffect handle re-fetch
    setCurrentPage('list');
  };

  // Render LoginPage if no user is authenticated
  if (!authToken || !userId) {
    return (
      <div className="app-container"> {/* Use a global class for consistent background */}
        {/* Pass the handleAuthSuccess callback to LoginPage */}
        <LoginPage onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  // Render main app content if user is authenticated
  return (
    <div className="app-container"> {/* Use a global class for consistent background */}
      <div className="app-content-wrapper">
        {/* User ID Display and Logout Button */}
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

        {/* Navigation Tabs */}
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

        {/* Conditional Page Rendering */}
        {currentPage === 'list' && (
          <WorkoutListPage
            workouts={workouts}
            isLoading={isLoadingWorkouts}
            error={workoutError}
          />
        )}
        {currentPage === 'add' && (
          <WorkoutFormPage
            authToken={authToken} // Pass the token
            onWorkoutAdded={handleWorkoutAdded}
          />
        )}
      </div>
    </div>
  );
};

export default App;
