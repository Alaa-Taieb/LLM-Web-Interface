// --- Imports ---
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const groqRoutes = require('./routes/groqRoutes');
// const connectDB = require('./config/database'); // Import the database connection function
require('./config/database.config.js');
// --- Configuration ---

// --- Connect to Database ---
// connectDB(); // Connect to MongoDB

// --- Express App ---
const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/api/groq', groqRoutes);

app.get('/', (req, res) => {
    res.send('Server is running!');
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
