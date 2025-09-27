import User from "../models/user.model.js"
import jwt from 'jsonwebtoken'
export const protectRoute=async(req,res,next)=>{
    try {
        const token=req.cookies.jwt
        if(!token){
            return res.status(401).json({message:"unauthorized access"})
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
      if(!decoded){
        return res.status(401).json({message:"unauthorized access"})
      }
      const user=await User.findById(decoded.userId).select('-password')
      if(!user){
        return res.status(401).json({message:"user not found"})
      }
      req.user=user
        next()
    } catch (error) {
        console.log('error in protect route middleware',error)
        res.status(401).json({message:"unauthorized access"})
    }
}