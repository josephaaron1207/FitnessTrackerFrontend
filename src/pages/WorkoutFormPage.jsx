import React, { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const WorkoutFormPage = ({ authToken, onWorkoutAdded }) => {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/workouts/addWorkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, duration }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("❌ Failed to parse response:", text);
        setError("Invalid server response");
        return;
      }

      if (res.ok) {
        setName("");
        setDuration("");
        onWorkoutAdded(); // refresh workouts list
      } else {
        setError(data.message || "Failed to add workout");
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      setError("Network error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">Add a Workout</h2>
      <form onSubmit={handleAddWorkout} className="form-layout">
        <div className="form-field">
          <label className="form-label">Workout Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-field">
          <label className="form-label">Duration (mins)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="form-input"
            required
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Workout"}
        </button>
      </form>
    </div>
  );
};

export default WorkoutFormPage;
