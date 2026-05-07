"""Tokenizer Loader for LLM Service"""

from transformers import AutoTokenizer
from config import LLMConfig


class TokenizerLoader:
    """Handles tokenizer loading and initialization"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.tokenizer = None
        return cls._instance
    
    def __init__(self):
        """Initialize tokenizer if not already loaded"""
        if self.tokenizer is None:
            self.load_tokenizer()
    
    def load_tokenizer(self):
        """Load tokenizer from pretrained model"""
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(
                LLMConfig.MODEL_NAME,
                cache_dir=LLMConfig.CACHE_DIR,
                trust_remote_code=True
            )
            
            # Set padding token if not defined
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            print(f"✅ Tokenizer loaded successfully from {LLMConfig.MODEL_NAME}")
        except Exception as e:
            print(f"❌ Error loading tokenizer: {e}")
            raise
    
    def get_tokenizer(self):
        """Get loaded tokenizer"""
        if self.tokenizer is None:
            self.load_tokenizer()
        return self.tokenizer
    
    def encode(self, text: str):
        """Encode text using tokenizer"""
        if self.tokenizer is None:
            self.load_tokenizer()
        return self.tokenizer.encode(text)
    
    def decode(self, tokens):
        """Decode tokens using tokenizer"""
        if self.tokenizer is None:
            self.load_tokenizer()
        return self.tokenizer.decode(tokens)
    
    def apply_chat_template(self, messages, add_generation_prompt=True):
        """Apply chat template for messages"""
        if self.tokenizer is None:
            self.load_tokenizer()
        
        return self.tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=add_generation_prompt,
            tokenize=False
        )
