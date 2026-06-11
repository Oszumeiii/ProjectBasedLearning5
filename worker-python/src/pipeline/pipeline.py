import asyncio
from http import client
from src.utils.pdf_processor import extract_pdf_clean, extract_title
from src.utils.toc_processor import (
    classify_lines,
    convert_doc_to_markdown,
    toc_to_markdown,
)
from src.utils.reference_extractor import extract_references

from src.database.supabase_client import SupabaseRepository
from src.database.pg_client import (
    save_report_references,
)

from src.pipeline.parse import (
    build_path,
    flatten_tree,
    generate_summaries_and_embedding_for_tree,
    parse_markdown,
    print_tree,
    save_json,
)
# =========================
# MAIN PIPELINE
# =========================
import json
import os
import time
from datetime import datetime

from src.database.pipecone import PineconeDB

supabase_repo = SupabaseRepository()
pc = None
index = None


def _get_pinecone():
    global pc, index
    if pc is None:
        pc = PineconeDB()
        index = pc.index
    return pc, index
# =========================
# STAGE 1: PDF -> Clean Text
# =========================
def stage_extract_pdf(pdf_path):
    documents = extract_pdf_clean(pdf_path)
    return documents


# =========================
# STAGE 2: TOC Detection
# =========================
def stage_detect_toc(documents):
    title_candidates = extract_title(documents)
    toc_lines = classify_lines(title_candidates)
    md_lines, structured_toc = toc_to_markdown(toc_lines)

    return structured_toc


# =========================
# STAGE 3: Build Markdown
# =========================
def stage_build_markdown(documents, structured_toc):
    markdown_document = convert_doc_to_markdown(
        documents, structured_toc, output_path="Output.md"
    )

    return markdown_document


# =========================
# STAGE 4: Markdown -> Tree
# =========================
def stage_build_tree(markdown_document):
    root = parse_markdown(markdown_document)
    build_path(root)
    save_json(root.to_dict(), "pages.json")

    return root


# =========================
# STAGE 5: Tree -> Chunks (RAG)
# =========================
def stage_flatten_tree(root):
    flat_chunks = flatten_tree(root)
    save_json(flat_chunks, "chunks.json")

    return flat_chunks


# =========================
# STAGE 6: Extract References
# =========================
def stage_extract_references(documents, report_id):
    """Trích xuất tài liệu tham khảo từ các trang cuối của PDF."""
    last_pages_text = "\n".join([doc["text"] for doc in documents[-10:]])
    references = extract_references(last_pages_text)

    if references and report_id:
        save_report_references(report_id, references)
        print(f"📚 Đã lưu {len(references)} tài liệu tham khảo cho report #{report_id}")

    return references


# =========================
# STAGE 7: Upload to Supabase (only for class_posts, not reports)
# =========================
def stage_upload(chunks, global_summary, post_id=None):
    """Upload chunks vào Supabase. post_id có thể là class_posts ID hoặc report_id."""
    if post_id:
        supabase_repo.upload_to_supabase(chunks, global_summary, post_id)
    else:
        print("⏭️ Bỏ qua upload Supabase (không có post_id)")




RESULT_FILE = "pipeline_statistics.json"


def save_statistics(data):
    """
    Save statistics into json file
    """

    if not os.path.exists(RESULT_FILE):
        with open(RESULT_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)

    with open(RESULT_FILE, "r", encoding="utf-8") as f:
        old_data = json.load(f)

    old_data.append(data)

    with open(RESULT_FILE, "w", encoding="utf-8") as f:
        json.dump(old_data, f, ensure_ascii=False, indent=4)


def measure_stage(stage_name, func, *args, **kwargs):
    """
    Measure execution time for each stage
    """

    print(f"\n🔹 START {stage_name}")

    start = time.time()

    result = func(*args, **kwargs)

    end = time.time()

    duration = round(end - start, 2)

    print(f"✅ DONE {stage_name} ({duration}s)")

    return result, duration


def run_pipeline(pdf_path, report_id=None, post_id=None):

    pipeline_start = time.time()

    print("🚀 START PIPELINE")

    # =========================
    # Stage 1 - Extract PDF
    # =========================
    documents = stage_extract_pdf(pdf_path)

    # =========================
    # Stage 2 - Detect TOC
    # =========================
    structured_toc = stage_detect_toc(documents)


    # =========================
    # Stage 3 - Build Markdown
    # =========================
    markdown_document = stage_build_markdown(documents, structured_toc)

    # =========================
    # Stage 4 - Build Tree
    # =========================
    root = stage_build_tree(markdown_document)

    # =========================
    # Stage 5 - Summary + Embedding
    # =========================

    root, global_summary = generate_summaries_and_embedding_for_tree(root)

    # =========================
    # Stage 6 - Flatten Tree
    # =========================
    chunks = stage_flatten_tree(root)
  
    embed_key = post_id if post_id is not None else report_id

    if embed_key is not None:
        stage_upload(chunks, global_summary, embed_key)
    else:
        print("⏭️ Bỏ qua upload Supabase (thiếu cả post_id và report_id)")

    pc_instance, pc_index = _get_pinecone()
    global_summary_embedding = pc_instance.embed_text(global_summary)

    if embed_key is None:
        print("⏭️ Bỏ qua Pinecone (thiếu report_id và post_id)")
    else:
        response = pc_index.upsert(
            vectors=[
                {
                    "id": str(embed_key),
                    "values": global_summary_embedding,
                    "metadata": {
                        "text": global_summary
                    }
                }
            ]
        )
        if response.get("upserted_count", 0) > 0:
            print(f"✅ Uploaded global summary embedding ")
        else:
            print(f"❌ Failed to upload global summary embedding")
  

    
    print("✅ DONE PIPELINE")

    return chunks


if __name__ == "__main__":
    run_pipeline(
            pdf_path=f"data/raw_docs/report5.pdf",
            report_id=5,
            post_id=30
        )
    
    # =========================
    # test search in pinecone
    # =========================
    pc_instance, pc_index = _get_pinecone()

    query = "Đề tài nào sử dụng mô hình CNN "
    results = pc_instance.semantic_search(query=query, top_k=3)
    print(
        json.dumps(
            results.to_dict(),
            indent=4,
            ensure_ascii=False
        )
    )