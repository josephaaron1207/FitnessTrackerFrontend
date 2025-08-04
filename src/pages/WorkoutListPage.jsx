import React from 'react';

// Card for each workout
const WorkoutCard = ({ workout, onEdit, onDelete, onCompleteStatus }) => {
  const workoutWithId = {
    ...workout,
    id: workout.id || crypto.randomUUID(), // fallback ID
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'Pending': return 'status-pending';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-default';
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
      <span className={`workout-status-badge ${getStatusColor(workoutWithId.status)}`}>
        {workoutWithId.status}
      </span>

      <div className="workout-card-actions">
        <button
          onClick={() => onEdit?.(workoutWithId)}
          className="action-button update-button"
        >
          Update
        </button>
        <button
          onClick={() => onDelete?.(workoutWithId.id)}
          className="action-button delete-button"
        >
          Delete
        </button>
        {workoutWithId.status !== 'Completed' && (
          <button
            onClick={() => onCompleteStatus?.(workoutWithId.id)}
            className="action-button complete-button"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
};

// Page for workout list
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

  // ✅ Ensure workouts is an array
  const safeWorkouts = Array.isArray(workouts) ? workouts : [];
  console.log("✅ Rendering Workouts:", safeWorkouts);

  return (
    <div className="list-page-container">
      <h2 className="list-page-heading">Your Workouts</h2>
      {safeWorkouts.length === 0 ? (
        <p className="list-page-message">No workouts added yet. Add one from the "Add Workout" tab!</p>
      ) : (
        <div className="workout-grid">
          {safeWorkouts.map((workout) => (
            <WorkoutCard
              key={workout.id || `temp-${Math.random()}`}
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
