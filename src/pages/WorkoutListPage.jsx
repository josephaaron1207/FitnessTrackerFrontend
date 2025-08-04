import React from 'react';

const WorkoutCard = ({ workout, onEdit, onDelete, onCompleteStatus }) => {
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
      <h3 className="workout-card-title">{workout.name}</h3>
      <p className="workout-card-detail">
        <span className="workout-card-label">Duration:</span> {workout.duration}
      </p>
      <p className="workout-card-detail">
        <span className="workout-card-label">Date Added:</span>{' '}
        {new Date(workout.dateAdded).toLocaleString()}
      </p>
      <span className={`workout-status-badge ${getStatusColor(workout.status)}`}>
        {workout.status}
      </span>
      <div className="workout-card-actions">
        <button onClick={() => onEdit(workout)} className="action-button update-button">Update</button>
        <button onClick={() => onDelete(workout.id)} className="action-button delete-button">Delete</button>
        {workout.status !== 'Completed' && (
          <button onClick={() => onCompleteStatus(workout.id)} className="action-button complete-button">
            Complete
          </button>
        )}
      </div>
    </div>
  );
};

const WorkoutListPage = ({ workouts, isLoading, error, onEdit, onDelete, onCompleteStatus }) => {
  if (isLoading) {
    return <p className="list-page-message">Loading workouts...</p>;
  }

  if (error) {
    return <p className="list-page-message error-message-text">Error: {error}</p>;
  }

  return (
    <div className="list-page-container">
      <h2 className="list-page-heading">Your Workouts</h2>
      {(!workouts || workouts.length === 0) ? (
        <p className="list-page-message">No workouts yet. Add one!</p>
      ) : (
        <div className="workout-grid">
          {workouts.map((w) => (
            <WorkoutCard
              key={w.id}
              workout={w}
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
