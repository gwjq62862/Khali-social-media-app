import express from 'express'
import authRoutes from './routes/auth.route.js'
import { ConnectDB } from './db/connectDb.js'
import dotenv from'dotenv'
const app=express()
const PORT=process.env.PORT ||3000
dotenv.config()


app.use('/api/auth',authRoutes)

app.listen(PORT)
await ConnectDB()
console.log(`your server is running on Port${PORT}`)