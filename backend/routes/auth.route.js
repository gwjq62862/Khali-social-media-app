import express from 'express'
import { login, signup, logout, getMe } from '../controller/auth.controller.js'
import { protectRoute } from '../middleware/ProtuctRoute.js'
const router = express.Router()
router.get('/Me',protectRoute,getMe)
router.post('/signup', signup)

router.post('/login', login)

router.post('/logout', logout)


export default router