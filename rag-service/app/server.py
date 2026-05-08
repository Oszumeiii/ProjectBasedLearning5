"""Simple Flask server for LLM Service"""

from flask import Flask, request, jsonify
from pydantic import ValidationError


from llm_service.app.core.model import LLMModel
from llm_service.app.config.config import LLMConfig
from supabase_client import SupabaseRepository

from schemas import (
    GenerateRequest,
    SummaryRequest,
    AnswerRequest,
    ChatRequest
)

app = Flask(__name__)

llm = LLMModel()
repo = SupabaseRepository()

                  
    
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
            "path": node.get("path") or ""
        }
        
        if node_summary["id"]:
            summary_nodes.append(node_summary)
            
    return summary_nodes


# retrieval hybrid
@app.route("/retrieve", methods=["POST"])
def retrieve():
    try:
        payload = AnswerRequest(**request.json)
        vector_response = repo.search_nodes_by_vector(
            report_id=payload.report_id,
            query=payload.query,
            limit=15
        )
        
        candidate_nodes = vector_response.data if vector_response else []
        
        if not candidate_nodes:
            return jsonify({"error": "Không tìm thấy thông tin liên quan trong Vector DB"}), 404

        # --- BƯỚC 2: HYBRID RERANKING (Lọc tinh bằng Metadata) ---
        # Chúng ta trích xuất Summary Nodes từ danh sách ứng viên đã lọc thô
        summary_candidates = get_summary_for_node(candidate_nodes)

        # Sử dụng SearchService (LLM) để "đọc" qua các summary và chọn ra ID tốt nhất
        # Đây là nơi LLM phát huy sức mạnh hiểu ngữ cảnh (Title, Path)
        search_service = SearchService(llm) 
        target_id = search_service.find_relevant_node_id(
            query=payload.query,
            nodes=summary_candidates
        )

        print(f"🎯 Hybrid Search chọn Node ID: {target_id}")

        # --- BƯỚC 3: TRÍCH XUẤT NỘI DUNG (Content Extraction) ---
        if not target_id:
            # Fallback: Nếu LLM không chọn được, có thể lấy node có điểm vector cao nhất
            target_node = candidate_nodes[0]
        else:
            target_node = next((n for n in candidate_nodes if str(n['id']) == str(target_id)), candidate_nodes[0])

        return jsonify({
            "relevant_context": target_node.get("content"),
            "metadata": {
                "title": target_node.get("title"),
                "path": target_node.get("path"),
                "node_id": target_node.get("id")
            }
        })

    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# =========================================================
# CHAT
# =========================================================
@app.route("/chat", methods=["POST"])
def chat():
    try:
        payload = ChatRequest(**request.json)

        response = llm.chat(payload.message)

        return jsonify({
            "response": response,
            "model": LLMConfig.MODEL_NAME
        })

    except ValidationError as e:
        return jsonify({
            "error": e.errors()
        }), 400

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


# =========================================================
# GENERATE
# =========================================================
@app.route("/generate", methods=["POST"])
def generate():
    try:
        payload = GenerateRequest(**request.json)

        response = llm.generate(
            messages=[
                {
                    "role": m.role,
                    "content": m.content
                }
                for m in payload.messages
            ],
            max_new_tokens=payload.max_new_tokens
        )

        return jsonify({
            "response": response,
            "model": LLMConfig.MODEL_NAME
        })

    except ValidationError as e:
        return jsonify({
            "error": e.errors()
        }), 400

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


# =========================================================
# HEALTH
# =========================================================
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "model": LLMConfig.MODEL_NAME
    })


# =========================================================
# CONFIG
# =========================================================
@app.route("/config", methods=["GET"])
def get_config():
    return jsonify({
        "model": LLMConfig.MODEL_NAME,
        "max_new_tokens": LLMConfig.MAX_NEW_TOKENS,
        "temperature": LLMConfig.TEMPERATURE,
        "device": LLMConfig.DEVICE
    })


# =========================================================
# MAIN
# =========================================================
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )