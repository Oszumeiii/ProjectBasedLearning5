import asyncio

from src.utils.pdf_processor import extract_pdf_clean, extract_title
from src.utils.toc_processor import (
    classify_lines,
    convert_doc_to_markdown,
    toc_to_markdown,
)
from src.utils.reference_extractor import extract_references

from src.database.supabase_client import upload_to_supabase
from src.database.pg_client import save_report_references

from src.pipeline.parse import (
    build_path,
    flatten_tree,
    generate_summaries_for_tree,
    parse_markdown,
    print_tree,
    save_json,
)


# =========================
# STAGE 1: PDF -> Clean Text
# =========================
def stage_extract_pdf(pdf_path):
    documents = extract_pdf_clean(pdf_path)

    for doc in documents:
        print(f"Page {doc['page']}:\n{doc['text']}\n{'-'*40}\n")

    return documents


# =========================
# STAGE 2: TOC Detection
# =========================
def stage_detect_toc(documents):
    title_candidates = extract_title(documents)

    print("Title Candidates:")
    for title in title_candidates:
        print(title)

    toc_lines = classify_lines(title_candidates)

    print("\nFiltered TOC Lines:")
    print(toc_lines)

    md_lines, structured_toc = toc_to_markdown(toc_lines)

    print("\nGenerated Markdown TOC:")
    print(md_lines)

    return structured_toc


# =========================
# STAGE 3: Build Markdown
# =========================
def stage_build_markdown(documents, structured_toc):
    markdown_document = convert_doc_to_markdown(
        documents, structured_toc, output_path="Output.md"
    )

    print("\nFinal Markdown Document:")
    print(markdown_document)

    return markdown_document


# =========================
# STAGE 4: Markdown -> Tree
# =========================
def stage_build_tree(markdown_document):
    root = parse_markdown(markdown_document)
    build_path(root)

    print("\n=== TREE ===")
    print_tree(root)

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
def stage_upload(chunks, post_id=None):
    """Upload chunks vào Supabase. Chỉ chạy khi có post_id hợp lệ (từ class_posts)."""
    if post_id:
        upload_to_supabase(chunks, post_id)
    else:
        print("⏭️ Bỏ qua upload Supabase (không có post_id từ class_posts)")


# =========================
# MAIN PIPELINE
# =========================
def run_pipeline(pdf_path, report_id=None, post_id=None):
    print("🚀 START PIPELINE")

    documents = stage_extract_pdf(pdf_path)

    structured_toc = stage_detect_toc(documents)

    markdown_document = stage_build_markdown(documents, structured_toc)

    root = stage_build_tree(markdown_document)

    # Optional
    generate_summaries_for_tree(root)
    
    embedding_summaries_for_tree(root)  # TODO: Triển khai hàm này với model embedding thực tế
    

    chunks = stage_flatten_tree(root)

    #stage_extract_references(documents, report_id)

    stage_upload(chunks, post_id)

    print("✅ DONE PIPELINE")
    return chunks


if __name__ == "__main__":
    run_pipeline("data/raw_docs/pbl_report.pdf" , 24)