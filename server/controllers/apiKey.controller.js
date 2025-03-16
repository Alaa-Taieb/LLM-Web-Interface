const ApiKey = require('../models/apiKey.model');

const apiKeyController = {
    // Get all API keys for a user
    getAllKeys: async (req, res) => {
        try {
            const keys = await ApiKey.find({ user: req.user._id })
                .select('_id name createdAt lastUsed')  // Include _id in the selection
                .sort('-createdAt');
            res.json(keys);
        } catch (error) {
            console.error('Error fetching API keys:', error);
            res.status(500).json({ message: 'Error fetching API keys' });
        }
    },

    // Add a new API key
    addKey: async (req, res) => {
        try {
            const { name, key } = req.body;
            
            // Validate required fields
            if (!key) {
                return res.status(400).json({ message: 'API key is required' });
            }

            // Check if user already has this key
            const existingKey = await ApiKey.findOne({
                user: req.user._id,
                key: key
            });

            if (existingKey) {
                return res.status(400).json({ message: 'This API key already exists' });
            }

            const newApiKey = new ApiKey({
                name: name || 'Default Key',
                key,
                user: req.user._id
            });

            await newApiKey.save();
            
            res.status(201).json({
                id: newApiKey._id,
                name: newApiKey.name,
                createdAt: newApiKey.createdAt
            });
        } catch (error) {
            console.error('Error adding API key:', error);
            res.status(500).json({ message: 'Error adding API key' });
        }
    },

    // Delete an API key
    deleteKey: async (req, res) => {
        try {
            const key = await ApiKey.findOne({
                _id: req.params.id,
                user: req.user._id
            });

            if (!key) {
                return res.status(404).json({ message: 'API key not found' });
            }

            await key.deleteOne();
            res.json({ message: 'API key deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting API key' });
        }
    },

    // Verify an API key
    verifyKey: async (req, res) => {
        try {
            const { key } = req.body;
            const apiKey = await ApiKey.findOne({
                key,
                user: req.user._id
            });

            if (!apiKey) {
                return res.status(404).json({ message: 'API key not found' });
            }

            // Update last used timestamp
            apiKey.lastUsed = new Date();
            await apiKey.save();

            res.json({ valid: true });
        } catch (error) {
            res.status(500).json({ message: 'Error verifying API key' });
        }
    },

    // Get a specific API key
    getKey: async (req, res) => {
        try {
            const key = await ApiKey.findOne({
                _id: req.params.id,
                user: req.user._id
            }).select('key');  // Only select the key field

            if (!key) {
                return res.status(404).json({ message: 'API key not found' });
            }

            res.json({ key: key.key });  // Return the actual key value
        } catch (error) {
            console.error('Error fetching API key:', error);
            res.status(500).json({ message: 'Error fetching API key' });
        }
    }
};

module.exports = apiKeyController;