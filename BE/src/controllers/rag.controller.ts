import type { Request, Response } from 'express'
import pool from '../config/db'
import { retrieveNodes, rerankNodesByLLM, generateAnswer } from '../utils/service-client'

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
    const { question, post_id, report_id, embedding, topK = 5 } = req.body as {
      question?: string
      post_id?: string
      report_id?: string
      embedding?: number[]
      topK?: number
    }

    // Validate required fields
    if (!question) {
      res.status(400).json({ message: 'question là bắt buộc' })
      return
    }

    if (!report_id) {
      res.status(400).json({ message: 'report_id là bắt buộc' })
      return
    }

    console.log(`🔍 RAG QA Request: question="${question}", report_id="${report_id}"`)

    // Step 1: Retrieve candidate nodes from RAG service
    let candidateNodes = []
    try {
      candidateNodes = await retrieveNodes(report_id, question, topK || 15)
      console.log(`✅ Retrieved ${candidateNodes.length} candidate nodes`)

      if (candidateNodes.length === 0) {
        res.status(404).json({
          question,
          answer: 'Xin lỗi, không tìm thấy thông tin liên quan trong Vector DB.',
          contexts: []
        })
        return
      }
    } catch (error) {
      console.error('❌ Error retrieving nodes from RAG service:', error)

      // Fallback to embedding-based search if RAG service fails
      if (embedding && embedding.length > 0) {
        console.log('⚠️ Falling back to embedding-based search')
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
          answer: 'Fallback: Không thể kết nối với RAG service.',
          contexts
        })
        return
      }

      res.status(500).json({ message: 'Failed to retrieve nodes from RAG service' })
      return
    }

    // Step 2: Use LLM to rerank nodes and find the most relevant one
    let selectedNodeId: string | null = null
    try {
      selectedNodeId = await rerankNodesByLLM(question, candidateNodes, 3)
      console.log(`✅ LLM Reranking completed. Selected Node ID: ${selectedNodeId}`)
    } catch (error) {
      console.error('❌ Error during LLM reranking:', error)
      // Continue without reranking - use first node as fallback
      selectedNodeId = candidateNodes[0]?.id || null
    }

    // Step 3: Get full content for selected nodes
    const selectedNodes = candidateNodes.filter((node) => {
      if (selectedNodeId && String(node.id) === String(selectedNodeId)) {
        return true
      }
      // Include top nodes as context even if not primary selection
      return candidateNodes.indexOf(node) < 3
    })

    console.log(`📄 Selected ${selectedNodes.length} nodes for context`)

    // Step 4: Try to get full content from database if nodes have content
    const contexts: string[] = []
    for (const node of selectedNodes) {
      if (node.content) {
        contexts.push(node.content)
      } else {
        // Try to fetch from embeddings table
        try {
          const result = await pool.query(
            'SELECT content FROM embeddings WHERE id = $1 LIMIT 1',
            [node.id]
          )
          if (result.rows.length > 0) {
            contexts.push(result.rows[0].content)
          } else {
            // Use summary as fallback
            contexts.push(`Title: ${node.title}\nSummary: ${node.summary}`)
          }
        } catch (dbError) {
          console.error(`⚠️ Could not fetch full content for node ${node.id}:`, dbError)
          contexts.push(`Title: ${node.title}\nSummary: ${node.summary}`)
        }
      }
    }

    // Step 5: Generate answer using LLM
    const answer = await generateAnswer(question, contexts)
    console.log(`✅ Generated answer: ${answer.substring(0, 100)}...`)

    // Return response with answer and selected nodes
    res.json({
      question,
      answer,
      selectedNodes: selectedNodes.map((node) => ({
        id: node.id,
        title: node.title,
        summary: node.summary,
        path: node.path
      })),
      contexts: contexts.slice(0, 3) // Return top 3 contexts
    })
  } catch (error) {
    console.error('❌ Error in ragQA:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

