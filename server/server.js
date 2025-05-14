const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const authRouter = require("./routes/authRouters");
const taskRouter = require("./routes/taskRouter");
const adminRouter = require("./routes/adminRouter");
const bodyParser = require('body-parser')


const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://task-management-application-five-beta.vercel.app',
        'https://task-management-application-91iz-iz8u5b9y7.vercel.app',
        'https://task-management-application-mocha.vercel.app'

    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Handle preflight requests
app.options('*', cors());

app.use(cookieParser());
app.use(express.json({ limit: '30mb', extended: true }))
app.use(express.urlencoded({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))

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