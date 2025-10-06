import express from 'express'
import { protectRoute } from '../middleware/ProtuctRoute.js'
import { deleteNotification, getNoti, getUnreadCount } from '../controller/notification.controller.js'
const router=express.Router()
router.get('/',protectRoute,getNoti)
router.delete('/',protectRoute,deleteNotification)
router.get('/unread-count',protectRoute,getUnreadCount)
export default router