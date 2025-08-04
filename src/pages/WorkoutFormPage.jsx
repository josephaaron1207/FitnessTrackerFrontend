import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const WorkoutFormPage = ({ authToken, onWorkoutAdded }) => {
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [workoutStatus, setWorkoutStatus] = useState('Completed');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/workouts/addWorkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: workoutName,
          duration: workoutDuration,
          status: workoutStatus,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setWorkoutName('');
        setWorkoutDuration('');
        setWorkoutStatus('Completed');
        onWorkoutAdded();
      } else {
        setFormError(data.message || 'Failed to add workout');
      }
    } catch (err) {
      setFormError('Network error while adding workout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-page-container">
      <h2 className="form-page-heading">Add New Workout</h2>
      <form onSubmit={handleAddWorkout} className="form-layout">
        <div className="form-field">
          <label htmlFor="workoutName" className="form-label">Workout Name</label>
          <input
            type="text"
            id="workoutName"
            className="form-input"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="workoutDuration" className="form-label">Duration</label>
          <input
            type="text"
            id="workoutDuration"
            className="form-input"
            value={workoutDuration}
            onChange={(e) => setWorkoutDuration(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="workoutStatus" className="form-label">Status</label>
          <select
            id="workoutStatus"
            className="form-select"
            value={workoutStatus}
            onChange={(e) => setWorkoutStatus(e.target.value)}
          >
            <option>Completed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
        </div>
        {formError && <p className="form-error-message">{formError}</p>}
        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? 'Adding Workout...' : 'Add Workout'}
        </button>
      </form>
    </div>
  );
};

export default WorkoutFormPage;
