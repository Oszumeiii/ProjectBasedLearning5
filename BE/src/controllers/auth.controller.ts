import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import pool from '../config/db'
import {
  ACTIVATION_TOKEN_HOURS,
  AUTH_LOCK_DURATION_MINUTES,
  AUTH_MAX_FAILED_LOGIN,
  CLIENT_URL,
  PASSWORD_RESET_HOURS,
  REFRESH_TOKEN_DAYS
} from '../config/env'
import { createToken, type UserRole } from '../utils/jwt'
import { sendMail, activationEmail, passwordResetEmail } from '../utils/email'

const ACTIVE_ACCOUNT = 'active'

const accountStatusMessage: Record<string, string> = {
  pending_activation: 'Tài khoản chưa được kích hoạt. Kiểm tra email hoặc liên hệ quản trị.',
  locked: 'Tài khoản đang bị khóa. Liên hệ quản trị.',
  suspended: 'Tài khoản đã bị đình chỉ.',
  graduated: 'Tài khoản sinh viên đã tốt nghiệp, không thể đăng nhập.'
}

function randomToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function hashToken(plain: string): string {
  return crypto.createHash('sha256').update(plain).digest('hex')
}

function clientIp(req: Request): string | null {
  const raw = req.ip || req.socket.remoteAddress
  if (!raw || raw === '::1') return null
  return raw.replace(/^::ffff:/, '')
}

function deviceInfo(req: Request): string | null {
  return (req.headers['user-agent'] as string) ?? null
}

async function createRefreshToken(
  userId: number,
  req: Request
): Promise<string> {
  const plain = randomToken()
  const hashed = hashToken(plain)
  const ip = clientIp(req)
  const device = deviceInfo(req)

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at)
     VALUES ($1, $2, $3, $4::inet, NOW() + ($5::text || ' days')::interval)`,
    [userId, hashed, device, ip, String(REFRESH_TOKEN_DAYS)]
  )

  return plain
}

// ─────────────────────── LOGIN ───────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }

    if (!email?.trim() || !password) {
      res.status(400).json({ message: 'email và password là bắt buộc' })
      return
    }

    const emailNorm = email.trim().toLowerCase()

    const result = await pool.query(
      `SELECT id, full_name, email, major, password_hash, role,
              is_active, account_status, failed_login_count, locked_until, deleted_at
       FROM users WHERE email = $1`,
      [emailNorm]
    )

    const genericAuthError = (): void => {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
    }

    if (result.rows.length === 0) { genericAuthError(); return }

    const user = result.rows[0] as {
      id: number; full_name: string; email: string; major: string | null
      password_hash: string | null; role: UserRole; is_active: boolean
      account_status: string; failed_login_count: number
      locked_until: Date | string | null; deleted_at: Date | string | null
    }

    if (user.deleted_at != null) { genericAuthError(); return }

    if (user.locked_until != null && new Date(user.locked_until) > new Date()) {
      res.status(423).json({
        message: `Tài khoản tạm khóa do đăng nhập sai nhiều lần. Thử lại sau ${AUTH_LOCK_DURATION_MINUTES} phút.`
      })
      return
    }

    if (user.account_status !== ACTIVE_ACCOUNT) {
      const msg = accountStatusMessage[user.account_status]
        ?? 'Tài khoản không thể đăng nhập. Liên hệ quản trị.'
      res.status(403).json({ message: msg })
      return
    }

    if (!user.is_active) {
      res.status(403).json({ message: 'Tài khoản chưa được kích hoạt.' })
      return
    }

    if (!user.password_hash) {
      res.status(403).json({
        message: 'Tài khoản chưa đặt mật khẩu. Dùng liên kết kích hoạt hoặc liên hệ quản trị.'
      })
      return
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      const inc = await pool.query(
        `UPDATE users SET
           failed_login_count = failed_login_count + 1,
           locked_until = CASE
             WHEN failed_login_count + 1 >= $2 THEN NOW() + ($3::text || ' minutes')::interval
             ELSE locked_until
           END
         WHERE id = $1
         RETURNING failed_login_count`,
        [user.id, AUTH_MAX_FAILED_LOGIN, String(AUTH_LOCK_DURATION_MINUTES)]
      )

      const row = inc.rows[0] as { failed_login_count: number } | undefined
      if (row && row.failed_login_count >= AUTH_MAX_FAILED_LOGIN) {
        res.status(423).json({
          message: `Sai mật khẩu quá nhiều lần. Tài khoản bị khóa ${AUTH_LOCK_DURATION_MINUTES} phút.`
        })
        return
      }
      genericAuthError()
      return
    }

    const ip = clientIp(req)
    await pool.query(
      `UPDATE users SET failed_login_count = 0, locked_until = NULL,
         last_login_at = NOW(), last_login_ip = $2::inet
       WHERE id = $1`,
      [user.id, ip]
    )

    const accessToken = createToken(user.id, user.email, user.role)
    const refreshToken = await createRefreshToken(user.id, req)

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id, full_name: user.full_name, email: user.email,
        major: user.major, role: user.role,
        account_status: user.account_status, is_active: user.is_active
      }
    })
  } catch (error) {
    console.error('❌ Error in login:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── REFRESH ───────────────────────

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string }

    if (!refreshToken?.trim()) {
      res.status(400).json({ message: 'refreshToken là bắt buộc' })
      return
    }

    const hashed = hashToken(refreshToken.trim())

    const result = await pool.query(
      `SELECT rt.id, rt.user_id, rt.expires_at, rt.is_revoked,
              u.email, u.role, u.full_name, u.major, u.account_status, u.is_active, u.deleted_at
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1`,
      [hashed]
    )

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Refresh token không hợp lệ' })
      return
    }

    const row = result.rows[0] as {
      id: number; user_id: number; expires_at: Date | string; is_revoked: boolean
      email: string; role: UserRole; full_name: string; major: string | null
      account_status: string; is_active: boolean; deleted_at: Date | string | null
    }

    if (row.is_revoked) {
      res.status(401).json({ message: 'Refresh token đã bị thu hồi' })
      return
    }

    if (new Date(row.expires_at) < new Date()) {
      res.status(401).json({ message: 'Refresh token đã hết hạn' })
      return
    }

    if (row.deleted_at != null || row.account_status !== ACTIVE_ACCOUNT || !row.is_active) {
      res.status(403).json({ message: 'Tài khoản không thể sử dụng' })
      return
    }

    // Token rotation: revoke cũ, tạo mới
    await pool.query(
      'UPDATE refresh_tokens SET is_revoked = TRUE, revoked_at = NOW() WHERE id = $1',
      [row.id]
    )

    const newAccessToken = createToken(row.user_id, row.email, row.role)
    const newRefreshToken = await createRefreshToken(row.user_id, req)

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: row.user_id, full_name: row.full_name, email: row.email,
        major: row.major, role: row.role,
        account_status: row.account_status, is_active: row.is_active
      }
    })
  } catch (error) {
    console.error('❌ Error in refresh:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── LOGOUT ───────────────────────

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string }

    if (!refreshToken?.trim()) {
      res.json({ message: 'Đã đăng xuất' })
      return
    }

    const hashed = hashToken(refreshToken.trim())

    await pool.query(
      'UPDATE refresh_tokens SET is_revoked = TRUE, revoked_at = NOW() WHERE token_hash = $1 AND is_revoked = FALSE',
      [hashed]
    )

    res.json({ message: 'Đã đăng xuất' })
  } catch (error) {
    console.error('❌ Error in logout:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── LOGOUT ALL DEVICES ───────────────────────

export const logoutAll = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const result = await pool.query(
      `UPDATE refresh_tokens SET is_revoked = TRUE, revoked_at = NOW()
       WHERE user_id = $1 AND is_revoked = FALSE
       RETURNING id`,
      [req.user.id]
    )

    res.json({ message: 'Đã đăng xuất tất cả thiết bị', revokedCount: result.rowCount })
  } catch (error) {
    console.error('❌ Error in logoutAll:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── ME ───────────────────────

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const result = await pool.query(
      `SELECT id, full_name, email, major, role, account_status, is_active,
              department, student_code, class_name, phone, avatar_url,
              academic_title, specialization
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [req.user.id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.json({ user: result.rows[0] })
  } catch (error) {
    console.error('❌ Error in me:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── ACTIVATE ───────────────────────

export const activate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body as { token?: string; password?: string }

    if (!token?.trim() || !password) {
      res.status(400).json({ message: 'token và password là bắt buộc' })
      return
    }
    if (password.length < 8) {
      res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' })
      return
    }

    const result = await pool.query(
      `SELECT id, full_name, email, role, account_status, activation_expires_at
       FROM users WHERE activation_token = $1 AND deleted_at IS NULL`,
      [token.trim()]
    )

    if (result.rows.length === 0) {
      res.status(400).json({ message: 'Token kích hoạt không hợp lệ hoặc đã được sử dụng' })
      return
    }

    const user = result.rows[0] as {
      id: number; full_name: string; email: string; role: UserRole
      account_status: string; activation_expires_at: Date | string | null
    }

    if (user.account_status !== 'pending_activation') {
      res.status(400).json({ message: 'Tài khoản đã được kích hoạt trước đó' })
      return
    }

    if (user.activation_expires_at && new Date(user.activation_expires_at) < new Date()) {
      res.status(410).json({ message: 'Token kích hoạt đã hết hạn. Liên hệ quản trị để gửi lại.' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await pool.query(
      `UPDATE users SET password_hash = $2, is_active = TRUE, is_verified = TRUE,
         account_status = 'active', activation_token = NULL, activation_expires_at = NULL
       WHERE id = $1`,
      [user.id, passwordHash]
    )

    const accessToken = createToken(user.id, user.email, user.role)
    const refreshTk = await createRefreshToken(user.id, req)

    res.json({
      message: 'Kích hoạt tài khoản thành công!',
      accessToken,
      refreshToken: refreshTk,
      user: {
        id: user.id, full_name: user.full_name, email: user.email,
        role: user.role, account_status: 'active', is_active: true
      }
    })
  } catch (error) {
    console.error('❌ Error in activate:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── REQUEST ACTIVATION ───────────────────────

export const requestActivation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email?: string }
    if (!email?.trim()) { res.status(400).json({ message: 'email là bắt buộc' }); return }

    const safeMsg = 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được email kích hoạt.'
    const emailNorm = email.trim().toLowerCase()

    const result = await pool.query(
      'SELECT id, full_name, account_status FROM users WHERE email = $1 AND deleted_at IS NULL',
      [emailNorm]
    )

    if (result.rows.length === 0 || result.rows[0].account_status !== 'pending_activation') {
      res.json({ message: safeMsg })
      return
    }

    const user = result.rows[0] as { id: number; full_name: string }
    const newToken = randomToken()

    await pool.query(
      `UPDATE users SET activation_token = $2,
         activation_expires_at = NOW() + ($3::text || ' hours')::interval
       WHERE id = $1`,
      [user.id, newToken, String(ACTIVATION_TOKEN_HOURS)]
    )

    const link = `${CLIENT_URL}/activate?token=${newToken}`
    await sendMail(activationEmail(emailNorm, user.full_name, link))

    res.json({ message: safeMsg })
  } catch (error) {
    console.error('❌ Error in requestActivation:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── FORGOT PASSWORD ───────────────────────

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email?: string }
    if (!email?.trim()) { res.status(400).json({ message: 'email là bắt buộc' }); return }

    const safeMsg = 'Nếu email tồn tại, bạn sẽ nhận được liên kết đặt lại mật khẩu.'
    const emailNorm = email.trim().toLowerCase()

    const result = await pool.query(
      `SELECT id, full_name, account_status, is_active
       FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [emailNorm]
    )

    if (result.rows.length === 0) { res.json({ message: safeMsg }); return }

    const user = result.rows[0] as {
      id: number; full_name: string; account_status: string; is_active: boolean
    }

    if (user.account_status !== ACTIVE_ACCOUNT || !user.is_active) {
      res.json({ message: safeMsg })
      return
    }

    const token = randomToken()

    await pool.query(
      `UPDATE users SET password_reset_token = $2,
         password_reset_expires_at = NOW() + ($3::text || ' hours')::interval
       WHERE id = $1`,
      [user.id, token, String(PASSWORD_RESET_HOURS)]
    )

    const link = `${CLIENT_URL}/reset-password?token=${token}`
    await sendMail(passwordResetEmail(emailNorm, user.full_name, link))

    res.json({ message: safeMsg })
  } catch (error) {
    console.error('❌ Error in forgotPassword:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── RESET PASSWORD ───────────────────────

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body as { token?: string; password?: string }

    if (!token?.trim() || !password) {
      res.status(400).json({ message: 'token và password là bắt buộc' })
      return
    }
    if (password.length < 8) {
      res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' })
      return
    }

    const result = await pool.query(
      `SELECT id, email, role, password_reset_expires_at
       FROM users WHERE password_reset_token = $1 AND deleted_at IS NULL`,
      [token.trim()]
    )

    if (result.rows.length === 0) {
      res.status(400).json({ message: 'Token không hợp lệ hoặc đã được sử dụng' })
      return
    }

    const user = result.rows[0] as {
      id: number; email: string; role: UserRole
      password_reset_expires_at: Date | string | null
    }

    if (user.password_reset_expires_at && new Date(user.password_reset_expires_at) < new Date()) {
      res.status(410).json({ message: 'Token đã hết hạn. Hãy yêu cầu đặt lại mật khẩu mới.' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await pool.query(
      `UPDATE users SET password_hash = $2,
         password_reset_token = NULL, password_reset_expires_at = NULL
       WHERE id = $1`,
      [user.id, passwordHash]
    )

    // Revoke tất cả refresh token cũ (bắt buộc đăng nhập lại)
    await pool.query(
      `UPDATE refresh_tokens SET is_revoked = TRUE, revoked_at = NOW()
       WHERE user_id = $1 AND is_revoked = FALSE`,
      [user.id]
    )

    res.json({ message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' })
  } catch (error) {
    console.error('❌ Error in resetPassword:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── CHANGE PASSWORD ───────────────────────

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string; newPassword?: string
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'currentPassword và newPassword là bắt buộc' })
      return
    }
    if (newPassword.length < 8) {
      res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
      return
    }

    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1 AND deleted_at IS NULL',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const { password_hash } = result.rows[0] as { password_hash: string | null }

    if (!password_hash) {
      res.status(400).json({ message: 'Tài khoản chưa có mật khẩu. Dùng chức năng kích hoạt.' })
      return
    }

    const match = await bcrypt.compare(currentPassword, password_hash)
    if (!match) {
      res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' })
      return
    }

    const newHash = await bcrypt.hash(newPassword, 10)

    await pool.query('UPDATE users SET password_hash = $2 WHERE id = $1', [req.user.id, newHash])

    // Revoke tất cả refresh token (bắt buộc đăng nhập lại trên mọi thiết bị)
    await pool.query(
      `UPDATE refresh_tokens SET is_revoked = TRUE, revoked_at = NOW()
       WHERE user_id = $1 AND is_revoked = FALSE`,
      [req.user.id]
    )

    res.json({ message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' })
  } catch (error) {
    console.error('❌ Error in changePassword:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
