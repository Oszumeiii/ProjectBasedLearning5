import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import {
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
  getMyEnrollments
} from '../controllers/course.controller'

const router = Router()

// Xem lớp — tất cả user (filter theo role trong controller)
router.get('/', authMiddleware, listCourses)

// Lớp tôi đã tham gia — student
router.get('/my/enrollments', authMiddleware, getMyEnrollments)

// Chi tiết lớp — thành viên + lecturer + admin
router.get('/:id', authMiddleware, getCourseById)

// Tạo lớp — chỉ lecturer + admin
router.post('/', authMiddleware, requireRole('lecturer', 'manager', 'admin'), createCourse)

// Sửa/xóa lớp — lecturer owner + admin (check trong controller)
router.put('/:id', authMiddleware, requireRole('lecturer', 'manager', 'admin'), updateCourse)
router.delete('/:id', authMiddleware, requireRole('lecturer', 'manager', 'admin'), deleteCourse)

// Thêm/xóa sinh viên — chủ nhiệm / quản lý khoa / admin
router.post('/:id/enroll', authMiddleware, requireRole('lecturer', 'manager', 'admin'), enrollStudent)
router.delete('/:id/unenroll/:studentId', authMiddleware, requireRole('lecturer', 'manager', 'admin'), unenrollStudent)

export default router
