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

  // Fetch workouts
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

  // CRUD handlers
  const handleWorkoutAdded = () => fetchWorkouts();

  const handleDeleteWorkout = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/workouts/deleteWorkout/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setWorkouts((prev) => prev.filter((w) => w.id !== id));
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
      if (res.ok) {
        setWorkouts((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status: 'Completed' } : w))
        );
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
        setEditWorkout(null);
      }
    } catch (err) {
      console.error('❌ Update error:', err);
    }
  };

  if (!authToken || !userId) {
    return <LoginPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-container">
      <div className="app-content-wrapper">
        <div className="user-info-bar">
          <p className="user-id-text">
            Your User ID: <span className="font-mono break-all">{userId}</span>
          </p>
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
              <h3 className="modal-heading">Edit Workout</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateWorkout(editWorkout);
                }}
                className="form-layout"
              >
                <div className="form-field">
                  <label className="form-label">Workout Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editWorkout.name}
                    onChange={(e) => setEditWorkout({ ...editWorkout, name: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editWorkout.duration}
                    onChange={(e) => setEditWorkout({ ...editWorkout, duration: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editWorkout.status}
                    onChange={(e) => setEditWorkout({ ...editWorkout, status: e.target.value })}
                  >
                    <option>Completed</option>
                    <option>Pending</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="submit-button">Save</button>
                  <button type="button" className="cancel-button" onClick={() => setEditWorkout(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
