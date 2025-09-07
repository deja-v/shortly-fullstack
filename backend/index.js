import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB  from './connection.js';
import urlRoutes, { validateShortId } from './routes/url.js';
import authRoutes from './routes/user.js';
import { handleRedirect } from './controllers/url.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1); 

const allowedOrigins = [
  "http://localhost:5173",
  "https://shortly-jade-tau.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE",
  })
);app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api/user', authRoutes);
app.use('/api', urlRoutes);

app.get('/:shortId', 
    validateShortId,
    handleRedirect
);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});