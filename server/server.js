const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const authRouter = require("./routes/authRouters");

dotenv.config();
const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 5000;
const DB = process.env.DATABASE;
mongoose.connect(DB)
    .then((conn) => {
        app.listen(PORT, () => console.log(`The server running in port ${PORT}`));
    })
    .catch((error) => {
        console.error(`Error occurred 💥: ${error}`);
    })