import React, { useState, useEffect } from 'react';

// API_BASE_URL now points to the proxy
const API_BASE_URL = '/api';

// Accepts editingWorkout prop (the workout object to edit, or null for add mode)
// onFormSubmitSuccess is called after successful add/update
// onCancelEdit is called when the user cancels editing
const WorkoutFormPage = ({ authToken, onFormSubmitSuccess, editingWorkout, onCancelEdit }) => {
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [workoutStatus, setWorkoutStatus] = useState('Completed'); // Default status re-added
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to pre-fill form when editingWorkout changes (i.e., when entering edit mode)
  useEffect(() => {
    if (editingWorkout) {
      setWorkoutName(editingWorkout.name || '');
      setWorkoutDuration(editingWorkout.duration || ''); // Assuming duration is a string like "30 mins"
      setWorkoutStatus(editingWorkout.status || 'Completed'); // Set status for editing
    } else {
      // Reset form if no workout is being edited (e.g., when switching to 'Add Workout' tab)
      setWorkoutName('');
      setWorkoutDuration('');
      setWorkoutStatus('Completed'); // Reset status
    }
    setFormError(''); // Clear any previous errors
  }, [editingWorkout]);

  // Handle adding or updating a workout
  const handleSubmitWorkout = async (e) => {
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

    const workoutData = {
      name: workoutName,
      duration: workoutDuration,
      status: workoutStatus, // Status field re-added
    };

    try {
      let response;
      if (editingWorkout) {
        // Update existing workout
        response = await fetch(`${API_BASE_URL}/workouts/updateWorkout/${editingWorkout.id}`, {
          method: 'PATCH', // Use PATCH for updates
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(workoutData),
        });
      } else {
        // Add new workout
        response = await fetch(`${API_BASE_URL}/workouts/addWorkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(workoutData),
        });
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse API response as JSON:", responseText);
        setFormError('An unexpected response was received from the API. Check console for details.');
        setIsSubmitting(false);
        return;
      }

      if (response.ok) {
        console.log(`Workout ${editingWorkout ? 'updated' : 'added'} successfully:`, data);
        onFormSubmitSuccess(); // Notify parent component of success
      } else {
        setFormError(data.message || `Failed to ${editingWorkout ? 'update' : 'add'} workout: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error ${editingWorkout ? 'updating' : 'adding'} workout:`, error);
      setFormError(`Network error or API is unreachable for ${editingWorkout ? 'updating' : 'adding'} workout.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-page-container">
      <h2 className="form-page-heading">{editingWorkout ? 'Edit Workout' : 'Add New Workout'}</h2>
      <form onSubmit={handleSubmitWorkout} className="form-layout">
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
        <div className="form-field"> {/* Status field re-added */}
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
        <div className="button-group-form">
          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? (editingWorkout ? 'Updating...' : 'Adding...') : (editingWorkout ? 'Update Workout' : 'Add Workout')}
          </button>
          {editingWorkout && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting}
              className="cancel-button"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default WorkoutFormPage;