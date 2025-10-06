import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
export const signup = async (req, res) => {
    try {
        const { username, fullname, password, email } = req.body;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "username already taken" });
        }
        const exsitingEmail = await User.findOne({ email })
        if (exsitingEmail) {
            return res.status(400).json({ message: 'email is alredy taken' })
        }
     
            if(password.length < 6){
                return res.status(400).json({ message: 'password must be at least 6 characters long' })
            }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            username,
            fullname,
            password: hashPassword,
            email,
        });
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save()
            res.status(200).json({
                _id: newUser._id,
                username: newUser.username,
                fullname: newUser.fullname,
                email: newUser.email,
                follower: newUser.follower,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
                bio: newUser.bio,
                link: newUser.link,
            })
        } else {
            res.status(400).json({ message: 'inviald user data ' })
        }

    } catch (error) {
        console.log('error  in sign up controller', error)
        res.status(500).json({ message: 'internal server error' })
    }
}

export const login = async (req, res) => {
   try {
    const {username,password}=req.body
    const user=await User.findOne({username})
     if(!user){
        return res.status(400).json({message:'username does not exist'})
     }
    
    const isMath=await bcrypt.compare(password,user?.password||"")
    if(!isMath){
       return res.status(400).json({message:'invaild password or username'})
    }
    generateTokenAndSetCookie(user._id,res)
    res.status(200).json({
        username:user.username,
        follower:user.follower,
        following:user.following,
        profileImg:user.profileImg,
        coverImg:user.coverImg,
        bio:user.bio,
        link:user.link,
        _id:user._id,
        fullname:user.fullname,
        email:user.email,
    })
   } catch (error) {
     console.log('error  in login controller', error)
        res.status(500).json({ message: 'internal server error' })
   }
}

export const logout = async (req, res) => {
   try {
    res.cookie('jwt',"",{maxAge: 0,})
    res.status(200).json({ message: 'logout successful' })
   } catch (error) {
    console.log('errror in logout controller',error)
    res.status(500).json({message:"internal server error"})
   }
}
export const getMe=async(req,res)=>{
   try {
     const user=await User.findById(req.user._id).select('-password')
     res.status(200).json(user)
   } catch (error) {
    console.error('error in getme controller',error)
    res.status(500).json({message:"Internla server error"})
   }
}