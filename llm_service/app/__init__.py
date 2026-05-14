"""LLM Service Package - Qwen2.5-7B-Instruct via Ollama"""

from .core.model import LLMModel
from .config.config import LLMConfig

__all__ = ["LLMModel", "LLMConfig"]
