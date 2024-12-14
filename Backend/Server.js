const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log the URI to debug (remove in production)
console.log('MongoDB URI:', process.env.MONGO_URI);

// Database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB successfully");
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB:", error.message);
    });

// Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/events", require("./routes/events"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

