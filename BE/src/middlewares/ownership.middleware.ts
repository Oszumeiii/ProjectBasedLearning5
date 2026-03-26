import type { NextFunction, Request, Response } from 'express'
import pool from '../config/db'

/**
 * Middleware kiểm tra quyền sở hữu report.
 *
 * Logic:
 * - Admin / manager / lecturer → bypass, cho phép luôn
 * - Student → kiểm tra report.author_id = req.user.id
 *
 * ⚠️  Middleware này phải đặt SAU authMiddleware
 */
export const requireOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    // Admin, quản lý khoa và GV được bypass ownership check
    if (req.user.role === 'admin' || req.user.role === 'manager' || req.user.role === 'lecturer') {
      next()
      return
    }

    // Student: kiểm tra report có phải do mình tạo
    const reportId = Number(req.params.id)

    if (isNaN(reportId)) {
      res.status(400).json({ message: 'Invalid report ID' })
      return
    }

    const result = await pool.query('SELECT id FROM reports WHERE id = $1 AND author_id = $2', [reportId, req.user.id])

    if (result.rows.length === 0) {
      res.status(403).json({ message: 'Forbidden: you can only modify your own reports' })
      return
    }

    next()
  } catch (error) {
    console.error('❌ Error in requireOwnership:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
