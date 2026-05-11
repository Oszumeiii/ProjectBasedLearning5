from pydantic import BaseModel
from typing import List, Optional


class Message(BaseModel):
    role: str
    content: str


class GenerateRequest(BaseModel):
    messages: List[Message]
    max_new_tokens: int = 256


class SummaryRequest(BaseModel):
    content: str
    max_new_tokens: int = 200


class AnswerRequest(BaseModel):
    message: str
    post_id: str
    report_id: Optional[str] = None
    query: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    post_id: Optional[str] = None