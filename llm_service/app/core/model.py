"""LLM Model using Ollama"""

import requests
import json
from app.config.config import LLMConfig

OLLAMA_API_TIMEOUT = 120*2  

class LLMModel:
    """LLM Model class using Ollama (Qwen2.5-7B-Instruct)"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.ollama_url = LLMConfig.OLLAMA_BASE_URL
            cls._instance.model_name = LLMConfig.MODEL_NAME
        return cls._instance
    
    def __init__(self):
        """Initialize Ollama connection"""
        self.check_ollama_connection()
    
    def check_ollama_connection(self):
        """Check if Ollama server is running"""
        try:
            response = requests.get(
                f"{self.ollama_url}/api/tags",
                timeout=5
            )
            response.raise_for_status()
            models = response.json().get("models", [])
            available_models = [m["name"] for m in models]
            
            if self.model_name not in available_models:
                print(f"⚠️  Model {self.model_name} not found. Available models: {available_models}")
                print(f"🔄 Pulling model {self.model_name}...")
                self.pull_model()
            else:
                print(f"✅ Ollama connected. Model {self.model_name} is available")
        except requests.exceptions.ConnectionError:
            print(f"❌ Ollama server not found at {self.ollama_url}")
            print("🔄 Make sure to run: ollama serve")
            raise
        except Exception as e:
            print(f"❌ Error checking Ollama: {e}")
            raise
    
    def pull_model(self):
        """Pull model from Ollama"""
        try:
            url = f"{self.ollama_url}/api/pull"
            data = {"name": self.model_name}
            
            response = requests.post(url, json=data, timeout=600)  # 10 min timeout for pulling
            response.raise_for_status()
            print(f"✅ Model {self.model_name} pulled successfully")
        except Exception as e:
            print(f"❌ Error pulling model: {e}")
            raise
    
    def generate(
        self,
        messages: list,
        max_new_tokens: int = None,
        temperature: float = None,
        top_p: float = None,
        top_k: int = None
    ) -> str:
        """Generate response from messages using Ollama"""
        try:
            # Use config defaults if not provided
            max_new_tokens = max_new_tokens or LLMConfig.MAX_NEW_TOKENS
            temperature = temperature or LLMConfig.TEMPERATURE
            top_p = top_p or LLMConfig.TOP_P
            
            # Convert Message objects to dicts if needed
            formatted_messages = []
            for msg in messages:
                if isinstance(msg, dict):
                    formatted_messages.append(msg)
                else:
                    # Handle Message object
                    formatted_messages.append({
                        "role": getattr(msg, "role", "user"),
                        "content": getattr(msg, "content", "")
                    })
            
            url = f"{self.ollama_url}/api/chat"
            
            payload = {
                "model": self.model_name,
                "messages": formatted_messages,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "top_p": top_p,
                    "top_k": top_k,
                    "num_predict": max_new_tokens,
                }
            }
            
            response = requests.post(
                url,
                json=payload,
                timeout=OLLAMA_API_TIMEOUT
            )
            response.raise_for_status()
            
            result = response.json()
            message_content = result.get("message", {}).get("content", "")
            
            if not message_content:
                raise ValueError(f"Empty response from Ollama: {result}")
            
            return message_content.strip()
        except requests.exceptions.Timeout:
            print(f"❌ Ollama API timeout after {OLLAMA_API_TIMEOUT}s")
            raise
        except Exception as e:
            print(f"❌ Error during generation: {e}")
            raise
    
    def chat(self, user_message: str, max_new_tokens: int = None) -> str:
        """Simple chat interface"""
        messages = [
            {"role": "user", "content": user_message}
        ]
        return self.generate(messages, max_new_tokens=max_new_tokens)
    
    def generate_with_history(
        self,
        messages: list,
        system_prompt: str = None,
        max_new_tokens: int = 256
    ) -> str:
        """Generate with conversation history"""
        try:
            if system_prompt:
                messages = [
                    {"role": "system", "content": system_prompt},
                    *messages
                ]
            
            return self.generate(messages, max_new_tokens=max_new_tokens)
        except Exception as e:
            print(f"❌ Error in generate_with_history: {e}")
            raise
    
    def answer_with_context(self, user_message: str, context: str, max_new_tokens: int = 512) -> str:
        """Answer user query with provided context"""
        system_prompt = (
            "Bạn là một trợ lý AI chuyên trả lời câu hỏi dựa trên nội dung tài liệu đã cho. "
            "Hãy sử dụng thông tin trong phần CONTEXT để trả lời câu hỏi của người dùng một cách chính xác ."
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"CONTEXT:\n{context}\n\nQUESTION:\n{user_message}"}
        ]
        
        return self.generate(messages, max_new_tokens=max_new_tokens)

    def answer_without_context(self, user_message: str, max_new_tokens: int = 512) -> str:
        """Answer user query without any context"""
        system_prompt = (
            "Bạn là một trợ lý AI chuyên trả lời câu hỏi của người dùng. "
            "Hãy trả lời câu hỏi một cách chính xác và ngắn gọn dựa trên kiến thức chung của bạn."
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
        
        return self.generate(messages, max_new_tokens=max_new_tokens)
    
    def summarize(self, text: str, max_new_tokens: int = 256) -> str:
        """Summarize text"""
        system_prompt = (
            "Bạn là một trợ lý AI chuyên tạo tóm tắt. "
            "Hãy tóm tắt nội dung sau đây một cách ngắn gọn và chính xác, giữ lại những thông tin quan trọng nhất."
        )
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"TEXT:\n{text}"}
        ]
        
        return self.generate(messages, max_new_tokens=max_new_tokens)