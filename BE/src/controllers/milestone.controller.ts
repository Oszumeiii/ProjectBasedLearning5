import type { Request, Response } from 'express'
import pool from '../config/db'

const VALID_STATUSES = ['pending', 'in_progress', 'completed', 'overdue', 'skipped'] as const

async function checkMilestoneAccess(milestoneId: number, user: { id: number; role: string }): Promise<
  { ok: true; milestone: Record<string, unknown> } | { ok: false; status: number; message: string }
> {
  const result = await pool.query(
    `SELECT pt.*, p.student_id, p.supervisor_id
     FROM progress_tracking pt
     JOIN projects p ON p.id = pt.project_id AND p.deleted_at IS NULL
     WHERE pt.id = $1`,
    [milestoneId]
  )
  if (result.rows.length === 0) return { ok: false, status: 404, message: 'Milestone not found' }

  const row = result.rows[0]
  if (user.role === 'student' && row.student_id !== user.id) {
    return { ok: false, status: 403, message: 'Không có quyền thao tác milestone này' }
  }
  if (user.role === 'lecturer' && row.supervisor_id !== user.id) {
    return { ok: false, status: 403, message: 'Bạn không phải GV hướng dẫn của đề tài này' }
  }
  return { ok: true, milestone: row }
}

// ─────────────────────── LIST MILESTONES (by project) ───────────────────────

export const listMilestones = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const projectId = Number(req.params.projectId)

    const result = await pool.query(
      `SELECT pt.*, u.full_name AS completed_by_name
       FROM progress_tracking pt
       LEFT JOIN users u ON u.id = pt.completed_by
       WHERE pt.project_id = $1
       ORDER BY pt.order_index, pt.id`,
      [projectId]
    )

    res.json({ items: result.rows })
  } catch (error) {
    console.error('❌ Error in listMilestones:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── CREATE MILESTONE ───────────────────────

export const createMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const projectId = Number(req.params.projectId)
    const { milestone, description, orderIndex, dueDate } = req.body as {
      milestone?: string; description?: string; orderIndex?: number; dueDate?: string
    }

    if (!milestone?.trim()) {
      res.status(400).json({ message: 'milestone (tên) là bắt buộc' })
      return
    }

    // Kiểm tra project tồn tại
    const project = await pool.query(
      'SELECT id, student_id, supervisor_id FROM projects WHERE id = $1 AND deleted_at IS NULL',
      [projectId]
    )
    if (project.rows.length === 0) { res.status(404).json({ message: 'Project not found' }); return }

    // Student chỉ tạo cho project mình, staff tạo cho bất kỳ
    const p = project.rows[0]
    if (req.user.role === 'student' && p.student_id !== req.user.id) {
      res.status(403).json({ message: 'Không có quyền' }); return
    }

    const result = await pool.query(
      `INSERT INTO progress_tracking (project_id, milestone, description, order_index, due_date, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [projectId, milestone.trim(), description?.trim() || null, orderIndex ?? 0, dueDate || null]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in createMilestone:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── UPDATE MILESTONE ───────────────────────

export const updateMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const access = await checkMilestoneAccess(id, req.user)
    if (!access.ok) { res.status(access.status).json({ message: access.message }); return }

    const { milestone, description, orderIndex, dueDate } = req.body as {
      milestone?: string; description?: string; orderIndex?: number; dueDate?: string
    }

    const result = await pool.query(
      `UPDATE progress_tracking SET
         milestone = COALESCE($1, milestone), description = COALESCE($2, description),
         order_index = COALESCE($3, order_index), due_date = COALESCE($4::date, due_date)
       WHERE id = $5 RETURNING *`,
      [milestone?.trim() || null, description?.trim() || null, orderIndex ?? null, dueDate || null, id]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in updateMilestone:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── UPDATE MILESTONE STATUS ───────────────────────

export const updateMilestoneStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const access = await checkMilestoneAccess(id, req.user)
    if (!access.ok) { res.status(access.status).json({ message: access.message }); return }

    const { status } = req.body as { status?: string }

    if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      res.status(400).json({ message: `status phải là: ${VALID_STATUSES.join(', ')}` })
      return
    }

    const completedBy = status === 'completed' ? req.user.id : null

    const result = await pool.query(
      `UPDATE progress_tracking SET
         status = $1,
         completed_at = ${status === 'completed' ? 'NOW()' : 'completed_at'},
         completed_by = COALESCE($2, completed_by)
       WHERE id = $3 RETURNING *`,
      [status, completedBy, id]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in updateMilestoneStatus:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── DELETE MILESTONE ───────────────────────

export const deleteMilestone = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const access = await checkMilestoneAccess(id, req.user)
    if (!access.ok) { res.status(access.status).json({ message: access.message }); return }

    await pool.query('DELETE FROM progress_tracking WHERE id = $1', [id])
    res.json({ message: 'Đã xóa milestone' })
  } catch (error) {
    console.error('❌ Error in deleteMilestone:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── BULK CREATE MILESTONES ───────────────────────

export const bulkCreateMilestones = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const projectId = Number(req.params.projectId)
    const { milestones } = req.body as {
      milestones?: Array<{ milestone: string; description?: string; orderIndex?: number; dueDate?: string }>
    }

    if (!milestones || milestones.length === 0) {
      res.status(400).json({ message: 'milestones array là bắt buộc' }); return
    }

    const project = await pool.query(
      'SELECT id, student_id FROM projects WHERE id = $1 AND deleted_at IS NULL', [projectId]
    )
    if (project.rows.length === 0) { res.status(404).json({ message: 'Project not found' }); return }

    if (req.user.role === 'student' && project.rows[0].student_id !== req.user.id) {
      res.status(403).json({ message: 'Không có quyền' }); return
    }

    const values: string[] = []
    const params: unknown[] = []

    milestones.forEach((m, i) => {
      const base = i * 4
      params.push(m.milestone, m.description || null, m.orderIndex ?? i, m.dueDate || null)
      values.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}::date, ${projectId}, 'pending')`)
    })

    const result = await pool.query(
      `INSERT INTO progress_tracking (milestone, description, order_index, due_date, project_id, status)
       VALUES ${values.join(', ')}
       RETURNING *`,
      params
    )

    res.status(201).json({ items: result.rows })
  } catch (error) {
    console.error('❌ Error in bulkCreateMilestones:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
