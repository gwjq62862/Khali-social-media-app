import express from 'express'
import { protectRoute } from '../middleware/ProtuctRoute.js'
import { deleteNotification, getNoti } from '../controller/notification.controller.js'
const router=express.Router()
router.get('/',protectRoute,getNoti)
router.delete('/',protectRoute,deleteNotification)
export default router