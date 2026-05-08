import chromadb
from src.core.config import settings

class VectorDB:
    def __init__(self):
        self.client = chromadb.PersistentClient(path="./storage/chroma_db")
        self.collection = self.client.get_or_create_collection(name="reports")

    def add_documents(self, ids, vectors, documents, metadatas):
        self.collection.add(
            ids=ids,
            embeddings=vectors,
            documents=documents,
            metadatas=metadatas
        )

    def query(self, query_vector, n_results=5, filter_dict=None):
        return self.collection.query(
            query_embeddings=[query_vector],
            n_results=n_results,
            where=filter_dict # Dùng để lọc theo report_id
        )