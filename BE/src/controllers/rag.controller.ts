import type { Request, Response } from 'express'
import pool from '../config/db'

const toPgVectorLiteral = (embedding: number[]): string => {
  return `[${embedding.join(',')}]`
}

export const storeEmbeddings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chunks } = req.body as {
      chunks?: Array<{
        content: string
        embedding: number[]
      }>
    }

    if (!chunks || chunks.length === 0) {
      res.status(400).json({ message: 'chunks là bắt buộc và không được rỗng' })
      return
    }

    const valuesSql: string[] = []
    const params: unknown[] = []

    chunks.forEach((chunk, index) => {
      const paramIndex = index * 2
      params.push(chunk.content)
      params.push(toPgVectorLiteral(chunk.embedding))
      valuesSql.push(`($${paramIndex + 1}, $${paramIndex + 2}::vector)`)
    })

    const sql = `
      INSERT INTO embeddings (content, embedding)
      VALUES ${valuesSql.join(', ')}
      RETURNING id, content
    `

    const result = await pool.query(sql, params)

    res.status(201).json({
      inserted: result.rows.length,
      items: result.rows
    })
  } catch (error) {
    console.error('❌ Error in storeEmbeddings:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const semanticSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { embedding, topK = 5 } = req.body as {
      embedding?: number[]
      topK?: number
    }

    if (!embedding || embedding.length === 0) {
      res.status(400).json({ message: 'embedding là bắt buộc' })
      return
    }

    const k = Number(topK) || 5
    const embeddingLiteral = toPgVectorLiteral(embedding)

    const sql = `
      SELECT id, content, embedding <-> $1::vector AS distance
      FROM embeddings
      ORDER BY embedding <-> $1::vector ASC
      LIMIT $2
    `

    const result = await pool.query(sql, [embeddingLiteral, k])

    res.json({
      results: result.rows.map((row) => ({
        id: row.id,
        content: row.content,
        score: 1 / (1 + Number(row.distance))
      }))
    })
  } catch (error) {

    console.error('❌ Error in semanticSearch:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const ragQA = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, embedding, topK = 5 } = req.body as {
      question?: string
      embedding?: number[]
      topK?: number
    }

    if (!question || !embedding || embedding.length === 0) {
      res.status(400).json({ message: 'question và embedding là bắt buộc' })
      return
    }

    const k = Number(topK) || 5
    const embeddingLiteral = toPgVectorLiteral(embedding)

    const sql = `
      SELECT id, content, embedding <-> $1::vector AS distance
      FROM embeddings
      ORDER BY embedding <-> $1::vector ASC
      LIMIT $2
    `

    const result = await pool.query(sql, [embeddingLiteral, k])

    const contexts = result.rows.map((row) => ({
      id: row.id,
      content: row.content,
      score: 1 / (1 + Number(row.distance))
    }))

    res.json({
      question,
      answer:
        'This is a placeholder answer. Integrate an LLM here to generate a final answer from the contexts.',
      contexts
    })
  } catch (error) {

    console.error('❌ Error in ragQA:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

