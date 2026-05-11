import { RAG_SERVICE_URL, LLM_SERVICE_URL, SERVICE_TIMEOUT_MS } from '../config/env'

/**
 * Generic fetch wrapper with timeout and error handling
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), SERVICE_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Call RAG Service /retrieve endpoint to get candidate nodes
 */
export async function retrieveNodes(
  reportId: string,
  query: string,
  limit = 15
): Promise<Array<{ id: string; title: string; summary: string; path: string; content?: string }>> {
  try {
    const url = `${RAG_SERVICE_URL}/retrieve`
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_id: reportId,
        query,
        limit
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`RAG Service error: ${response.status} - ${errorData.error || response.statusText}`)
    }

    const data = (await response.json()) as { candidates: Array<{ id: string; title: string; summary: string; path: string }> }
    return data.candidates || []
  } catch (error) {
    console.error('❌ Error in retrieveNodes:', error)
    throw error
  }
}

/**
 * Call LLM Service /generate endpoint to rerank nodes
 */
export async function rerankNodesByLLM(
  query: string,
  nodesSummary: Array<{ id: string; title: string; summary: string; path: string }>,
  topK = 3
): Promise<string | null> {
  try {
    if (!nodesSummary || nodesSummary.length === 0) {
      return null
    }

    // Build selection prompt similar to SearchService
    const prompt = buildRerankingPrompt(query, nodesSummary)

    const url = `${LLM_SERVICE_URL}/generate`
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_new_tokens: 64
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`LLM Service error: ${response.status} - ${errorData.detail || response.statusText}`)
    }

    const data = (await response.json()) as { response: string }
    const llmResponse = data.response

    console.log(`🔍 LLM Reranking Response: ${llmResponse}`)

    // Extract ID from LLM response
    const selectedId = extractNodeId(llmResponse)

    if (selectedId === 'NO_RELEVANT_NODE' || !selectedId) {
      return null
    }

    return selectedId
  } catch (error) {
    console.error('❌ Error in rerankNodesByLLM:', error)
    return null
  }
}

/**
 * Call LLM Service /generate endpoint to generate answer
 */
export async function generateAnswer(query: string, contexts: string[]): Promise<string> {
  try {
    if (!contexts || contexts.length === 0) {
      return 'Xin lỗi, không tìm thấy thông tin liên quan để trả lời câu hỏi này.'
    }

    const contextText = contexts.join('\n\n---\n\n')

    const url = `${LLM_SERVICE_URL}/generate`
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Bạn là một trợ lý AI thông minh và hữu ích. Hãy trả lời câu hỏi dựa trên thông tin được cung cấp.'
          },
          {
            role: 'user',
            content: `Dựa trên thông tin sau:\n\n${contextText}\n\nHãy trả lời câu hỏi: ${query}`
          }
        ],
        max_new_tokens: 256
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`LLM Service error: ${response.status} - ${errorData.detail || response.statusText}`)
    }

    const data = (await response.json()) as { response: string }
    return data.response || 'Không thể tạo phản hồi.'
  } catch (error) {
    console.error('❌ Error in generateAnswer:', error)
    return 'Xin lỗi, đã xảy ra lỗi khi tạo phản hồi.'
  }
}

/**
 * Build reranking prompt for LLM
 */
function buildRerankingPrompt(
  query: string,
  nodes: Array<{ id: string; title: string; summary: string; path: string }>
): string {
  let prompt = `Bạn được cho danh sách các đoạn/node từ tài liệu.\n`
  prompt += `Nhiệm vụ của bạn là chỉ ra NODE_ID nào LIÊN QUAN NHẤT với câu hỏi sau:\n\n`
  prompt += `Câu hỏi: "${query}"\n\n`
  prompt += `Danh sách nodes:\n`

  nodes.forEach((node) => {
    prompt += `NODE_ID: ${node.id}\n`
    prompt += `Title: ${node.title}\n`
    prompt += `Summary: ${node.summary}\n`
    prompt += `Path: ${node.path}\n\n`
  })

  prompt += `Hãy trả lời chỉ với NODE_ID của node liên quan nhất, hoặc trả lời "NO_RELEVANT_NODE" nếu không có node nào liên quan.\n`
  prompt += `Đáp án: NODE_ID:`

  return prompt
}

/**
 * Extract node ID from LLM response
 */
function extractNodeId(response: string): string | null {
  // Try to extract ID from the response
  const idMatch = response.match(/(?:NODE_ID:?\s*)?([a-f0-9-]+|\d+)/i)
  if (idMatch && idMatch[1]) {
    return idMatch[1].trim()
  }

  // Check if response indicates no relevant node
  if (response.toLowerCase().includes('no_relevant_node') || response.toLowerCase().includes('không')) {
    return 'NO_RELEVANT_NODE'
  }

  return null
}
