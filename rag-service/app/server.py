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
            "title": node.get("title") or "",
            "summary": node.get("summary") or "",
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

        summary_candidates = get_summary_for_node(candidate_nodes)
        return jsonify({
            "candidates": summary_candidates
        }) 
        
    except ValidationError as ve:
        return jsonify({"error": "Dữ liệu gửi lên không hợp lệ", "details": ve.errors()}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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