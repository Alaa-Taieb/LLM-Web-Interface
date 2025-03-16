const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authController = {
    register: async (req, res) => {
        try {
            const { email, password, name } = req.body;

            // Case-insensitive email check
            const existingUser = await User.findOne({ 
                email: { $regex: new RegExp(`^${email}$`, 'i') }
            });
            
            if (existingUser) {
                return res.status(400).json({ 
                    message: 'Email already registered. Please login or use a different email.' 
                });
            }

            const user = new User({
                email: email.toLowerCase(), // Store email in lowercase
                password,
                name
            });

            await user.save();

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error creating account', error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user || !(await user.comparePassword(password))) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            user.lastLogin = new Date();
            await user.save();

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error logging in', error: error.message });
        }
    },

    googleAuth: async (req, res) => {
        try {
            const { credential } = req.body;
            
            if (!credential) {
                return res.status(400).json({ message: 'No credential provided' });
            }

            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            
            const payload = ticket.getPayload();
            const { email, name, picture: avatar, sub: googleId } = payload;

            // Case-insensitive email check
            let user = await User.findOne({ 
                email: { $regex: new RegExp(`^${email}$`, 'i') }
            });
            
            if (user) {
                // If user exists but doesn't have googleId, update it
                if (!user.googleId) {
                    user.googleId = googleId;
                    user.avatar = avatar;
                    await user.save();
                }
            } else {
                // Create new user
                user = await User.create({
                    email: email.toLowerCase(),
                    name,
                    avatar,
                    googleId
                });
            }

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar
                }
            });
        } catch (error) {
            console.error('Google auth error:', error);
            res.status(400).json({ 
                message: 'Error authenticating with Google',
                error: error.message 
            });
        }
    },

    getUser: async (req, res) => {
        try {
            const userId = req.params.userId;
            const user = await User.findById(userId).select('-password');
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user', error: error.message });
        }
    }
};

module.exports = authController;