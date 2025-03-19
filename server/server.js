/**
 * Main server application file.
 * Sets up Express server with middleware, routes, and database connection.
 * @module server
 */

// --- Imports ---
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const groqRoutes = require('./routes/groqRoutes');
const authRoutes = require('./routes/auth.routes');
const apiKeyRoutes = require('./routes/apiKey.routes');

// Load environment variables
dotenv.config();

// Initialize database connection
require('./config/database.config.js');

/**
 * Express application instance
 * @type {express.Application}
 */
const app = express();

/**
 * Server port number from environment variables or default to 5000
 * @type {number}
 */
const port = process.env.PORT || 5000;

// --- Middleware Configuration ---

/**
 * CORS configuration for cross-origin requests
 * Allows requests only from the React client application
 */
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// --- Route Definitions ---

/**
 * Mount API routes
 * - /api/groq: Groq API related endpoints
 * - /api/auth: Authentication related endpoints
 * - /api/keys: API key management endpoints
 */
app.use('/api/groq', groqRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/keys', apiKeyRoutes);

/**
 * Health check endpoint
 * @route GET /
 * @returns {string} Server status message
 */
app.get('/', (req, res) => {
    res.send('Server is running!');
});

/**
 * Start the server and listen for incoming requests
 */
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

module.exports = app;
