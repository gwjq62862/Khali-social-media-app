import express from 'express'
import authRoutes from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import { ConnectDB } from './db/connectDb.js'
import dotenv from 'dotenv'
import { v2 as cloudinary } from 'cloudinary';
import cookieParser from 'cookie-parser'
const app = express()
const PORT = process.env.PORT || 5000
dotenv.config()
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//express.json() is to parse json from req.body
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use('/api/auth', authRoutes)

app.use('/api/users', userRouter)



app.listen(PORT)
await ConnectDB()
console.log(`your server is running on Port${PORT}`)