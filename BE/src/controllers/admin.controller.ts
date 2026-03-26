import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import pool from '../config/db'
import { ACTIVATION_TOKEN_HOURS, CLIENT_URL } from '../config/env'
import type { UserRole } from '../utils/jwt'
import { sendMail, activationEmail } from '../utils/email'

const VALID_ROLES: UserRole[] = ['student', 'lecturer', 'manager', 'admin']
const VALID_STATUSES = ['pending_activation', 'active', 'locked', 'suspended', 'graduated'] as const

// ─────────────────────── LIST USERS ───────────────────────

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const {
      role, status, department, search,
      page = '1', limit = '20'
    } = req.query

    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20))
    const offset = (pageNum - 1) * limitNum

    const conditions: string[] = ['u.deleted_at IS NULL']
    const params: unknown[] = []

    if (role && typeof role === 'string') {
      params.push(role)
      conditions.push(`u.role = $${params.length}`)
    }

    if (status && typeof status === 'string') {
      params.push(status)
      conditions.push(`u.account_status = $${params.length}`)
    }

    if (department && typeof department === 'string') {
      params.push(department)
      conditions.push(`u.department = $${params.length}`)
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`
      params.push(term, term, term)
      conditions.push(
        `(u.full_name ILIKE $${params.length - 2} OR u.email ILIKE $${params.length - 1} OR u.student_code ILIKE $${params.length})`
      )
    }

    const where = `WHERE ${conditions.join(' AND ')}`

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM users u ${where}`, params
    )

    const listResult = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.student_code, u.class_name,
              u.major, u.department, u.account_status, u.is_active,
              u.last_login_at, u.created_at
       FROM users u ${where}
       ORDER BY u.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limitNum, offset]
    )

    res.json({
      items: listResult.rows,
      page: pageNum,
      limit: limitNum,
      total: countResult.rows[0]?.total ?? 0
    })
  } catch (error) {
    console.error('❌ Error in listUsers:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── GET USER BY ID ───────────────────────

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)

    const result = await pool.query(
      `SELECT id, full_name, email, phone, avatar_url, date_of_birth, gender,
              role, student_code, class_name, intake_year, expected_graduation_year,
              major, department, academic_title, specialization,
              account_status, is_active, is_verified, source,
              last_login_at, last_login_ip, created_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.json({ user: result.rows[0] })
  } catch (error) {
    console.error('❌ Error in getUserById:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── UPDATE USER STATUS ───────────────────────

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)
    const { accountStatus } = req.body as { accountStatus?: string }

    if (!accountStatus || !VALID_STATUSES.includes(accountStatus as (typeof VALID_STATUSES)[number])) {
      res.status(400).json({
        message: `accountStatus phải là: ${VALID_STATUSES.join(', ')}`
      })
      return
    }

    // Không cho tự đổi trạng thái chính mình
    if (id === req.user.id) {
      res.status(400).json({ message: 'Không thể thay đổi trạng thái tài khoản chính mình' })
      return
    }

    const target = await pool.query(
      'SELECT id, role FROM users WHERE id = $1 AND deleted_at IS NULL', [id]
    )
    if (target.rows.length === 0) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    // Manager không được thay đổi admin
    if (req.user.role === 'manager' && target.rows[0].role === 'admin') {
      res.status(403).json({ message: 'Manager không có quyền thay đổi tài khoản admin' })
      return
    }

    const isActive = accountStatus === 'active'

    const result = await pool.query(
      `UPDATE users SET account_status = $2, is_active = $3,
         failed_login_count = CASE WHEN $2 = 'active' THEN 0 ELSE failed_login_count END,
         locked_until = CASE WHEN $2 = 'active' THEN NULL ELSE locked_until END
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, full_name, email, role, account_status, is_active`,
      [id, accountStatus, isActive]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    // Nếu khóa/đình chỉ → revoke tất cả refresh token
    if (accountStatus !== 'active') {
      await pool.query(
        `UPDATE refresh_tokens SET is_revoked = TRUE, revoked_at = NOW()
         WHERE user_id = $1 AND is_revoked = FALSE`,
        [id]
      )
    }

    res.json({ message: `Đã cập nhật trạng thái → ${accountStatus}`, user: result.rows[0] })
  } catch (error) {
    console.error('❌ Error in updateUserStatus:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── CREATE SINGLE USER ───────────────────────

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const body = req.body as {
      email?: string; fullName?: string; role?: UserRole
      major?: string; department?: string; phone?: string
      academicTitle?: string; specialization?: string
      password?: string; sendActivation?: boolean
    }

    const { email, fullName, role, major, department, phone,
            academicTitle, specialization, password } = body
    const sendActivationFlag = body.sendActivation !== false

    if (!email?.trim() || !fullName?.trim() || !role) {
      res.status(400).json({ message: 'email, fullName và role là bắt buộc' })
      return
    }

    if (!VALID_ROLES.includes(role)) {
      res.status(400).json({ message: `role phải là: ${VALID_ROLES.join(', ')}` })
      return
    }

    // Chỉ admin mới tạo được admin khác
    if (role === 'admin' && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền tạo tài khoản admin' })
      return
    }

    const emailNorm = email.trim().toLowerCase()

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1', [emailNorm]
    )
    if (existing.rows.length > 0) {
      res.status(409).json({ message: 'Email đã tồn tại' })
      return
    }

    let passwordHash: string | null = null
    let accountStatus: string
    let isActive: boolean
    let activationToken: string | null = null

    if (password) {
      if (password.length < 8) {
        res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' })
        return
      }
      passwordHash = await bcrypt.hash(password, 10)
      accountStatus = 'active'
      isActive = true
    } else {
      activationToken = crypto.randomBytes(32).toString('hex')
      accountStatus = 'pending_activation'
      isActive = false
    }

    const result = await pool.query(
      `INSERT INTO users (
         email, password_hash, full_name, role, major, department, phone,
         academic_title, specialization,
         is_active, is_verified, account_status,
         activation_token, activation_expires_at, source
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9,
         $10, $10, $11,
         $12, CASE WHEN $12 IS NOT NULL THEN NOW() + ($13::text || ' hours')::interval ELSE NULL END,
         'manual'
       )
       RETURNING id, full_name, email, role, account_status, is_active`,
      [
        emailNorm, passwordHash, fullName.trim(), role,
        major?.trim() || null, department?.trim() || null, phone?.trim() || null,
        academicTitle?.trim() || null, specialization?.trim() || null,
        isActive, accountStatus,
        activationToken, String(ACTIVATION_TOKEN_HOURS)
      ]
    )

    const user = result.rows[0]

    if (activationToken && sendActivationFlag) {
      const link = `${CLIENT_URL}/activate?token=${activationToken}`
      await sendMail(activationEmail(emailNorm, fullName.trim(), link))
    }

    res.status(201).json({ user })
  } catch (error) {
    console.error('❌ Error in createUser:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── SOFT DELETE USER ───────────────────────

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)

    if (id === req.user.id) {
      res.status(400).json({ message: 'Không thể xóa tài khoản chính mình' })
      return
    }

    const target = await pool.query(
      'SELECT id, role FROM users WHERE id = $1 AND deleted_at IS NULL', [id]
    )
    if (target.rows.length === 0) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    if (req.user.role === 'manager' && target.rows[0].role === 'admin') {
      res.status(403).json({ message: 'Manager không có quyền xóa tài khoản admin' })
      return
    }

    await pool.query('UPDATE users SET deleted_at = NOW() WHERE id = $1', [id])

    await pool.query(
      `UPDATE refresh_tokens SET is_revoked = TRUE, revoked_at = NOW()
       WHERE user_id = $1 AND is_revoked = FALSE`,
      [id]
    )

    res.json({ message: 'Đã xóa tài khoản (soft delete)' })
  } catch (error) {
    console.error('❌ Error in deleteUser:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
