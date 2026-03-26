import type { Request, Response } from 'express'
import pool from '../config/db'

export const getMyFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const result = await pool.query(
      `SELECT
         r.id,
         r.title,
         r.description,
         r.project_id,
         r.file_url,
         r.visibility,
         r.view_count,
         r.created_at
       FROM favorites f
       JOIN reports r ON r.id = f.report_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    )

    res.json({ items: result.rows })
  } catch (error) {
    
    console.error('❌ Error in getMyFavorites:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

