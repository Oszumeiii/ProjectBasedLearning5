import type { Request, Response } from 'express'
import pool from '../config/db'

export const overviewStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [users, projects, reports, plagiarismChecks, feedbacks, queries] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM projects'),
      pool.query('SELECT COUNT(*)::int AS count FROM reports'),
      pool.query('SELECT COUNT(*)::int AS count FROM plagiarism_checks'),
      pool.query('SELECT COUNT(*)::int AS count FROM feedback'),
      pool.query('SELECT COALESCE(SUM(query_count), 0)::int AS count FROM rag_query_logs')
    ])

    res.json({
      totalStudents: users.rows[0]?.count ?? 0,
      totalProjects: projects.rows[0]?.count ?? 0,
      totalReports: reports.rows[0]?.count ?? 0,
      totalPlagiarismChecks: plagiarismChecks.rows[0]?.count ?? 0,
      totalFeedback: feedbacks.rows[0]?.count ?? 0,
      totalRagQueries: queries.rows[0]?.count ?? 0
    })
  } catch (error) {
    console.error('❌ Error in overviewStats:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

