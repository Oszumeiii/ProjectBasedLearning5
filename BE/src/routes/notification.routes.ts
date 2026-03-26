import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import {
  listMyNotifications, markAsRead, markAllAsRead, deleteNotification
} from '../controllers/notification.controller'

const router = Router()

router.use(authMiddleware)

router.get('/', listMyNotifications)
router.patch('/read-all', markAllAsRead)
router.patch('/:id/read', markAsRead)
router.delete('/:id', deleteNotification)

export default router
