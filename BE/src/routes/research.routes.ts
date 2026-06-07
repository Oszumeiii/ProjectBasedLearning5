import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import {
  listResearchPapers, getResearchPaperById, createResearchPaper,
  updateResearchPaper, updateResearchPaperStatus, assignResearchSupervisor,
  deleteResearchPaper
} from '../controllers/research.controller'

const router = Router()

router.use(authMiddleware)

router.get('/', listResearchPapers)
router.get('/:id', getResearchPaperById)
router.post('/', createResearchPaper)
router.put('/:id', updateResearchPaper)

// Đổi status + gán DOI — staff
router.patch('/:id/status', requireRole('lecturer', 'manager', 'admin'), updateResearchPaperStatus)

// Gán GV hướng dẫn NCKH — staff
router.patch('/:id/supervisor', requireRole('lecturer', 'manager', 'admin'), assignResearchSupervisor)

router.delete('/:id', deleteResearchPaper)

export default router
