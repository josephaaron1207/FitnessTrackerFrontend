import React, { useState, useEffect } from 'react';
import WorkoutFormPage from './pages/WorkoutFormPage.jsx';
import WorkoutListPage from './pages/WorkoutListPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const App = () => {
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [currentPage, setCurrentPage] = useState('list');
  const [isLoading, setIsLoading] = useState(false);
  const [workoutError, setWorkoutError] = useState('');
  const [editWorkout, setEditWorkout] = useState(null);

  // Fetch workouts
  const fetchWorkouts = async () => {
    if (!authToken || !userId) return;
    setIsLoading(true);
    setWorkoutError('');
    try {
      const res = await fetch(`${API_BASE_URL}/workouts/getMyWorkouts`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setWorkouts(
          (Array.isArray(data) ? data : []).sort(
            (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
          )
        );
      } else {
        setWorkoutError(data.message || 'Failed to fetch workouts.');
      }
    } catch (err) {
      console.error("Error fetching workouts:", err);
      setWorkoutError('Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [authToken, userId]);

  // Auth success
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

  // Save updated workout
  const handleSaveWorkout = async () => {
    if (!editWorkout) return;
    try {
      const res = await fetch(`${API_BASE_URL}/workouts/updateWorkout/${editWorkout.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: editWorkout.name,
          duration: editWorkout.duration,
          status: editWorkout.status,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setWorkouts((prev) =>
          prev.map((w) =>
            w.id === editWorkout.id ? { ...w, ...data.updatedWorkout } : w
          )
        );
        setEditWorkout(null);
      } else {
        alert(data.message || 'Failed to update workout.');
      }
    } catch (err) {
      console.error('Error updating workout:', err);
      alert('Error updating workout.');
    }
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
          <p>Your User ID: <span>{userId}</span></p>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>

        <div className="navigation-tabs">
          <button
            className={`tab-button ${currentPage === 'list' ? 'active' : ''}`}
            onClick={() => setCurrentPage('list')}
          >
            View Workouts
          </button>
          <button
            className={`tab-button ${currentPage === 'add' ? 'active' : ''}`}
            onClick={() => setCurrentPage('add')}
          >
            Add Workout
          </button>
        </div>

        {currentPage === 'list' && (
          <WorkoutListPage
            workouts={workouts}
            isLoading={isLoading}
            error={workoutError}
            onEdit={setEditWorkout}
          />
        )}
        {currentPage === 'add' && (
          <WorkoutFormPage authToken={authToken} onWorkoutAdded={fetchWorkouts} />
        )}

        {/* Update Modal */}
        {editWorkout && (
          <div className="modal">
            <div className="modal-content">
              <h3>Edit Workout</h3>
              <input
                type="text"
                value={editWorkout.name}
                onChange={(e) => setEditWorkout({ ...editWorkout, name: e.target.value })}
              />
              <input
                type="text"
                value={editWorkout.duration}
                onChange={(e) => setEditWorkout({ ...editWorkout, duration: e.target.value })}
              />
              <select
                value={editWorkout.status}
                onChange={(e) => setEditWorkout({ ...editWorkout, status: e.target.value })}
              >
                <option>Completed</option>
                <option>Pending</option>
              </select>
              <button onClick={handleSaveWorkout}>Save</button>
              <button onClick={() => setEditWorkout(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
