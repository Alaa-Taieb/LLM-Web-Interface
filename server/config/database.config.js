/**
 * Database Configuration
 * Establishes and manages MongoDB connection using Mongoose.
 * Connects to MongoDB Atlas cluster using environment variables for credentials.
 * @module config/database.config
 */

const mongoose = require('mongoose');

/**
 * Database connection configuration
 * Retrieves connection parameters from environment variables:
 * - DB: Database name
 * - ATLAS_USERNAME: MongoDB Atlas username
 * - ATLAS_PASSWORD: MongoDB Atlas password
 * @type {Object}
 */
const dbName = process.env.DB;
const username = process.env.ATLAS_USERNAME;
const password = process.env.ATLAS_PASSWORD;

/**
 * MongoDB Atlas connection URI
 * Format: mongodb+srv://<username>:<password>@testing.lcn9q.mongodb.net/<dbName>
 * Includes retry writes and majority write concern for reliability
 * @type {string}
 */
const uri = `mongodb+srv://${username}:${password}@testing.lcn9q.mongodb.net/${dbName}?retryWrites=true&w=majority`;

/**
 * Establishes connection to MongoDB Atlas
 * Uses Mongoose to create and manage the database connection
 * Logs success or failure status to console
 * 
 * @async
 * @function connect
 * @throws {Error} If connection fails
 * 
 * @example
 * // Successful connection
 * Successfully connected to llm-chat ✅
 * 
 * // Failed connection
 * Failed to connect to llm-chat ❌
 */
mongoose.connect(uri)
    .then(() => console.log(`Successfully connected to ${dbName} ✅`))
    .catch(() => console.log(`Failed to connect to ${dbName} ❌`));

// Export mongoose instance for use in other modules
module.exports = mongoose;
