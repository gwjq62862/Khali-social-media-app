import express from'express'
import { protectRoute } from "../middleware/ProtuctRoute.js"

import { createPost, deletePost, getAllPost, getFollowedPost, getUserOwnPost, likeUnlikePost } from "../controller/post.controller.js"
const router=express.Router()
router.get('/all',getAllPost)
router.get('/following',protectRoute,getFollowedPost)
router.get('/userpost/:username',protectRoute,getUserOwnPost)
router.post('/createPost',protectRoute,createPost)

router.post('/likes/:postId',protectRoute,likeUnlikePost)
router.delete('/deletePost/:id',protectRoute,deletePost)
export default router