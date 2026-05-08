# services/rag-service/
# ├── src/
# │   ├── main.py                # Điểm khởi chạy FastAPI
# │   ├── api/                   # Định nghĩa các Endpoint API
# │   │   └── v1/
# │   │       ├── endpoints/
# │   │       │   ├── ingest.py  # API xử lý upload/index tài liệu
# │   │       │   └── search.py  # API tìm kiếm vector (retrieval)
# │   │       └── router.py
# │   ├── core/                  # Logic cốt lõi của RAG
# │   │   ├── config.py          # Quản lý biến môi trường (Pydantic)
# │   │   ├── embedder.py        # Khởi tạo Local Embedding Model
# │   │   ├── vector_db.py       # Kết nối/Thao tác với Vector DB (Chroma/Qdrant)
# │   │   └── document_loader.py # Logic cắt nhỏ file (Chunking)
# │   ├── services/              # Business logic (phối hợp core)
# │   │   ├── rag_service.py
# │   │   └── index_service.py
# │   ├── schemas/               # Định nghĩa kiểu dữ liệu (Pydantic)
# │   │   └── rag_schema.py
# │   └── utils/                 # Các hàm bổ trợ (logger, helpers)
# ├── storage/                   # Nơi lưu trữ local Vector DB (nếu dùng Chroma/FAISS)
# ├── requirements.txt
# ├── Dockerfile
# └── .env.example



#!/usr/bin/env python
"""Entry point for LLM Service Flask server"""

import sys
import os

# Add the workspace to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from llm_service.app.server import app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)


