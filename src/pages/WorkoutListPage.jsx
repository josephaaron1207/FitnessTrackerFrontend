import React from 'react';

// WorkoutCard component (defined within WorkoutListPage for simplicity)
// Now accepts onEdit, onDelete, onCompleteStatus callbacks
const WorkoutCard = ({ workout, onEdit, onDelete, onCompleteStatus }) => {
  // Ensure workout has an ID. If not, assign a temporary client-side ID.
  // IMPORTANT: Actions (update/delete/complete) will still fail on the backend
  // for workouts that only have this temporary ID, as the backend won't recognize it.
  const workoutWithId = {
    ...workout,
    id: workout.id || crypto.randomUUID(), // Assign a temporary ID if missing
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Assuming dateString is in a format Date constructor can parse
    const date = new Date(dateString);
    if (isNaN(date.getTime())) { // Check if date is invalid
      return dateString; // Return original string if invalid date
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'Pending':
        return 'status-pending';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="workout-card">
      <h3 className="workout-card-title">{workoutWithId.name}</h3>
      <p className="workout-card-detail">
        <span className="workout-card-label">Duration:</span> {workoutWithId.duration}
      </p>
      <p className="workout-card-detail">
        <span className="workout-card-label">Date Added:</span> {formatDate(workoutWithId.dateAdded)}
      </p>
      {/* Status badge */}
      <span className={`workout-status-badge ${getStatusColor(workoutWithId.status)}`}>
        {workoutWithId.status}
      </span>

      {/* Action Buttons */}
      <div className="workout-card-actions">
        {/* Buttons will always render now due to temporary ID assignment */}
        <button
          onClick={() => onEdit(workoutWithId)} // Pass workoutWithId
          className="action-button update-button"
        >
          Update
        </button>
        <button
          onClick={() => onDelete(workoutWithId.id)} // Pass workoutWithId.id
          className="action-button delete-button"
        >
          Delete
        </button>
        {workoutWithId.status !== 'Completed' && ( // Only show "Complete" if not already completed
          <button
            onClick={() => onCompleteStatus(workoutWithId.id)} // Pass workoutWithId.id
            className="action-button complete-button"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
};

// WorkoutListPage Component
const WorkoutListPage = ({ workouts, isLoading, error, onEdit, onDelete, onCompleteStatus }) => {
  if (isLoading) {
    return (
      <div className="list-page-message">
        <p>Loading workouts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-page-message error-message-text">
        <p>Error: {error}</p>
        <p>Please try again later or check your network connection.</p>
      </div>
    );
  }

  return (
    <div className="list-page-container">
      <h2 className="list-page-heading">Your Workouts</h2>
      {workouts.length === 0 ? (
        <p className="list-page-message">No workouts added yet. Add one from the "Add Workout" tab!</p>
      ) : (
        <div className="workout-grid">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id || `temp-${Math.random()}`} // Still use fallback key for React list optimization
              workout={workout}
              onEdit={onEdit}
              onDelete={onDelete}
              onCompleteStatus={onCompleteStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutListPage;
