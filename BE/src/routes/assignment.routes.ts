import { Router } from 'express'
import multer from 'multer'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import { UPLOAD_MAX_SIZE_MB } from '../config/env'
import {
  listAssignmentsByCourse,
  createAssignment,
  patchAssignment,
  deleteAssignment,
  listAssignmentSubmissions,
  submitAssignment,
  gradeAssignmentSubmission,
  listClassPostsByCourse,
  createClassPost,
  addClassPostComment,
  downloadAssignmentAttachment,
  downloadClassPostAttachment
} from '../controllers/assignment.controller'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_MAX_SIZE_MB * 1024 * 1024 }
})

const router = Router()

router.use(authMiddleware)

router.get('/course/:courseId', listAssignmentsByCourse)
router.post('/', upload.array('files'), requireRole('lecturer', 'manager', 'admin'), createAssignment)
router.patch('/:id', upload.array('files'), requireRole('lecturer', 'manager', 'admin'), patchAssignment)
router.delete('/:id', requireRole('lecturer', 'manager', 'admin'), deleteAssignment)

router.get('/:id/submissions', listAssignmentSubmissions)
router.post('/:id/submit', upload.single('file'), submitAssignment)
router.patch('/submissions/:submissionId/grade', requireRole('lecturer', 'manager', 'admin'), gradeAssignmentSubmission)
router.get('/:id/attachments/:attachmentIndex/download', downloadAssignmentAttachment)

router.get('/class-posts/course/:courseId', listClassPostsByCourse)
router.post('/class-posts', upload.array('files'), createClassPost)
router.get('/class-posts/:id/attachments/:attachmentIndex/download', downloadClassPostAttachment)
router.post('/class-posts/:id/comments', addClassPostComment)

export default router
