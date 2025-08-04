import React, { useState } from 'react';

// ✅ Use the correct env variable name
const API_BASE_URL = import.meta.env.VITE_API_URL; 

const WorkoutFormPage = ({ authToken, onWorkoutAdded }) => {
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [workoutStatus, setWorkoutStatus] = useState('Completed'); 
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle adding a new workout
  const handleAddWorkout = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    if (!authToken) {
      setFormError("Not authenticated. Please log in.");
      setIsSubmitting(false);
      return;
    }

    if (!workoutName || !workoutDuration) {
      setFormError("Workout name and duration cannot be empty.");
      setIsSubmitting(false);
      return;
    }

    try {
      const url = `${API_BASE_URL}/workouts/addWorkout`;
      console.log("👉 Sending request to:", url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`, 
        },
        body: JSON.stringify({
          name: workoutName,
          duration: workoutDuration, 
          status: workoutStatus,
        }),
      });

      const responseText = await response.text();
      console.log("👉 Raw API Response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("❌ Failed to parse API response as JSON:", responseText);
        setFormError('An unexpected response was received from the API. Check console for details.');
        setIsSubmitting(false);
        return;
      }

      if (response.ok) {
        console.log("✅ Workout added successfully:", data);
        setWorkoutName('');
        setWorkoutDuration('');
        setWorkoutStatus('Completed');
        onWorkoutAdded(); 
      } else {
        setFormError(data.message || `Failed to add workout: ${response.statusText}`);
      }
    } catch (error) {
      console.error("❌ Error adding workout:", error);
      setFormError('Network error or API is unreachable for adding workout.');
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
            placeholder="e.g., Morning Run"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="workoutDuration" className="form-label">Duration (e.g., "30 mins")</label>
          <input
            type="text"
            id="workoutDuration"
            className="form-input"
            placeholder="e.g., 45 mins, 1 hour"
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
        {formError && (
          <p className="form-error-message">{formError}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Adding Workout...' : 'Add Workout'}
        </button>
      </form>
    </div>
  );
};

export default WorkoutFormPage;
