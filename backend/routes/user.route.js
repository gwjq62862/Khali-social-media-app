import express from 'express'
import { protectRoute } from '../middleware/ProtuctRoute.js'
import { followUnfollowUser, getSuggestedUser, getUserProfile, updateUserProfile } from '../controller/user.controller.js'
import multer from 'multer';
const router =express.Router()
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } 
});

router.get('/profile/:username',protectRoute,getUserProfile)
router.get('/suggested',protectRoute,getSuggestedUser)
router.post('/follow/:id',protectRoute,followUnfollowUser)
router.put('/update',protectRoute,   upload.fields([
        { name: 'profileImg', maxCount: 1 }, 
        { name: 'coverImg', maxCount: 1 }
    ]),updateUserProfile)
export default router