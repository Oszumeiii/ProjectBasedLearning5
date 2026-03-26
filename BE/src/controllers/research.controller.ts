import type { Request, Response } from 'express'
import pool from '../config/db'
import { createNotification } from '../utils/notification.js'

const VALID_STATUSES = ['draft', 'submitted', 'under_review', 'revision', 'accepted', 'published', 'rejected'] as const
const VALID_INDEX = ['ISI', 'Scopus', 'other'] as const

// ─────────────────────── LIST ───────────────────────

export const listResearchPapers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const { courseId, status, page = '1', limit = '20', search = '' } = req.query
    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20))
    const offset = (pageNum - 1) * limitNum

    const conds: string[] = ['rp.deleted_at IS NULL']
    const params: unknown[] = []

    if (courseId) { params.push(Number(courseId)); conds.push(`rp.course_id = $${params.length}`) }
    if (status && typeof status === 'string') { params.push(status); conds.push(`rp.status = $${params.length}`) }
    if (typeof search === 'string' && search.trim()) {
      params.push(`%${search.trim()}%`)
      conds.push(`(rp.title ILIKE $${params.length} OR rp.abstract ILIKE $${params.length})`)
    }

    if (req.user.role === 'student') {
      params.push(req.user.id)
      conds.push(`rp.student_id = $${params.length}`)
    } else if (req.user.role === 'lecturer') {
      params.push(req.user.id, req.user.id)
      conds.push(`(rp.supervisor_id = $${params.length - 1} OR rp.student_id = $${params.length})`)
    }

    const where = `WHERE ${conds.join(' AND ')}`

    const [countRes, listRes] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total FROM research_papers rp ${where}`, params),
      pool.query(
        `SELECT rp.*, s.full_name AS student_name, sv.full_name AS supervisor_name
         FROM research_papers rp
         LEFT JOIN users s ON s.id = rp.student_id
         LEFT JOIN users sv ON sv.id = rp.supervisor_id
         ${where}
         ORDER BY rp.created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limitNum, offset]
      )
    ])

    res.json({ items: listRes.rows, page: pageNum, limit: limitNum, total: countRes.rows[0]?.total ?? 0 })
  } catch (error) {
    console.error('❌ Error in listResearchPapers:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── GET BY ID ───────────────────────

export const getResearchPaperById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const result = await pool.query(
      `SELECT rp.*, s.full_name AS student_name, s.email AS student_email,
              sv.full_name AS supervisor_name, sv.email AS supervisor_email,
              c.name AS course_name
       FROM research_papers rp
       LEFT JOIN users s ON s.id = rp.student_id
       LEFT JOIN users sv ON sv.id = rp.supervisor_id
       LEFT JOIN courses c ON c.id = rp.course_id
       WHERE rp.id = $1 AND rp.deleted_at IS NULL`,
      [id]
    )

    if (result.rows.length === 0) { res.status(404).json({ message: 'Research paper not found' }); return }

    const paper = result.rows[0]
    if (req.user.role === 'student' && paper.student_id !== req.user.id) {
      res.status(403).json({ message: 'Bạn không có quyền xem bài NCKH này' }); return
    }
    if (req.user.role === 'lecturer' && paper.supervisor_id !== req.user.id) {
      res.status(403).json({ message: 'Bạn không phải GV hướng dẫn bài NCKH này' }); return
    }

    res.json(paper)
  } catch (error) {
    console.error('❌ Error in getResearchPaperById:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── CREATE ───────────────────────

export const createResearchPaper = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const body = req.body as {
      title?: string; abstract?: string; keywords?: string[]
      courseId?: number; supervisorId?: number; fileUrl?: string
    }

    if (!body.title?.trim()) { res.status(400).json({ message: 'title là bắt buộc' }); return }

    const studentId = req.user.role === 'student' ? req.user.id : (req.body.studentId as number | undefined)
    if (!studentId) { res.status(400).json({ message: 'studentId là bắt buộc' }); return }

    const result = await pool.query(
      `INSERT INTO research_papers (title, abstract, keywords, student_id, supervisor_id, course_id, file_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
       RETURNING *`,
      [body.title.trim(), body.abstract?.trim() || null, body.keywords || null,
       studentId, body.supervisorId || null, body.courseId || null, body.fileUrl || null]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in createResearchPaper:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── UPDATE ───────────────────────

export const updateResearchPaper = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const body = req.body as {
      title?: string; abstract?: string; keywords?: string[]
      fileUrl?: string; journalName?: string; conferenceName?: string
    }

    const existing = await pool.query(
      'SELECT student_id FROM research_papers WHERE id = $1 AND deleted_at IS NULL', [id]
    )
    if (existing.rows.length === 0) { res.status(404).json({ message: 'Not found' }); return }
    if (req.user.role === 'student' && existing.rows[0].student_id !== req.user.id) {
      res.status(403).json({ message: 'Không có quyền' }); return
    }

    const result = await pool.query(
      `UPDATE research_papers SET
         title = COALESCE($1, title), abstract = COALESCE($2, abstract),
         keywords = COALESCE($3, keywords), file_url = COALESCE($4, file_url),
         journal_name = COALESCE($5, journal_name), conference_name = COALESCE($6, conference_name)
       WHERE id = $7 AND deleted_at IS NULL RETURNING *`,
      [body.title?.trim() || null, body.abstract?.trim() || null, body.keywords || null,
       body.fileUrl || null, body.journalName?.trim() || null, body.conferenceName?.trim() || null, id]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in updateResearchPaper:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── UPDATE STATUS ───────────────────────

export const updateResearchPaperStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const { status, doi, issn, indexType, publicationDate } = req.body as {
      status?: string; doi?: string; issn?: string
      indexType?: string; publicationDate?: string
    }

    if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      res.status(400).json({ message: `status phải là: ${VALID_STATUSES.join(', ')}` })
      return
    }

    if (indexType && !VALID_INDEX.includes(indexType as (typeof VALID_INDEX)[number])) {
      res.status(400).json({ message: `indexType phải là: ${VALID_INDEX.join(', ')}` })
      return
    }

    const existing = await pool.query(
      'SELECT student_id, title FROM research_papers WHERE id = $1 AND deleted_at IS NULL', [id]
    )
    if (existing.rows.length === 0) { res.status(404).json({ message: 'Not found' }); return }

    const result = await pool.query(
      `UPDATE research_papers SET
         status = $1, doi = COALESCE($2, doi), issn = COALESCE($3, issn),
         index_type = COALESCE($4, index_type),
         publication_date = COALESCE($5::date, publication_date)
       WHERE id = $6 RETURNING *`,
      [status, doi || null, issn || null, indexType || null, publicationDate || null, id]
    )

    const paper = existing.rows[0]
    if (status === 'published') {
      await createNotification({
        userId: paper.student_id,
        type: 'research.published',
        title: 'Bài NCKH được xuất bản',
        message: `Bài "${paper.title}" đã chuyển sang trạng thái published.`,
        refType: 'project', refId: id
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in updateResearchPaperStatus:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── ASSIGN SUPERVISOR ───────────────────────

export const assignResearchSupervisor = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const { supervisorId } = req.body as { supervisorId?: number }
    if (!supervisorId) { res.status(400).json({ message: 'supervisorId là bắt buộc' }); return }

    const sv = await pool.query(
      "SELECT id, full_name FROM users WHERE id = $1 AND role IN ('lecturer','manager','admin') AND deleted_at IS NULL",
      [supervisorId]
    )
    if (sv.rows.length === 0) { res.status(404).json({ message: 'GV không tồn tại' }); return }

    const result = await pool.query(
      'UPDATE research_papers SET supervisor_id = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING *',
      [supervisorId, id]
    )
    if (result.rows.length === 0) { res.status(404).json({ message: 'Not found' }); return }

    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in assignResearchSupervisor:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── DELETE (soft) ───────────────────────

export const deleteResearchPaper = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const existing = await pool.query(
      'SELECT student_id FROM research_papers WHERE id = $1 AND deleted_at IS NULL', [id]
    )
    if (existing.rows.length === 0) { res.status(404).json({ message: 'Not found' }); return }
    if (req.user.role === 'student' && existing.rows[0].student_id !== req.user.id) {
      res.status(403).json({ message: 'Không có quyền' }); return
    }

    await pool.query('UPDATE research_papers SET deleted_at = NOW() WHERE id = $1', [id])
    res.json({ message: 'Đã xóa (soft delete)' })
  } catch (error) {
    console.error('❌ Error in deleteResearchPaper:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
