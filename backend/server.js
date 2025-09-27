import express from 'express'
import authRoutes from './routes/auth.route.js'
import { ConnectDB } from './db/connectDb.js'
import dotenv from'dotenv'
import cookieParser from 'cookie-parser'
const app=express()
const PORT=process.env.PORT ||5000
dotenv.config()
//express.json() is to parse json from req.body
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use('/api/auth',authRoutes)




app.listen(PORT)
await ConnectDB()
console.log(`your server is running on Port${PORT}`)