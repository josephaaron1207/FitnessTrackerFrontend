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
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [workoutError, setWorkoutError] = useState('');
  const [editWorkout, setEditWorkout] = useState(null);

  // 🔹 Fetch workouts
  const fetchWorkouts = async () => {
    if (!authToken || !userId) return;
    setIsLoadingWorkouts(true);
    setWorkoutError('');
    try {
      const response = await fetch(`${API_BASE_URL}/workouts/getMyWorkouts`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setWorkouts(
          data.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        );
      } else {
        setWorkoutError(data.message || 'Failed to fetch workouts');
        setWorkouts([]);
      }
    } catch (err) {
      console.error('❌ Error fetching workouts:', err);
      setWorkoutError('Network error or API unreachable.');
    } finally {
      setIsLoadingWorkouts(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [authToken, userId]);

  // 🔹 Auth success
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

  // 🔹 CRUD handlers
  const handleWorkoutAdded = () => fetchWorkouts();

  const handleDeleteWorkout = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/workouts/deleteWorkout/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setWorkouts((prev) => prev.filter((w) => w.id !== id));
      } else {
        console.error('❌ Failed to delete workout');
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
    }
  };

  const handleCompleteWorkout = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/workouts/completeWorkoutStatus/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setWorkouts((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status: 'Completed' } : w))
        );
      } else {
        console.error('❌ Complete failed:', data);
      }
    } catch (err) {
      console.error('❌ Complete error:', err);
    }
  };

  const handleUpdateWorkout = async (updatedWorkout) => {
    try {
      const res = await fetch(`${API_BASE_URL}/workouts/updateWorkout/${updatedWorkout.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedWorkout),
      });
      const data = await res.json();
      if (res.ok) {
        setWorkouts((prev) =>
          prev.map((w) => (w.id === updatedWorkout.id ? data.updatedWorkout : w))
        );
        setEditWorkout(null); // close modal
      } else {
        console.error('❌ Update failed:', data);
      }
    } catch (err) {
      console.error('❌ Update error:', err);
    }
  };

  // 🔹 Render LoginPage if unauthenticated
  if (!authToken || !userId) {
    return <LoginPage onAuthSuccess={handleAuthSuccess} />;
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
            onDelete={handleDeleteWorkout}
            onEdit={(w) => setEditWorkout(w)}
            onCompleteStatus={handleCompleteWorkout}
          />
        )}
        {currentPage === 'add' && (
          <WorkoutFormPage
            authToken={authToken}
            onWorkoutAdded={handleWorkoutAdded}
          />
        )}

        {/* Update Workout Modal */}
        {editWorkout && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>Edit Workout</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateWorkout(editWorkout);
                }}
              >
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
                  <option>Cancelled</option>
                </select>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditWorkout(null)}>Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
