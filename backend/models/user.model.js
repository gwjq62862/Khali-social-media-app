
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    fullname: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minLength: [6, 'Password must be at least 6 characters long.']
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    follower: {
        type:[ mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: [],
    }, 
    following: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: [],
    },
     profileImg:{
        type:String,
        default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
     },
     coverImg:{
        type:String,
        default:""
     },
     bio:{
        type:String,
        default:""
     },
     link:{
        type:String,
        default:""
     },likedPosts:{
        type:mongoose.Schema.ObjectId,
        ref:"Post",
        default:[]
     }
}, { timeStamp: true })


const User=mongoose.model("User",UserSchema)
export default User;