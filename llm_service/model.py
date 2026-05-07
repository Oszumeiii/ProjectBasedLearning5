"""LLM Model Loader and Interface"""

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from config import LLMConfig
from tokenizer import TokenizerLoader


class LLMModel:
    """LLM Model class for LiquidAI/LFM2.5-1.2B-Instruct"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.model = None
            cls._instance.tokenizer_loader = None
        return cls._instance
    
    def __init__(self):
        """Initialize LLM Model"""
        if self.model is None:
            self.tokenizer_loader = TokenizerLoader()
            self.load_model()
    
    def load_model(self):
        """Load model from pretrained"""
        try:
            print(f"🔄 Loading model {LLMConfig.MODEL_NAME}...")
            
            # Determine dtype
            dtype = torch.float16 if LLMConfig.USE_HALF_PRECISION else torch.float32
            
            # Prepare kwargs for from_pretrained
            model_kwargs = {
                "cache_dir": LLMConfig.CACHE_DIR,
                "dtype": dtype,
                "trust_remote_code": True,
                "low_cpu_mem_usage": True,
            }
            
            # Only use device_map for CUDA (accelerate is required for this)
            if LLMConfig.DEVICE == "cuda":
                try:
                    import accelerate
                    model_kwargs["device_map"] = "auto"
                except ImportError:
                    print("⚠️ accelerate not installed, loading model to CPU first")
            
            self.model = AutoModelForCausalLM.from_pretrained(
                LLMConfig.MODEL_NAME,
                **model_kwargs
            )
            
            # Move to device if not using device_map
            if "device_map" not in model_kwargs:
                self.model = self.model.to(LLMConfig.DEVICE)
            
            self.model.eval()
            print(f"✅ Model loaded successfully on {LLMConfig.DEVICE}")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise
    
    def get_tokenizer(self):
        """Get tokenizer"""
        return self.tokenizer_loader.get_tokenizer()
    
    def generate(
        self,
        messages: list,
        max_new_tokens: int = None,
        temperature: float = None,
        top_p: float = None,
        top_k: int = None
    ) -> str:
        """Generate response from messages"""
        try:
            # Use config defaults if not provided
            max_new_tokens = max_new_tokens or LLMConfig.MAX_NEW_TOKENS
            temperature = temperature or LLMConfig.TEMPERATURE
            top_p = top_p or LLMConfig.TOP_P
            top_k = top_k or LLMConfig.TOP_K
            
            tokenizer = self.get_tokenizer()
            
            # Apply chat template
            inputs = tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=True,
                tokenize=True,
                return_dict=True,
                return_tensors="pt"
            ).to(self.model.device)
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_new_tokens,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    do_sample=True
                )
            
            # Decode response
            response = tokenizer.decode(
                outputs[0][inputs["input_ids"].shape[-1]:],
                skip_special_tokens=True
            )
            
            return response.strip()
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
        max_new_tokens: int = None
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
    
    def unload_model(self):
        """Unload model from memory"""
        try:
            if self.model is not None:
                del self.model
                self.model = None
                torch.cuda.empty_cache()
                print("✅ Model unloaded successfully")
        except Exception as e:
            print(f"⚠️ Error unloading model: {e}")
