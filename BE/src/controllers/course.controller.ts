import type { Request, Response } from 'express'
import crypto from 'crypto'
import pool from '../config/db'
import { isCourseModerator } from '../utils/roles'
import { canManageCourse, isCourseAdminRole, isStudentEnrolled, type CourseRow } from '../utils/courseAccess'

/** 6 ký tự, tránh nhầm 0/O, 1/I/l — giống mã lớp nhiều trường */
const ENROLL_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const ENROLL_CODE_LEN = 6

async function generateUniqueEnrollmentCode(): Promise<string> {
  for (let attempt = 0; attempt < 100; attempt++) {
    let s = ''
    for (let i = 0; i < ENROLL_CODE_LEN; i++) {
      s += ENROLL_CODE_CHARS[crypto.randomInt(0, ENROLL_CODE_CHARS.length)]
    }
    const dup = await pool.query(
      `SELECT 1 FROM courses WHERE UPPER(enrollment_code) = UPPER($1) AND deleted_at IS NULL`,
      [s]
    )
    if (dup.rows.length === 0) return s
  }
  throw new Error('Không tạo được mã tham gia lớp duy nhất')
}

const COURSE_CODE_PREFIXES: Record<string, string> = {
  project: 'DA',
  thesis: 'KL',
  research: 'NC',
  internship: 'TT'
}

async function generateUniqueCourseCode(courseType: string, semester: string): Promise<string> {
  const prefix = COURSE_CODE_PREFIXES[courseType] ?? 'LP'
  const semTag = semester.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8)
  for (let attempt = 0; attempt < 100; attempt++) {
    let rand = ''
    for (let i = 0; i < 4; i++) {
      rand += ENROLL_CODE_CHARS[crypto.randomInt(0, ENROLL_CODE_CHARS.length)]
    }
    const code = `${prefix}-${semTag}-${rand}`
    const dup = await pool.query(
      `SELECT 1 FROM courses WHERE UPPER(code) = UPPER($1) AND deleted_at IS NULL`,
      [code]
    )
    if (dup.rows.length === 0) return code
  }
  throw new Error('Không tạo được mã học phần duy nhất')
}

async function loadCourseRow(id: number): Promise<(CourseRow & Record<string, unknown>) | null> {
  if (!Number.isFinite(id) || id <= 0) return null
  const r = await pool.query(`SELECT * FROM courses WHERE id = $1 AND deleted_at IS NULL`, [id])
  return r.rows[0] ?? null
}

const ENROLLMENT_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['active', 'rejected', 'dropped'],
  active: ['dropped', 'completed', 'failed'],
  rejected: ['active'],
  dropped: ['active'],
  completed: [],
  failed: []
}

function canTransitionEnrollmentStatus(from: string, to: string): boolean {
  if (from === to) return true
  return (ENROLLMENT_STATUS_TRANSITIONS[from] ?? []).includes(to)
}

// ==================== CRUD Lớp học phần ====================

/**
 * Tạo lớp — thesis: chỉ manager/admin; project/research/internship: lecturer+
 */
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const { name, code, description, semester, academicYear, courseType, maxStudents } = req.body as {
      name?: string
      code?: string
      description?: string
      semester?: string
      academicYear?: string
      courseType?: string
      maxStudents?: number
    }

    if (!name || !semester?.trim() || !academicYear?.trim()) {
      res.status(400).json({ message: 'name, semester và academicYear là bắt buộc' })
      return
    }

    const ctype = (courseType ?? 'project').toLowerCase()
    const allowedTypes = ['project', 'thesis', 'research', 'internship'] as const
    if (!allowedTypes.includes(ctype as (typeof allowedTypes)[number])) {
      res.status(400).json({ message: 'courseType phải là: project | thesis | research | internship' })
      return
    }

    if (ctype === 'thesis' && req.user.role !== 'manager' && req.user.role !== 'admin') {
      res.status(403).json({
        message: 'Chỉ quản lý (manager) hoặc admin được tạo lớp loại khóa luận (thesis)'
      })
      return
    }

    if (!['lecturer', 'manager', 'admin'].includes(req.user.role)) {
      res.status(403).json({ message: 'Không có quyền tạo lớp' })
      return
    }

    let finalCode: string
    if (code?.trim()) {
      const existing = await pool.query('SELECT id FROM courses WHERE code = $1 AND deleted_at IS NULL', [code.trim()])
      if (existing.rows.length > 0) {
        res.status(409).json({ message: `Mã lớp "${code}" đã tồn tại` })
        return
      }
      finalCode = code.trim()
    } else {
      finalCode = await generateUniqueCourseCode(ctype, semester.trim())
    }

    const enrollmentCode = await generateUniqueEnrollmentCode()

    let cap = 30
    if (maxStudents != null && !Number.isNaN(Number(maxStudents))) {
      cap = Math.min(500, Math.max(1, Math.floor(Number(maxStudents))))
    }

    const result = await pool.query(
      `INSERT INTO courses (
         name, code, description, semester, academic_year, course_type,
         lecturer_id, created_by, enrollment_code, max_students
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        name,
        finalCode,
        description ?? null,
        semester.trim(),
        academicYear.trim(),
        ctype,
        req.user.id,
        req.user.id,
        enrollmentCode,
        cap
      ]
    )

    const course = result.rows[0] as { id: number }

    await pool.query(
      `INSERT INTO course_lecturers (course_id, lecturer_id, role_in_course)
       VALUES ($1, $2, 'supervisor')
       ON CONFLICT (course_id, lecturer_id, role_in_course) DO NOTHING`,
      [course.id, req.user.id]
    )

    const lecturer = await pool.query('SELECT full_name, email FROM users WHERE id = $1', [req.user.id])
    const row = result.rows[0] as Record<string, unknown>
    row.lecturer_name = lecturer.rows[0]?.full_name ?? null

    res.status(201).json(row)
  } catch (error) {
    console.error('❌ Error in createCourse:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * GET /courses — filter: semester, course_type, lecturer_id (moderator)
 */
export const listCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const semester = req.query.semester as string | undefined
    const course_type = req.query.course_type as string | undefined
    const lecturer_id = req.query.lecturer_id ? Number(req.query.lecturer_id) : undefined

    if (isCourseModerator(req.user.role)) {
      const conds: string[] = ['c.deleted_at IS NULL']
      const params: unknown[] = []
      let p = 1
      if (semester?.trim()) {
        conds.push(`c.semester = $${p++}`)
        params.push(semester.trim())
      }
      if (course_type?.trim()) {
        conds.push(`c.course_type = $${p++}`)
        params.push(course_type.trim().toLowerCase())
      }
      if (lecturer_id != null && !Number.isNaN(lecturer_id)) {
        conds.push(`c.lecturer_id = $${p++}`)
        params.push(lecturer_id)
      }
      const sql = `
        SELECT c.*, u.full_name AS lecturer_name, u.email AS lecturer_email,
               COUNT(e.id) FILTER (WHERE e.status NOT IN ('dropped', 'rejected'))::int AS student_count
        FROM courses c
        LEFT JOIN users u ON u.id = c.lecturer_id
        LEFT JOIN enrollments e ON e.course_id = c.id
        WHERE ${conds.join(' AND ')}
        GROUP BY c.id, u.full_name, u.email
        ORDER BY c.created_at DESC
      `
      const result = await pool.query(sql, params)
      res.json({ items: result.rows })
      return
    }

    if (req.user.role === 'lecturer') {
      const conds: string[] = ['c.deleted_at IS NULL', `(c.lecturer_id = $1 OR EXISTS (
          SELECT 1 FROM course_lecturers cl WHERE cl.course_id = c.id AND cl.lecturer_id = $1))`]
      const params: unknown[] = [req.user.id]
      let p = 2
      if (semester?.trim()) {
        conds.push(`c.semester = $${p++}`)
        params.push(semester.trim())
      }
      if (course_type?.trim()) {
        conds.push(`c.course_type = $${p++}`)
        params.push(course_type.trim().toLowerCase())
      }
      if (lecturer_id != null && !Number.isNaN(lecturer_id)) {
        conds.push(`c.lecturer_id = $${p++}`)
        params.push(lecturer_id)
      }
      const sql = `
        SELECT c.*, u.full_name AS lecturer_name, u.email AS lecturer_email,
               COUNT(e.id) FILTER (WHERE e.status NOT IN ('dropped', 'rejected'))::int AS student_count
        FROM courses c
        LEFT JOIN users u ON u.id = c.lecturer_id
        LEFT JOIN enrollments e ON e.course_id = c.id
        WHERE ${conds.join(' AND ')}
        GROUP BY c.id, u.full_name, u.email
        ORDER BY c.created_at DESC
      `
      const result = await pool.query(sql, params)
      res.json({ items: result.rows })
      return
    }

    const result = await pool.query(
      `SELECT c.*, u.full_name AS lecturer_name, u.email AS lecturer_email,
              e.enrolled_at, e.status AS enrollment_status,
              COUNT(e2.id) FILTER (WHERE e2.status NOT IN ('dropped', 'rejected'))::int AS student_count
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN users u ON u.id = c.lecturer_id
       LEFT JOIN enrollments e2 ON e2.course_id = c.id
       WHERE e.student_id = $1 AND c.deleted_at IS NULL
       GROUP BY c.id, u.full_name, u.email, e.enrolled_at, e.status
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    )
    res.json({ items: result.rows })
  } catch (error) {
    console.error('❌ Error in listCourses:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * GET /courses/my — SV: lớp đã ghi danh; GV: lớp đang dạy; Manager/Admin: toàn bộ (có filter)
 */
export const getMyCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const semester = req.query.semester as string | undefined
    const course_type = req.query.course_type as string | undefined

    if (req.user.role === 'student') {
      const conds: string[] = ['e.student_id = $1', 'c.deleted_at IS NULL']
      const params: unknown[] = [req.user.id]
      let p = 2
      if (semester?.trim()) {
        conds.push(`c.semester = $${p++}`)
        params.push(semester.trim())
      }
      if (course_type?.trim()) {
        conds.push(`c.course_type = $${p++}`)
        params.push(course_type.trim().toLowerCase())
      }
      const sql = `
        SELECT c.*, u.full_name AS lecturer_name, u.email AS lecturer_email,
               e.enrolled_at, e.status AS enrollment_status,
               COUNT(e2.id) FILTER (WHERE e2.status NOT IN ('dropped', 'rejected'))::int AS student_count
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        LEFT JOIN users u ON u.id = c.lecturer_id
        LEFT JOIN enrollments e2 ON e2.course_id = c.id
        WHERE ${conds.join(' AND ')}
        GROUP BY c.id, u.full_name, u.email, e.enrolled_at, e.status
        ORDER BY e.enrolled_at DESC
      `
      const result = await pool.query(sql, params)
      res.json({ items: result.rows })
      return
    }

    if (req.user.role === 'lecturer') {
      const conds: string[] = ['c.deleted_at IS NULL', `(c.lecturer_id = $1 OR EXISTS (
          SELECT 1 FROM course_lecturers cl WHERE cl.course_id = c.id AND cl.lecturer_id = $1))`]
      const params: unknown[] = [req.user.id]
      let p = 2
      if (semester?.trim()) {
        conds.push(`c.semester = $${p++}`)
        params.push(semester.trim())
      }
      if (course_type?.trim()) {
        conds.push(`c.course_type = $${p++}`)
        params.push(course_type.trim().toLowerCase())
      }
      const sql = `
        SELECT c.*, u.full_name AS lecturer_name, u.email AS lecturer_email,
               COUNT(e.id) FILTER (WHERE e.status NOT IN ('dropped', 'rejected'))::int AS student_count
        FROM courses c
        LEFT JOIN users u ON u.id = c.lecturer_id
        LEFT JOIN enrollments e ON e.course_id = c.id
        WHERE ${conds.join(' AND ')}
        GROUP BY c.id, u.full_name, u.email
        ORDER BY c.created_at DESC
      `
      const result = await pool.query(sql, params)
      res.json({ items: result.rows })
      return
    }

    // manager / admin
    const conds: string[] = ['c.deleted_at IS NULL']
    const params: unknown[] = []
    let p = 1
    if (semester?.trim()) {
      conds.push(`c.semester = $${p++}`)
      params.push(semester.trim())
    }
    if (course_type?.trim()) {
      conds.push(`c.course_type = $${p++}`)
      params.push(course_type.trim().toLowerCase())
    }
    const sql = `
      SELECT c.*, u.full_name AS lecturer_name, u.email AS lecturer_email,
             COUNT(e.id) FILTER (WHERE e.status NOT IN ('dropped', 'rejected'))::int AS student_count
      FROM courses c
      LEFT JOIN users u ON u.id = c.lecturer_id
      LEFT JOIN enrollments e ON e.course_id = c.id
      WHERE ${conds.join(' AND ')}
      GROUP BY c.id, u.full_name, u.email
      ORDER BY c.created_at DESC
    `
    const result = await pool.query(sql, params)
    res.json({ items: result.rows })
  } catch (error) {
    console.error('❌ Error in getMyCourses:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * Chi tiết lớp + sinh viên + tiêu chí đánh giá (nếu có quyền xem)
 */
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const id = Number(req.params.id)
    if (!Number.isFinite(id) || id <= 0 || !Number.isInteger(id)) {
      res.status(400).json({ message: 'Mã lớp không hợp lệ' })
      return
    }

    const courseResult = await pool.query(
      `SELECT c.*, u.full_name AS lecturer_name, u.email AS lecturer_email
       FROM courses c
       LEFT JOIN users u ON u.id = c.lecturer_id
       WHERE c.id = $1 AND c.deleted_at IS NULL`,
      [id]
    )

    if (courseResult.rows.length === 0) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    const course = courseResult.rows[0] as CourseRow & Record<string, unknown>

    if (req.user.role === 'student') {
      const ok = await isStudentEnrolled(id, req.user.id)
      if (!ok) {
        res.status(403).json({ message: 'Bạn chưa tham gia lớp này' })
        return
      }
    } else if (!isCourseAdminRole(req.user.role)) {
      const can = await canManageCourse(req.user.id, req.user.role, course as CourseRow)
      if (!can) {
        res.status(403).json({ message: 'Không có quyền xem lớp này' })
        return
      }
    }

    const studentsResult = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.major,
              e.enrolled_at, e.status AS enrollment_status, e.id AS enrollment_id,
              e.final_grade, e.final_score
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       WHERE e.course_id = $1
       ORDER BY e.enrolled_at ASC`,
      [id]
    )

    let reportCount = 0
    try {
      const rc = await pool.query('SELECT COUNT(*)::int AS count FROM reports WHERE course_id = $1', [id])
      reportCount = rc.rows[0]?.count ?? 0
    } catch {
      /* Bảng reports có thể chưa có trên DB dev — không chặn chi tiết lớp */
    }

    const assistants = await pool.query(
      `SELECT cl.lecturer_id, cl.role_in_course, cl.assigned_at, u.full_name, u.email
       FROM course_lecturers cl
       JOIN users u ON u.id = cl.lecturer_id
       WHERE cl.course_id = $1
       ORDER BY cl.role_in_course, cl.lecturer_id`,
      [id]
    )

    const criteria = await pool.query(
      `SELECT id, name, description, weight, max_score, order_index
       FROM evaluation_criteria WHERE course_id = $1 ORDER BY order_index, id`,
      [id]
    )

    res.json({
      ...course,
      student_count: studentsResult.rows.length,
      students: studentsResult.rows,
      report_count: reportCount,
      course_lecturers: assistants.rows,
      evaluation_criteria: criteria.rows
    })
  } catch (error) {
    console.error('❌ Error in getCourseById:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/** GET /courses/:id/students — danh sách enrollment có trạng thái */
export const getCourseStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const courseId = Number(req.params.id)
    const course = await loadCourseRow(courseId)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }
    const ok = await canManageCourse(req.user.id, req.user.role, course as CourseRow)
    if (!ok) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const result = await pool.query(
      `SELECT e.id AS enrollment_id, e.status, e.enrolled_at, e.final_grade, e.final_score,
              u.id AS student_id, u.full_name, u.email, u.major
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       WHERE e.course_id = $1
       ORDER BY e.enrolled_at ASC`,
      [courseId]
    )
    res.json({ items: result.rows })
  } catch (error) {
    console.error('❌ getCourseStudents:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const patchCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const id = Number(req.params.id)
    const course = await loadCourseRow(id)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    const ok = await canManageCourse(req.user.id, req.user.role, course as CourseRow)
    if (!ok) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const {
      name,
      description,
      semester,
      academicYear,
      maxStudents,
      isActive,
      courseType,
      submissionStart,
      submissionEnd,
      defenseDate
    } = req.body as Record<string, unknown>

    if (courseType != null) {
      const ctype = String(courseType).toLowerCase()
      if (ctype === 'thesis' && !isCourseAdminRole(req.user.role)) {
        res.status(403).json({ message: 'Chỉ manager/admin đổi loại lớp sang thesis' })
        return
      }
    }

    const maxStudentsVal =
      maxStudents !== undefined && maxStudents !== null
        ? Math.min(500, Math.max(1, Math.floor(Number(maxStudents))))
        : null

    const result = await pool.query(
      `UPDATE courses SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         semester = COALESCE($3, semester),
         academic_year = COALESCE($4, academic_year),
         max_students = COALESCE($5, max_students),
         is_active = COALESCE($6, is_active),
         course_type = COALESCE($7, course_type),
         submission_start = COALESCE($8, submission_start),
         submission_end = COALESCE($9, submission_end),
         defense_date = COALESCE($10, defense_date),
         updated_at = NOW()
       WHERE id = $11 AND deleted_at IS NULL
       RETURNING *`,
      [
        name ?? null,
        description ?? null,
        semester ?? null,
        academicYear ?? null,
        maxStudentsVal,
        isActive != null ? Boolean(isActive) : null,
        courseType != null ? String(courseType).toLowerCase() : null,
        submissionStart ?? null,
        submissionEnd ?? null,
        defenseDate ?? null,
        id
      ]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ patchCourse:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/** Alias PUT → PATCH */
export const updateCourse = patchCourse

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const id = Number(req.params.id)
    const course = await loadCourseRow(id)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    const ok = await canManageCourse(req.user.id, req.user.role, course as CourseRow)
    if (!ok) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const result = await pool.query(
      'UPDATE courses SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    res.json({ message: 'Đã lưu trữ lớp (soft delete)' })
  } catch (error) {
    console.error('❌ Error in deleteCourse:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ==================== Join Course ====================

export const joinCourseByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    if (req.user.role !== 'student') {
      res.status(403).json({ message: 'Chỉ sinh viên dùng mã tham gia' })
      return
    }

    const { courseCode } = req.body as { courseCode: string }
    const studentId = req.user.id

    if (!courseCode?.trim()) {
      res.status(400).json({ message: 'Vui lòng nhập mã tham gia lớp học' })
      return
    }

    const raw = courseCode.trim().toUpperCase().replace(/\s+/g, '')
    if (!raw || raw.length < 4) {
      res.status(400).json({ message: 'Mã tham gia quá ngắn' })
      return
    }
    if (raw.length > 64) {
      res.status(400).json({ message: 'Mã nhập quá dài' })
      return
    }

    /** Khớp mã tham gia 6 ký tự HOẶC mã học phần (code) đầy đủ — sinh viên có thể dùng một trong hai */
    const courseQuery = await pool.query(
      `SELECT id, name, max_students, is_active
       FROM courses
       WHERE deleted_at IS NULL
         AND (
           (enrollment_code IS NOT NULL AND UPPER(TRIM(enrollment_code)) = $1)
           OR UPPER(TRIM(code)) = $1
         )`,
      [raw]
    )

    if (courseQuery.rows.length === 0) {
      res.status(404).json({
        message:
          'Không tìm thấy lớp. Dùng đúng mã 6 ký tự (mã tham gia) hoặc mã học phần đầy đủ do giảng viên cung cấp.'
      })
      return
    }

    const course = courseQuery.rows[0] as {
      id: number
      name: string
      max_students: number
      is_active: boolean
    }

    if (!course.is_active) {
      res.status(400).json({ message: 'Lớp đang đóng, không thể tham gia' })
      return
    }

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS count FROM enrollments
       WHERE course_id = $1 AND status = 'active'`,
      [course.id]
    )

    if (countRes.rows[0].count >= course.max_students) {
      res.status(400).json({ message: 'Lớp đã đủ sĩ số' })
      return
    }

    const checkEnroll = await pool.query(
      `SELECT id, status FROM enrollments WHERE course_id = $1 AND student_id = $2`,
      [course.id, studentId]
    )

    if (checkEnroll.rows.length > 0) {
      const existing = checkEnroll.rows[0] as { id: number; status: string }
      if (existing.status === 'dropped' || existing.status === 'rejected') {
        await pool.query(`UPDATE enrollments SET status = 'active' WHERE id = $1`, [existing.id])
        res.status(200).json({ message: `Tham gia lại thành công lớp: ${course.name}` })
        return
      }
      res.status(400).json({ message: 'Bạn đã đăng ký hoặc đang chờ duyệt lớp này' })
      return
    }

    const inserted = await pool.query(
      `INSERT INTO enrollments (course_id, student_id, status)
       VALUES ($1, $2, 'active')
       ON CONFLICT (course_id, student_id) DO NOTHING
       RETURNING id`,
      [course.id, studentId]
    )

    if (inserted.rows.length === 0) {
      const latest = await pool.query(
        `SELECT status FROM enrollments WHERE course_id = $1 AND student_id = $2 LIMIT 1`,
        [course.id, studentId]
      )
      const status = latest.rows[0]?.status
      if (status === 'dropped' || status === 'rejected') {
        await pool.query(
          `UPDATE enrollments SET status = 'active' WHERE course_id = $1 AND student_id = $2`,
          [course.id, studentId]
        )
        res.status(200).json({ message: `Tham gia lại thành công lớp: ${course.name}` })
        return
      }
      res.status(400).json({ message: 'Bạn đã đăng ký hoặc đang chờ duyệt lớp này' })
      return
    }

    res.status(201).json({ message: `Tham gia thành công lớp: ${course.name}` })
  } catch (error) {
    console.error('❌ JoinCourse Error:', error)
    res.status(500).json({ message: 'Lỗi hệ thống khi tham gia lớp học' })
  }
}

// ==================== Enrollment ====================

/**
 * POST /courses/:id/enroll
 * - Student (không body): ghi danh chờ duyệt (pending)
 * - Staff: thêm SV (studentId | email) → active
 */
export const enrollOrRequestEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const courseId = Number(req.params.id)
    const courseRow = await loadCourseRow(courseId)
    if (!courseRow) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    const course = courseRow as CourseRow

    // --- Sinh viên tự đăng ký ---
    if (req.user.role === 'student') {
      const { studentId, email } = req.body as { studentId?: number; email?: string }
      if (studentId != null || email) {
        res.status(400).json({ message: 'Sinh viên chỉ gửi yêu cầu ghi danh (không kèm studentId/email)' })
        return
      }

      const dup = await pool.query(
        `SELECT id, status FROM enrollments WHERE course_id = $1 AND student_id = $2`,
        [courseId, req.user.id]
      )
      if (dup.rows.length > 0) {
        const existing = dup.rows[0] as { id: number; status: string }
        if (existing.status === 'dropped' || existing.status === 'rejected') {
          await pool.query(`UPDATE enrollments SET status = 'pending' WHERE id = $1`, [existing.id])
          res.status(200).json({
            message: 'Đã gửi lại yêu cầu ghi danh, chờ duyệt',
            enrollment: { ...existing, status: 'pending' }
          })
          return
        }
        res.status(200).json({ message: 'Bạn đã có bản ghi ghi danh cho lớp này', enrollment: dup.rows[0] })
        return
      }

      const countRes = await pool.query(
        `SELECT COUNT(*)::int AS c FROM enrollments
         WHERE course_id = $1 AND status = 'active'`,
        [courseId]
      )
      const maxS = Number((courseRow as Record<string, unknown>).max_students ?? 30)
      if (countRes.rows[0].c >= maxS) {
        res.status(400).json({ message: 'Lớp đã đủ sĩ số' })
        return
      }

      if (!(courseRow as Record<string, unknown>).is_active) {
        res.status(400).json({ message: 'Lớp không mở ghi danh' })
        return
      }

      const ins = await pool.query(
        `INSERT INTO enrollments (course_id, student_id, status)
         VALUES ($1, $2, 'pending')
         ON CONFLICT (course_id, student_id) DO NOTHING
         RETURNING id, course_id, student_id, status, enrolled_at`,
        [courseId, req.user.id]
      )

      if (ins.rows.length === 0) {
        const existing = await pool.query(
          `SELECT id, status, course_id, student_id, enrolled_at
           FROM enrollments
           WHERE course_id = $1 AND student_id = $2
           LIMIT 1`,
          [courseId, req.user.id]
        )
        res.status(200).json({ message: 'Bạn đã có bản ghi ghi danh cho lớp này', enrollment: existing.rows[0] })
        return
      }

      res.status(201).json({ message: 'Đã gửi yêu cầu ghi danh, chờ duyệt', enrollment: ins.rows[0] })
      return
    }

    // --- Staff thêm sinh viên ---
    const can = await canManageCourse(req.user.id, req.user.role, course)
    if (!can) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const { studentId, email } = req.body as { studentId?: number; email?: string }

    let targetStudentId: number | undefined
    if (studentId) {
      targetStudentId = studentId
    } else if (email) {
      const student = await pool.query("SELECT id FROM users WHERE email = $1 AND role = 'student'", [
        email.trim().toLowerCase()
      ])
      if (student.rows.length === 0) {
        res.status(404).json({ message: `Không tìm thấy sinh viên với email` })
        return
      }
      targetStudentId = student.rows[0].id
    } else {
      res.status(400).json({ message: 'studentId hoặc email là bắt buộc' })
      return
    }

    const userCheck = await pool.query(
      'SELECT id, full_name, email, role FROM users WHERE id = $1 AND deleted_at IS NULL',
      [targetStudentId]
    )
    if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'student') {
      res.status(400).json({ message: 'User không hợp lệ' })
      return
    }

    const ex = await pool.query(
      `SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2`,
      [courseId, targetStudentId]
    )
    if (ex.rows.length > 0) {
      await pool.query(
        `UPDATE enrollments SET status = 'active' WHERE id = $1`,
        [ex.rows[0].id]
      )
      res.status(200).json({ message: 'Sinh viên đã có trong lớp — đã kích hoạt', id: ex.rows[0].id })
      return
    }

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS c FROM enrollments WHERE course_id = $1 AND status = 'active'`,
      [courseId]
    )
    const maxS2 = Number((courseRow as Record<string, unknown>).max_students ?? 30)
    if (countRes.rows[0].c >= maxS2) {
      res.status(400).json({ message: 'Lớp đã đủ sĩ số' })
      return
    }

    const result = await pool.query(
      `INSERT INTO enrollments (course_id, student_id, status)
       VALUES ($1, $2, 'active')
       ON CONFLICT (course_id, student_id) DO NOTHING
       RETURNING id, course_id, student_id, enrolled_at, status`,
      [courseId, targetStudentId]
    )

    if (result.rows.length === 0) {
      await pool.query(
        `UPDATE enrollments
         SET status = 'active'
         WHERE course_id = $1 AND student_id = $2`,
        [courseId, targetStudentId]
      )

      const existing = await pool.query(
        `SELECT id, course_id, student_id, enrolled_at, status
         FROM enrollments
         WHERE course_id = $1 AND student_id = $2
         LIMIT 1`,
        [courseId, targetStudentId]
      )

      res.status(200).json({
        ...existing.rows[0],
        student_name: userCheck.rows[0].full_name,
        student_email: userCheck.rows[0].email
      })
      return
    }

    res.status(201).json({
      ...result.rows[0],
      student_name: userCheck.rows[0].full_name,
      student_email: userCheck.rows[0].email
    })
  } catch (error) {
    console.error('❌ enrollOrRequestEnrollment:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const updateEnrollmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const enrollmentId = Number(req.params.enrollmentId)
    const { status } = req.body as { status?: string }

    const allowed = ['active', 'rejected', 'dropped', 'completed', 'failed']
    if (!status || !allowed.includes(status)) {
      res.status(400).json({ message: `status phải là: ${allowed.join(', ')}` })
      return
    }

    const en = await pool.query(
      `SELECT e.*, c.max_students, c.id AS cid
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.id = $1`,
      [enrollmentId]
    )
    if (en.rows.length === 0) {
      res.status(404).json({ message: 'Không tìm thấy ghi danh' })
      return
    }

    const row = en.rows[0] as { course_id: number; student_id: number; status: string; max_students: number }
    const course = await loadCourseRow(row.course_id)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    const can = await canManageCourse(req.user.id, req.user.role, course as CourseRow)
    if (!can) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    if (!canTransitionEnrollmentStatus(row.status, status)) {
      res.status(400).json({ message: `Không thể chuyển trạng thái từ ${row.status} sang ${status}` })
      return
    }

    if (status === 'active' && row.status !== 'active') {
      const countRes = await pool.query(
        `SELECT COUNT(*)::int AS c FROM enrollments
         WHERE course_id = $1 AND status = 'active'`,
        [row.course_id]
      )
      if (countRes.rows[0].c >= row.max_students) {
        res.status(400).json({ message: 'Lớp đã đủ sĩ số (chỉ tính sinh viên đã duyệt)' })
        return
      }
    }

    await pool.query(`UPDATE enrollments SET status = $1 WHERE id = $2`, [status, enrollmentId])

    res.json({ message: 'Đã cập nhật trạng thái ghi danh', enrollmentId, status })
  } catch (error) {
    console.error('❌ updateEnrollmentStatus:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const bulkUpdateEnrollmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const courseId = Number(req.params.id)
    const course = await loadCourseRow(courseId)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    const can = await canManageCourse(req.user.id, req.user.role, course as CourseRow)
    if (!can) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const { enrollmentIds, status } = req.body as { enrollmentIds?: number[]; status?: string }
    const allowed = ['active', 'rejected', 'dropped', 'completed', 'failed']
    if (!Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
      res.status(400).json({ message: 'enrollmentIds là bắt buộc' })
      return
    }
    if (!status || !allowed.includes(status)) {
      res.status(400).json({ message: `status phải là: ${allowed.join(', ')}` })
      return
    }

    const normalizedIds = Array.from(new Set(enrollmentIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)))
    if (normalizedIds.length === 0) {
      res.status(400).json({ message: 'enrollmentIds không hợp lệ' })
      return
    }

    const existing = await pool.query(
      `SELECT id, status FROM enrollments WHERE course_id = $1 AND id = ANY($2::int[]) ORDER BY enrolled_at ASC`,
      [courseId, normalizedIds]
    )
    if (existing.rows.length !== normalizedIds.length) {
      res.status(400).json({ message: 'Có ghi danh không thuộc lớp này hoặc không tồn tại' })
      return
    }

    const invalid = existing.rows.find((row) => !canTransitionEnrollmentStatus(row.status, status))
    if (invalid) {
      res.status(400).json({ message: `Không thể chuyển trạng thái từ ${invalid.status} sang ${status}` })
      return
    }

    if (status === 'active') {
      const activeCountRes = await pool.query(
        `SELECT COUNT(*)::int AS c FROM enrollments WHERE course_id = $1 AND status = 'active'`,
        [courseId]
      )
      const activatingCount = existing.rows.filter((row) => row.status !== 'active').length
      if (Number(activeCountRes.rows[0].c) + activatingCount > Number((course as Record<string, unknown>).max_students ?? 30)) {
        res.status(400).json({ message: 'Vượt quá sĩ số tối đa của lớp' })
        return
      }
    }

    await pool.query(`UPDATE enrollments SET status = $1 WHERE course_id = $2 AND id = ANY($3::int[])`, [
      status,
      courseId,
      normalizedIds
    ])

    res.json({
      message: 'Đã cập nhật trạng thái ghi danh hàng loạt',
      updatedCount: normalizedIds.length,
      enrollmentIds: normalizedIds,
      status
    })
  } catch (error) {
    console.error('❌ bulkUpdateEnrollmentStatus:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const updateEnrollmentGrade = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const enrollmentId = Number(req.params.enrollmentId)
    if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
      res.status(400).json({ message: 'enrollmentId không hợp lệ' })
      return
    }

    const { finalGrade, finalScore } = req.body as { finalGrade?: string | null; finalScore?: number | string | null }
    const normalizedGrade = typeof finalGrade === 'string' ? finalGrade.trim().toUpperCase() : null
    const normalizedScore =
      finalScore === null || finalScore === undefined || finalScore === ''
        ? null
        : Number(finalScore)

    if (normalizedGrade && normalizedGrade.length > 8) {
      res.status(400).json({ message: 'finalGrade không hợp lệ' })
      return
    }
    if (normalizedScore != null && (!Number.isFinite(normalizedScore) || normalizedScore < 0 || normalizedScore > 10)) {
      res.status(400).json({ message: 'finalScore phải trong khoảng 0-10' })
      return
    }

    const enrollment = await pool.query(
      `SELECT e.id, e.course_id, e.status, e.final_grade, e.final_score
       FROM enrollments e
       WHERE e.id = $1`,
      [enrollmentId]
    )
    if (enrollment.rows.length === 0) {
      res.status(404).json({ message: 'Không tìm thấy ghi danh' })
      return
    }

    const row = enrollment.rows[0] as { course_id: number; status: string }
    const course = await loadCourseRow(row.course_id)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    const can = await canManageCourse(req.user.id, req.user.role, course as CourseRow)
    if (!can) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const updated = await pool.query(
      `UPDATE enrollments
       SET final_grade = $1,
           final_score = $2
       WHERE id = $3
       RETURNING id, course_id, student_id, status, final_grade, final_score, enrolled_at`,
      [normalizedGrade || null, normalizedScore, enrollmentId]
    )

    res.json({ message: 'Đã cập nhật điểm tổng kết', enrollment: updated.rows[0] })
  } catch (error) {
    console.error('❌ updateEnrollmentGrade:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/** Giữ tên cũ cho FE */
export const enrollStudent = enrollOrRequestEnrollment

export const unenrollStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const courseId = Number(req.params.id)
    const studentId = Number(req.params.studentId)

    const course = await loadCourseRow(courseId)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    const ok = await canManageCourse(req.user.id, req.user.role, course as CourseRow)
    if (!ok) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const result = await pool.query('DELETE FROM enrollments WHERE course_id = $1 AND student_id = $2 RETURNING id', [
      courseId,
      studentId
    ])

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Sinh viên không có trong lớp này' })
      return
    }

    res.json({ message: 'Đã xóa sinh viên khỏi lớp' })
  } catch (error) {
    console.error('❌ Error in unenrollStudent:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getMyEnrollments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const result = await pool.query(
      `SELECT c.id, c.name, c.code, c.description, c.semester,
              u.full_name AS lecturer_name, u.email AS lecturer_email,
              e.enrolled_at, e.status AS enrollment_status,
              COUNT(e2.id) FILTER (WHERE e2.status NOT IN ('dropped', 'rejected'))::int AS student_count
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN users u ON u.id = c.lecturer_id
       LEFT JOIN enrollments e2 ON e2.course_id = c.id
       WHERE e.student_id = $1 AND c.deleted_at IS NULL
       GROUP BY c.id, u.full_name, u.email, e.enrolled_at, e.status
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    )

    res.json({ items: result.rows })
  } catch (error) {
    console.error('❌ Error in getMyEnrollments:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ==================== Course lecturers ====================

export const addCourseLecturer = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const courseId = Number(req.params.id)
    const course = await loadCourseRow(courseId)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    const ok = await canManageCourse(req.user.id, req.user.role, course as CourseRow)
    if (!ok) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const { lecturerId, roleInCourse } = req.body as { lecturerId?: number; roleInCourse?: string }
    if (!lecturerId) {
      res.status(400).json({ message: 'lecturerId là bắt buộc' })
      return
    }

    const role = (roleInCourse ?? 'supervisor').toLowerCase()
    if (!['supervisor', 'reviewer', 'committee'].includes(role)) {
      res.status(400).json({ message: 'roleInCourse: supervisor | reviewer | committee' })
      return
    }

    const u = await pool.query(`SELECT id, role FROM users WHERE id = $1 AND deleted_at IS NULL`, [lecturerId])
    if (u.rows.length === 0 || u.rows[0].role !== 'lecturer') {
      res.status(400).json({ message: 'Người dùng phải là giảng viên' })
      return
    }

    await pool.query(
      `INSERT INTO course_lecturers (course_id, lecturer_id, role_in_course)
       VALUES ($1, $2, $3)
       ON CONFLICT (course_id, lecturer_id, role_in_course) DO NOTHING`,
      [courseId, lecturerId, role]
    )

    res.status(201).json({ message: 'Đã thêm giảng viên vào lớp' })
  } catch (error) {
    console.error('❌ addCourseLecturer:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const removeCourseLecturer = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const courseId = Number(req.params.id)
    const userId = Number(req.params.userId)

    const course = await loadCourseRow(courseId)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    const ok = await canManageCourse(req.user.id, req.user.role, course as CourseRow)
    if (!ok) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    if (userId === (course as { lecturer_id: number }).lecturer_id) {
      res.status(400).json({ message: 'Không thể gỡ giảng viên chủ nhiệm — hãy đổi chủ nhiệm trước' })
      return
    }

    const del = await pool.query(
      `DELETE FROM course_lecturers WHERE course_id = $1 AND lecturer_id = $2 RETURNING id`,
      [courseId, userId]
    )

    res.json({ message: 'Đã gỡ giảng viên', removed: del.rows.length })
  } catch (error) {
    console.error('❌ removeCourseLecturer:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
