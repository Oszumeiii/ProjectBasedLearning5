"""Configuration for LLM Service - Optimized for Mac M2 Pro"""

import os
import torch
from dotenv import load_dotenv

load_dotenv()

class LLMConfig:
    """LLM Configuration"""
    
    # Model settings
    MODEL_NAME = "LiquidAI/LFM2.5-1.2B-Instruct"
    
    # Generation parameters
    MAX_NEW_TOKENS = int(os.getenv("MAX_NEW_TOKENS", 512)) # Tăng lên một chút cho câu trả lời chi tiết
    TEMPERATURE = float(os.getenv("TEMPERATURE", 0.1))     # Giảm xuống để RAG chính xác hơn
    TOP_P = float(os.getenv("TOP_P", 0.9))
    TOP_K = int(os.getenv("TOP_K", 40))
    
    # Device settings
    # Tự động nhận diện mps (Metal) cho Mac
    if torch.backends.mps.is_available():
        DEFAULT_DEVICE = "mps"
    elif torch.cuda.is_available():
        DEFAULT_DEVICE = "cuda"
    else:
        DEFAULT_DEVICE = "cpu"
        
    DEVICE = os.getenv("DEVICE", DEFAULT_DEVICE)
    
    # Với Mac M2 Pro, dùng bfloat16 là tối ưu nhất (cân bằng tốc độ và chính xác)
    USE_BFLOAT16 = os.getenv("USE_BFLOAT16", "true").lower() == "true"
    
    CACHE_DIR = os.getenv("HF_CACHE_DIR", "./model_cache")