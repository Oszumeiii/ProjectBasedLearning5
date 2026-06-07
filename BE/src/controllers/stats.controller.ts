import type { Request, Response } from 'express'
import pool from '../config/db'

export const overviewStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const safeCount = (sql: string) =>
      pool.query(sql).then(r => r.rows[0]?.count ?? 0).catch(() => 0)

    const [
      totalStudents, totalProjects, totalReports,
      totalPlagiarismChecks, totalFeedback, totalRagQueries,
      totalCourses
    ] = await Promise.all([
      safeCount('SELECT COUNT(*)::int AS count FROM users'),
      safeCount('SELECT COUNT(*)::int AS count FROM projects'),
      safeCount('SELECT COUNT(*)::int AS count FROM reports'),
      safeCount('SELECT COUNT(*)::int AS count FROM plagiarism_checks'),
      safeCount('SELECT COUNT(*)::int AS count FROM feedback'),
      safeCount('SELECT COUNT(*)::int AS count FROM rag_query_logs'),
      safeCount("SELECT COUNT(*)::int AS count FROM courses WHERE deleted_at IS NULL")
    ])

    res.json({
      totalStudents, totalProjects, totalReports,
      totalPlagiarismChecks, totalFeedback, totalRagQueries,
      totalCourses
    })
  } catch (error) {
    console.error('❌ Error in overviewStats:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

