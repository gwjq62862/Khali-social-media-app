import express from 'express'
import { createComment, deleteComment,  getcm, likeComment } from '../controller/comment.route.js'
import { protectRoute } from '../middleware/ProtuctRoute.js'


const router=express.Router()
router.get('/getcm/:postId',getcm)
router.post('/createComment/:postId',protectRoute,createComment)
router.post('/likescm/:cmId',protectRoute,likeComment)
router.delete('/deleteComment/:cmId',protectRoute,deleteComment)
export default router