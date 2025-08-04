import React from 'react';

const WorkoutCard = ({ workout, onEdit, onDelete, onCompleteStatus }) => {
  return (
    <div className="workout-card">
      <h3>{workout.name}</h3>
      <p>Duration: {workout.duration}</p>
      <p>Status: {workout.status}</p>
      <div>
        <button onClick={() => onEdit(workout)}>Update</button>
        <button onClick={() => onDelete(workout.id)}>Delete</button>
        {workout.status !== 'Completed' && (
          <button onClick={() => onCompleteStatus(workout.id)}>Complete</button>
        )}
      </div>
    </div>
  );
};

const WorkoutListPage = ({ workouts, isLoading, error, onEdit, onDelete, onCompleteStatus }) => {
  if (isLoading) return <p>Loading workouts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Your Workouts</h2>
      {(!workouts || workouts.length === 0) ? (
        <p>No workouts yet. Add one!</p>
      ) : (
        workouts.map((w) => (
          <WorkoutCard
            key={w.id}
            workout={w}
            onEdit={onEdit}
            onDelete={onDelete}
            onCompleteStatus={onCompleteStatus}
          />
        ))
      )}
    </div>
  );
};

export default WorkoutListPage;
