require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/energy', require('./routes/energy'));
app.use('/api/energy-log', require('./routes/energyLog'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/ecobot', require('./routes/ecobot'));
app.use('/api/documents', require('./routes/documents'));

// =======================
// Health Check
// =======================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// =======================
// Debug Routes
// =======================
app.get('/', (req, res) => {
    res.send('Backend Working');
});

app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working'
    });
});

console.log('========== SERVER VERSION 2 ==========');

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Carbonil Pasumai Server running on port ${PORT}`);
});