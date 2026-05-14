"""Configuration for LLM Service - Using Ollama"""

import os
from dotenv import load_dotenv

load_dotenv()

class LLMConfig:
    """LLM Configuration using Ollama"""
    
    # Ollama settings
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    MODEL_NAME = "qwen2.5:7b"  # Ollama model name
    
    # Generation parameters
    MAX_NEW_TOKENS = 1024

    TEMPERATURE = 0.6

    TOP_P = 0.92

    TOP_K = 40