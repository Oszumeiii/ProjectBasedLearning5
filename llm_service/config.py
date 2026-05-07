"""Configuration for LLM Service"""

import os
from dotenv import load_dotenv

load_dotenv()


class LLMConfig:
    """LLM Configuration"""
    
    # Model settings
    MODEL_NAME = "LiquidAI/LFM2.5-1.2B-Instruct"
    
    # Generation parameters
    MAX_NEW_TOKENS = int(os.getenv("MAX_NEW_TOKENS", 256))
    TEMPERATURE = float(os.getenv("TEMPERATURE", 0.7))
    TOP_P = float(os.getenv("TOP_P", 0.9))
    TOP_K = int(os.getenv("TOP_K", 50))
    
    # Device settings
    DEVICE = os.getenv("DEVICE", "cuda")  # cuda or cpu
    USE_HALF_PRECISION = os.getenv("USE_HALF_PRECISION", "true").lower() == "true"
    
    # Loading settings
    LOAD_IN_8BIT = os.getenv("LOAD_IN_8BIT", "false").lower() == "true"
    LOAD_IN_4BIT = os.getenv("LOAD_IN_4BIT", "false").lower() == "true"
    
    # Cache settings
    CACHE_DIR = os.getenv("HF_CACHE_DIR", "./model_cache")
