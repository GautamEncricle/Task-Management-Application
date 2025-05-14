const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'config.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const authRouter = require("./routes/authRouters");
const taskRouter = require("./routes/taskRouter");
const adminRouter = require("./routes/adminRouter");

const app = express();

// CORS configuration
// Update allowedOrigins array - make sure to include ALL frontend URLs
const allowedOrigins = [
    'http://localhost:5173',
    'https://task-management-application-five-beta.vercel.app',
    'https://task-management-application-91iz-iz8u5b9y7.vercel.app',
    'https://task-management-application-mocha.vercel.app'
];

// Enhanced CORS middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    maxAge: 86400 // 24 hours
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint - useful for debugging connections
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.status(200).send('Task Management API is running');
});

// Database connection
const connectDB = async () => {
    try {
        const DB = process.env.DATABASE;
        if (!DB) {
            throw new Error("DATABASE environment variable not set!");
        }

        await mongoose.connect(DB, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
        });
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
};

// Connect to database
connectDB();

// For local development
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

// Export app for Vercel
module.exports = app;