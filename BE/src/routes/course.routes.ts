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
router.post('/', authMiddleware, requireRole('lecturer', 'admin'), createCourse)

// Sửa/xóa lớp — lecturer owner + admin (check trong controller)
router.put('/:id', authMiddleware, requireRole('lecturer', 'admin'), updateCourse)
router.delete('/:id', authMiddleware, requireRole('lecturer', 'admin'), deleteCourse)

// Thêm/xóa sinh viên — lecturer owner + admin
router.post('/:id/enroll', authMiddleware, requireRole('lecturer', 'admin'), enrollStudent)
router.delete('/:id/unenroll/:studentId', authMiddleware, requireRole('lecturer', 'admin'), unenrollStudent)

export default router
