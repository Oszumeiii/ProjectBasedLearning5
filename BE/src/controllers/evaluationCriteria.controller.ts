import type { Request, Response } from 'express'
import type { PoolClient } from 'pg'
import pool from '../config/db'
import { canManageCourse, isStudentEnrolled, type CourseRow } from '../utils/courseAccess'

async function totalWeight(client: PoolClient | typeof pool, courseId: number): Promise<number> {
  const r = await client.query(
    `SELECT COALESCE(SUM(weight), 0)::numeric AS s FROM evaluation_criteria WHERE course_id = $1`,
    [courseId]
  )
  return Number(r.rows[0].s)
}

/** Nếu có ít nhất 1 tiêu chí thì tổng trọng số phải = 100 */
export async function assertCriteriaWeightsValid(
  client: PoolClient | typeof pool,
  courseId: number
): Promise<void> {
  const c = await client.query(
    `SELECT COUNT(*)::int AS n, COALESCE(SUM(weight), 0)::numeric AS s
     FROM evaluation_criteria WHERE course_id = $1`,
    [courseId]
  )
  if (c.rows[0].n === 0) return
  const t = Number(c.rows[0].s)
  if (Math.abs(t - 100) > 0.01) {
    throw new Error('Tổng trọng số các tiêu chí phải bằng 100%')
  }
}

async function loadCourse(courseId: number): Promise<CourseRow | null> {
  if (!Number.isFinite(courseId) || courseId <= 0) return null
  const r = await pool.query(
    `SELECT id, lecturer_id FROM courses WHERE id = $1 AND deleted_at IS NULL`,
    [courseId]
  )
  return r.rows[0] ?? null
}

async function assertCanEditCriteria(req: Request, courseId: number): Promise<CourseRow | null> {
  if (!req.user) return null
  const course = await loadCourse(courseId)
  if (!course) return null
  const ok = await canManageCourse(req.user.id, req.user.role, course)
  if (!ok) return null
  return course
}

export const listEvaluationCriteria = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const courseId = Number(req.params.id)
    const course = await loadCourse(courseId)
    if (!course) {
      res.status(404).json({ message: 'Course not found' })
      return
    }

    let canView = false
    if (req.user.role === 'student') {
      canView = await isStudentEnrolled(courseId, req.user.id)
    } else {
      canView = await canManageCourse(req.user.id, req.user.role, course)
    }
    if (!canView) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const result = await pool.query(
      `SELECT id, course_id, name, description, weight, max_score, order_index, created_at
       FROM evaluation_criteria WHERE course_id = $1 ORDER BY order_index ASC, id ASC`,
      [courseId]
    )
    const sum = await totalWeight(pool, courseId)
    res.json({ items: result.rows, totalWeight: sum })
  } catch (error) {
    console.error('❌ listEvaluationCriteria:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const createEvaluationCriterion = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect()
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const courseId = Number(req.params.id)
    const course = await assertCanEditCriteria(req, courseId)
    if (!course) {
      res.status(403).json({ message: 'Forbidden hoặc không tìm thấy lớp' })
      return
    }

    const { name, description, weight, maxScore, orderIndex } = req.body as {
      name?: string
      description?: string
      weight?: number
      maxScore?: number
      orderIndex?: number
    }

    if (!name?.trim() || weight === undefined || weight <= 0) {
      res.status(400).json({ message: 'name và weight (>0) là bắt buộc' })
      return
    }

    await client.query('BEGIN')
    await client.query(
      `INSERT INTO evaluation_criteria (course_id, name, description, weight, max_score, order_index)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        courseId,
        name.trim(),
        description ?? null,
        weight,
        maxScore ?? 10,
        orderIndex ?? 0
      ]
    )
    await assertCriteriaWeightsValid(client, courseId)
    await client.query('COMMIT')

    const items = await pool.query(
      `SELECT * FROM evaluation_criteria WHERE course_id = $1 ORDER BY order_index, id`,
      [courseId]
    )
    res.status(201).json({ items: items.rows, totalWeight: await totalWeight(pool, courseId) })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    if ((error as Error).message?.includes('100%')) {
      res.status(400).json({ message: (error as Error).message })
      return
    }
    console.error('❌ createEvaluationCriterion:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    client.release()
  }
}

export const updateEvaluationCriterion = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect()
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const courseId = Number(req.params.id)
    const criteriaId = Number(req.params.criteriaId)
    const course = await assertCanEditCriteria(req, courseId)
    if (!course) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const { name, description, weight, maxScore, orderIndex } = req.body as {
      name?: string
      description?: string | null
      weight?: number
      maxScore?: number
      orderIndex?: number
    }

    const cur = await pool.query(
      `SELECT id FROM evaluation_criteria WHERE id = $1 AND course_id = $2`,
      [criteriaId, courseId]
    )
    if (cur.rows.length === 0) {
      res.status(404).json({ message: 'Tiêu chí không tồn tại' })
      return
    }

    await client.query('BEGIN')
    await client.query(
      `UPDATE evaluation_criteria SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         weight = COALESCE($3, weight),
         max_score = COALESCE($4, max_score),
         order_index = COALESCE($5, order_index)
       WHERE id = $6 AND course_id = $7`,
      [
        name ?? null,
        description !== undefined ? description : null,
        weight ?? null,
        maxScore ?? null,
        orderIndex ?? null,
        criteriaId,
        courseId
      ]
    )
    await assertCriteriaWeightsValid(client, courseId)
    await client.query('COMMIT')

    const row = await pool.query(`SELECT * FROM evaluation_criteria WHERE id = $1`, [criteriaId])
    res.json({ item: row.rows[0], totalWeight: await totalWeight(pool, courseId) })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    if ((error as Error).message?.includes('100%')) {
      res.status(400).json({ message: (error as Error).message })
      return
    }
    console.error('❌ updateEvaluationCriterion:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    client.release()
  }
}

export const deleteEvaluationCriterion = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect()
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const courseId = Number(req.params.id)
    const criteriaId = Number(req.params.criteriaId)
    const course = await assertCanEditCriteria(req, courseId)
    if (!course) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    await client.query('BEGIN')
    const del = await client.query(
      `DELETE FROM evaluation_criteria WHERE id = $1 AND course_id = $2 RETURNING id`,
      [criteriaId, courseId]
    )
    if (del.rows.length === 0) {
      await client.query('ROLLBACK')
      res.status(404).json({ message: 'Not found' })
      return
    }
    await assertCriteriaWeightsValid(client, courseId)
    await client.query('COMMIT')

    res.json({ message: 'Đã xóa', totalWeight: await totalWeight(pool, courseId) })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    if ((error as Error).message?.includes('100%')) {
      res.status(400).json({ message: (error as Error).message })
      return
    }
    console.error('❌ deleteEvaluationCriterion:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    client.release()
  }
}

export const reorderEvaluationCriteria = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect()
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const courseId = Number(req.params.id)
    const course = await assertCanEditCriteria(req, courseId)
    if (!course) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    const { orderedIds } = req.body as { orderedIds?: number[] }
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      res.status(400).json({ message: 'orderedIds là bắt buộc' })
      return
    }

    const normalizedIds = orderedIds.map((id) => Number(id))
    const validIds = normalizedIds.filter((id) => Number.isInteger(id) && id > 0)
    if (validIds.length !== normalizedIds.length || new Set(validIds).size !== validIds.length) {
      res.status(400).json({ message: 'orderedIds không hợp lệ' })
      return
    }

    const existing = await client.query(
      `SELECT id FROM evaluation_criteria WHERE course_id = $1 ORDER BY id ASC`,
      [courseId]
    )

    if (existing.rows.length !== validIds.length) {
      res.status(400).json({ message: 'orderedIds phải chứa đủ tiêu chí của lớp' })
      return
    }

    const existingSet = new Set(existing.rows.map((row) => Number(row.id)))
    const sameSet = validIds.every((id) => existingSet.has(id))
    if (!sameSet) {
      res.status(400).json({ message: 'orderedIds chứa tiêu chí không thuộc lớp' })
      return
    }

    await client.query('BEGIN')
    for (let index = 0; index < validIds.length; index++) {
      await client.query(
        `UPDATE evaluation_criteria SET order_index = $1 WHERE id = $2 AND course_id = $3`,
        [index + 1, validIds[index], courseId]
      )
    }
    await client.query('COMMIT')

    const items = await pool.query(
      `SELECT id, course_id, name, description, weight, max_score, order_index, created_at
       FROM evaluation_criteria WHERE course_id = $1 ORDER BY order_index ASC, id ASC`,
      [courseId]
    )

    res.json({ items: items.rows, totalWeight: await totalWeight(pool, courseId) })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('❌ reorderEvaluationCriteria:', error)
    res.status(500).json({ message: 'Internal server error' })
  } finally {
    client.release()
  }
}
