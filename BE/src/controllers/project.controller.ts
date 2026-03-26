import type { Request, Response } from 'express'
import pool from '../config/db'

import { createNotification } from '../utils/notification.js'
// ─────────────────────── LIST PROJECTS ───────────────────────

export const listProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const { courseId, status, page = '1', limit = '20', search = '' } = req.query
    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20))
    const offset = (pageNum - 1) * limitNum

    const conds: string[] = ['p.deleted_at IS NULL']
    const params: unknown[] = []

    if (courseId) { params.push(Number(courseId)); conds.push(`p.course_id = $${params.length}`) }
    if (status && typeof status === 'string') { params.push(status); conds.push(`p.status = $${params.length}`) }
    if (typeof search === 'string' && search.trim()) {
      params.push(`%${search.trim()}%`)
      conds.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`)
    }

    // Student chỉ thấy project mình hoặc project trong lớp đã enroll
    if (req.user.role === 'student') {
      params.push(req.user.id, req.user.id)
      conds.push(`(p.student_id = $${params.length - 1} OR p.course_id IN (SELECT course_id FROM enrollments WHERE student_id = $${params.length}))`)
    } else if (req.user.role === 'lecturer') {
      params.push(req.user.id, req.user.id)
      conds.push(`(p.supervisor_id = $${params.length - 1} OR p.course_id IN (SELECT id FROM courses WHERE lecturer_id = $${params.length}))`)
    }

    const where = `WHERE ${conds.join(' AND ')}`

    const [countRes, listRes] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total FROM projects p ${where}`, params),
      pool.query(
        `SELECT p.*, s.full_name AS student_name, s.email AS student_email,
                sv.full_name AS supervisor_name, sv.email AS supervisor_email,
                c.name AS course_name, c.code AS course_code
         FROM projects p
         LEFT JOIN users s ON s.id = p.student_id
         LEFT JOIN users sv ON sv.id = p.supervisor_id
         LEFT JOIN courses c ON c.id = p.course_id
         ${where}
         ORDER BY p.created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limitNum, offset]
      )
    ])

    res.json({ items: listRes.rows, page: pageNum, limit: limitNum, total: countRes.rows[0]?.total ?? 0 })
  } catch (error) {
    console.error('❌ Error in listProjects:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── GET PROJECT BY ID ───────────────────────

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)

    const result = await pool.query(
      `SELECT p.*, s.full_name AS student_name, s.email AS student_email,
              sv.full_name AS supervisor_name, sv.email AS supervisor_email,
              c.name AS course_name, c.code AS course_code
       FROM projects p
       LEFT JOIN users s ON s.id = p.student_id
       LEFT JOIN users sv ON sv.id = p.supervisor_id
       LEFT JOIN courses c ON c.id = p.course_id
       WHERE p.id = $1 AND p.deleted_at IS NULL`,
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Project not found' })
      return
    }

    const project = result.rows[0]

    if (req.user.role === 'student') {
      const enrolled = await pool.query(
        'SELECT 1 FROM enrollments WHERE course_id = $1 AND student_id = $2',
        [project.course_id, req.user.id]
      )
      if (project.student_id !== req.user.id && enrolled.rows.length === 0) {
        res.status(403).json({ message: 'Bạn không có quyền xem đề tài này' }); return
      }
    } else if (req.user.role === 'lecturer') {
      const teachsCourse = project.course_id
        ? (await pool.query('SELECT 1 FROM courses WHERE id = $1 AND lecturer_id = $2', [project.course_id, req.user.id])).rows.length > 0
        : false
      if (project.supervisor_id !== req.user.id && !teachsCourse) {
        res.status(403).json({ message: 'Bạn không có quyền xem đề tài này' }); return
      }
    }

    // Milestones
    const milestones = await pool.query(
      'SELECT * FROM progress_tracking WHERE project_id = $1 ORDER BY order_index, id',
      [id]
    )

    // Mentors
    const mentors = await pool.query(
      `SELECT m.*, u.full_name AS mentor_name, u.email AS mentor_email
       FROM mentorships m JOIN users u ON u.id = m.mentor_id
       WHERE m.project_id = $1 ORDER BY m.created_at`,
      [id]
    )

    // Reports
    const reports = await pool.query(
      'SELECT id, title, status, created_at FROM reports WHERE project_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC',
      [id]
    )

    res.json({ ...project, milestones: milestones.rows, mentors: mentors.rows, reports: reports.rows })
  } catch (error) {
    console.error('❌ Error in getProjectById:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── CREATE PROJECT ───────────────────────

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const { title, description, courseId, startDate, endDate, tags } = req.body as {
      title?: string; description?: string; courseId?: number
      startDate?: string; endDate?: string; tags?: string[]
    }

    if (!title?.trim() || !startDate) {
      res.status(400).json({ message: 'title và startDate là bắt buộc' })
      return
    }

    // Student tạo project cho chính mình
    const studentId = req.user.role === 'student' ? req.user.id : (req.body.studentId as number | undefined)

    if (!studentId) {
      res.status(400).json({ message: 'studentId là bắt buộc (hoặc đăng nhập bằng tài khoản sinh viên)' })
      return
    }

    // Nếu có courseId → kiểm tra enrollment
    if (courseId) {
      const enrolled = await pool.query(
        'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2', [courseId, studentId]
      )
      if (enrolled.rows.length === 0 && req.user.role === 'student') {
        res.status(403).json({ message: 'Sinh viên chưa tham gia lớp này' })
        return
      }
    }

    const result = await pool.query(
      `INSERT INTO projects (title, description, student_id, course_id, start_date, end_date, tags, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [title.trim(), description?.trim() || null, studentId, courseId || null,
       startDate, endDate || null, tags || null]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in createProject:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── UPDATE PROJECT ───────────────────────

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const { title, description, endDate, tags } = req.body as {
      title?: string; description?: string; endDate?: string; tags?: string[]
    }

    const project = await pool.query(
      'SELECT student_id, supervisor_id FROM projects WHERE id = $1 AND deleted_at IS NULL', [id]
    )
    if (project.rows.length === 0) { res.status(404).json({ message: 'Project not found' }); return }

    // Chỉ student owner, supervisor hoặc staff
    const p = project.rows[0]
    if (req.user.role === 'student' && p.student_id !== req.user.id) {
      res.status(403).json({ message: 'Bạn không có quyền sửa đồ án này' }); return
    }

    const result = await pool.query(
      `UPDATE projects SET
         title = COALESCE($1, title), description = COALESCE($2, description),
         end_date = COALESCE($3, end_date), tags = COALESCE($4, tags)
       WHERE id = $5 AND deleted_at IS NULL RETURNING *`,
      [title?.trim() || null, description?.trim() || null, endDate || null, tags || null, id]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in updateProject:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── UPDATE PROJECT STATUS (GV duyệt) ───────────────────────

export const updateProjectStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const { status } = req.body as { status?: string }

    const validStatuses = ['pending', 'approved', 'in_progress', 'submitted', 'defending', 'completed', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ message: `status phải là: ${validStatuses.join(', ')}` })
      return
    }

    const project = await pool.query(
      'SELECT id, student_id, title FROM projects WHERE id = $1 AND deleted_at IS NULL', [id]
    )
    if (project.rows.length === 0) { res.status(404).json({ message: 'Project not found' }); return }

    const result = await pool.query(
      'UPDATE projects SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    )

    const p = project.rows[0]

    // Thông báo cho SV khi đề tài được duyệt/từ chối
    if (status === 'approved') {
      await createNotification({
        userId: p.student_id,
        type: 'project.approved',
        title: 'Đề tài được duyệt',
        message: `Đề tài "${p.title}" đã được duyệt bởi giảng viên.`,
        refType: 'project', refId: id
      })
    } else if (status === 'cancelled') {
      await createNotification({
        userId: p.student_id,
        type: 'project.cancelled',
        title: 'Đề tài bị hủy',
        message: `Đề tài "${p.title}" đã bị hủy.`,
        refType: 'project', refId: id
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in updateProjectStatus:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── ASSIGN SUPERVISOR ───────────────────────

export const assignSupervisor = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const { supervisorId } = req.body as { supervisorId?: number }

    if (!supervisorId) { res.status(400).json({ message: 'supervisorId là bắt buộc' }); return }

    const supervisor = await pool.query(
      "SELECT id, full_name FROM users WHERE id = $1 AND role IN ('lecturer','manager','admin') AND deleted_at IS NULL",
      [supervisorId]
    )
    if (supervisor.rows.length === 0) {
      res.status(404).json({ message: 'Giảng viên không tồn tại' }); return
    }

    const project = await pool.query(
      'SELECT id, student_id, title FROM projects WHERE id = $1 AND deleted_at IS NULL', [id]
    )
    if (project.rows.length === 0) { res.status(404).json({ message: 'Project not found' }); return }

    const result = await pool.query(
      'UPDATE projects SET supervisor_id = $1 WHERE id = $2 RETURNING *',
      [supervisorId, id]
    )

    await createNotification({
      userId: project.rows[0].student_id,
      type: 'project.supervisor_assigned',
      title: 'GV hướng dẫn được gán',
      message: `GV ${supervisor.rows[0].full_name} đã được gán làm hướng dẫn đề tài "${project.rows[0].title}".`,
      refType: 'project', refId: id
    })

    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in assignSupervisor:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── DELETE PROJECT (soft) ───────────────────────

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)

    const project = await pool.query(
      'SELECT student_id FROM projects WHERE id = $1 AND deleted_at IS NULL', [id]
    )
    if (project.rows.length === 0) { res.status(404).json({ message: 'Project not found' }); return }

    if (req.user.role === 'student' && project.rows[0].student_id !== req.user.id) {
      res.status(403).json({ message: 'Không có quyền' }); return
    }

    await pool.query('UPDATE projects SET deleted_at = NOW() WHERE id = $1', [id])

    res.json({ message: 'Đã xóa đồ án (soft delete)' })
  } catch (error) {
    console.error('❌ Error in deleteProject:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
