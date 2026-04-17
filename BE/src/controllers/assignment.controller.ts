import type { Request, Response } from 'express'
import crypto from 'crypto'
import path from 'path'
import pool from '../config/db'
import { UPLOAD_MAX_SIZE_MB } from '../config/env'
import { detectFileType } from '../utils/file-type'
import { uploadFile, downloadFile } from '../services/storage.service'
import { canManageCourse, isStudentEnrolled, type CourseRow } from '../utils/courseAccess'
import { createNotification } from '../utils/notification'

const sha256 = (buf: Buffer): string => crypto.createHash('sha256').update(buf).digest('hex')

async function loadCourse(courseId: number | string): Promise<(CourseRow & Record<string, unknown>) | null> {
  const parsedCourseId = Number(courseId)
  if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) return null
  const r = await pool.query('SELECT * FROM courses WHERE id = $1 AND deleted_at IS NULL', [parsedCourseId])
  return r.rows[0] ?? null
}

async function loadAssignment(assignmentId: number): Promise<Record<string, unknown> | null> {
  if (!Number.isInteger(assignmentId) || assignmentId <= 0) return null
  const r = await pool.query(
    `SELECT a.*, c.id AS course_row_id, c.lecturer_id
     FROM assignments a
     JOIN courses c ON c.id = a.course_id
     WHERE a.id = $1 AND a.deleted_at IS NULL`,
    [assignmentId]
  )
  return r.rows[0] ?? null
}

function normalizeAttachments(input: unknown): Array<{ name: string; url?: string; size?: string }> {
  if (!Array.isArray(input)) return []
  const normalized: Array<{ name: string; url?: string; size?: string }> = []
  for (const item of input) {
    const row = item as Record<string, unknown>
    const name = typeof row.name === 'string' ? row.name.trim() : ''
    if (!name) continue
    const entry: { name: string; url?: string; size?: string } = { name }
    if (typeof row.url === 'string') entry.url = row.url
    if (typeof row.size === 'string') entry.size = row.size
    normalized.push(entry)
  }
  return normalized
}

function parseAttachmentPayload(input: unknown): Array<{ name: string; url?: string; size?: string }> {
  if (typeof input === 'string') {
    try {
      return normalizeAttachments(JSON.parse(input))
    } catch {
      return []
    }
  }
  return normalizeAttachments(input)
}

async function uploadAttachmentFiles(
  files: Express.Multer.File[] | undefined,
  folder: string
): Promise<Array<{ name: string; url: string; size: string }>> {
  if (!files?.length) return []
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const uploaded: Array<{ name: string; url: string; size: string }> = []

  for (const file of files) {
    const ext = path.extname(file.originalname).replace('.', '').toLowerCase() || 'bin'
    const hash = sha256(file.buffer)
    const key = `${folder}/${year}/${month}/${hash}.${ext}`
    await uploadFile(key, file.buffer, file.mimetype || 'application/octet-stream')
    uploaded.push({
      name: file.originalname,
      url: key,
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`
    })
  }

  return uploaded
}

function getAttachmentFromUnknown(
  value: unknown,
  index: number
): { name: string; url: string } | null {
  if (!Array.isArray(value) || index < 0 || index >= value.length) return null
  const row = value[index] as Record<string, unknown>
  const name = typeof row?.name === 'string' ? row.name : ''
  const url = typeof row?.url === 'string' ? row.url : ''
  if (!name || !url) return null
  return { name, url }
}

function contentTypeFromFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()
  if (ext === '.pdf') return 'application/pdf'
  if (ext === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (ext === '.zip') return 'application/zip'
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  return 'application/octet-stream'
}

export const listAssignmentsByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const courseId = Number(req.params.courseId)
    const course = await loadCourse(courseId)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    const isStudent = req.user.role === 'student'
    let canView = false
    if (isStudent) {
      canView = await isStudentEnrolled(courseId, req.user.id)
    } else {
      canView = await canManageCourse(req.user.id, req.user.role, course)
    }

    if (!canView) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const result = await pool.query(
      `SELECT a.*,
              u.full_name AS created_by_name,
              (
                SELECT COUNT(*)::int FROM assignment_submissions s WHERE s.assignment_id = a.id
              ) AS total_submissions,
              (
                SELECT COUNT(*)::int FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.status IN ('submitted','late','graded')
              ) AS submitted_count,
              (
                SELECT COUNT(*)::int FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.status = 'graded'
              ) AS graded_count
       FROM assignments a
       LEFT JOIN users u ON u.id = a.created_by
       WHERE a.course_id = $1
         AND a.deleted_at IS NULL
         AND ($2 = false OR a.is_published = TRUE)
       ORDER BY a.created_at DESC`,
      [courseId, !isStudent]
    )

    res.json({ items: result.rows })
  } catch (error) {
    console.error('❌ listAssignmentsByCourse:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect()
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const {
      courseId,
      title,
      description,
      assignmentType,
      deadline,
      maxScore,
      allowLateSubmission,
      latePenaltyPercent,
      attachments
    } = req.body as {
      courseId?: number | string
      title?: string
      description?: string
      assignmentType?: string
      deadline?: string
      maxScore?: number | string
      allowLateSubmission?: boolean
      latePenaltyPercent?: number | string
      attachments?: unknown
    }
    const uploadedAttachments = await uploadAttachmentFiles(req.files as Express.Multer.File[] | undefined, 'assignment-attachments')
    const finalAttachments = [...parseAttachmentPayload(attachments), ...uploadedAttachments]

    const parsedCourseId = Number(courseId)
    if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) {
      res.status(400).json({ message: 'courseId không hợp lệ' })
      return
    }

    const course = await loadCourse(parsedCourseId)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    const canManage = await canManageCourse(req.user.id, req.user.role, course)
    if (!canManage) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    if (!title?.trim()) {
      res.status(400).json({ message: 'title là bắt buộc' })
      return
    }

    if (!deadline || Number.isNaN(new Date(deadline).getTime())) {
      res.status(400).json({ message: 'deadline không hợp lệ' })
      return
    }

    const type = (assignmentType ?? 'report').toLowerCase()
    if (!['report', 'exercise', 'project', 'quiz'].includes(type)) {
      res.status(400).json({ message: 'assignmentType không hợp lệ' })
      return
    }

    const parsedMaxScore = Number(maxScore ?? 10)
    if (!Number.isFinite(parsedMaxScore) || parsedMaxScore <= 0 || parsedMaxScore > 100) {
      res.status(400).json({ message: 'maxScore phải trong khoảng >0 và <=100' })
      return
    }

    const parsedLatePenalty = Number(latePenaltyPercent ?? 0)
    if (!Number.isFinite(parsedLatePenalty) || parsedLatePenalty < 0 || parsedLatePenalty > 100) {
      res.status(400).json({ message: 'latePenaltyPercent phải trong khoảng 0-100' })
      return
    }

    await client.query('BEGIN')
    const ins = await client.query(
      `INSERT INTO assignments
        (course_id, title, description, assignment_type, deadline, max_score, attachments,
         allow_late_submission, late_penalty_percent, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        parsedCourseId,
        title.trim(),
        description?.trim() || null,
        type,
        deadline,
        parsedMaxScore,
        JSON.stringify(finalAttachments),
        Boolean(allowLateSubmission),
        parsedLatePenalty,
        req.user.id
      ]
    )

    const assignment = ins.rows[0] as { id: number; title: string; course_id: number }

    await client.query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, status)
       SELECT $1, e.student_id, 'not_submitted'
       FROM enrollments e
       WHERE e.course_id = $2 AND e.status = 'active'
       ON CONFLICT (assignment_id, student_id) DO NOTHING`,
      [assignment.id, parsedCourseId]
    )

    await client.query('COMMIT')

    const students = await pool.query(
      `SELECT e.student_id, u.full_name
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       WHERE e.course_id = $1 AND e.status = 'active'`,
      [assignment.course_id]
    )

    await Promise.all(
      students.rows.map((student) =>
        createNotification({
          userId: student.student_id,
          type: 'assignment_created',
          title: 'Bài tập mới',
          message: `Bạn có bài tập mới: ${assignment.title}`,
          refType: 'course',
          refId: assignment.course_id
        })
      )
    )

    res.status(201).json(assignment)
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('❌ createAssignment:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    client.release()
  }
}

export const patchAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const assignmentId = Number(req.params.id)
    const assignment = await loadAssignment(assignmentId)
    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' })
      return
    }

    const canManage = await canManageCourse(req.user.id, req.user.role, { id: Number(assignment.course_row_id), lecturer_id: Number(assignment.lecturer_id) } as CourseRow)
    if (!canManage) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const { title, description, assignmentType, deadline, maxScore, allowLateSubmission, latePenaltyPercent, isPublished, attachments } = req.body as Record<string, unknown>
    const uploadedAttachments = await uploadAttachmentFiles(req.files as Express.Multer.File[] | undefined, 'assignment-attachments')
    const baseAttachments = attachments !== undefined ? parseAttachmentPayload(attachments) : null
    const mergedAttachments =
      baseAttachments === null ? (uploadedAttachments.length ? uploadedAttachments : null) : [...baseAttachments, ...uploadedAttachments]

    const parsedMaxScore =
      maxScore === undefined || maxScore === null || maxScore === '' ? null : Number(maxScore)
    if (parsedMaxScore != null && (!Number.isFinite(parsedMaxScore) || parsedMaxScore <= 0 || parsedMaxScore > 100)) {
      res.status(400).json({ message: 'maxScore phải trong khoảng >0 và <=100' })
      return
    }

    const parsedLatePenalty =
      latePenaltyPercent === undefined || latePenaltyPercent === null || latePenaltyPercent === ''
        ? null
        : Number(latePenaltyPercent)
    if (parsedLatePenalty != null && (!Number.isFinite(parsedLatePenalty) || parsedLatePenalty < 0 || parsedLatePenalty > 100)) {
      res.status(400).json({ message: 'latePenaltyPercent phải trong khoảng 0-100' })
      return
    }

    const updated = await pool.query(
      `UPDATE assignments SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         assignment_type = COALESCE($3, assignment_type),
         deadline = COALESCE($4, deadline),
         max_score = COALESCE($5, max_score),
         allow_late_submission = COALESCE($6, allow_late_submission),
         late_penalty_percent = COALESCE($7, late_penalty_percent),
         is_published = COALESCE($8, is_published),
         attachments = COALESCE($9, attachments)
       WHERE id = $10 AND deleted_at IS NULL
       RETURNING *`,
      [
        title ? String(title).trim() : null,
        description !== undefined ? (description ? String(description).trim() : null) : null,
        assignmentType ? String(assignmentType).toLowerCase() : null,
        deadline ? String(deadline) : null,
        parsedMaxScore,
        allowLateSubmission != null ? Boolean(allowLateSubmission) : null,
        parsedLatePenalty,
        isPublished != null ? Boolean(isPublished) : null,
        mergedAttachments !== null ? JSON.stringify(mergedAttachments) : null,
        assignmentId
      ]
    )

    res.json(updated.rows[0])
  } catch (error) {
    console.error('❌ patchAssignment:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const assignmentId = Number(req.params.id)
    const assignment = await loadAssignment(assignmentId)
    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' })
      return
    }

    const canManage = await canManageCourse(req.user.id, req.user.role, { id: Number(assignment.course_row_id), lecturer_id: Number(assignment.lecturer_id) } as CourseRow)
    if (!canManage) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    await pool.query('UPDATE assignments SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL', [assignmentId])
    res.json({ message: 'Đã lưu trữ bài tập' })
  } catch (error) {
    console.error('❌ deleteAssignment:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const listAssignmentSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const assignmentId = Number(req.params.id)
    const assignment = await loadAssignment(assignmentId)
    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' })
      return
    }

    const courseId = Number(assignment.course_id)
    const isStudent = req.user.role === 'student'

    if (isStudent) {
      const enrolled = await isStudentEnrolled(courseId, req.user.id)
      if (!enrolled) {
        res.status(403).json({ message: 'Forbidden' })
        return
      }
    } else {
      const canManage = await canManageCourse(req.user.id, req.user.role, { id: Number(assignment.course_row_id), lecturer_id: Number(assignment.lecturer_id) } as CourseRow)
      if (!canManage) {
        res.status(403).json({ message: 'Forbidden' })
        return
      }
    }

    const result = await pool.query(
      `SELECT s.*,
              r.id AS report_id,
              u.full_name AS student_name,
              u.email AS student_email,
              r.file_name AS report_file_name,
              r.file_size AS report_file_size
       FROM assignment_submissions s
       JOIN users u ON u.id = s.student_id
       LEFT JOIN reports r ON r.id = s.report_id
       WHERE s.assignment_id = $1
         AND ($2 = false OR s.student_id = $3)
       ORDER BY u.full_name ASC`,
      [assignmentId, isStudent, req.user.id]
    )

    res.json({ items: result.rows })
  } catch (error) {
    console.error('❌ listAssignmentSubmissions:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const submitAssignment = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect()
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    if (req.user.role !== 'student') {
      res.status(403).json({ message: 'Chỉ sinh viên được nộp bài' })
      return
    }

    const assignmentId = Number(req.params.id)
    const assignment = await loadAssignment(assignmentId)
    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' })
      return
    }

    const courseId = Number(assignment.course_id)
    const enrolled = await isStudentEnrolled(courseId, req.user.id)
    if (!enrolled) {
      res.status(403).json({ message: 'Bạn chưa tham gia lớp này' })
      return
    }

    const { title, description } = req.body as { title?: string; description?: string }
    if (!title?.trim()) {
      res.status(400).json({ message: 'title là bắt buộc' })
      return
    }

    const file = req.file
    if (!file) {
      res.status(400).json({ message: 'Vui lòng đính kèm file nộp bài' })
      return
    }

    if (file.size > UPLOAD_MAX_SIZE_MB * 1024 * 1024) {
      res.status(400).json({ message: `File vượt quá giới hạn ${UPLOAD_MAX_SIZE_MB}MB` })
      return
    }

    const detected = detectFileType(file.buffer)
    if (!detected) {
      res.status(400).json({ message: 'Loại file không hợp lệ. Chỉ chấp nhận: pdf, docx, zip' })
      return
    }

    const hash = sha256(file.buffer)
    const key = `assignments/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${hash}.${detected.ext}`
    await uploadFile(key, file.buffer, detected.mime)

    await client.query('BEGIN')

    const reportIns = await client.query(
      `INSERT INTO reports
        (title, description, author_id, course_id, file_url, file_name, file_size, file_type, file_hash,
         visibility, status, embedding_status, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'course','pending','pending',NOW())
       RETURNING id`,
      [
        title.trim(),
        description?.trim() || null,
        req.user.id,
        courseId,
        key,
        file.originalname,
        file.size,
        detected.dbType,
        hash
      ]
    )

    const reportId = Number(reportIns.rows[0].id)

    const deadline = new Date(String(assignment.deadline))
    const isLate = new Date() > deadline

    await client.query(
      `INSERT INTO assignment_submissions
        (assignment_id, student_id, report_id, status, submitted_at, is_late, submission_count)
       VALUES ($1,$2,$3,$4,NOW(),$5,1)
       ON CONFLICT (assignment_id, student_id)
       DO UPDATE SET
         report_id = EXCLUDED.report_id,
         status = EXCLUDED.status,
         submitted_at = EXCLUDED.submitted_at,
         is_late = EXCLUDED.is_late,
         submission_count = assignment_submissions.submission_count + 1,
         score = NULL,
         feedback = NULL,
         graded_by = NULL,
         graded_at = NULL,
         updated_at = NOW()`,
      [assignmentId, req.user.id, reportId, isLate ? 'late' : 'submitted', isLate]
    )

    await client.query('COMMIT')

    res.status(201).json({ message: 'Nộp bài thành công', reportId, status: isLate ? 'late' : 'submitted' })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('❌ submitAssignment:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    client.release()
  }
}

export const gradeAssignmentSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const submissionId = Number(req.params.submissionId)
    const { feedback } = req.body as { feedback?: string }

    if (!feedback?.trim()) {
      res.status(400).json({ message: 'feedback là bắt buộc' })
      return
    }

    const sub = await pool.query(
      `SELECT s.*, a.course_id, a.max_score
       FROM assignment_submissions s
       JOIN assignments a ON a.id = s.assignment_id
       WHERE s.id = $1 AND a.deleted_at IS NULL`,
      [submissionId]
    )

    if (sub.rows.length === 0) {
      res.status(404).json({ message: 'Submission not found' })
      return
    }

    const row = sub.rows[0] as { course_id: number; max_score: string | number; assignment_id: number; student_id: number }
    const course = await loadCourse(row.course_id)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    const canManage = await canManageCourse(req.user.id, req.user.role, course)
    if (!canManage) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const updated = await pool.query(
      `UPDATE assignment_submissions
       SET feedback = $1,
           status = 'graded',
           graded_by = $2,
           graded_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [feedback.trim(), req.user.id, submissionId]
    )

    await createNotification({
      userId: row.student_id,
      type: 'assignment_graded',
      title: 'Bài nộp đã có phản hồi',
      message: `Bài nộp #${row.assignment_id} của bạn đã có nhận xét từ giảng viên.`,
      refType: 'course',
      refId: row.course_id
    })

    res.json({ message: 'Đã lưu nhận xét', submission: updated.rows[0] })
  } catch (error) {
    console.error('❌ gradeAssignmentSubmission:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const listClassPostsByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const courseId = Number(req.params.courseId)
    const course = await loadCourse(courseId)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    let canView = false
    if (req.user.role === 'student') {
      canView = await isStudentEnrolled(courseId, req.user.id)
    } else {
      canView = await canManageCourse(req.user.id, req.user.role, course)
    }

    if (!canView) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const posts = await pool.query(
      `SELECT p.*, u.full_name AS author_name, u.role AS author_role
       FROM class_posts p
       JOIN users u ON u.id = p.author_id
       WHERE p.course_id = $1 AND p.deleted_at IS NULL
       ORDER BY p.is_pinned DESC, p.created_at DESC`,
      [courseId]
    )

    const postIds = posts.rows.map((row) => row.id as number)
    if (postIds.length === 0) {
      res.json({ items: [] })
      return
    }

    const comments = await pool.query(
      `SELECT c.*, u.full_name AS author_name, u.role AS author_role
       FROM class_post_comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.post_id = ANY($1::int[]) AND c.deleted_at IS NULL
       ORDER BY c.created_at ASC`,
      [postIds]
    )

    const groupedComments = new Map<number, Record<string, unknown>[]>()
    for (const row of comments.rows) {
      const pid = Number(row.post_id)
      const list = groupedComments.get(pid) ?? []
      list.push(row)
      groupedComments.set(pid, list)
    }

    res.json({
      items: posts.rows.map((post) => ({
        ...post,
        comments: groupedComments.get(Number(post.id)) ?? []
      }))
    })
  } catch (error) {
    console.error('❌ listClassPostsByCourse:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const downloadAssignmentAttachment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const assignmentId = Number(req.params.id)
    const attachmentIndex = Number(req.params.attachmentIndex)
    if (!Number.isInteger(attachmentIndex) || attachmentIndex < 0) {
      res.status(400).json({ message: 'attachmentIndex không hợp lệ' })
      return
    }

    const assignment = await loadAssignment(assignmentId)
    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' })
      return
    }

    const courseId = Number(assignment.course_id)
    if (req.user.role === 'student') {
      const enrolled = await isStudentEnrolled(courseId, req.user.id)
      if (!enrolled) {
        res.status(403).json({ message: 'Forbidden' })
        return
      }
    } else {
      const canView = await canManageCourse(
        req.user.id,
        req.user.role,
        { id: Number(assignment.course_row_id), lecturer_id: Number(assignment.lecturer_id) } as CourseRow
      )
      if (!canView) {
        res.status(403).json({ message: 'Forbidden' })
        return
      }
    }

    const attachment = getAttachmentFromUnknown(assignment.attachments, attachmentIndex)
    if (!attachment) {
      res.status(404).json({ message: 'Attachment not found' })
      return
    }

    const fileBuffer = await downloadFile(attachment.url)
    res.setHeader('Content-Type', contentTypeFromFileName(attachment.name))
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(attachment.name)}`)
    res.send(fileBuffer)
  } catch (error) {
    console.error('❌ downloadAssignmentAttachment:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const downloadClassPostAttachment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const postId = Number(req.params.id)
    const attachmentIndex = Number(req.params.attachmentIndex)
    if (!Number.isInteger(attachmentIndex) || attachmentIndex < 0) {
      res.status(400).json({ message: 'attachmentIndex không hợp lệ' })
      return
    }

    const postQuery = await pool.query(
      'SELECT id, course_id, attachments FROM class_posts WHERE id = $1 AND deleted_at IS NULL',
      [postId]
    )
    if (postQuery.rows.length === 0) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    const post = postQuery.rows[0]
    const courseId = Number(post.course_id)
    if (req.user.role === 'student') {
      const enrolled = await isStudentEnrolled(courseId, req.user.id)
      if (!enrolled) {
        res.status(403).json({ message: 'Forbidden' })
        return
      }
    } else {
      const course = await loadCourse(courseId)
      if (!course) {
        res.status(404).json({ message: 'Course not found' })
        return
      }
      const canView = await canManageCourse(req.user.id, req.user.role, course)
      if (!canView) {
        res.status(403).json({ message: 'Forbidden' })
        return
      }
    }

    const attachment = getAttachmentFromUnknown(post.attachments, attachmentIndex)
    if (!attachment) {
      res.status(404).json({ message: 'Attachment not found' })
      return
    }

    const fileBuffer = await downloadFile(attachment.url)
    res.setHeader('Content-Type', contentTypeFromFileName(attachment.name))
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(attachment.name)}`)
    res.send(fileBuffer)
  } catch (error) {
    console.error('❌ downloadClassPostAttachment:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const createClassPost = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const { courseId, content, isPinned, attachments } = req.body as {
      courseId?: number | string
      content?: string
      isPinned?: boolean
      attachments?: unknown
    }
    const uploadedAttachments = await uploadAttachmentFiles(req.files as Express.Multer.File[] | undefined, 'class-post-attachments')
    const finalAttachments = [...parseAttachmentPayload(attachments), ...uploadedAttachments]

    const parsedCourseId = Number(courseId)
    if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) {
      res.status(400).json({ message: 'courseId không hợp lệ' })
      return
    }

    if (!content?.trim()) {
      res.status(400).json({ message: 'content là bắt buộc' })
      return
    }

    const course = await loadCourse(parsedCourseId)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    let canPost = false
    if (req.user.role === 'student') {
      canPost = await isStudentEnrolled(parsedCourseId, req.user.id)
    } else {
      canPost = await canManageCourse(req.user.id, req.user.role, course)
    }

    if (!canPost) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const created = await pool.query(
      `INSERT INTO class_posts (course_id, author_id, content, is_pinned, attachments)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        parsedCourseId,
        req.user.id,
        content.trim(),
        Boolean(isPinned) && req.user.role !== 'student',
        JSON.stringify(finalAttachments)
      ]
    )

    res.status(201).json(created.rows[0])
  } catch (error) {
    console.error('❌ createClassPost:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const addClassPostComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const postId = Number(req.params.id)
    const { content } = req.body as { content?: string }

    if (!content?.trim()) {
      res.status(400).json({ message: 'content là bắt buộc' })
      return
    }

    const post = await pool.query('SELECT id, course_id FROM class_posts WHERE id = $1 AND deleted_at IS NULL', [postId])
    if (post.rows.length === 0) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    const courseId = Number(post.rows[0].course_id)
    const course = await loadCourse(courseId)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    let canComment = false
    if (req.user.role === 'student') {
      canComment = await isStudentEnrolled(courseId, req.user.id)
    } else {
      canComment = await canManageCourse(req.user.id, req.user.role, course)
    }

    if (!canComment) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const created = await pool.query(
      `INSERT INTO class_post_comments (post_id, author_id, content)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [postId, req.user.id, content.trim()]
    )

    res.status(201).json(created.rows[0])
  } catch (error) {
    console.error('❌ addClassPostComment:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
