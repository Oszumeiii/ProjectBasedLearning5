import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import { requireOwnership } from '../middlewares/ownership.middleware'
import {
  addFavorite,
  createReport,
  deleteReport,
  getReportById,
  getReportVersionById,
  listReportVersions,
  listReports,
  removeFavorite,
  updateReport,
  getRatings,
  upsertRating
} from '../controllers/report.controller'

const router = Router()

// Xem — tất cả user đã đăng nhập
router.get('/', authMiddleware, listReports)
router.get('/:id', authMiddleware, getReportById)

// Tạo — tất cả user đã đăng nhập (report gắn với project)
router.post('/', authMiddleware, createReport)

// Sửa/xóa — chủ báo cáo (SV) hoặc GV / quản lý khoa / admin
router.put('/:id', authMiddleware, requireOwnership, updateReport)
router.delete('/:id', authMiddleware, requireOwnership, deleteReport)

// Đánh giá — GV, quản lý khoa, admin
router.post('/:id/rating', authMiddleware, requireRole('lecturer', 'manager', 'admin'), upsertRating)
router.get('/:id/ratings', authMiddleware, getRatings)

// Yêu thích — tất cả user đã đăng nhập
router.post('/:id/favorite', authMiddleware, addFavorite)
router.delete('/:id/favorite', authMiddleware, removeFavorite)

// Lịch sử phiên bản — tất cả user đã đăng nhập
router.get('/:id/versions', authMiddleware, listReportVersions)
router.get('/:id/versions/:versionId', authMiddleware, getReportVersionById)

export default router
