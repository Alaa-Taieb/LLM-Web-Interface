
const express = require('express');
const groqController = require('../controllers/groqController');

const router = express.Router();

// Define the route for sending messages to the Groq API
router.post('/sendMessage', groqController.sendMessage);

module.exports = router;
