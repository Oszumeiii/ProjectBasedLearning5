"""Simple Flask server for LLM Service"""

from flask import Flask, request, jsonify
from pydantic import ValidationError

from service.summary_service import summarize_text
from service.search_service import SearchService

from model import LLMModel
from config import LLMConfig
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
        # Tạo một dictionary mới chỉ chứa các trường cần thiết cho SearchService
        node_summary = {
            "id": node.get("id"),
            "title": node.get("title") or "Không có tiêu đề",
            "summary": node.get("summary") or "Không có tóm tắt",
            "path": node.get("path") or ""
        }
        
        # Kiểm tra điều kiện: Node phải có ID và ít nhất là tiêu đề hoặc tóm tắt
        if node_summary["id"]:
            summary_nodes.append(node_summary)
            
    return summary_nodes

@app.route("/answer", methods=["POST"])
def answer():
    try:
        payload = AnswerRequest(**request.json)

        response = repo.get_nodes_by_post(payload.post_id)
        nodes = response.data if response else []
        summary_nodes = get_summary_for_node(nodes)
        
        target_id = SearchService(llm).find_relevant_node_id(
            payload.message,
            summary_nodes
        )
        
        print(f"🔍 Target node ID: {target_id}")

        if not target_id:
            return jsonify({
                "response": "Xin lỗi, tôi không tìm thấy thông tin này trong báo cáo."
            })

        relevant_contents = ""

        for node in nodes:
            if str(node["id"]) == str(target_id):
                relevant_contents = node["content"]
                break
        
        print(f"🔍 User query: {payload.message}")

        response = llm.answer_with_context(
            payload.message,
            relevant_contents
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
# SUMMARY
# =========================================================
@app.route("/summary", methods=["POST"])
def generate_summary():
    try:
        payload = SummaryRequest(**request.json)

        response = summarize_text(
            content=payload.content,
            max_new_tokens=payload.max_new_tokens
        )

        return jsonify({
            "summary": response
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