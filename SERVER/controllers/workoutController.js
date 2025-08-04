const Workout = require("../models/Workout");

module.exports.addWorkout = (req, res) => {
  let newWorkout = new Workout({
    name: req.body.name,
    duration: req.body.duration,
    status: req.body.status || "pending",
    dateAdded: req.body.dateAdded || Date.now(),
    userId: req.user.id
  });

  newWorkout.save()
    .then(savedWorkout => res.status(201).send({
      message: "Workout successfully added",
      workout: savedWorkout
    }))
    .catch(saveErr => {
      console.error("Error in saving the workout:", saveErr);
      return res.status(500).send({ error: 'Failed to save the workout' });
    });
};

module.exports.getMyWorkouts = (req, res) => {
  Workout.find({ userId: req.user.id })
    .then(workouts => {
      // Transform Mongoose documents to plain objects and map _id to id
      const formattedWorkouts = workouts.map(workout => ({
        id: workout._id.toString(), // Convert ObjectId to string and name it 'id'
        name: workout.name,
        duration: workout.duration,
        status: workout.status,
        dateAdded: workout.dateAdded,
        userId: workout.userId.toString() // Also convert userId to string if needed on frontend
      }));

      if (formattedWorkouts.length > 0) {
        // Send the array directly, not wrapped in { workouts: [...] }
        return res.status(200).send(formattedWorkouts); // <-- UPDATED THIS LINE
      } else {
        return res.status(200).send([]); // Send an empty array if no workouts found
      }
    })
    .catch(err => {
      console.error("Error finding workouts:", err);
      res.status(500).send({ error: 'Error finding workouts.' });
    });
};


module.exports.updateWorkout = (req, res) => {
  let workoutUpdates = {
    name: req.body.name,
    duration: req.body.duration,
    status: req.body.status,
    // dateAdded: req.body.dateAdded // dateAdded should typically not be updated manually
  };

  Workout.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    workoutUpdates,
    { new: true }
  )
  .then(updatedWorkout => {
    if (!updatedWorkout) {
      return res.status(404).send({ error: 'Workout not found or not authorized' });
    }
    // Return the updated workout with _id mapped to id
    const formattedUpdatedWorkout = {
      id: updatedWorkout._id.toString(),
      name: updatedWorkout.name,
      duration: updatedWorkout.duration,
      status: updatedWorkout.status,
      dateAdded: updatedWorkout.dateAdded,
      userId: updatedWorkout.userId.toString()
    };
    return res.status(200).send({
      message: 'Workout updated successfully',
      updatedWorkout: formattedUpdatedWorkout
    });
  })
  .catch(err => {
    console.error("Error in updating a workout:", err);
    // More specific error handling for CastError if ID format is wrong
    if (err.name === 'CastError' && err.path === '_id') {
      return res.status(400).send({ error: 'Invalid Workout ID format.' });
    }
    return res.status(500).send({ error: 'Error in updating a workout.' });
  });
};


module.exports.deleteWorkout = (req, res) => {
  Workout.deleteOne({ _id: req.params.id, userId: req.user.id })
  .then(deletedResult => {
    if (deletedResult.deletedCount < 1) {
      return res.status(404).send({ error: 'Workout not found or not authorized to delete' });
    }
    return res.status(200).send({ message: 'Workout deleted successfully' });
  })
  .catch(err => {
    console.error("Error in deleting a workout:", err);
    if (err.name === 'CastError' && err.path === '_id') {
      return res.status(400).send({ error: 'Invalid Workout ID format.' });
    }
    return res.status(500).send({ error: 'Error in deleting a workout.' });
  });
};

module.exports.completeWorkoutStatus = (req, res) => {
  const workoutId = req.params.id;

  Workout.findOneAndUpdate(
    { _id: workoutId, userId: req.user.id }, // ensure user owns the workout
    { status: "Completed" }, // Ensure status is "Completed" (capitalized as per frontend)
    { new: true }
  )
  .then(updatedWorkout => {
    if (!updatedWorkout) {
      return res.status(404).send({ error: 'Workout not found or not authorized' });
    }
    // Return the updated workout with _id mapped to id
    const formattedUpdatedWorkout = {
      id: updatedWorkout._id.toString(),
      name: updatedWorkout.name,
      duration: updatedWorkout.duration,
      status: updatedWorkout.status,
      dateAdded: updatedWorkout.dateAdded,
      userId: updatedWorkout.userId.toString()
    };
    return res.status(200).send({
      message: 'Workout marked as completed',
      updatedWorkout: formattedUpdatedWorkout
    });
  })
  .catch(err => {
    console.error("Error completing workout:", err);
    if (err.name === 'CastError' && err.path === '_id') {
      return res.status(400).send({ error: 'Invalid Workout ID format.' });
    }
    res.status(500).send({ error: 'Failed to complete workout.' });
  });
};