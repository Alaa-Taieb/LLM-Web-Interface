const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKey.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth); // Protect all routes

router.get('/', apiKeyController.getAllKeys);
router.post('/', apiKeyController.addKey);
router.get('/:id', apiKeyController.getKey);
router.delete('/:id', apiKeyController.deleteKey);
router.post('/verify', apiKeyController.verifyKey);

module.exports = router;