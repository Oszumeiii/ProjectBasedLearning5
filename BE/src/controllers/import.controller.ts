import type { Request, Response } from 'express'
import { parse } from 'csv-parse/sync'
import crypto from 'crypto'
import pool from '../config/db'
import { ACTIVATION_TOKEN_HOURS, CLIENT_URL } from '../config/env'
import { sendMail, activationEmail } from '../utils/email'
import type { PoolClient } from 'pg'

interface CsvRow {
  email?: string
  full_name?: string
  student_code?: string
  class_name?: string
  major?: string
  department?: string
  intake_year?: string
  academic_title?: string
  specialization?: string
}

type BatchType = 'student' | 'lecturer'

const REQUIRED_HEADERS = ['email', 'full_name'] as const

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function parseCsvFile(buffer: Buffer): CsvRow[] {
  return parse(buffer.toString('utf-8'), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true
  }) as CsvRow[]
}

function validateHeaders(rows: CsvRow[]): string | null {
  if (rows.length === 0) return 'File CSV rỗng'
  const headers = Object.keys(rows[0]).map((h) => h.toLowerCase().trim())
  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) return `Thiếu cột bắt buộc: ${required}`
  }
  return null
}

async function insertUser(
  client: PoolClient,
  row: CsvRow,
  batchType: BatchType,
  batchId: number
): Promise<{ token: string }> {
  const email = row.email!.trim().toLowerCase()
  const fullName = row.full_name!.trim()
  const token = generateToken()
  const role = batchType === 'lecturer' ? 'lecturer' : 'student'

  await client.query(
    `INSERT INTO users (
       email, full_name, student_code, class_name, major, department,
       intake_year, academic_title, specialization,
       role, is_active, is_verified, account_status,
       activation_token, activation_expires_at,
       imported_batch_id, source
     )
     VALUES (
       $1, $2, $3, $4, $5, $6,
       $7, $8, $9,
       $10, FALSE, FALSE, 'pending_activation',
       $11, NOW() + ($12::text || ' hours')::interval,
       $13, 'import'
     )`,
    [
      email, fullName,
      row.student_code?.trim() || null,
      row.class_name?.trim() || null,
      row.major?.trim() || null,
      row.department?.trim() || null,
      row.intake_year ? Number(row.intake_year) : null,
      row.academic_title?.trim() || null,
      row.specialization?.trim() || null,
      role, token, String(ACTIVATION_TOKEN_HOURS), batchId
    ]
  )

  return { token }
}

async function importUsersCore(
  req: Request,
  res: Response,
  batchType: BatchType
): Promise<void> {
  const client = await pool.connect()

  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const file = req.file
    if (!file) {
      res.status(400).json({ message: 'Thiếu file CSV (field "file")' })
      return
    }

    let rows: CsvRow[]
    try {
      rows = parseCsvFile(file.buffer)
    } catch {
      res.status(400).json({ message: 'File CSV không hợp lệ hoặc sai định dạng' })
      return
    }

    const headerError = validateHeaders(rows)
    if (headerError) { res.status(400).json({ message: headerError }); return }

    const semester = (req.body.semester as string)?.trim() || null

    await client.query('BEGIN')

    const batchResult = await client.query(
      `INSERT INTO user_import_batches (imported_by, file_name, batch_type, semester, total_rows)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [req.user.id, file.originalname, batchType, semester, rows.length]
    )
    const batchId: number = batchResult.rows[0].id

    let successCount = 0
    let failedCount = 0
    let skippedCount = 0
    const errors: Array<{ row: number; email: string; reason: string }> = []
    const emailQueue: Array<{ to: string; fullName: string; token: string }> = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2
      const email = row.email?.trim().toLowerCase()
      const fullName = row.full_name?.trim()

      if (!email || !fullName) {
        errors.push({ row: rowNum, email: email ?? '', reason: 'Thiếu email hoặc full_name' })
        failedCount++
        continue
      }

      const existing = await client.query('SELECT id FROM users WHERE email = $1', [email])
      if (existing.rows.length > 0) {
        skippedCount++
        errors.push({ row: rowNum, email, reason: 'Email đã tồn tại — bỏ qua' })
        continue
      }

      try {
        const { token } = await insertUser(client, row, batchType, batchId)
        emailQueue.push({ to: email, fullName, token })
        successCount++
      } catch (err) {
        const msg = (err as Error).message
        if (msg.includes('users_student_code_key')) {
          errors.push({ row: rowNum, email, reason: `Trùng MSSV: ${row.student_code}` })
          skippedCount++
        } else {
          errors.push({ row: rowNum, email, reason: msg })
          failedCount++
        }
      }
    }

    await client.query(
      `UPDATE user_import_batches
       SET success_rows = $2, failed_rows = $3, skipped_rows = $4,
           error_detail = $5::jsonb, status = 'completed'
       WHERE id = $1`,
      [batchId, successCount, failedCount, skippedCount, JSON.stringify(errors)]
    )

    await client.query('COMMIT')

    let emailsSent = 0
    for (const item of emailQueue) {
      const link = `${CLIENT_URL}/activate?token=${item.token}`
      const sent = await sendMail(activationEmail(item.to, item.fullName, link))
      if (sent) emailsSent++
    }

    res.status(201).json({
      batchId, batchType,
      totalRows: rows.length,
      success: successCount,
      failed: failedCount,
      skipped: skippedCount,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(`❌ Error in import ${batchType}:`, error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    client.release()
  }
}

// ─── Public endpoints ───

export const importStudents = (req: Request, res: Response): Promise<void> =>
  importUsersCore(req, res, 'student')

export const importLecturers = (req: Request, res: Response): Promise<void> =>
  importUsersCore(req, res, 'lecturer')

// ─── Import batch history ───

export const listImportBatches = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const result = await pool.query(
      `SELECT b.*, u.full_name AS imported_by_name
       FROM user_import_batches b
       JOIN users u ON u.id = b.imported_by
       ORDER BY b.imported_at DESC
       LIMIT 50`
    )

    res.json({ items: result.rows })
  } catch (error) {
    console.error('❌ Error in listImportBatches:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getImportBatchById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)

    const result = await pool.query(
      `SELECT b.*, u.full_name AS imported_by_name
       FROM user_import_batches b
       JOIN users u ON u.id = b.imported_by
       WHERE b.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Import batch not found' })
      return
    }

    const usersResult = await pool.query(
      `SELECT id, email, full_name, student_code, class_name, role, account_status
       FROM users WHERE imported_batch_id = $1 ORDER BY id`,
      [id]
    )

    res.json({ ...result.rows[0], users: usersResult.rows })
  } catch (error) {
    console.error('❌ Error in getImportBatchById:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const resendActivation = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const { email } = req.body as { email?: string }
    if (!email?.trim()) { res.status(400).json({ message: 'email là bắt buộc' }); return }

    const emailNorm = email.trim().toLowerCase()

    const result = await pool.query(
      'SELECT id, full_name, account_status FROM users WHERE email = $1 AND deleted_at IS NULL',
      [emailNorm]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Không tìm thấy user với email này' })
      return
    }

    const user = result.rows[0] as { id: number; full_name: string; account_status: string }

    if (user.account_status !== 'pending_activation') {
      res.status(400).json({ message: `Tài khoản ở trạng thái "${user.account_status}", không cần kích hoạt` })
      return
    }

    const newToken = generateToken()

    await pool.query(
      `UPDATE users SET activation_token = $2,
         activation_expires_at = NOW() + ($3::text || ' hours')::interval
       WHERE id = $1`,
      [user.id, newToken, String(ACTIVATION_TOKEN_HOURS)]
    )

    const link = `${CLIENT_URL}/activate?token=${newToken}`
    const sent = await sendMail(activationEmail(emailNorm, user.full_name, link))

    res.json({ message: sent ? 'Đã gửi lại email kích hoạt' : 'Không gửi được (SMTP chưa cấu hình)' })
  } catch (error) {
    console.error('❌ Error in resendActivation:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
