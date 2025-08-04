import React, { useState, useEffect } from 'react';

// Import your page components
import WorkoutFormPage from './pages/WorkoutFormPage.jsx';
import WorkoutListPage from './pages/WorkoutListPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

// API Base URL for all operations - NOW POINTS TO THE PROXY
const API_BASE_URL = '/api';

// Main App component
const App = () => { // Removed the extra '};' here
  const [authToken, setAuthToken] = useState(null); // Stores the JWT received from LoginPage
  const [userId, setUserId] = useState(null); // Stores the userId extracted from the JWT
  const [workouts, setWorkouts] = useState([]);
  const [currentPage, setCurrentPage] = useState('list'); // 'list' or 'add'
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [workoutError, setWorkoutError] = useState('');
  const [editingWorkout, setEditingWorkout] = useState(null); // State to hold workout being edited

  // Effect to fetch workouts when authToken or userId changes, or when a workout is added/updated/deleted
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
        const responseData = await response.json(); // Get the full response data
        let workoutsArray = [];

        // Safely determine if responseData is an array or an object containing the array
        if (Array.isArray(responseData)) {
          workoutsArray = responseData;
        } else if (responseData && Array.isArray(responseData.workouts)) {
          workoutsArray = responseData.workouts;
        } else if (responseData && Array.isArray(responseData.data)) {
          workoutsArray = responseData.data;
        } else {
          console.warn("API response for workouts was not an array or expected object structure:", responseData);
          setWorkoutError("Unexpected data format from API.");
          setWorkouts([]);
          return;
        }

        // Sort workouts by dateAdded in memory (assuming dateAdded is a string or Date object)
        const sortedWorkouts = workoutsArray.sort((a, b) => {
          const dateA = new Date(a.dateAdded || 0);
          const dateB = new Date(b.dateAdded || 0);
          return dateB.getTime() - dateA.getTime(); // Sort descending by dateAdded
        });
        setWorkouts(sortedWorkouts);
      } else {
        // Attempt to parse error response as JSON, but handle non-JSON responses gracefully
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // If response is not JSON (e.g., HTML 404 page), use status text
          errorData.message = response.statusText;
        }
        setWorkoutError(errorData.message || `Failed to fetch workouts: ${response.statusText}`);
        setWorkouts([]);
      }
    } catch (err) {
      console.error("Error fetching workouts:", err);
      setWorkoutError('Network error or API is unreachable for workouts.');
      setWorkouts([]);
    } finally {
      setIsLoadingWorkouts(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [authToken, userId, currentPage]); // Re-fetch when token, userId, or page changes (to ensure data refresh after add/update/delete)

  // Callback from LoginPage after successful login/registration
  const handleAuthSuccess = (apiUserId, token) => {
    setUserId(apiUserId); // Set the userId obtained from your API
    setAuthToken(token); // Store the JWT
    setCurrentPage('list'); // Redirect to workout list page
    // fetchWorkouts will be called by useEffect due to authToken/userId change
  };

  const handleLogout = () => {
    // For a REST API, logout often just means clearing client-side token
    setUserId(null); // Clear userId state
    setAuthToken(null); // Clear token
    setWorkouts([]); // Clear workouts
    setCurrentPage('login'); // Redirect to login page
    // If your API has a logout endpoint that invalidates tokens on the server,
    // you would add a fetch call here, e.g.:
    // fetch(`${API_BASE_URL}/users/logout`, { method: 'POST', headers: { 'Authorization': `Bearer ${authToken}` } });
  };

  // Function to handle editing a workout (passed to WorkoutListPage)
  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
    setCurrentPage('add'); // Switch to the form page
  };

  // Function to handle form submission success (add or update)
  const handleFormSubmitSuccess = () => {
    setEditingWorkout(null); // Clear editing state
    setCurrentPage('list'); // Go back to list page
    // fetchWorkouts will be called by useEffect due to currentPage change
  };

  // Function to handle deleting a workout (passed to WorkoutListPage)
  const handleDeleteWorkout = async (workoutId) => {
    if (window.confirm("Are you sure you want to delete this workout?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/workouts/deleteWorkout/${workoutId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          console.log(`Workout ${workoutId} deleted successfully.`);
          fetchWorkouts(); // Re-fetch workouts to update the list
        } else {
          let errorData = {};
          try {
            errorData = await response.json();
          } catch (e) {
            errorData.message = response.statusText;
          }
          console.error(`Failed to delete workout ${workoutId}:`, errorData.message || response.statusText);
          setWorkoutError(`Failed to delete workout: ${errorData.message || response.statusText}`);
        }
      } catch (error) {
        console.error("Error deleting workout:", error);
        setWorkoutError('Network error or API is unreachable for deleting workout.');
      }
    }
  };

  // Function to handle completing a workout status (passed to WorkoutListPage)
  const handleCompleteWorkoutStatus = async (workoutId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/workouts/completeWorkoutStatus/${workoutId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        // No request body needed as per API doc for this endpoint
      });

      if (response.ok) {
        console.log(`Workout ${workoutId} status completed.`);
        fetchWorkouts(); // Re-fetch workouts to update the list
      } else {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData.message = response.statusText;
        }
        console.error(`Failed to complete workout status ${workoutId}:`, errorData.message || response.statusText);
        setWorkoutError(`Failed to complete workout status: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error completing workout status:", error);
      setWorkoutError('Network error or API is unreachable for completing workout status.');
    }
  };

  // Render LoginPage if no user is authenticated
  if (!authToken || !userId) {
    return (
      <div className="app-container">
        <LoginPage onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  // Render main app content if user is authenticated
  return (
    <div className="app-container">
      <div className="app-content-wrapper">
        {/* User ID Display and Logout Button */}
        <div className="user-info-bar">
          <p className="user-id-text">
            Your User ID: <span className="user-id-value">{userId || 'N/A'}</span>
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
            onClick={() => {
              setCurrentPage('list');
              setEditingWorkout(null); // Clear editing state when switching to list
            }}
          >
            View Workouts
          </button>
          <button
            className={`tab-button ${currentPage === 'add' ? 'tab-button-active' : ''}`}
            onClick={() => {
              setCurrentPage('add');
              setEditingWorkout(null); // Ensure no workout is being edited when clicking 'Add'
            }}
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
            onEdit={handleEditWorkout} // Pass edit handler
            onDelete={handleDeleteWorkout} // Pass delete handler
            onCompleteStatus={handleCompleteWorkoutStatus} // Pass complete status handler
            authToken={authToken} // Pass authToken for actions
          />
        )}
        {currentPage === 'add' && (
          <WorkoutFormPage
            authToken={authToken}
            onFormSubmitSuccess={handleFormSubmitSuccess} // Renamed callback
            editingWorkout={editingWorkout} // Pass workout to edit
            onCancelEdit={() => {
              setEditingWorkout(null);
              setCurrentPage('list');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
