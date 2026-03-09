import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env'

export type UserRole = 'student' | 'lecturer' | 'admin'

export interface JwtPayload {
  userId: number
  email: string
  role: UserRole
}

export const createToken = (userId: number, email: string, role: UserRole): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }

  const payload: JwtPayload = { userId, email, role }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h'
  })
}

export const verifyToken = (token: string): JwtPayload => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }

  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

  return decoded
}

