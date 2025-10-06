import Comment from "../models/comment.model.js"
import Notification from "../models/notification.model.js"
import Post from "../models/post.model.js"
import User from "../models/user.model.js"

export const createComment = async (req, res) => {
    try {
        const { text, parent } = req.body
        const userId = req.user._id
        const postId = req.params.postId
        const post = await Post.findById(postId)
        const user = await User.findById(userId)
        if (!userId) {
            return res.status(404).json({ message: "User not found" })

        }
        if (!post) {
            return res.status(404).json({ message: "post not found" })
        }
        if (!text) {
            return res.status(400).json({ message: "text is require" })
        }
        let parentId = null
        if (parent) {
            const parentComment = await Comment.findById(parent)
            if (!parentComment) {
                return res.status(404).json({ message: "parent comment not found" })
            }
            parentId = parentComment._id
        }
        if (user._id.toString() !== post.user.toString()) {
            const isreply = parentId ? true : false
            const newNotification = new Notification({
                from: userId,
                to: post.user,
                message: `${user.username} is ${isreply ? "replied" : "commented"} on your ${isreply ? "comment" : "post"}`,
                type: 'comment',
            })
            await newNotification.save()
        }

        const newComment = new Comment({
            text,
            user: userId,
            post: postId,
            parent: parentId,

        })

        await newComment.save()
        await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } })
        res.status(201).json({ message: "comment created successfully" })
    } catch (error) {
        console.log('error in createComment controller', error)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const likeComment = async (req, res) => {
    try {
        const userId = req.user._id
        const cmId = req.params.cmId
        const comment = await Comment.findById(cmId)
        const user = await User.findById(userId)
        if (!comment) {
            return res.status(400).json({ message: "comment not found" })
        }
        const isLiked = comment.likes.includes(userId)
        if (isLiked) {
            const updateResponse = await Comment.findByIdAndUpdate(cmId, { $pull: { likes: userId } }, { new: true })
            res.status(200).json({ message: "comment unliked successfully", likeCount: updateResponse.likes.length })
        }
        else {
            const updateResponse = await Comment.findByIdAndUpdate(cmId, { $push: { likes: userId } }, { new: true })
            res.status(200).json({ message: "comment liked successfully", likeCount: updateResponse.likes.length })
            const newNoti = new Notification({
                from: userId,
                to: comment.user,
                message: `${user.username} is liked your comment`,
                type: "like",
            })
            await newNoti.save()
            res.status(200).json({ message: "you liked the comment successfully" })
        }
    } catch (error) {
        console.log('erorr in likecomment controller ', error)
        res.status(500).json({ message: error.message })
    }
}
const deleteReplycm = async (commentId) => {
  let count = 1; 
  const replies = await Comment.find({ parent: commentId });

  for (let reply of replies) {
    count += await deleteReplycm(reply._id); 
  }

  await Comment.findByIdAndDelete(commentId);

  return count; 
};

export const deleteComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const cmId = req.params.cmId;
    const comment = await Comment.findById(cmId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (userId.toString() !== comment.user.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this comment" });
    }

  
    const deletedCount = await deleteReplycm(cmId);

    if (comment.post) {
      await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -deletedCount } });
    }

    res.status(200).json({ message: `Deleted ${deletedCount} comment(s) successfully` });
  } catch (error) {
    console.log("error in deleteComment controller ", error);
    res.status(500).json({ message: error.message });
  }
};

export const getcm = async (req, res) => {
    try {
        const postId = req.params.postId
        const comments = await Comment.find({ post: postId }).populate({ path: "user", select: '-password' })
        if (comments.length < 1) {
            return res.status(200).json({ message: "no comment create yet" })
        }
        res.status(200).json(comments)
    } catch (error) {
        console.log('error in getcm controller', error)
        res.status(500).json({ message: "Internal server error" })
    }
}