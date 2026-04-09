import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import {
  createCourse,
  listCourses,
  getMyCourses,
  getCourseById,
  patchCourse,
  deleteCourse,
  joinCourseByCode,
  enrollOrRequestEnrollment,
  updateEnrollmentStatus,
  bulkUpdateEnrollmentStatus,
  updateEnrollmentGrade,
  unenrollStudent,
  getMyEnrollments,
  getCourseStudents,
  addCourseLecturer,
  removeCourseLecturer
} from '../controllers/course.controller'
import {
  listEvaluationCriteria,
  createEvaluationCriterion,
  updateEvaluationCriterion,
  deleteEvaluationCriterion,
  reorderEvaluationCriteria
} from '../controllers/evaluationCriteria.controller'

const router = Router()

const staffCreate = requireRole('lecturer', 'manager', 'admin')

// —— Phải khai báo trước /:id ——
router.get('/my', authMiddleware, getMyCourses)
router.get('/my/enrollments', authMiddleware, getMyEnrollments)

router.patch('/enrollments/:enrollmentId/status', authMiddleware, updateEnrollmentStatus)
router.patch('/enrollments/:enrollmentId/grade', authMiddleware, updateEnrollmentGrade)

router.post('/joinByEnrollmentCode', authMiddleware, joinCourseByCode)
router.post('/join', authMiddleware, joinCourseByCode)

router.get('/', authMiddleware, listCourses)

router.post('/', authMiddleware, staffCreate, createCourse)

router.get('/:id/evaluation-criteria', authMiddleware, listEvaluationCriteria)
router.post('/:id/evaluation-criteria', authMiddleware, staffCreate, createEvaluationCriterion)
router.patch('/:id/evaluation-criteria/:criteriaId', authMiddleware, staffCreate, updateEvaluationCriterion)
router.delete('/:id/evaluation-criteria/:criteriaId', authMiddleware, staffCreate, deleteEvaluationCriterion)
router.patch('/:id/evaluation-criteria/reorder', authMiddleware, staffCreate, reorderEvaluationCriteria)

router.get('/:id/students', authMiddleware, getCourseStudents)
router.post('/:id/lecturers', authMiddleware, staffCreate, addCourseLecturer)
router.delete('/:id/lecturers/:userId', authMiddleware, staffCreate, removeCourseLecturer)

router.post('/:id/enroll', authMiddleware, enrollOrRequestEnrollment)
router.patch('/:id/enrollments/bulk-status', authMiddleware, staffCreate, bulkUpdateEnrollmentStatus)
router.delete('/:id/unenroll/:studentId', authMiddleware, unenrollStudent)

router.get('/:id', authMiddleware, getCourseById)
router.patch('/:id', authMiddleware, staffCreate, patchCourse)
router.put('/:id', authMiddleware, staffCreate, patchCourse)
router.delete('/:id', authMiddleware, staffCreate, deleteCourse)

export default router
