require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// ====================================
// SERVER VERSION
// ====================================
console.log("========== SERVER VERSION 5 ==========");

// ====================================
// Connect MongoDB
// ====================================
connectDB();

// ====================================
// Request Logger
// ====================================
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

// ====================================
// CORS Configuration
// ====================================
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'https://carbon-project-rho.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Enable CORS
app.use(cors(corsOptions));

// ❌ REMOVE THIS LINE
// app.options('*', cors(corsOptions));

// ====================================
// Middleware
// ====================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================================
// Debug Routes
// ====================================
app.get('/', (req, res) => {
    console.log('✅ GET /');
    res.send('Backend Working');
});

app.get('/api/test', (req, res) => {
    console.log('✅ GET /api/test');

    res.json({
        success: true,
        message: 'API is working'
    });
});

app.get('/api/health', (req, res) => {
    console.log('✅ GET /api/health');

    res.json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// ====================================
// AUTH ROUTES DEBUG
// ====================================
let authRoutes;

try {

    authRoutes = require('./routes/auth');

    console.log('✅ Auth router loaded successfully');
    console.log('Router Type:', typeof authRoutes);

    app.use('/api/auth', (req, res, next) => {
        console.log(`🔥 AUTH ROUTE HIT -> ${req.method} ${req.originalUrl}`);
        next();
    });

    app.use('/api/auth', authRoutes);

} catch (err) {

    console.error('❌ Failed to load auth routes');
    console.error(err);

}

// ====================================
// Other API Routes
// ====================================
app.use('/api/energy', require('./routes/energy'));
app.use('/api/energy-log', require('./routes/energyLog'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/ecobot', require('./routes/ecobot'));
app.use('/api/documents', require('./routes/documents'));

// ====================================
// 404 Handler
// ====================================
app.use((req, res) => {

    console.log(`❌ Route Not Found -> ${req.method} ${req.originalUrl}`);

    res.status(404).json({
        success: false,
        message: 'Route Not Found',
        method: req.method,
        url: req.originalUrl
    });

});

// ====================================
// Global Error Handler
// ====================================
app.use((err, req, res, next) => {

    console.error('❌ Global Error');
    console.error(err.stack);

    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });

});

// ====================================
// Start Server
// ====================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`🚀 Carbonil Pasumai Server running on port ${PORT}`);

});