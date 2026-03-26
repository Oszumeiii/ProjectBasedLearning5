import type { Request, Response } from 'express'
import pool from '../config/db'

export const listReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, studentId, page = '1', limit = '20', search = '', sort = 'recent' } = req.query

    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 20
    const offset = (pageNum - 1) * limitNum

    const conditions: string[] = []
    const params: unknown[] = []

    if (projectId) {
      params.push(Number(projectId))
      conditions.push(`r.project_id = $${params.length}`)
    }

    if (studentId) {
      params.push(Number(studentId))
      conditions.push(`r.project_id IN (SELECT id FROM projects WHERE student_id = $${params.length + 1})`)
      params.push(Number(studentId))
    }

    if (typeof search === 'string' && search.trim() !== '') {
      const term = `%${search.trim()}%`
      params.push(term, term)
      conditions.push(`(r.title ILIKE $${params.length - 1} OR r.description ILIKE $${params.length})`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    let orderBy = 'ORDER BY r.created_at DESC'
    if (sort === 'popular') {
      orderBy = 'ORDER BY r.view_count DESC NULLS LAST'
    } else if (sort === 'rated') {
      orderBy = 'ORDER BY COALESCE(avg_rating, 0) DESC'
    }

    const listQuery = `
      SELECT
        r.id,
        r.title,
        r.description,
        r.project_id,
        r.file_url,
        r.visibility,
        r.view_count,
        r.created_at,
        r.author_id,
        u.full_name AS author_name,
        u.email AS author_email,
        COALESCE(AVG(rr.rating), 0) AS avg_rating,
        COUNT(rr.id) AS rating_count
      FROM reports r
      LEFT JOIN users u ON u.id = r.author_id
      LEFT JOIN report_ratings rr ON rr.report_id = r.id
      ${whereClause}
      GROUP BY r.id, u.full_name, u.email
      ${orderBy}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM reports r
      ${whereClause}
    `

    const listParams = [...params, limitNum, offset]

    const [listResult, countResult] = await Promise.all([
      pool.query(listQuery, listParams),
      pool.query(countQuery, params)
    ])

    res.json({
      items: listResult.rows,
      page: pageNum,
      limit: limitNum,
      total: countResult.rows[0]?.total ?? 0
    })
  } catch (error) {
    console.error('❌ Error in listReports:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)

    await pool.query('UPDATE reports SET view_count = view_count + 1 WHERE id = $1', [id])

    const result = await pool.query(
      `SELECT
         r.id,
         r.title,
         r.description,
         r.content,
         r.file_url,
         r.visibility,
         r.view_count,
         r.project_id,
         r.created_at,
         r.author_id,
         u.full_name AS author_name,
         u.email AS author_email,
         COALESCE(AVG(rr.rating), 0) AS avg_rating,
         COUNT(rr.id) AS rating_count
       FROM reports r
       LEFT JOIN users u ON u.id = r.author_id
       LEFT JOIN report_ratings rr ON rr.report_id = r.id
       WHERE r.id = $1
       GROUP BY r.id, u.full_name, u.email`,
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Report not found' })
      return
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in getReportById:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const { title, description, content, fileUrl, visibility, projectId, courseId } = req.body as {
      title?: string
      description?: string
      content?: string
      fileUrl?: string
      visibility?: string
      projectId?: number
      courseId?: number
    }

    if (!title || !content) {
      res.status(400).json({ message: 'title và content là bắt buộc' })
      return
    }

    // Nếu có courseId → kiểm tra student đã enroll lớp đó chưa
    if (courseId && req.user.role === 'student') {
      const enrolled = await pool.query('SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2', [
        courseId,
        req.user.id
      ])
      if (enrolled.rows.length === 0) {
        res.status(403).json({ message: 'Bạn chưa tham gia lớp học phần này' })
        return
      }
    }

    // Auto-set author_id = user đang đăng nhập
    const authorId = req.user.id

    const result = await pool.query(
      `INSERT INTO reports (title, description, content, file_url, visibility, project_id, author_id, course_id)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'course'), $6, $7, $8)
       RETURNING id, title, description, content, file_url, visibility, project_id, author_id, course_id, created_at, view_count`,
      [
        title,
        description ?? null,
        content,
        fileUrl ?? null,
        visibility ?? null,
        projectId ?? null,
        authorId,
        courseId ?? null
      ]
    )

    // Lấy tên tác giả để trả về
    const report = result.rows[0]
    const userResult = await pool.query('SELECT full_name, email FROM users WHERE id = $1', [authorId])
    report.author_name = userResult.rows[0]?.full_name ?? null
    report.author_email = userResult.rows[0]?.email ?? null

    res.status(201).json(report)
  } catch (error) {
    console.error('❌ Error in createReport:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const updateReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)
    const { title, description, content, fileUrl, visibility, projectId } = req.body as {
      title?: string
      description?: string
      content?: string
      fileUrl?: string
      visibility?: string
      projectId?: number | null
    }

    const result = await pool.query(
      `UPDATE reports
       SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         content = COALESCE($3, content),
         file_url = COALESCE($4, file_url),
         visibility = COALESCE($5, visibility),
         project_id = COALESCE($6, project_id)
       WHERE id = $7
       RETURNING id, title, description, content, file_url, visibility, project_id, created_at, view_count`,
      [title ?? null, description ?? null, content ?? null, fileUrl ?? null, visibility ?? null, projectId ?? null, id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Report not found' })
      return
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in updateReport:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const deleteReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id)

    const result = await pool.query('DELETE FROM reports WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Report not found' })
      return
    }

    res.json({ message: 'Report deleted' })
  } catch (error) {
    console.error('❌ Error in deleteReport:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const upsertRating = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const reportId = Number(req.params.id)
    const { rating, comment } = req.body as { rating?: number; comment?: string }

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: 'rating phải từ 1 đến 5' })
      return
    }

    const sql = `
      INSERT INTO report_ratings (user_id, report_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, report_id)
      DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
      RETURNING id, user_id, report_id, rating, comment, created_at
    `

    const result = await pool.query(sql, [req.user.id, reportId, rating, comment ?? null])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in upsertRating:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getRatings = async (req: Request, res: Response): Promise<void> => {
  try {
    const reportId = Number(req.params.id)

    const result = await pool.query(
      'SELECT id, user_id, report_id, rating, comment, created_at FROM report_ratings WHERE report_id = $1 ORDER BY created_at DESC',
      [reportId]
    )

    const agg = await pool.query(
      'SELECT COALESCE(AVG(rating), 0) AS avg_rating, COUNT(*) AS count FROM report_ratings WHERE report_id = $1',
      [reportId]
    )

    res.json({
      avgRating: Number(agg.rows[0]?.avg_rating ?? 0),
      count: Number(agg.rows[0]?.count ?? 0),
      items: result.rows
    })
  } catch (error) {
    console.error('❌ Error in getRatings:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const addFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const reportId = Number(req.params.id)

    const sql = `
      INSERT INTO favorites (user_id, report_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, report_id) DO NOTHING
      RETURNING id, user_id, report_id, created_at
    `

    const result = await pool.query(sql, [req.user.id, reportId])

    if (result.rows.length === 0) {
      res.status(200).json({ message: 'Already favorited' })
      return
    }

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in addFavorite:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const removeFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const reportId = Number(req.params.id)

    const result = await pool.query('DELETE FROM favorites WHERE user_id = $1 AND report_id = $2 RETURNING id', [
      req.user.id,
      reportId
    ])

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Favorite not found' })
      return
    }

    res.json({ message: 'Favorite removed' })
  } catch (error) {
    console.error('❌ Error in removeFavorite:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const listReportVersions = async (req: Request, res: Response): Promise<void> => {
  try {
    const reportId = Number(req.params.id)

    const result = await pool.query(
      'SELECT id, version_number, created_at FROM report_versions WHERE report_id = $1 ORDER BY version_number ASC',
      [reportId]
    )

    res.json({ items: result.rows })
  } catch (error) {
    console.error('❌ Error in listReportVersions:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getReportVersionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const reportId = Number(req.params.id)
    const versionId = Number(req.params.versionId)

    const result = await pool.query(
      'SELECT id, version_number, content, created_at FROM report_versions WHERE report_id = $1 AND id = $2',
      [reportId, versionId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Report version not found' })
      return
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('❌ Error in getReportVersionById:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
