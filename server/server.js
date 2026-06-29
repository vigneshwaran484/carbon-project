require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// ===============================
// Request Logger
// ===============================
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// Connect MongoDB
// ===============================
connectDB();

// ===============================
// API Routes
// ===============================
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

// ===============================
// Debug Routes
// ===============================
app.get('/', (req, res) => {
    console.log('✅ GET / route executed');
    res.send('Backend Working');
});

app.get('/api/test', (req, res) => {
    console.log('✅ GET /api/test route executed');

    res.status(200).json({
        success: true,
        message: 'API is working'
    });
});

app.get('/api/health', (req, res) => {
    console.log('✅ GET /api/health route executed');

    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// ===============================
// 404 Handler
// ===============================
app.use((req, res) => {
    console.log(`❌ No Route Matched -> ${req.method} ${req.originalUrl}`);

    res.status(404).json({
        success: false,
        message: 'Route Not Found',
        method: req.method,
        url: req.originalUrl
    });
});

console.log("========== SERVER VERSION 3 ==========");

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Carbonil Pasumai Server running on port ${PORT}`);
});