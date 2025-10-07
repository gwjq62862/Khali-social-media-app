import express from 'express'
import path from'path'
import authRoutes from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import postRouter from './routes/post.route.js'
import commentRouter from './routes/comment.route.js'
import notificationRouter from'./routes/notification.route.js'
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
const _dirname=path.resolve()
//express.json() is to parse json from req.body
app.use(express.json({limit:"5mb"}))
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use('/api/auth', authRoutes)

app.use('/api/users', userRouter)
app.use('/api/posts',postRouter)
app.use('/api/comments',commentRouter)
app.use('/api/notification',notificationRouter)
if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(_dirname,"/frontend/dist")))
  app.get(/.*/,(req,res)=>{
    res.sendFile(path.resolve(_dirname,"frontend","dist","index.html"))
  })
}
app.listen(PORT)
await ConnectDB()
console.log(`your server is running on Port${PORT}`)