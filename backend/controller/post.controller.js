import { getPublicIdFromUrl } from "../lib/utils/getPublicIdfromUrl.js"
import Notification from "../models/notification.model.js"
import Post from "../models/post.model.js"
import User from "../models/user.model.js"
import { v2 as cloudinary } from "cloudinary"
export const createPost = async (req, res) => {
    try {

        const { title, text } = req.body


        const imageFileBuffer = req.file?.buffer;

        const userId = req.user._id

        if (!userId) {

            return res.status(404).json({ message: "User not found" })
        }
        if (!title || !text) {

            return res.status(400).json({ message: "Title and text are required" })
        }

        let imgUrl = null;


        if (imageFileBuffer) {
            try {

                const base64Image = `data:${req.file.mimetype};base64,${imageFileBuffer.toString('base64')}`;


                const uploadResponse = await cloudinary.uploader.upload(base64Image, {
                    folder: "posts"
                })
                imgUrl = uploadResponse.secure_url

            } catch (error) {
                console.error('error in uploading to Cloudinary:', error)

                return res.status(500).json({ message: "Failed to upload image" })
            }
        }


        const newPost = new Post({
            title,
            text,
            user: userId,
            img: imgUrl,
        })

        await newPost.save()
        res.status(201).json(newPost)

    } catch (error) {
        console.error("erorr in createPost controller:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this post" })
        }
        if (post.img) {
            try {
                const imgid = getPublicIdFromUrl(post.img, "posts")
                await cloudinary.uploader.destroy(imgid)
            } catch (error) {
                console.error('errorr in deleting post phot in cloudinary', error)
                return res.status(500).json({ message: "Internal server erorr" })
            }
        }
        await post.deleteOne()
        res.status(200).json({ message: "your post is successfully delted" })
    } catch (error) {
        console.log('erorr in delepost controller', error)
        res.status(500).json({ message: "Internal server erorr" })
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const postId = req.params.postId
        const userId = req.user._id
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ message: "post not found" })
        }
        const user = await User.findById(userId)
        const isLiked = post.likes.includes(userId)
        if (isLiked) {
            const updatePost = await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } }, { new: true });
            await User.findByIdAndUpdate(userId, { $pull: { likedPosts: postId } }, { new: true })
            res.status(200).json({ message: "post unlike successfully", likeCount: updatePost.likes.length })
        } else {
            const updatePost = await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } }, { new: true });
            await User.findByIdAndUpdate(userId, { $addToSet: { likedPosts: postId } }, { new: true });

            if (userId.toString() !== post.user.toString()) {
                const newNoti = new Notification({
                    from: userId,
                    to: post.user,
                    type: "like",
                    message: `${user.username} liked your post ${post.title}`
                })
                await newNoti.save()
            }



            res.status(200).json({ message: "post liked successfully", likeCount: updatePost.likes.length })
        }



    } catch (error) {
        console.log('erorr in likeUnlike controller', error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const getAllPost = async (req, res) => {
    try {
        const AllPost = await Post.find().sort({ createdAt: -1 }).populate({ path: "user", select: "-password" })
        res.status(200).json(AllPost)
    } catch (error) {
        console.log('erorr in getAllpost controller', error)
        res.status(500).json({ message: "internal server error" })
    }
}

export const getFollowedPost = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        const followeduser = user.following
        if (!followeduser || followeduser.length === 0) {
            return res.status(200).json({ message: "No posts yet", posts: [] });
        }
        const allpost = await Post.find({ user: { $in: followeduser } }).populate({ path: "user", select: "-password" }).sort({ createdAt: -1 })

        res.status(200).json({ posts: allpost });
    } catch (error) {
        console.log('erorr in gettingAllPost', error)
        res.status(500).json({ message: error.message })
    }
}

export const getUserOwnPost = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        const ownPosts = await Post.find({ user: user._id })
            .populate({ path: "user", select: "-password" })
            .sort({ createdAt: -1 });


        const likedPosts = await User.findById(user._id)
            .populate({
                path: "likedPosts",
                populate: { path: "user", select: "-password" },
                options: { sort: { createdAt: -1 } },
            })
            .select("likedPosts");

        res.status(200).json({
            ownPosts,
            likedPosts: likedPosts.likedPosts,
        });
    } catch (error) {
        console.log("Error in getUserOwnPost controller", error);
        res.status(500).json({ message: error.message });
    }
};
