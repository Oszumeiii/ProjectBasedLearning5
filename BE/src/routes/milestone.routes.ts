import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import {
  listMilestones, createMilestone, bulkCreateMilestones,
  updateMilestone, updateMilestoneStatus, deleteMilestone
} from '../controllers/milestone.controller'

const router = Router()

router.use(authMiddleware)

// Milestones theo project
router.get('/project/:projectId', listMilestones)
router.post('/project/:projectId', createMilestone)
router.post('/project/:projectId/bulk', bulkCreateMilestones)

// CRUD từng milestone
router.put('/:id', updateMilestone)
router.patch('/:id/status', updateMilestoneStatus)
router.delete('/:id', deleteMilestone)

export default router
