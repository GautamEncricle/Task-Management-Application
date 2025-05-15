const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const authRouter = require("./routes/authRouters");
const taskRouter = require("./routes/taskRouter");
const adminRouter = require("./routes/adminRouter")
const globalErrorHandler = require("./utils/globalErrorHandler");
const app = express();

/* app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
})); */

app.use(cors({
    origin: ['http://localhost:5173', process.env.FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}))
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/tasks', taskRouter);

const PORT = process.env.PORT || 5000;
const DB = process.env.DATABASE;

app.use(globalErrorHandler);

if (!DB) {
    console.error("❌ DATABASE environment variable not set!");
    process.exit(1);
}

mongoose.connect(DB)
    .then(() => {
        console.log("✅ MongoDB connected");
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });