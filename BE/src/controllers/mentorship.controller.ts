import type { Request, Response } from 'express'
import pool from '../config/db'
import { createNotification } from '../utils/notification.js'

// ─────────────────────── LIST MENTORSHIPS ───────────────────────

export const listMentorships = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const { projectId, courseId } = req.query

    const conds: string[] = []
    const params: unknown[] = []

    if (projectId) { params.push(Number(projectId)); conds.push(`m.project_id = $${params.length}`) }
    if (courseId) { params.push(Number(courseId)); conds.push(`m.course_id = $${params.length}`) }

    if (req.user.role === 'student') {
      params.push(req.user.id)
      conds.push(`m.student_id = $${params.length}`)
    } else if (req.user.role === 'lecturer') {
      params.push(req.user.id)
      conds.push(`m.mentor_id = $${params.length}`)
    }

    const where = conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : ''

    const result = await pool.query(
      `SELECT m.*,
              s.full_name AS student_name, s.email AS student_email,
              mt.full_name AS mentor_name, mt.email AS mentor_email,
              p.title AS project_title
       FROM mentorships m
       LEFT JOIN users s ON s.id = m.student_id
       LEFT JOIN users mt ON mt.id = m.mentor_id
       LEFT JOIN projects p ON p.id = m.project_id
       ${where}
       ORDER BY m.created_at DESC`,
      params
    )

    res.json({ items: result.rows })
  } catch (error) {
    console.error('❌ Error in listMentorships:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── CREATE MENTORSHIP ───────────────────────

export const createMentorship = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const { studentId, mentorId, projectId, courseId, startDate, note } = req.body as {
      studentId?: number; mentorId?: number; projectId?: number
      courseId?: number; startDate?: string; note?: string
    }

    if (!studentId || !mentorId || !startDate) {
      res.status(400).json({ message: 'studentId, mentorId và startDate là bắt buộc' })
      return
    }

    // Kiểm tra student + mentor tồn tại
    const [studentRes, mentorRes] = await Promise.all([
      pool.query("SELECT id, full_name FROM users WHERE id = $1 AND role = 'student' AND deleted_at IS NULL", [studentId]),
      pool.query("SELECT id, full_name FROM users WHERE id = $1 AND role IN ('lecturer','manager','admin') AND deleted_at IS NULL", [mentorId])
    ])

    if (studentRes.rows.length === 0) { res.status(404).json({ message: 'Sinh viên không tồn tại' }); return }
    if (mentorRes.rows.length === 0) { res.status(404).json({ message: 'Giảng viên không tồn tại' }); return }

    const result = await pool.query(
      `INSERT INTO mentorships (student_id, mentor_id, project_id, course_id, start_date, note, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       ON CONFLICT (student_id, mentor_id, project_id) DO NOTHING
       RETURNING *`,
      [studentId, mentorId, projectId || null, courseId || null, startDate, note?.trim() || null]
    )

    if (result.rows.length === 0) {
      res.status(409).json({ message: 'Quan hệ hướng dẫn này đã tồn tại' })
      return
    }

    // Thông báo cho SV
    await createNotification({
      userId: studentId,
      type: 'mentorship.assigned',
      title: 'Được gán GV hướng dẫn',
      message: `${mentorRes.rows[0].full_name} đã được gán làm GV hướng dẫn cho bạn.`,
      refType: 'user', refId: mentorId
    })

    // Thông báo cho GV
    await createNotification({
      userId: mentorId,
      type: 'mentorship.assigned',
      title: 'Được gán SV hướng dẫn',
      message: `Bạn đã được gán hướng dẫn sinh viên ${studentRes.rows[0].full_name}.`,
      refType: 'user', refId: studentId
    })

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in createMentorship:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── UPDATE STATUS ───────────────────────

export const updateMentorshipStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const { status, endDate, note } = req.body as { status?: string; endDate?: string; note?: string }

    const valid = ['active', 'completed', 'terminated']
    if (!status || !valid.includes(status)) {
      res.status(400).json({ message: `status phải là: ${valid.join(', ')}` }); return
    }

    const result = await pool.query(
      `UPDATE mentorships SET status = $1, end_date = COALESCE($2::date, end_date), note = COALESCE($3, note)
       WHERE id = $4 RETURNING *`,
      [status, endDate || null, note?.trim() || null, id]
    )

    if (result.rows.length === 0) { res.status(404).json({ message: 'Not found' }); return }
    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in updateMentorshipStatus:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── DELETE ───────────────────────

export const deleteMentorship = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const result = await pool.query('DELETE FROM mentorships WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) { res.status(404).json({ message: 'Not found' }); return }
    res.json({ message: 'Đã xóa quan hệ hướng dẫn' })
  } catch (error) {
    console.error('❌ Error in deleteMentorship:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
