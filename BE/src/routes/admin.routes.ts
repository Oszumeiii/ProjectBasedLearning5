import { Router } from 'express'
import multer from 'multer'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import {
  importStudents,
  importLecturers,
  listImportBatches,
  getImportBatchById,
  resendActivation
} from '../controllers/import.controller'
import {
  listUsers,
  getUserById,
  updateUserStatus,
  createUser,
  deleteUser
} from '../controllers/admin.controller'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true)
    } else {
      cb(new Error('Chỉ chấp nhận file CSV'))
    }
  }
})

const router = Router()

// ─── Tất cả route admin yêu cầu đăng nhập + quyền admin hoặc manager ───
router.use(authMiddleware, requireRole('admin', 'manager'))

// ─── Import CSV ───
router.post('/import-students', upload.single('file'), importStudents)
router.post('/import-lecturers', upload.single('file'), importLecturers)

// ─── Import batch history ───
router.get('/import-batches', listImportBatches)
router.get('/import-batches/:id', getImportBatchById)

// ─── Gửi lại email kích hoạt ───
router.post('/resend-activation', resendActivation)

// ─── Quản lý user ───
router.get('/users', listUsers)
router.get('/users/:id', getUserById)
router.post('/users', createUser)
router.patch('/users/:id/status', updateUserStatus)
router.delete('/users/:id', deleteUser)

export default router
