// --- Imports ---
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const groqRoutes = require('./routes/groqRoutes');
const authRoutes = require('./routes/auth.routes');
const apiKeyRoutes = require('./routes/apiKey.routes');
require('./config/database.config.js');
// --- Configuration ---

// --- Connect to Database ---
// connectDB(); // Connect to MongoDB

// --- Express App ---
const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
    origin: 'http://localhost:3000', // Your React app's URL
    credentials: true, // Important for cookies/credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- Routes ---
app.use('/api/groq', groqRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/keys', apiKeyRoutes);
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
