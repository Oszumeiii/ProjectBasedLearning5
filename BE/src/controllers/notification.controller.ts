import type { Request, Response } from 'express'
import pool from '../config/db'

// ─────────────────────── LIST MY NOTIFICATIONS ───────────────────────

export const listMyNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const { unreadOnly, page = '1', limit = '20' } = req.query
    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20))
    const offset = (pageNum - 1) * limitNum

    const conds = ['user_id = $1']
    const params: unknown[] = [req.user.id]

    if (unreadOnly === 'true') { conds.push('is_read = FALSE') }

    const where = `WHERE ${conds.join(' AND ')}`

    const [countRes, listRes] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total FROM notifications ${where}`, params),
      pool.query(
        `SELECT * FROM notifications ${where}
         ORDER BY created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limitNum, offset]
      )
    ])

    const unreadCount = await pool.query(
      'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [req.user.id]
    )

    res.json({
      items: listRes.rows,
      page: pageNum, limit: limitNum,
      total: countRes.rows[0]?.total ?? 0,
      unreadCount: unreadCount.rows[0]?.count ?? 0
    })
  } catch (error) {
    console.error('❌ Error in listMyNotifications:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── MARK AS READ ───────────────────────

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)

    const result = await pool.query(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW()
       WHERE id = $1 AND user_id = $2 AND is_read = FALSE
       RETURNING id`,
      [id, req.user.id]
    )

    if (result.rows.length === 0) {
      res.json({ message: 'Đã đọc hoặc không tồn tại' })
      return
    }

    res.json({ message: 'Đã đánh dấu đã đọc' })
  } catch (error) {
    console.error('❌ Error in markAsRead:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── MARK ALL AS READ ───────────────────────

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const result = await pool.query(
      `UPDATE notifications SET is_read = TRUE, read_at = NOW()
       WHERE user_id = $1 AND is_read = FALSE
       RETURNING id`,
      [req.user.id]
    )

    res.json({ message: 'Đã đánh dấu tất cả đã đọc', count: result.rowCount })
  } catch (error) {
    console.error('❌ Error in markAllAsRead:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// ─────────────────────── DELETE NOTIFICATION ───────────────────────

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return }

    const id = Number(req.params.id)

    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    )

    if (result.rows.length === 0) { res.status(404).json({ message: 'Not found' }); return }
    res.json({ message: 'Đã xóa thông báo' })
  } catch (error) {
    console.error('❌ Error in deleteNotification:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
