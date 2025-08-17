import 'dotenv/config'
import express, { urlencoded } from 'express';
import connectDB from './connection.js';
import urlRouter from './routes/url.js';
import userRouter from './routes/user.js';
import cors from "cors"
const app = express();
const port = process.env.PORT || 8000;

//connection
connectDB();

const allowedOrigins = [
  'https://shortly-jade-tau.vercel.app',
  'http://localhost:5173',
];

app.use(cors({
    origin: allowedOrigins, 
    methods: 'GET,POST,PUT,DELETE',
}));

app.use(express.urlencoded({extended:false}))

app.use(express.json());

app.use('/api/user', userRouter);
app.use('/api', urlRouter);

app.listen(port, () => {console.log('Server is running on port ', port)});