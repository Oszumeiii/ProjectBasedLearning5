import jwt, { type SignOptions } from 'jsonwebtoken'
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/env'

/** Khớp CHECK (role IN (...)) trong bảng users */
export type UserRole = 'student' | 'lecturer' | 'manager' | 'admin'

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

  const signOptions = { expiresIn: JWT_EXPIRES_IN } as SignOptions
  return jwt.sign(payload, JWT_SECRET, signOptions)
}

export const verifyToken = (token: string): JwtPayload => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined')
  }

  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload

  return decoded
}

