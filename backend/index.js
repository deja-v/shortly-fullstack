import 'dotenv/config'
import express, { urlencoded } from 'express';
import connectDB from './connection.js';
import urlRouter from './routes/url.js';
const app = express();
const port = process.env.PORT || 8000;

//connection
connectDB();

app.use(express.urlencoded({extended:false}))

app.use(express.json());

app.use('/api', urlRouter);

app.listen(port, () => {console.log('Server is running on port ', port)});