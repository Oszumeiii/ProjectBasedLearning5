import type { Request, Response } from 'express'
import crypto from 'crypto'
import pool from '../config/db'
import { UPLOAD_MAX_SIZE_MB } from '../config/env'
import { createNotification } from '../utils/notification.js'
import { detectFileType } from '../utils/file-type.js'
import { uploadFile, getPresignedUrl, downloadFile } from '../services/storage.service.js'
import { pushToQueue } from '../config/redis.js'

const sha256 = (buf: Buffer): string => crypto.createHash('sha256').update(buf).digest('hex')

const VALID_VISIBILITY = ['private', 'course', 'department', 'public'] as const
const REVIEW_STATUSES = ['under_review', 'revision_needed', 'approved', 'rejected'] as const

/** Tách từ khóa để so khớp nội dung (hỗ trợ kiểm tra trùng lặp / “RAG nội bộ”). */
function tokenizeReportText(text: string): Set<string> {
  const s = String(text).toLowerCase()
  const parts = s.split(/[\s0-9.,;:!?'"()[\]{}\\/|_+=<>@#^&*~`]+/).filter(Boolean)
  return new Set(parts.filter((w) => w.length >= 3))
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  const uni = a.size + b.size - inter
  return uni === 0 ? 0 : inter / uni
}

// ─── Visibility helper: can this user see this report? ───

async function canView(userId: number, role: string, report: Record<string, unknown>): Promise<boolean> {
  if (role === 'admin' || role === 'manager') return true
  if (report.author_id === userId) return true

  const vis = report.visibility as string
  if (vis === 'public') return true

  if (vis === 'course' && report.course_id) {
    const enrolled = await pool.query(
      'SELECT 1 FROM enrollments WHERE course_id = $1 AND student_id = $2',
      [report.course_id, userId]
    )
    if (enrolled.rows.length > 0) return true

    if (role === 'lecturer') {
      const teaches = await pool.query(
        'SELECT 1 FROM courses WHERE id = $1 AND lecturer_id = $2',
        [report.course_id, userId]
      )
      if (teaches.rows.length > 0) return true

      const coLecturer = await pool.query(
        'SELECT 1 FROM course_lecturers WHERE course_id = $1 AND lecturer_id = $2',
        [report.course_id, userId]
      )
      if (coLecturer.rows.length > 0) return true
    }
  }

  if (vis === 'department') {
    const authorDept = await pool.query('SELECT department FROM users WHERE id = $1', [report.author_id])
    const userDept = await pool.query('SELECT department FROM users WHERE id = $1', [userId])
    if (authorDept.rows[0]?.department && authorDept.rows[0].department === userDept.rows[0]?.department) {
      return true
    }
  }

  return false
}

// ══════════════════════════════════════════════════════════════
//  CREATE REPORT  (POST /reports — multipart file + metadata)
// ══════════════════════════════════════════════════════════════

export const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const { title, description, visibility, projectId, courseId, researchPaperId } = req.body as {
      title?: string; description?: string; visibility?: string
      projectId?: string; courseId?: string; researchPaperId?: string
    }

    if (!title?.trim()) {
      res.status(400).json({ message: 'title là bắt buộc' }); return
    }

    if (visibility && !VALID_VISIBILITY.includes(visibility as (typeof VALID_VISIBILITY)[number])) {
      res.status(400).json({ message: `visibility phải là: ${VALID_VISIBILITY.join(', ')}` }); return
    }

    // Enrollment check
    if (courseId && req.user.role === 'student') {
      const enrolled = await pool.query(
        'SELECT 1 FROM enrollments WHERE course_id = $1 AND student_id = $2',
        [Number(courseId), req.user.id]
      )
      if (enrolled.rows.length === 0) {
        res.status(403).json({ message: 'Bạn chưa tham gia lớp học phần này' }); return
      }
    }

    let fileUrl: string | null = null
    let fileName: string | null = null
    let fileSize: number | null = null
    let fileType: string | null = null
    let fileHash: string | null = null

    const file = req.file
    if (file) {
      if (file.size > UPLOAD_MAX_SIZE_MB * 1024 * 1024) {
        res.status(400).json({ message: `File vượt quá giới hạn ${UPLOAD_MAX_SIZE_MB}MB` }); return
      }

      const detected = detectFileType(file.buffer)
      if (!detected) {
        res.status(400).json({ message: 'Loại file không hợp lệ. Chỉ chấp nhận: pdf, docx, zip' }); return
      }

      const hash = sha256(file.buffer)

      const dup = await pool.query(
        'SELECT id, title FROM reports WHERE file_hash = $1 AND deleted_at IS NULL',
        [hash]
      )
      if (dup.rows.length > 0) {
        res.status(409).json({
          message: `File trùng lặp với báo cáo #${dup.rows[0].id}: "${dup.rows[0].title}"`,
          duplicateReportId: dup.rows[0].id
        })
        return
      }

      const key = `reports/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${hash}.${detected.ext}`
      await uploadFile(key, file.buffer, detected.mime)

      fileUrl = key
      fileName = file.originalname
      fileSize = file.size
      fileType = detected.dbType
      fileHash = hash
    }

    const result = await pool.query(
      `INSERT INTO reports
         (title, description, author_id, project_id, course_id, research_paper_id,
          file_url, file_name, file_size, file_type, file_hash,
          visibility, status, embedding_status, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, COALESCE($12,'course'), 'pending','pending', NOW())
       RETURNING *`,
      [
        title.trim(), description?.trim() || null, req.user.id,
        projectId ? Number(projectId) : null,
        courseId ? Number(courseId) : null,
        researchPaperId ? Number(researchPaperId) : null,
        fileUrl, fileName, fileSize, fileType, fileHash,
        visibility || null
      ]
    )

    const report = result.rows[0]

    // Version 1
    await pool.query(
      `INSERT INTO report_versions (report_id, version_number, content, file_url, file_size, file_hash, change_summary, created_by)
       VALUES ($1, 1, NULL, $2, $3, $4, 'Bản nộp đầu tiên', $5)`,
      [report.id, fileUrl, fileSize, fileHash, req.user.id]
    )

    if (fileUrl && (fileType === 'pdf' || fileType === 'docx')) {
      pushToQueue('pdf_processing_queue', {
        report_id: report.id,
        file_key: fileUrl,
        file_type: fileType
      }).catch(err =>
        console.error(`❌ Failed to enqueue report #${report.id}:`, err)
      )
    }

    res.status(201).json(report)
  } catch (error) {
    console.error('❌ Error in createReport:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ══════════════════════════════════════════════════════════════
//  PLAGIARISM / TƯƠNG ĐỒNG (POST /reports/:id/plagiarism-check)
// ══════════════════════════════════════════════════════════════

export const checkReportPlagiarism = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const id = Number(req.params.id)
    const r0 = await pool.query('SELECT * FROM reports WHERE id = $1 AND deleted_at IS NULL', [id])
    if (r0.rows.length === 0) {
      res.status(404).json({ message: 'Report not found' })
      return
    }

    const report = r0.rows[0] as Record<string, unknown>
    if (!(await canView(req.user.id, req.user.role, report))) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const content = String(report.content || '').slice(0, 80000)
    const courseId = report.course_id != null ? Number(report.course_id) : null

    if (content.length < 80) {
      res.json({
        analyzed: false,
        message:
          'Chưa đủ văn bản trích xuất từ file (PDF/DOCX). Chờ xử lý xong hoặc báo cáo quá ngắn.',
        matches: []
      })
      return
    }

    if (!courseId || courseId <= 0) {
      res.json({
        analyzed: false,
        message: 'Báo cáo chưa gắn lớp học — chỉ so sánh được các báo cáo trong cùng một lớp.',
        matches: []
      })
      return
    }

    const authorId = Number(report.author_id)
    const cand = await pool.query(
      `SELECT r.id, r.title, LEFT(r.content, 14000) AS content, u.full_name AS author_name
       FROM reports r
       JOIN users u ON u.id = r.author_id
       WHERE r.deleted_at IS NULL
         AND r.id != $1
         AND r.author_id != $2
         AND r.course_id = $3
         AND r.content IS NOT NULL
         AND length(trim(r.content)) > 100
       ORDER BY r.created_at DESC
       LIMIT 80`,
      [id, authorId, courseId]
    )

    const targetTokens = tokenizeReportText(content)
    const matches = cand.rows
      .map((row: { id: unknown; title: unknown; content: unknown; author_name: unknown }) => {
        const sim = jaccardSimilarity(targetTokens, tokenizeReportText(String(row.content || '')))
        return {
          reportId: Number(row.id),
          title: String(row.title || ''),
          authorName: String(row.author_name || ''),
          similarityPercent: Math.min(100, Math.round(sim * 100))
        }
      })
      .filter((m) => m.similarityPercent >= 12)
      .sort((a, b) => b.similarityPercent - a.similarityPercent)
      .slice(0, 10)

    const maxSim = matches[0]?.similarityPercent ?? 0
    let summary: string
    if (maxSim >= 48) {
      summary = 'Cao: có mức trùng lặp từ vựng đáng kể với báo cáo khác trong lớp — nên xem xét thủ công.'
    } else if (maxSim >= 28) {
      summary = 'Trung bình: một số cụm từ tương đồng với báo cáo khác.'
    } else if (matches.length === 0) {
      summary = 'Thấp: không thấy trùng lặp rõ trong các báo cáo cùng lớp đã so sánh.'
    } else {
      summary = 'Thấp đến trung bình: có điểm tương đồng nhẹ — nên đối chiếu thêm.'
    }

    res.json({
      analyzed: true,
      method: 'lexical_rag_corpus',
      summary,
      maxSimilarityPercent: maxSim,
      comparedCount: cand.rows.length,
      matches
    })
  } catch (error) {
    console.error('❌ checkReportPlagiarism:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ══════════════════════════════════════════════════════════════
//  LIST REPORTS  (GET /reports)
// ══════════════════════════════════════════════════════════════

export const listReports = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const {
      status, courseId, authorId, projectId,
      dateFrom, dateTo, search,
      reportType, academicYear, semester, department, tag,
      page = '1', limit = '20', sort = 'recent'
    } = req.query

    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20))
    const offset = (pageNum - 1) * limitNum

    const conds: string[] = ['r.deleted_at IS NULL']
    const params: unknown[] = []

    if (status && typeof status === 'string') {
      params.push(status); conds.push(`r.status = $${params.length}`)
    }
    if (courseId) { params.push(Number(courseId)); conds.push(`r.course_id = $${params.length}`) }
    if (authorId) { params.push(Number(authorId)); conds.push(`r.author_id = $${params.length}`) }
    if (projectId) { params.push(Number(projectId)); conds.push(`r.project_id = $${params.length}`) }
    if (typeof dateFrom === 'string' && dateFrom) {
      params.push(dateFrom); conds.push(`r.created_at >= $${params.length}::timestamptz`)
    }
    if (typeof dateTo === 'string' && dateTo) {
      params.push(dateTo); conds.push(`r.created_at <= $${params.length}::timestamptz`)
    }
    if (typeof reportType === 'string' && reportType) {
      params.push(reportType); conds.push(`COALESCE(r.report_type, c.course_type) = $${params.length}`)
    }
    if (typeof academicYear === 'string' && academicYear) {
      params.push(academicYear); conds.push(`COALESCE(r.academic_year, c.academic_year) = $${params.length}`)
    }
    if (typeof semester === 'string' && semester) {
      params.push(semester); conds.push(`COALESCE(r.semester, c.semester) = $${params.length}`)
    }
    if (typeof department === 'string' && department) {
      params.push(department); conds.push(`u.department = $${params.length}`)
    }
    if (typeof tag === 'string' && tag) {
      params.push(tag); conds.push(`($${params.length} = ANY(r.tags) OR $${params.length} = ANY(p.tags))`)
    }
    if (typeof search === 'string' && search.trim()) {
      params.push(`%${search.trim()}%`)
      conds.push(`(r.title ILIKE $${params.length}
        OR r.description ILIKE $${params.length}
        OR r.abstract ILIKE $${params.length}
        OR u.full_name ILIKE $${params.length}
        OR sup.full_name ILIKE $${params.length}
        OR c.name ILIKE $${params.length}
        OR c.code ILIKE $${params.length})`)
    }

    // Role-based visibility
    if (req.user.role === 'student') {
      params.push(req.user.id, req.user.id)
      conds.push(`(
        r.author_id = $${params.length - 1}
        OR (r.visibility = 'public' AND r.status = 'approved')
        OR (r.visibility = 'course' AND r.course_id IN (
          SELECT course_id FROM enrollments WHERE student_id = $${params.length}
        ))
      )`)
    } else if (req.user.role === 'lecturer') {
      params.push(req.user.id, req.user.id, req.user.id)
      conds.push(`(
        r.author_id = $${params.length - 2}
        OR r.visibility = 'public'
        OR r.course_id IN (SELECT id FROM courses WHERE lecturer_id = $${params.length - 1})
        OR r.course_id IN (SELECT course_id FROM course_lecturers WHERE lecturer_id = $${params.length})
      )`)
    }

    const userId = req.user.id

    const joins = `
      FROM reports r
      LEFT JOIN users u ON u.id = r.author_id
      LEFT JOIN courses c ON c.id = r.course_id
      LEFT JOIN projects p ON p.id = r.project_id
      LEFT JOIN users sup ON sup.id = COALESCE(p.supervisor_id, c.lecturer_id)
      LEFT JOIN users rv ON rv.id = r.reviewed_by
      LEFT JOIN report_ratings rr ON rr.report_id = r.id
      LEFT JOIN favorites fv ON fv.report_id = r.id AND fv.user_id = $${params.length + 1}`

    params.push(userId)

    const where = `WHERE ${conds.join(' AND ')}`

    let orderBy = 'ORDER BY r.created_at DESC'
    if (sort === 'popular') orderBy = 'ORDER BY r.view_count DESC NULLS LAST'
    else if (sort === 'rated') orderBy = 'ORDER BY avg_rating DESC NULLS LAST'
    else if (sort === 'downloads') orderBy = 'ORDER BY r.download_count DESC NULLS LAST'

    const [countRes, listRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(DISTINCT r.id)::int AS total ${joins} ${where}`,
        params
      ),
      pool.query(
        `SELECT r.id, r.title, r.description, r.abstract, r.file_type, r.file_name,
                r.file_size, r.status, r.visibility, r.view_count, r.download_count,
                r.embedding_status, r.author_id, r.course_id, r.project_id,
                r.tags, r.report_type, r.academic_year, r.semester,
                r.created_at, r.submitted_at,
                u.full_name AS author_name, u.email AS author_email,
                u.student_code, u.class_name, u.department, u.major,
                c.name AS course_name, c.code AS course_code,
                c.course_type, c.semester AS course_semester,
                c.academic_year AS course_academic_year,
                p.title AS project_title,
                sup.full_name AS supervisor_name,
                rv.full_name AS reviewer_name,
                COALESCE(AVG(rr.rating), 0) AS avg_rating,
                COUNT(DISTINCT rr.id)::int AS rating_count,
                (fv.id IS NOT NULL) AS is_favorited
         ${joins}
         ${where}
         GROUP BY r.id, u.full_name, u.email, u.student_code, u.class_name,
                  u.department, u.major, c.name, c.code, c.course_type,
                  c.semester, c.academic_year, p.title, sup.full_name, rv.full_name, fv.id
         ${orderBy}
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limitNum, offset]
      )
    ])

    res.json({ items: listRes.rows, page: pageNum, limit: limitNum, total: countRes.rows[0]?.total ?? 0 })
  } catch (error) {
    console.error('❌ Error in listReports:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ══════════════════════════════════════════════════════════════
//  GET REPORT BY ID  (GET /reports/:id)
// ══════════════════════════════════════════════════════════════

export const getReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const userId = req.user.id

    const result = await pool.query(
      `SELECT r.*,
              u.full_name AS author_name, u.email AS author_email,
              c.name AS course_name, c.code AS course_code,
              rv.full_name AS reviewer_name,
              COALESCE(AVG(rr.rating), 0) AS avg_rating,
              COUNT(DISTINCT rr.id)::int AS rating_count,
              (fv.id IS NOT NULL) AS is_favorited
       FROM reports r
       LEFT JOIN users u ON u.id = r.author_id
       LEFT JOIN courses c ON c.id = r.course_id
       LEFT JOIN users rv ON rv.id = r.reviewed_by
       LEFT JOIN report_ratings rr ON rr.report_id = r.id
       LEFT JOIN favorites fv ON fv.report_id = r.id AND fv.user_id = $2
       WHERE r.id = $1 AND r.deleted_at IS NULL
       GROUP BY r.id, u.full_name, u.email, c.name, c.code, rv.full_name, fv.id`,
      [id, userId]
    )

    if (result.rows.length === 0) { res.status(404).json({ message: 'Report not found' }); return }

    const report = result.rows[0]

    if (!(await canView(req.user.id, req.user.role, report))) {
      res.status(403).json({ message: 'Bạn không có quyền xem báo cáo này' }); return
    }

    await pool.query('UPDATE reports SET view_count = view_count + 1 WHERE id = $1', [id])

    // Version count
    const verCount = await pool.query(
      'SELECT COUNT(*)::int AS cnt FROM report_versions WHERE report_id = $1', [id]
    )
    report.version_count = verCount.rows[0]?.cnt ?? 0

    res.json(report)
  } catch (error) {
    console.error('❌ Error in getReportById:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ══════════════════════════════════════════════════════════════
//  UPDATE REPORT  (PATCH /reports/:id — metadata only)
// ══════════════════════════════════════════════════════════════

export const updateReport = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)

    const existing = await pool.query(
      'SELECT author_id FROM reports WHERE id = $1 AND deleted_at IS NULL', [id]
    )
    if (existing.rows.length === 0) { res.status(404).json({ message: 'Report not found' }); return }

    if (req.user.role === 'student' && existing.rows[0].author_id !== req.user.id) {
      res.status(403).json({ message: 'Không có quyền sửa báo cáo này' }); return
    }

    const { title, description, visibility, projectId, courseId, researchPaperId } = req.body as {
      title?: string; description?: string; visibility?: string
      projectId?: number; courseId?: number; researchPaperId?: number
    }

    if (visibility && !VALID_VISIBILITY.includes(visibility as (typeof VALID_VISIBILITY)[number])) {
      res.status(400).json({ message: `visibility phải là: ${VALID_VISIBILITY.join(', ')}` }); return
    }

    const result = await pool.query(
      `UPDATE reports SET
         title = COALESCE($1, title), description = COALESCE($2, description),
         visibility = COALESCE($3, visibility), project_id = COALESCE($4, project_id),
         course_id = COALESCE($5, course_id), research_paper_id = COALESCE($6, research_paper_id)
       WHERE id = $7 AND deleted_at IS NULL RETURNING *`,
      [
        title?.trim() || null, description?.trim() || null,
        visibility || null, projectId ?? null, courseId ?? null,
        researchPaperId ?? null, id
      ]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in updateReport:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ══════════════════════════════════════════════════════════════
//  GHI NHẬN XÉT GIẢNG VIÊN (PATCH /reports/:id/review-note)
// ══════════════════════════════════════════════════════════════

export const patchReportReviewNote = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    if (!['lecturer', 'manager', 'admin'].includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const id = Number(req.params.id)
    const { reviewNote } = req.body as { reviewNote?: string }
    const note = reviewNote?.trim() || null

    const existing = await pool.query('SELECT * FROM reports WHERE id = $1 AND deleted_at IS NULL', [id])
    if (existing.rows.length === 0) {
      res.status(404).json({ message: 'Report not found' })
      return
    }
    const report = existing.rows[0] as Record<string, unknown>
    if (!(await canView(req.user.id, req.user.role, report))) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const result = await pool.query(
      `UPDATE reports SET review_note = $1, reviewed_by = $2 WHERE id = $3
       RETURNING id, review_note, reviewed_by, status, title`,
      [note, req.user.id, id]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ patchReportReviewNote:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ══════════════════════════════════════════════════════════════
//  DELETE REPORT  (DELETE /reports/:id — soft delete)
// ══════════════════════════════════════════════════════════════

export const deleteReport = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const existing = await pool.query(
      'SELECT author_id FROM reports WHERE id = $1 AND deleted_at IS NULL', [id]
    )
    if (existing.rows.length === 0) { res.status(404).json({ message: 'Report not found' }); return }

    if (req.user.role === 'student' && existing.rows[0].author_id !== req.user.id) {
      res.status(403).json({ message: 'Không có quyền xóa báo cáo này' }); return
    }

    await pool.query('UPDATE reports SET deleted_at = NOW() WHERE id = $1', [id])
    res.json({ message: 'Đã xóa báo cáo (soft delete)' })
  } catch (error) {
    console.error('❌ Error in deleteReport:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ══════════════════════════════════════════════════════════════
//  APPROVE / REJECT  (PATCH /reports/:id/status — staff only)
// ══════════════════════════════════════════════════════════════

export const updateReportStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const { status, reviewNote } = req.body as { status?: string; reviewNote?: string }

    if (!status || !REVIEW_STATUSES.includes(status as (typeof REVIEW_STATUSES)[number])) {
      res.status(400).json({ message: `status phải là: ${REVIEW_STATUSES.join(', ')}` }); return
    }

    const existing = await pool.query(
      'SELECT id, author_id, title, course_id FROM reports WHERE id = $1 AND deleted_at IS NULL', [id]
    )
    if (existing.rows.length === 0) { res.status(404).json({ message: 'Report not found' }); return }

    const report = existing.rows[0]

    if (req.user.role === 'lecturer') {
      const courseId = report.course_id
      if (!courseId) {
        res.status(403).json({ message: 'Báo cáo không thuộc lớp nào — bạn không có quyền duyệt.' }); return
      }
      const teaches = await pool.query(
        'SELECT 1 FROM courses WHERE id = $1 AND lecturer_id = $2', [courseId, req.user.id]
      )
      const coLecturer = await pool.query(
        'SELECT 1 FROM course_lecturers WHERE course_id = $1 AND lecturer_id = $2', [courseId, req.user.id]
      )
      if (teaches.rows.length === 0 && coLecturer.rows.length === 0) {
        res.status(403).json({ message: 'Bạn không phải giảng viên của lớp này — không có quyền duyệt.' }); return
      }
    }

    const timeField = status === 'approved' ? 'approved_at' : status === 'rejected' ? 'rejected_at' : null

    const result = await pool.query(
      `UPDATE reports SET
         status = $1, reviewed_by = $2, review_note = $3
         ${timeField ? `, ${timeField} = NOW()` : ''}
         ${status === 'approved' ? `, visibility = 'public'` : ''}
       WHERE id = $4 RETURNING *`,
      [status, req.user.id, reviewNote?.trim() || null, id]
    )

    const statusMessages: Record<string, string> = {
      approved: `Báo cáo "${report.title}" đã được duyệt thành công.`,
      rejected: `Báo cáo "${report.title}" đã bị từ chối.${reviewNote ? ' Lý do: ' + reviewNote : ''}`,
      revision_needed: `Báo cáo "${report.title}" cần chỉnh sửa lại.${reviewNote ? ' Ghi chú: ' + reviewNote : ''}`,
      under_review: `Báo cáo "${report.title}" đã chuyển sang trạng thái chờ duyệt.`
    }

    const typeMap: Record<string, { type: string; title: string; msg: string }> = {
      approved: {
        type: 'report.approved', title: 'Báo cáo được duyệt',
        msg: `Báo cáo "${report.title}" đã được duyệt.`
      },
      rejected: {
        type: 'report.rejected', title: 'Báo cáo bị từ chối',
        msg: `Báo cáo "${report.title}" bị từ chối.${reviewNote ? ' Lý do: ' + reviewNote : ''}`
      },
      revision_needed: {
        type: 'report.revision_needed', title: 'Yêu cầu chỉnh sửa',
        msg: `Báo cáo "${report.title}" cần chỉnh sửa.${reviewNote ? ' Ghi chú: ' + reviewNote : ''}`
      }
    }

    const notif = typeMap[status]
    if (notif) {
      await createNotification({
        userId: report.author_id,
        type: notif.type, title: notif.title, message: notif.msg,
        refType: 'report', refId: id
      })
    }

    res.json({
      ...result.rows[0],
      reviewMessage: statusMessages[status] || `Trạng thái báo cáo đã cập nhật thành "${status}".`
    })
  } catch (error) {
    console.error('❌ Error in updateReportStatus:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ══════════════════════════════════════════════════════════════
//  RESUBMIT  (POST /reports/:id/resubmit — new version)
// ══════════════════════════════════════════════════════════════

export const resubmitReport = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)

    const existing = await pool.query(
      'SELECT id, author_id, status FROM reports WHERE id = $1 AND deleted_at IS NULL', [id]
    )
    if (existing.rows.length === 0) { res.status(404).json({ message: 'Report not found' }); return }

    const report = existing.rows[0]
    if (report.author_id !== req.user.id) {
      res.status(403).json({ message: 'Chỉ tác giả mới được nộp lại' }); return
    }
    if (!['revision_needed', 'rejected'].includes(report.status)) {
      res.status(400).json({ message: 'Chỉ nộp lại khi báo cáo ở trạng thái revision_needed hoặc rejected' }); return
    }

    const file = req.file
    if (!file) { res.status(400).json({ message: 'File là bắt buộc khi nộp lại' }); return }

    if (file.size > UPLOAD_MAX_SIZE_MB * 1024 * 1024) {
      res.status(400).json({ message: `File vượt quá giới hạn ${UPLOAD_MAX_SIZE_MB}MB` }); return
    }

    const detected = detectFileType(file.buffer)
    if (!detected) {
      res.status(400).json({ message: 'Loại file không hợp lệ. Chỉ chấp nhận: pdf, docx, zip' }); return
    }

    const hash = sha256(file.buffer)
    const key = `reports/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${hash}.${detected.ext}`
    await uploadFile(key, file.buffer, detected.mime)

    // Next version number
    const verRow = await pool.query(
      'SELECT COALESCE(MAX(version_number), 0) + 1 AS next FROM report_versions WHERE report_id = $1', [id]
    )
    const nextVer: number = verRow.rows[0].next

    const { changeSummary } = req.body as { changeSummary?: string }

    await pool.query(
      `INSERT INTO report_versions (report_id, version_number, file_url, file_size, file_hash, change_summary, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, nextVer, key, file.size, hash, changeSummary?.trim() || `Nộp lại lần ${nextVer}`, req.user.id]
    )

    const result = await pool.query(
      `UPDATE reports SET
         file_url = $1, file_name = $2, file_size = $3, file_type = $4, file_hash = $5,
         status = 'pending', embedding_status = 'pending', content = NULL,
         submitted_at = NOW(), review_note = NULL, reviewed_by = NULL,
         approved_at = NULL, rejected_at = NULL
       WHERE id = $6 RETURNING *`,
      [key, file.originalname, file.size, detected.dbType, hash, id]
    )

    if (detected.dbType === 'pdf' || detected.dbType === 'docx') {
      pushToQueue('pdf_processing_queue', {
        report_id: id,
        file_key: key,
        file_type: detected.dbType
      }).catch(err =>
        console.error(`❌ Failed to enqueue resubmit for report #${id}:`, err)
      )
    }

    res.json({ ...result.rows[0], version_number: nextVer })
  } catch (error) {
    console.error('❌ Error in resubmitReport:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ══════════════════════════════════════════════════════════════
//  DOWNLOAD  (GET /reports/:id/download — presigned URL)
// ══════════════════════════════════════════════════════════════

export const downloadReport = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const report = (await pool.query(
      'SELECT id, file_url, file_name, file_type, author_id, course_id, visibility FROM reports WHERE id = $1 AND deleted_at IS NULL',
      [id]
    )).rows[0]

    if (!report) { res.status(404).json({ message: 'Report not found' }); return }
    if (!report.file_url) { res.status(404).json({ message: 'Báo cáo không có file đính kèm' }); return }

    if (!(await canView(req.user.id, req.user.role, report))) {
      res.status(403).json({ message: 'Bạn không có quyền tải báo cáo này' }); return
    }

    await pool.query('UPDATE reports SET download_count = download_count + 1 WHERE id = $1', [id])

    const fileBuffer = await downloadFile(report.file_url)
    const fileName = report.file_name ?? `report-${id}`
    const contentType =
      report.file_type === 'pdf'
        ? 'application/pdf'
        : report.file_type === 'docx'
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : report.file_type === 'zip'
            ? 'application/zip'
            : 'application/octet-stream'

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`)
    res.send(fileBuffer)
  } catch (error) {
    console.error('❌ Error in downloadReport:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ══════════════════════════════════════════════════════════════
//  VERSIONS  (GET /reports/:id/versions)
// ══════════════════════════════════════════════════════════════

export const listReportVersions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const reportId = Number(req.params.id)

    const report = (await pool.query(
      'SELECT author_id, course_id, visibility FROM reports WHERE id = $1 AND deleted_at IS NULL', [reportId]
    )).rows[0]
    if (!report) { res.status(404).json({ message: 'Report not found' }); return }

    if (!(await canView(req.user.id, req.user.role, report))) {
      res.status(403).json({ message: 'Không có quyền' }); return
    }

    const result = await pool.query(
      `SELECT rv.*, u.full_name AS created_by_name
       FROM report_versions rv
       LEFT JOIN users u ON u.id = rv.created_by
       WHERE rv.report_id = $1
       ORDER BY rv.version_number ASC`,
      [reportId]
    )

    res.json({ items: result.rows })
  } catch (error) {
    console.error('❌ Error in listReportVersions:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ══════════════════════════════════════════════════════════════
//  DOWNLOAD VERSION  (GET /reports/:id/versions/:versionId/download)
// ══════════════════════════════════════════════════════════════

export const downloadReportVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const reportId = Number(req.params.id)
    const versionId = Number(req.params.versionId)

    const report = (await pool.query(
      'SELECT author_id, course_id, visibility FROM reports WHERE id = $1 AND deleted_at IS NULL', [reportId]
    )).rows[0]
    if (!report) { res.status(404).json({ message: 'Report not found' }); return }

    if (!(await canView(req.user.id, req.user.role, report))) {
      res.status(403).json({ message: 'Không có quyền' }); return
    }

    const ver = (await pool.query(
      'SELECT id, file_url FROM report_versions WHERE report_id = $1 AND id = $2',
      [reportId, versionId]
    )).rows[0]
    if (!ver) { res.status(404).json({ message: 'Version not found' }); return }
    if (!ver.file_url) { res.status(404).json({ message: 'Version không có file' }); return }

    const url = await getPresignedUrl(ver.file_url, 3600)
    res.json({ url })
  } catch (error) {
    console.error('❌ Error in downloadReportVersion:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ══════════════════════════════════════════════════════════════
//  RATINGS & FAVORITES  (giữ nguyên logic cũ, thêm auth check)
// ══════════════════════════════════════════════════════════════

export const upsertRating = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const reportId = Number(req.params.id)
    const { rating, comment } = req.body as { rating?: number; comment?: string }

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: 'rating phải từ 1 đến 5' }); return
    }

    const result = await pool.query(
      `INSERT INTO report_ratings (user_id, report_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, report_id)
       DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
       RETURNING *`,
      [req.user.id, reportId, rating, comment ?? null]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in upsertRating:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getRatings = async (req: Request, res: Response): Promise<void> => {
  try {
    const reportId = Number(req.params.id)

    const [items, agg] = await Promise.all([
      pool.query(
        `SELECT rr.*, u.full_name AS reviewer_name
         FROM report_ratings rr LEFT JOIN users u ON u.id = rr.user_id
         WHERE rr.report_id = $1 ORDER BY rr.created_at DESC`,
        [reportId]
      ),
      pool.query(
        'SELECT COALESCE(AVG(rating),0) AS avg_rating, COUNT(*)::int AS count FROM report_ratings WHERE report_id = $1',
        [reportId]
      )
    ])

    res.json({ avgRating: Number(agg.rows[0]?.avg_rating ?? 0), count: agg.rows[0]?.count ?? 0, items: items.rows })
  } catch (error) {
    console.error('❌ Error in getRatings:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const addFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const reportId = Number(req.params.id)
    const result = await pool.query(
      `INSERT INTO favorites (user_id, report_id) VALUES ($1, $2)
       ON CONFLICT (user_id, report_id) DO NOTHING RETURNING *`,
      [req.user.id, reportId]
    )

    if (result.rows.length === 0) { res.json({ message: 'Already favorited' }); return }
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in addFavorite:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const removeFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const reportId = Number(req.params.id)
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND report_id = $2 RETURNING id',
      [req.user.id, reportId]
    )

    if (result.rows.length === 0) { res.status(404).json({ message: 'Favorite not found' }); return }
    res.json({ message: 'Favorite removed' })
  } catch (error) {
    console.error('❌ Error in removeFavorite:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ══════════════════════════════════════════════════════════════
//  REFERENCES  (GET /reports/:id/references)
// ══════════════════════════════════════════════════════════════

export const getReportReferences = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const reportId = Number(req.params.id)

    const report = (await pool.query(
      'SELECT id, author_id, course_id, visibility FROM reports WHERE id = $1 AND deleted_at IS NULL',
      [reportId]
    )).rows[0]

    if (!report) { res.status(404).json({ message: 'Report not found' }); return }

    if (!(await canView(req.user.id, req.user.role, report))) {
      res.status(403).json({ message: 'Không có quyền xem tài liệu tham khảo này' }); return
    }

    const result = await pool.query(
      'SELECT id, title, authors, year, source, url, ref_order FROM report_references WHERE report_id = $1 ORDER BY ref_order',
      [reportId]
    )

    res.json({ items: result.rows })
  } catch (error) {
    console.error('❌ Error in getReportReferences:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ══════════════════════════════════════════════════════════════
//  MEMBERS  (GET /reports/:id/members)
// ══════════════════════════════════════════════════════════════

export const getReportMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const reportId = Number(req.params.id)

    const report = (await pool.query(
      'SELECT course_id FROM reports WHERE id = $1 AND deleted_at IS NULL',
      [reportId]
    )).rows[0]

    if (!report) { res.status(404).json({ message: 'Report not found' }); return }

    if (!report.course_id) { res.json({ items: [] }); return }

    const result = await pool.query(
      `SELECT u.id, u.full_name, u.student_code, u.class_name, u.department, u.major
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       WHERE e.course_id = $1 AND e.status IN ('active', 'completed')
       ORDER BY u.full_name`,
      [report.course_id]
    )

    res.json({ items: result.rows })
  } catch (error) {
    console.error('❌ Error in getReportMembers:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
