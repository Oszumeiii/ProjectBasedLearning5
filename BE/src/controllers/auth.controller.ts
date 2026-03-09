import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import pool from '../config/db'
import { createToken, type UserRole } from '../utils/jwt'

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, major, password, role } = req.body as {
      name?: string
      email?: string
      major?: string
      password?: string
      role?: UserRole
    }

    if (!name || !email || !major || !password) {
      res.status(400).json({ message: 'name, email, major và password là bắt buộc' })
      return
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])

    if (existing.rows.length > 0) {
      res.status(409).json({ message: 'Email đã được đăng ký' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const userRole: UserRole = role ?? 'student'

    const insertResult = await pool.query(
      `INSERT INTO users (name, email, major, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, major, role`,
      [name, email, major, passwordHash, userRole]
    )

    const user = insertResult.rows[0] as {
      id: number
      name: string
      email: string
      major: string
      role: UserRole
    }

    const token = createToken(user.id, user.email, user.role)

    res.status(201).json({
      token,
      user
    })
  } catch (error) {
    console.error('❌ Error in register:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }

    if (!email || !password) {
      res.status(400).json({ message: 'email và password là bắt buộc' })
      return
    }

    const result = await pool.query(
      'SELECT id, name, email, major, password_hash, role FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
      return
    }

    const user = result.rows[0] as {
      id: number
      name: string
      email: string
      major: string
      password_hash: string | null
      role: UserRole
    }

    if (!user.password_hash) {
      res.status(401).json({ message: 'Tài khoản này chưa có mật khẩu' })
      return
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
      return
    }

    const token = createToken(user.id, user.email, user.role)

    const { password_hash: _omit, ...safeUser } = user

    res.json({
      token,
      user: safeUser
    })
  } catch (error) {
    console.error('❌ Error in login:', error)

    res.status(500).json({ message: 'Internal server error' })
  }
}

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const result = await pool.query(
      'SELECT id, name, email, major, role FROM users WHERE id = $1',
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
