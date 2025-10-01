import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    title:{
        type:String,
        required:true,

    },
    img:{
        type:String,
        default:null,
    },
    text:{
        type:String,
        required:true,
    },
    likes:{
        type:[mongoose.Schema.ObjectId],
        ref:"User",
        default:[],

    },
    commentCount:{
        type:Number,
        default:0,
    }
},{timestamps:true})

const Post=mongoose.model('Post',postSchema)
export default Post