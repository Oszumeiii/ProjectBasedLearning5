import os
import time
import ssl
import httpx
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from pinecone.errors.exceptions import PineconeConnectionError
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
import torch

load_dotenv()

CONNECTION_TIMEOUT = 10


class PineconeDB:

    def __init__(
        self,
        api_key: str = None,
        index_name: str = "quickstart",
        dimension: int = 1024,
        cloud: str = "aws",
        region: str = "us-east-1",
        max_retries: int = 3,
    ):
        if api_key is None:
            api_key = os.getenv("PINECONE_API_KEY")

        self.index_name = index_name

        # =========================
        # PINECONE CLIENT
        # =========================

        self.pc = Pinecone(
            api_key=api_key,
            timeout=CONNECTION_TIMEOUT,
        )

        # =========================
        # CREATE INDEX IF NOT EXISTS
        # =========================

        existing_indexes = self._list_indexes_with_retry(max_retries)

        if index_name not in existing_indexes:

            self.pc.create_index(
                name=index_name,
                dimension=dimension,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud=cloud,
                    region=region
                )
            )

        self.index = self.pc.Index(index_name)

        # =========================
        # EMBEDDING MODEL
        # =========================

        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {device}")

        self.embedding_model = SentenceTransformer(
            "BAAI/bge-m3",
            device=device
        )

    def _list_indexes_with_retry(self, max_retries: int = 3) -> List[str]:
        for attempt in range(max_retries):
            try:
                return [idx["name"] for idx in self.pc.list_indexes()]
            except (PineconeConnectionError, httpx.ConnectError, httpx.ConnectTimeout,
                    ssl.SSLError, OSError, Exception) as e:
                if attempt < max_retries - 1:
                    wait = 2 ** (attempt + 1)
                    print(f"⚠️ Pinecone connection failed (attempt {attempt + 1}/{max_retries}): {type(e).__name__}: {e}")
                    print(f"   Retrying in {wait}s...")
                    time.sleep(wait)
                else:
                    print(f"❌ Pinecone connection failed after {max_retries} attempts: {type(e).__name__}: {e}")
                    raise
        return []

    # =====================================================
    # EMBEDDING
    # =====================================================

    def embed_text(self, text: str) -> List[float]:

        embedding = self.embedding_model.encode(
            text,
            normalize_embeddings=True,
            convert_to_numpy=True
        )

        return embedding.tolist()

    # =====================================================
    # INSERT REPORT
    # =====================================================

    def insert_report(
        self,
        report_id: int,
        global_summary: str,
        metadata: Optional[Dict[str, Any]] = None,
    ):

        if metadata is None:
            metadata = {}

        embedding = self.embed_text(global_summary)

        payload = {
            "id": report_id,
            "values": embedding,
            "metadata": {
                "global_summary": global_summary,
                **metadata
            }
        }

        self.index.upsert([payload])

        print(f"✅ Inserted report: {report_id}")

    # =====================================================
    # SEMANTIC SEARCH
    # =====================================================

    def semantic_search(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None,
    ):

        query_embedding = self.embed_text(query)

        results = self.index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            filter=filters
        )

        return results

    # =====================================================
    # SEARCH REPORTS ONLY
    # =====================================================

    def search_reports(
        self,
        query: str,
        top_k: int = 5,
    ):

        return self.semantic_search(
            query=query,
            top_k=top_k,
            filters={
                "type": "report"
            }
        )


    # =====================================================
    # DELETE VECTOR
    # =====================================================

    def delete_vector(self, vector_id: str):

        self.index.delete(ids=[vector_id])

        print(f"🗑 Deleted vector: {vector_id}")

    # =====================================================
    # DELETE REPORT
    # =====================================================

    def delete_report(self, report_id: int):

        self.index.delete(
            filter={
                "report_id": report_id
            }
        )

        print(f"🗑 Deleted report: {report_id}")

    # =====================================================
    # GET INDEX STATS
    # =====================================================

    def get_stats(self):

        return self.index.describe_index_stats()
    