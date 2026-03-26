import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../utils/jwt'

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid Authorization header' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyToken(token)

    req.user = { id: decoded.userId, email: decoded.email, role: decoded.role }

    next()
  } catch (error) {
  
    console.error('❌ Invalid token:', error)

    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

