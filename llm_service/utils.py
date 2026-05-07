"""Utility functions for LLM Service"""

import json
from typing import Any, Dict, List, Optional


def format_chat_message(role: str, content: str) -> Dict[str, str]:
    """Format a chat message"""
    return {"role": role, "content": content}


def build_conversation_history(user_messages: List[str]) -> List[Dict[str, str]]:
    """Build conversation history from user messages"""
    messages = []
    for msg in user_messages:
        messages.append(format_chat_message("user", msg))
    return messages


def truncate_text(text: str, max_length: int) -> str:
    """Truncate text to max length"""
    if len(text) <= max_length:
        return text
    return text[:max_length] + "..."


def count_tokens(text: str, tokenizer) -> int:
    """Count tokens in text"""
    tokens = tokenizer.encode(text)
    return len(tokens)


def format_response(response: str, include_metadata: bool = False) -> Dict[str, Any]:
    """Format response with optional metadata"""
    if include_metadata:
        return {
            "response": response,
            "length": len(response),
            "tokens": None  # Can be populated if tokenizer is available
        }
    return {"response": response}


def parse_json_response(response: str) -> Optional[Dict]:
    """Try to parse JSON from response"""
    try:
        # Try to extract JSON from response
        start_idx = response.find("{")
        end_idx = response.rfind("}") + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = response[start_idx:end_idx]
            return json.loads(json_str)
    except Exception as e:
        print(f"⚠️ Could not parse JSON response: {e}")
    
    return None


def merge_conversations(conv1: List[Dict], conv2: List[Dict]) -> List[Dict]:
    """Merge two conversation histories"""
    return conv1 + conv2
