const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/user");
const workoutRoutes = require("./routes/workoutRoutes"); // Corrected variable name from workout to workoutRoutes

require('dotenv').config();

const app = express();

const corsOptions = {
    // Allow requests from your frontend's development server (Vite default)
    // and potentially your Render.com frontend URL if you deploy it there.
    origin:['http://localhost:5173', 'https://your-frontend-app.onrender.com'], // <-- UPDATED THIS LINE
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

mongoose.connect(process.env.MONGODB_STRING);
mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas'));

app.use("/users", userRoutes);
app.use("/workouts", workoutRoutes); // Ensure this matches the route file name

if(require.main === module){
    app.listen(process.env.PORT || 3000, () => {
        console.log(`API is now online on port ${ process.env.PORT || 3000 }`)
    });
}

module.exports = { app, mongoose };