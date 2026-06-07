"""FastAPI server for LLM Service with async support and thread pool for CPU-bound tasks"""

import asyncio
import functools
from typing import Optional
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from contextlib import asynccontextmanager

from app.service.summary_service import summarize_text
from app.service.search_service import SearchService

from app.core.model import LLMModel
from app.config.config import LLMConfig
from app.database.supabase_client import SupabaseRepository

from app.schemas.schemas import (
    GenerateRequest,
    SummaryRequest,
    AnswerRequest,
    ChatRequest,
    semanticSearchRequest
)
from app.database.pipecone import PineconeDB
# Global instances
llm = LLMModel()
repo = SupabaseRepository()
_pc: Optional[PineconeDB] = None


def get_pinecone() -> PineconeDB:
    global _pc
    if _pc is None:
        _pc = PineconeDB()
    return _pc

# Thread pool for CPU-bound LLM operations
# Using 1 worker to avoid concurrent GPU/MPS contention on single model
thread_pool = ThreadPoolExecutor(max_workers=1, thread_name_prefix="llm_worker_")

# Lifespan context for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 LLM Service starting...")
    print(f"📊 Thread pool initialized with 1 worker for CPU-bound LLM inference")
    yield
    # Shutdown
    print("🛑 LLM Service shutting down...")
    thread_pool.shutdown(wait=True)

app = FastAPI(
    title="LLM Service API",
    description="Optimized LLM Service with FastAPI for parallel processing",
    version="1.0.0",
    lifespan=lifespan
)

# =========================================================
# ASYNC HELPERS FOR CPU-BOUND OPERATIONS
# =========================================================

async def run_cpu_bound(func, *args, **kwargs):
    """
    Run a CPU-bound function in thread pool to avoid blocking event loop.
    This allows FastAPI to handle multiple requests concurrently.
    
    Usage:
        await run_cpu_bound(summarize_text, content=payload.content, max_new_tokens=200)
        await run_cpu_bound(llm.chat, "hello")
    """
    loop = asyncio.get_event_loop()
    # Use functools.partial to support both positional and keyword arguments
    fn = functools.partial(func, *args, **kwargs)
    return await loop.run_in_executor(thread_pool, fn)

                  
    
# =========================================================
# ANSWER
# =========================================================


def get_summary_for_node(nodes):
    """
    Lọc danh sách các node để chỉ lấy metadata cần thiết cho việc tìm kiếm.
    Loại bỏ 'content' để tối ưu bộ nhớ và tránh lỗi buffer size.
    """
    summary_nodes = []
    
    if not nodes:
        return summary_nodes

    for node in nodes:
        node_summary = {
            "id": node.get("id"),
            "title": node.get("title") or "Không có tiêu đề",
            "summary": node.get("summary") or "Không có tóm tắt",
            # "path": node.get("path") or ""
        }
        
        if node_summary["id"]:
            summary_nodes.append(node_summary)
            
    return summary_nodes

@app.post("/answer")
async def answer(payload: AnswerRequest):
    try:
        nodes_response = repo.get_nodes_by_post(payload.post_id)
        nodes = nodes_response.data if nodes_response else []
        print(f"🔍 Total nodes for post_id={payload.post_id}: {len(nodes)}")

        if not nodes:
            return {
                "response": "Tài liệu này chưa được xử lý hoặc chưa có dữ liệu để trả lời. Vui lòng thử lại sau.",
                "model": LLMConfig.MODEL_NAME
            }

        vector_response = repo.search_nodes_by_vector(
            report_id=payload.post_id,
            query=payload.message,
            limit=10
        )

        candidate_nodes = vector_response.data if vector_response else []
        print(f"🔍 Vector candidates for post_id={payload.post_id}: {len(candidate_nodes)}")

        if not candidate_nodes:
            print(
                f"⚠️ Vector search returned empty for post_id={payload.post_id}, falling back to all nodes"
            )
            candidate_nodes = nodes

        summary_candidates = get_summary_for_node(candidate_nodes)
        
        target_id = await run_cpu_bound(
            SearchService(llm).find_relevant_node_id,
            payload.message,
            summary_candidates
        )
        
        print(f"🔍 Target node ID: {target_id}")

        if not target_id:
            response = await run_cpu_bound(
                llm.answer_without_context,
                payload.message
            )
            response = response.strip() if response else "Xin lỗi, tôi không thể tìm thấy thông tin liên quan để trả lời câu hỏi của bạn."
            
            return {
                "response": response,
                "model": LLMConfig.MODEL_NAME
            }

        relevant_contents = ""

        target_id_clean = str(target_id).strip()
        print(f"🔍 Target node ID (cleaned): {target_id_clean}")
        relevant_contents = ""

        for node in nodes:
            node_id = str(node.get("id", "")).strip()

            print(f"🔍 Checking node ID: {node_id}")

            if node_id == target_id_clean:
                relevant_contents = node.get("content", "")
                break
        
        print(f"🔍 User query: {payload.message}")
        print(f"🔍 Relevant content for answer generation:\n{relevant_contents}")
        # Offload answer generation to thread pool
        response = await run_cpu_bound(
            llm.answer_with_context,
            payload.message,
            relevant_contents
        )
        print(f"🔍 Generated answer: {response}")

        return {
            "response": response,
            "model": LLMConfig.MODEL_NAME
        }

    except ValidationError as e:
        raise HTTPException(status_code=400, detail=e.errors())
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ /answer internal error: {e!r}")
        raise HTTPException(status_code=500, detail=str(e)) from e



# =========================================================
# SEMANTIC SEARCH
# =========================================================


# =====================================================
# SEMANTIC SEARCH API
# =====================================================

@app.post("/semantic-search")
async def semantic_search(payload: semanticSearchRequest):

    try:

        query = payload.query.strip()

        if not query:
            raise HTTPException(
                status_code=400,
                detail="query is required"
            )

        results = get_pinecone().semantic_search(
            query=query,
        )

        formatted_results = []

        for match in results.matches:

            formatted_results.append({
                "id": match.id,
                "score": float(match.score),
                "text": match.metadata.get("text", "")
            })
            
        print(f"🔍 Semantic search results for '{query}': {len(formatted_results)}")
        print(f"🔍 Top result: {formatted_results[0] if formatted_results else 'No matches found'}")
        return {
            "query": query,
            "total": len(formatted_results),
            "matches": formatted_results
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        

# =========================================================
# SUMMARY
# =========================================================
@app.post("/summary")
async def generate_summary(payload: SummaryRequest):
    """
    Generate a summary of the provided content.
    Offloads CPU-bound LLM inference to thread pool for true async handling.
    Multiple requests can now be queued and processed concurrently.
    """
    print("📝 Received summary request")
    try:
        # Offload CPU-intensive summarization to thread pool
        response = await run_cpu_bound(
            summarize_text,
            content=payload.content,
            max_new_tokens=payload.max_new_tokens
        )

        return {"summary": response}

    except ValidationError as e:
        raise HTTPException(status_code=400, detail=e.errors())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




# =========================================================
# CHAT
# =========================================================
@app.post("/chat")
async def chat(payload: ChatRequest):
    """
    Chat with the LLM model.
    Offloads CPU-bound LLM inference to thread pool for true async handling.
    """
    try:
        # Offload CPU-intensive chat to thread pool
        response = await run_cpu_bound(
            llm.chat,
            payload.message
        )

        return {
            "response": response,
            "model": LLMConfig.MODEL_NAME
        }

    except ValidationError as e:
        raise HTTPException(status_code=400, detail=e.errors())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# GENERATE
# =========================================================
@app.post("/generate")
async def generate(payload: GenerateRequest):
    """
    Generate response with flexible conversation history and system prompts.
    Offloads CPU-bound LLM inference to thread pool for true async handling.
    """
    try:
        messages = [
            {
                "role": m.role,
                "content": m.content
            }
            for m in payload.messages
        ]
        
        # Offload CPU-intensive generation to thread pool
        response = await run_cpu_bound(
            llm.generate,
            messages=messages,
            max_new_tokens=payload.max_new_tokens
        )

        return {
            "response": response,
            "model": LLMConfig.MODEL_NAME
        }

    except ValidationError as e:
        raise HTTPException(status_code=400, detail=e.errors())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# HEALTH
# =========================================================
@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {
        "status": "healthy",
        "model": LLMConfig.MODEL_NAME
    }


# =========================================================
# CONFIG
# =========================================================
@app.get("/config")
async def get_config():
    """
    Get LLM service configuration.
    """
    return {
        "model": LLMConfig.MODEL_NAME,
        "max_new_tokens": LLMConfig.MAX_NEW_TOKENS,
        "temperature": LLMConfig.TEMPERATURE,
        "device": LLMConfig.DEVICE
    }


# This is handled by main.py which uses uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.server:app",
        host="0.0.0.0",
        port=5000,
        reload=False,
        workers=1
    )