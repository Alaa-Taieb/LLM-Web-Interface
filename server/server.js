// --- Imports ---
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const groqRoutes = require('./routes/groqRoutes');

// --- Configuration ---
dotenv.config();

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
