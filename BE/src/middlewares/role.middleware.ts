import type { NextFunction, Request, Response } from 'express'
import type { UserRole } from '../utils/jwt'

export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: insufficient permissions' })
      return
    }

    next()
  }

