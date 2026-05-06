import asyncio

from src.utils.pdf_processor import extract_pdf_clean, extract_title
from src.utils.toc_processor import (
    classify_lines,
    convert_doc_to_markdown,
    toc_to_markdown,
)


from src.database.supabase_client import SupabaseRepository

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
# STAGE 6: Upload
# =========================
def stage_upload(chunks):
    supabase_repo = SupabaseRepository()
    supabase_repo.insert_report_nodes(chunks , 24)


# =========================
# MAIN PIPELINE
# =========================
def run_pipeline(pdf_path):
    print("🚀 START PIPELINE")

    documents = stage_extract_pdf(pdf_path)

    structured_toc = stage_detect_toc(documents)

    markdown_document = stage_build_markdown(documents, structured_toc)

    root = stage_build_tree(markdown_document)

    # Optional
    generate_summaries_for_tree(root)

    chunks = stage_flatten_tree(root)

    stage_upload(chunks)

    print("✅ DONE PIPELINE")
    return chunks


if __name__ == "__main__":
    run_pipeline("data/raw_docs/pbl_report.pdf")