import express from 'express'
import { protectRoute } from '../middleware/ProtuctRoute.js'
import { followUnfollowUser, getSuggestedUser, getUserProfile, updateUserProfile } from '../controller/user.controller.js'
const router =express.Router()


router.get('/profile/:username',protectRoute,getUserProfile)
router.get('/suggested',protectRoute,getSuggestedUser)
router.post('/follow/:id',protectRoute,followUnfollowUser)
router.post('/update',protectRoute,updateUserProfile)
export default router