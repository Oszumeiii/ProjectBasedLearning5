import type { Request, Response } from 'express'
import pool from '../config/db'
import axios from 'axios';

export const ragQA = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, post_id, report_id } = req.body as {
      question?: string;
      post_id?: string;
      report_id?: string; // Cần thiết cho server Python của bạn
    };

    // 1. Validate dữ liệu đầu vào
    if (!question || !post_id) {
      res.status(400).json({ 
        message: 'Thiếu thông tin bắt buộc: question và post_id là bắt buộc.' 
      });
      return;
    }
    console.log(`🔍 Đang gửi yêu cầu RAG: "${question}" cho post_id: ${post_id}`);

    const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || 'http://localhost:5000';
    
    const response = await axios.post(`${LLM_SERVICE_URL}/answer`, {
      message: question,    
      query: question,     
      post_id: post_id,
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000 
    });

    res.status(200).json({
      success: true,
      data: response.data.response,
      model: response.data.model
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

