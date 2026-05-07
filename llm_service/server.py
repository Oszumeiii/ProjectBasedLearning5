"""Simple Flask server for LLM Service"""

from flask import Flask, request, jsonify
from model import LLMModel
from config import LLMConfig

app = Flask(__name__)

# Load model on startup
llm = LLMModel()


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model": LLMConfig.MODEL_NAME
    })


@app.route("/generate", methods=["POST"])
def generate():
    """Generate response from messages"""
    try:
        data = request.json
        messages = data.get("messages", [])
        max_new_tokens = data.get("max_new_tokens")
        
        if not messages:
            return jsonify({"error": "Messages required"}), 400
        
        response = llm.generate(messages, max_new_tokens=max_new_tokens)
        
        return jsonify({
            "response": response,
            "model": LLMConfig.MODEL_NAME
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/chat", methods=["POST"])
def chat():
    """Simple chat endpoint"""
    try:
        data = request.json
        message = data.get("message", "")
        
        if not message:
            return jsonify({"error": "Message required"}), 400
        
        response = llm.chat(message)
        
        return jsonify({
            "response": response,
            "model": LLMConfig.MODEL_NAME
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/config", methods=["GET"])
def get_config():
    """Get current configuration"""
    return jsonify({
        "model": LLMConfig.MODEL_NAME,
        "max_new_tokens": LLMConfig.MAX_NEW_TOKENS,
        "temperature": LLMConfig.TEMPERATURE,
        "device": LLMConfig.DEVICE
    })


# For direct module execution
# Use: python -m llm_service.server
if __name__ == "__main__" or __name__ == "llm_service.server":
    if __name__ == "__main__":
        app.run(host="0.0.0.0", port=5000, debug=False)
