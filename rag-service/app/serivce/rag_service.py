# src/services/rag_service.py
from app.core.embedding import Embedder
from app.core.vector_db import VectorDB

embedder = Embedder()
vector_db = VectorDB()

def retrieve_context(query: str, report_id: str):
    # 1. Chuyển query của user thành vector
    query_vector = embedder.encode(query)
    
    # 2. Tìm kiếm trong Vector DB dựa trên embedding của Summary đã lưu
    results = vector_db.query(
        query_vector=query_vector, 
        n_results=3,
        filter_dict={"report_id": report_id}
    )
    
    # 3. Trả về Content đầy đủ (đã lưu trong metadata) để đưa vào LLM
    contexts = [res['content'] for res in results['metadatas'][0]]
    return contexts