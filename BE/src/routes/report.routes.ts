import { Router } from 'express'
import multer from 'multer'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import { UPLOAD_MAX_SIZE_MB } from '../config/env'
import {
  createReport, listReports, getReportById, updateReport, deleteReport,
  updateReportStatus, resubmitReport, downloadReport,
  listReportVersions, downloadReportVersion,
  addFavorite, removeFavorite
} from '../controllers/report.controller'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_MAX_SIZE_MB * 1024 * 1024 }
})

const router = Router()

router.use(authMiddleware)

// CRUD
router.get('/', listReports)
router.get('/:id', getReportById)
router.post('/', upload.single('file'), createReport)
router.patch('/:id', updateReport)
router.delete('/:id', deleteReport)

// Workflow duyệt (staff only)
router.patch('/:id/status', requireRole('lecturer', 'manager', 'admin'), updateReportStatus)

// Nộp lại (tác giả)
router.post('/:id/resubmit', upload.single('file'), resubmitReport)

// Download (presigned URL)
router.get('/:id/download', downloadReport)

// Versions
router.get('/:id/versions', listReportVersions)
router.get('/:id/versions/:versionId/download', downloadReportVersion)

// Favorites
router.post('/:id/favorite', addFavorite)
router.delete('/:id/favorite', removeFavorite)

export default router
