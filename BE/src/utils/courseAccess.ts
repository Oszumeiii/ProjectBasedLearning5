import pool from '../config/db'
import type { UserRole } from './jwt'

export interface CourseRow {
  id: number
  lecturer_id: number
}

/** Admin / manager: toàn quyền lớp */
export function isCourseAdminRole(role: UserRole): boolean {
  return role === 'admin' || role === 'manager'
}

/** GV chủ nhiệm hoặc trong course_lecturers */
export async function canLecturerManageCourse(
  userId: number,
  course: CourseRow
): Promise<boolean> {
  const lecturerId = Number(course.lecturer_id)
  const uid = Number(userId)
  if (lecturerId === uid) return true
  const r = await pool.query(
    'SELECT 1 FROM course_lecturers WHERE course_id = $1 AND lecturer_id = $2 LIMIT 1',
    [Number(course.id), uid]
  )
  return r.rows.length > 0
}

/** Xem/sửa lớp: admin, manager, GV chủ hoặc GV phụ */
export async function canManageCourse(
  userId: number,
  role: UserRole,
  course: CourseRow
): Promise<boolean> {
  if (isCourseAdminRole(role)) return true
  if (role === 'lecturer') return canLecturerManageCourse(userId, course)
  return false
}

/** Sinh viên đã enroll (bất kỳ trạng thái nào còn trong lớp) */
export async function isStudentEnrolled(
  courseId: number,
  studentId: number
): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM enrollments
     WHERE course_id = $1 AND student_id = $2
       AND status NOT IN ('dropped', 'rejected')`,
    [courseId, studentId]
  )
  return r.rows.length > 0
}
