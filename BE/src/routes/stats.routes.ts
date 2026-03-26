import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { overviewStats } from '../controllers/stats.controller'
import { requireRole } from '../middlewares/role.middleware'

const router = Router()

router.get('/overview', authMiddleware, requireRole('admin', 'manager'), overviewStats)

export default router

