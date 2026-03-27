import type { Request, Response } from 'express'
import pool from '../config/db'
import { isCourseModerator } from '../utils/roles'

// ==================== CRUD Lớp học phần ====================

/**
 * Tạo lớp học phần (GV / quản lý khoa / admin).
 * Loại `thesis` chỉ manager hoặc admin (theo quy ước EduRAG).
 */
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const { name, code, description, semester, academicYear, courseType } = req.body as {
      name?: string
      code?: string
      description?: string
      semester?: string
      academicYear?: string
      courseType?: string
    }

    if (!name || !code || !semester?.trim() || !academicYear?.trim()) {
      res.status(400).json({ message: 'name, code, semester và academicYear là bắt buộc' })
      return
    }

    const ctype = (courseType ?? 'project').toLowerCase()
    const allowedTypes = ['project', 'thesis', 'research', 'internship'] as const
    if (!allowedTypes.includes(ctype as (typeof allowedTypes)[number])) {
      res.status(400).json({ message: 'courseType phải là: project | thesis | research | internship' })
      return
    }

    if (ctype === 'thesis' && req.user.role !== 'manager' && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ quản lý khoa (manager) hoặc admin được tạo lớp loại khóa luận (thesis)' })
      return
    }

    const existing = await pool.query('SELECT id FROM courses WHERE code = $1 AND deleted_at IS NULL', [code])
    if (existing.rows.length > 0) {
      res.status(409).json({ message: `Mã lớp "${code}" đã tồn tại` })
      return
    }

    const result = await pool.query(
      `INSERT INTO courses (
         name, code, description, semester, academic_year, course_type,
         lecturer_id, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, code, description ?? null, semester.trim(), academicYear.trim(), ctype, req.user.id, req.user.id]
    )

    const lecturer = await pool.query('SELECT full_name, email FROM users WHERE id = $1', [req.user.id])
    const course = result.rows[0]
    course.lecturer_name = lecturer.rows[0]?.full_name ?? null

    res.status(201).json(course)
  } catch (error) {
    console.error('❌ Error in createCourse:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * Danh sách lớp học phần
 * - Lecturer: thấy lớp mình tạo
 * - Student: thấy lớp đã enroll
 * - Admin / manager: thấy tất cả
 */
export const listCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    let sql: string
    let params: unknown[]

    if (isCourseModerator(req.user.role)) {
      sql = `
        SELECT c.*, u.full_name AS lecturer_name, u.email AS lecturer_email,
               COUNT(e.id)::int AS student_count
        FROM courses c
        LEFT JOIN users u ON u.id = c.lecturer_id
        LEFT JOIN enrollments e ON e.course_id = c.id
        WHERE c.deleted_at IS NULL
        GROUP BY c.id, u.full_name, u.email
        ORDER BY c.created_at DESC
      `
      params = []
    } else if (req.user.role === 'lecturer') {
      sql = `
        SELECT c.*, u.full_name AS lecturer_name, u.email AS lecturer_email,
               COUNT(e.id)::int AS student_count
        FROM courses c
        LEFT JOIN users u ON u.id = c.lecturer_id
        LEFT JOIN enrollments e ON e.course_id = c.id
        WHERE c.lecturer_id = $1 AND c.deleted_at IS NULL
        GROUP BY c.id, u.full_name, u.email
        ORDER BY c.created_at DESC
      `
      params = [req.user.id]
    } else {
      // Student: lớp mình đã enroll
      sql = `
        SELECT c.*, u.full_name AS lecturer_name, u.email AS lecturer_email,
               e.enrolled_at,
               COUNT(e2.id)::int AS student_count
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        LEFT JOIN users u ON u.id = c.lecturer_id
        LEFT JOIN enrollments e2 ON e2.course_id = c.id
        WHERE e.student_id = $1 AND c.deleted_at IS NULL
        GROUP BY c.id, u.full_name, u.email, e.enrolled_at
        ORDER BY e.enrolled_at DESC
      `
      params = [req.user.id]
    }

    const result = await pool.query(sql, params)
    res.json({ items: result.rows })
  } catch (error) {
    console.error('❌ Error in listCourses:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * Chi tiết lớp học phần + danh sách sinh viên
 */
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const id = Number(req.params.id)

    // Lấy thông tin lớp
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

    const course = courseResult.rows[0]

    // Kiểm tra quyền truy cập: admin xem tất cả, lecturer chỉ xem lớp mình, student chỉ xem lớp đã enroll
    if (req.user.role === 'student') {
      const enrolled = await pool.query('SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2', [
        id,
        req.user.id
      ])
      if (enrolled.rows.length === 0) {
        res.status(403).json({ message: 'Bạn chưa tham gia lớp này' })
        return
      }
    } else if (req.user.role === 'lecturer' && course.lecturer_id !== req.user.id) {
      res.status(403).json({ message: 'Bạn không phải giảng viên của lớp này' })
      return
    }

    // Danh sách sinh viên trong lớp
    const studentsResult = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.major, e.enrolled_at
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       WHERE e.course_id = $1
       ORDER BY e.enrolled_at ASC`,
      [id]
    )

    // Đếm số report trong lớp
    const reportCount = await pool.query('SELECT COUNT(*)::int AS count FROM reports WHERE course_id = $1', [id])

    res.json({
      ...course,
      student_count: studentsResult.rows.length,
      students: studentsResult.rows,
      report_count: reportCount.rows[0]?.count ?? 0
    })
  } catch (error) {
    console.error('❌ Error in getCourseById:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * Cập nhật lớp học phần (Lecturer owner / Admin)
 */
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const id = Number(req.params.id)

    // Kiểm tra quyền: phải là lecturer owner hoặc admin
    if (req.user.role === 'lecturer') {
      const course = await pool.query('SELECT lecturer_id FROM courses WHERE id = $1', [id])
      if (course.rows.length === 0) {
        res.status(404).json({ message: 'Course not found' })
        return
      }
      if (course.rows[0].lecturer_id !== req.user.id) {
        res.status(403).json({ message: 'Bạn không phải giảng viên của lớp này' })
        return
      }
    }

    const { name, description, semester } = req.body as {
      name?: string
      description?: string
      semester?: string
    }

    const result = await pool.query(
      `UPDATE courses
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           semester = COALESCE($3, semester)
       WHERE id = $4 AND deleted_at IS NULL
       RETURNING *`,
      [name ?? null, description ?? null, semester ?? null, id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in updateCourse:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * Xóa lớp học phần (Lecturer owner / Admin)
 */
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const id = Number(req.params.id)

    // Kiểm tra quyền
    if (req.user.role === 'lecturer') {
      const course = await pool.query('SELECT lecturer_id FROM courses WHERE id = $1', [id])
      if (course.rows.length === 0) {
        res.status(404).json({ message: 'Course not found' })
        return
      }
      if (course.rows[0].lecturer_id !== req.user.id) {
        res.status(403).json({ message: 'Bạn không phải giảng viên của lớp này' })
        return
      }
    }

    const result = await pool.query(
      'UPDATE courses SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    res.json({ message: 'Course archived (soft delete)' })
  } catch (error) {
    console.error('❌ Error in deleteCourse:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ==================== Join Course ====================

export const joinCourseByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Kiểm tra User đã đăng nhập chưa (từ authMiddleware)
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const { courseCode } = req.body as { courseCode: string }
    const studentId = req.user.id

    if (!courseCode) {
      res.status(400).json({ message: 'Vui lòng nhập mã tham gia lớp học' })
      return
    }

    // 2. Tìm lớp dựa trên enrollment_code (Dùng UPPER để khớp chính xác không phân biệt hoa thường)
    const courseQuery = await pool.query(
      `SELECT id, name, max_students, is_active 
       FROM public.courses 
       WHERE UPPER(enrollment_code) = UPPER($1) 
         AND deleted_at IS NULL`,
      [courseCode.trim()]
    )

    if (courseQuery.rows.length === 0) {
      res.status(404).json({ message: 'Mã lớp học không chính xác hoặc không tồn tại' })
      return
    }

    const course = courseQuery.rows[0]

    // 3. Kiểm tra xem lớp có đang mở tham gia không (dựa trên cột is_active của bạn)
    if (!course.is_active) {
      res.status(400).json({ message: 'Lớp học này hiện đang đóng, không thể tham gia' })
      return
    }

    // 4. Kiểm tra sĩ số hiện tại (so với max_students trong DB của bạn)
    const countRes = await pool.query('SELECT COUNT(*)::int AS count FROM public.enrollments WHERE course_id = $1', [
      course.id
    ])

    if (countRes.rows[0].count >= course.max_students) {
      res.status(400).json({ message: 'Lớp học đã đạt giới hạn sĩ số tối đa' })
      return
    }

    // 5. Kiểm tra xem sinh viên đã tham gia lớp này chưa
    const checkEnroll = await pool.query('SELECT id FROM public.enrollments WHERE course_id = $1 AND student_id = $2', [
      course.id,
      studentId
    ])

    if (checkEnroll.rows.length > 0) {
      res.status(400).json({ message: 'Bạn đã tham gia lớp học này rồi' })
      return
    }

    // 6. Thực hiện đăng ký tham gia (Insert vào bảng enrollments)
    await pool.query('INSERT INTO public.enrollments (course_id, student_id) VALUES ($1, $2)', [course.id, studentId])

    res.status(201).json({
      message: `Tham gia thành công lớp: ${course.name}`
    })
  } catch (error) {
    console.error('❌ JoinCourse Error:', error)
    res.status(500).json({ message: 'Lỗi hệ thống khi tham gia lớp học' })
  }
}

// ==================== Enrollment ====================

/**
 * Thêm sinh viên vào lớp (Lecturer owner / Admin)
 */
export const enrollStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const courseId = Number(req.params.id)
    const { studentId, email } = req.body as { studentId?: number; email?: string }

    // Kiểm tra quyền: phải là lecturer owner hoặc admin
    if (req.user.role === 'lecturer') {
      const course = await pool.query('SELECT lecturer_id FROM courses WHERE id = $1', [courseId])
      if (course.rows.length === 0) {
        res.status(404).json({ message: 'Course not found' })
        return
      }
      if (course.rows[0].lecturer_id !== req.user.id) {
        res.status(403).json({ message: 'Bạn không phải giảng viên của lớp này' })
        return
      }
    }

    // Tìm student bằng id hoặc email
    let targetStudentId: number | undefined

    if (studentId) {
      targetStudentId = studentId
    } else if (email) {
      const student = await pool.query("SELECT id FROM users WHERE email = $1 AND role = 'student'", [email])
      if (student.rows.length === 0) {
        res.status(404).json({ message: `Không tìm thấy sinh viên với email: ${email}` })
        return
      }
      targetStudentId = student.rows[0].id
    } else {
      res.status(400).json({ message: 'studentId hoặc email là bắt buộc' })
      return
    }

    // Kiểm tra user có phải student không
    const userCheck = await pool.query(
      'SELECT id, full_name, email, role FROM users WHERE id = $1 AND deleted_at IS NULL',
      [targetStudentId]
    )
    if (userCheck.rows.length === 0) {
      res.status(404).json({ message: 'User not found' })
      return
    }
    if (userCheck.rows[0].role !== 'student') {
      res.status(400).json({ message: 'Chỉ có thể thêm sinh viên vào lớp' })
      return
    }

    // Thêm vào lớp
    const result = await pool.query(
      `INSERT INTO enrollments (course_id, student_id)
       VALUES ($1, $2)
       ON CONFLICT (course_id, student_id) DO NOTHING
       RETURNING id, course_id, student_id, enrolled_at`,
      [courseId, targetStudentId]
    )

    if (result.rows.length === 0) {
      res.status(200).json({ message: 'Sinh viên đã có trong lớp' })
      return
    }

    res.status(201).json({
      ...result.rows[0],
      student_name: userCheck.rows[0].full_name,
      student_email: userCheck.rows[0].email
    })
  } catch (error) {
    console.error('❌ Error in enrollStudent:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * Xóa sinh viên khỏi lớp (Lecturer owner / Admin)
 */
export const unenrollStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const courseId = Number(req.params.id)
    const studentId = Number(req.params.studentId)

    // Kiểm tra quyền
    if (req.user.role === 'lecturer') {
      const course = await pool.query('SELECT lecturer_id FROM courses WHERE id = $1', [courseId])
      if (course.rows.length === 0) {
        res.status(404).json({ message: 'Course not found' })
        return
      }
      if (course.rows[0].lecturer_id !== req.user.id) {
        res.status(403).json({ message: 'Bạn không phải giảng viên của lớp này' })
        return
      }
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

/**
 * Student xem danh sách lớp mình đã tham gia
 */
export const getMyEnrollments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const result = await pool.query(
      `SELECT c.id, c.name, c.code, c.description, c.semester,
              u.full_name AS lecturer_name, u.email AS lecturer_email,
              e.enrolled_at,
              COUNT(e2.id)::int AS student_count
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN users u ON u.id = c.lecturer_id
       LEFT JOIN enrollments e2 ON e2.course_id = c.id
       WHERE e.student_id = $1 AND c.deleted_at IS NULL
       GROUP BY c.id, u.full_name, u.email, e.enrolled_at
       ORDER BY e.enrolled_at DESC`,
      [req.user.id]
    )

    res.json({ items: result.rows })
  } catch (error) {
    console.error('❌ Error in getMyEnrollments:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
