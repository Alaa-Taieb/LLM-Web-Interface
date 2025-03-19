/**
 * User Model
 * Defines the schema and methods for user documents in MongoDB.
 * Supports both local authentication and Google OAuth.
 * @module models/user.model
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * @typedef {Object} UserSchema
 */
const userSchema = new mongoose.Schema({
    /**
     * User's email address
     * @type {String}
     * @required
     * @unique
     * @indexed For better query performance
     * @trim Removes whitespace
     * @lowercase Ensures consistent email format
     */
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },

    /**
     * User's hashed password
     * Required only for local authentication (non-Google users)
     * @type {String}
     * @required {Function} Returns true if googleId is not present
     */
    password: {
        type: String,
        required: function() {
            return !this.googleId;
        }
    },

    /**
     * Google OAuth ID
     * Present only for users who sign up/login with Google
     * @type {String}
     * @unique
     * @sparse Allows null values while maintaining uniqueness
     */
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },

    /**
     * User's full name
     * @type {String}
     * @required
     */
    name: {
        type: String,
        required: true
    },

    /**
     * User's avatar URL
     * Optional, typically set for Google users
     * @type {String}
     */
    avatar: {
        type: String
    },

    /**
     * Account creation timestamp
     * @type {Date}
     * @default Current timestamp
     */
    createdAt: {
        type: Date,
        default: Date.now
    },

    /**
     * Last login timestamp
     * Updated on each successful login
     * @type {Date}
     */
    lastLogin: {
        type: Date
    }
});

/**
 * Pre-save middleware to hash password before saving
 * Only hashes the password if it has been modified
 * @function
 * @async
 */
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

/**
 * Compare provided password with stored hash
 * @method comparePassword
 * @async
 * @param {string} candidatePassword - The password to verify
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * User Model
 * @typedef {mongoose.Model} UserModel
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
