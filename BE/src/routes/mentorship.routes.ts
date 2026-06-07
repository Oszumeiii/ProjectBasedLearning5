import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import {
  listMentorships, createMentorship, updateMentorshipStatus, deleteMentorship
} from '../controllers/mentorship.controller'

const router = Router()

router.use(authMiddleware)

router.get('/', listMentorships)

// Tạo / sửa / xóa — chỉ staff
router.post('/', requireRole('lecturer', 'manager', 'admin'), createMentorship)
router.patch('/:id/status', requireRole('lecturer', 'manager', 'admin'), updateMentorshipStatus)
router.delete('/:id', requireRole('lecturer', 'manager', 'admin'), deleteMentorship)

export default router
