import type { Request, Response } from 'express'
import pool from '../config/db'

export const ragQA = async (req: Request, res: Response): Promise<void> => {
  try {

    const { question, reportId } = req.body as {
      question?: string
      reportId?: number
    }

    if (!question || !reportId) {
      res.status(400).json({ 
        message: 'Thiếu thông tin bắt buộc: question và reportId là bắt buộc.' 
      });
      return;
    }
    console.log(`🔍 Đang gửi yêu cầu RAG: "${question}" cho reportId: ${reportId}`);

    const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || 'http://localhost:5000';
    
    const response = await fetch(`${LLM_SERVICE_URL}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: question,
        post_id: reportId,
      }),
    });

    if (!response.ok) {
      const detail = await response.text()
      res.status(response.status).json({
        message: 'Lỗi từ LLM Service',
        detail,
      });
      return
    }

    const data = await response.json()

    res.status(200).json({
      success: true,
      data: data.response,
      model: data.model
    });

  } catch (error: any) {
    console.error('❌ Lỗi khi gọi LLM Service:', error.message);

    if (error.response) {
      res.status(error.response.status).json({
        message: 'Lỗi từ LLM Service',
        detail: error.response.data.detail
      });
    } else {
      res.status(500).json({
        message: 'Không thể kết nối đến dịch vụ AI. Vui lòng thử lại sau.',
        error: error.message
      });
    }
  }
};



const toPgVectorLiteral = (embedding: number[]): string => {
  return `[${embedding.join(',')}]`
}

const clampTopK = (value: unknown): number => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return 5
  return Math.min(Math.floor(parsed), 10)
}

const normalizeReportId = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

const buildExtractiveAnswer = (question: string, contexts: Array<{ content: string }>): string => {
  if (contexts.length === 0) {
    return 'Chua tim thay noi dung phu hop trong tai lieu de tra loi cau hoi nay.'
  }

  const combined = contexts
    .map((context) => context.content.trim())
    .filter(Boolean)
    .join('\n\n')

  const maxLength = 1200
  const excerpt = combined.length > maxLength ? `${combined.slice(0, maxLength).trim()}...` : combined

  return `Dua tren noi dung tim thay cho cau hoi "${question}", phan lien quan nhat la:\n\n${excerpt}`
}

export const storeEmbeddings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId, chunks } = req.body as {
      reportId?: number
      chunks?: Array<{
        content: string
        embedding: number[]
        chunkIndex?: number
      }>
    }

    const parsedReportId = normalizeReportId(reportId)
    if (!parsedReportId) {
      res.status(400).json({ message: 'reportId is required' })
      return
    }

    if (!chunks || chunks.length === 0) {
      res.status(400).json({ message: 'chunks is required and cannot be empty' })
      return
    }

    const valuesSql: string[] = []
    const params: unknown[] = []

    chunks.forEach((chunk, index) => {
      const paramIndex = index * 5
      const content = chunk.content ?? ''
      const chunkIndex = chunk.chunkIndex ?? index
      params.push(parsedReportId)
      params.push(chunkIndex)
      params.push(content)
      params.push(content.length)
      params.push(toPgVectorLiteral(chunk.embedding))
      valuesSql.push(
        `($${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}::vector)`
      )
    })

    const sql = `
      INSERT INTO report_chunks (report_id, chunk_index, chunk_text, char_count, embedding)
      VALUES ${valuesSql.join(', ')}
      ON CONFLICT (report_id, chunk_index) DO UPDATE SET
        chunk_text = EXCLUDED.chunk_text,
        char_count = EXCLUDED.char_count,
        embedding = EXCLUDED.embedding
      RETURNING id, report_id, chunk_index, chunk_text
    `

    const result = await pool.query(sql, params)

    res.status(201).json({
      inserted: result.rows.length,
      items: result.rows
    })
  } catch (error) {
    console.error('Error in storeEmbeddings:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const semanticSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { embedding, reportId, topK = 5 } = req.body as {
      embedding?: number[]
      reportId?: number
      topK?: number
    }

    if (!embedding || embedding.length === 0) {
      res.status(400).json({ message: 'embedding is required' })
      return
    }

    const k = clampTopK(topK)
    const parsedReportId = normalizeReportId(reportId)
    const embeddingLiteral = toPgVectorLiteral(embedding)

    const sql = `
      SELECT id, report_id, chunk_text AS content, embedding <-> $1::vector AS distance
      FROM report_chunks
      WHERE embedding IS NOT NULL
        AND ($2::bigint IS NULL OR report_id = $2)
      ORDER BY embedding <-> $1::vector ASC
      LIMIT $3
    `

    const result = await pool.query(sql, [embeddingLiteral, parsedReportId, k])

    res.json({
      results: result.rows.map((row) => ({
        id: row.id,
        reportId: row.report_id,
        content: row.content,
        score: 1 / (1 + Number(row.distance))
      }))
    })
  } catch (error) {
    console.error('Error in semanticSearch:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// export const ragQA = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { question, reportId, embedding, topK = 5 } = req.body as {
//       question?: string
//       reportId?: number
//       embedding?: number[]
//       topK?: number
//     }

//     const normalizedQuestion = question?.trim()
//     if (!normalizedQuestion) {
//       res.status(400).json({ message: 'question is required' })
//       return
//     }

//     const k = clampTopK(topK)
//     const parsedReportId = normalizeReportId(reportId)
//     let rows: Array<{
//       id: number
//       report_id: number
//       report_title?: string
//       content: string
//       page_number?: number | null
//       section_title?: string | null
//       score: number
//     }> = []

//     if (embedding?.length) {
//       const embeddingLiteral = toPgVectorLiteral(embedding)
//       const result = await pool.query(
//         `
//           SELECT
//             rc.id,
//             rc.report_id,
//             r.title AS report_title,
//             rc.chunk_text AS content,
//             rc.page_number,
//             rc.section_title,
//             1 / (1 + (rc.embedding <-> $1::vector)) AS score
//           FROM report_chunks rc
//           JOIN reports r ON r.id = rc.report_id
//           WHERE rc.embedding IS NOT NULL
//             AND r.deleted_at IS NULL
//             AND ($2::bigint IS NULL OR rc.report_id = $2)
//           ORDER BY rc.embedding <-> $1::vector ASC
//           LIMIT $3
//         `,
//         [embeddingLiteral, parsedReportId, k]
//       )
//       rows = result.rows
//     } else {
//       const likeQuery = `%${normalizedQuestion}%`
//       const result = await pool.query(
//         `
//           SELECT
//             rc.id,
//             rc.report_id,
//             r.title AS report_title,
//             rc.chunk_text AS content,
//             rc.page_number,
//             rc.section_title,
//             ts_rank_cd(
//               to_tsvector('simple', coalesce(rc.chunk_text, '')),
//               plainto_tsquery('simple', $1)
//             ) AS score
//           FROM report_chunks rc
//           JOIN reports r ON r.id = rc.report_id
//           WHERE r.deleted_at IS NULL
//             AND ($2::bigint IS NULL OR rc.report_id = $2)
//             AND (
//               to_tsvector('simple', coalesce(rc.chunk_text, '')) @@ plainto_tsquery('simple', $1)
//               OR rc.chunk_text ILIKE $3
//             )
//           ORDER BY score DESC, rc.char_count DESC NULLS LAST
//           LIMIT $4
//         `,
//         [normalizedQuestion, parsedReportId, likeQuery, k]
//       )
//       rows = result.rows
//     }

//     if (rows.length === 0 && parsedReportId) {
//       const fallback = await pool.query(
//         `
//           SELECT
//             id,
//             id AS report_id,
//             title AS report_title,
//             content,
//             0.1 AS score
//           FROM reports
//           WHERE id = $1
//             AND deleted_at IS NULL
//             AND content IS NOT NULL
//             AND content <> ''
//           LIMIT 1
//         `,
//         [parsedReportId]
//       )
//       rows = fallback.rows
//     }

//     const contexts = rows.map((row) => ({
//       id: row.id,
//       reportId: row.report_id,
//       reportTitle: row.report_title,
//       content: row.content,
//       pageNumber: row.page_number ?? null,
//       sectionTitle: row.section_title ?? null,
//       score: Number(row.score) || 0
//     }))

//     res.json({
//       question: normalizedQuestion,
//       answer: buildExtractiveAnswer(normalizedQuestion, contexts),
//       contexts
//     })
//   } catch (error) {
//     console.error('Error in ragQA:', error)
//     res.status(500).json({ message: 'Internal server error' })
//   }
// }
