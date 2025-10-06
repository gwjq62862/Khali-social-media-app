import express from'express'
import { protectRoute } from "../middleware/ProtuctRoute.js"

import { createPost, deletePost, getAllPost, getFollowedPost, getUserOwnPost, likeUnlikePost } from "../controller/post.controller.js"
import multer from 'multer';
const router=express.Router()
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.get('/all',getAllPost)
router.get('/following',protectRoute,getFollowedPost)
router.get('/userpost/:username',protectRoute,getUserOwnPost)
router.post('/createPost',protectRoute,upload.single('img'),createPost)

router.post('/likes/:postId',protectRoute,likeUnlikePost)
router.delete('/deletePost/:id',protectRoute,deletePost)
export default router