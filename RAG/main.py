import asyncio

from summary import generate_summaries_for_tree
from parse import build_path, flatten_tree, parse_markdown, print_tree, save_json
from utils.pdf_processor import extract_pdf_clean
from utils.pdf_processor import extract_title
from utils.toc_processor import classify_lines, convert_doc_to_markdown
from utils.toc_processor import toc_to_markdown


def main ():
    pdf_path = r"data\raw_docs\pbl_report.pdf"
    documents = extract_pdf_clean(pdf_path)


    # Print the cleaned documents for verification
    for doc in documents:
        print(f"Page {doc['page']}:\n{doc['text']}\n{'-'*40}\n")

    
    # Extract title candidates for TOC processing
    title_candidates = extract_title(documents)
    print("Title Candidates:")
    for title in title_candidates:
        print(title)

    # Classify lines to filter out TOC entries
    toc_lines = classify_lines(title_candidates)
    print("\nFiltered TOC Lines:")
    print(toc_lines)
    

    # Convert doc to markdown
    md_lines , structured_toc = toc_to_markdown(toc_lines)
    print("\nGenerated Markdown:")
    print(md_lines)


    # convert doc to markdown
    markdown_document = convert_doc_to_markdown(documents, structured_toc)

    print("\nFinal Markdown Document:")
    print(markdown_document)

    # B2: parse markdown → tree
    root = parse_markdown(markdown_document)

    # B3: build path
    build_path(root)

    asyncio.run(generate_summaries_for_tree(root))

    # B4: debug tree
    print("\n=== TREE ===")
    print_tree(root)

    # B5: lưu tree
    save_json(root.to_dict(), "pages.json")


    # B6: flatten → chunks (RAG dùng cái này)
    flat_chunks = flatten_tree(root)

    print("\n=== CHUNKS ===")
    for c in flat_chunks:
        print(c["path"])
        print(c["content"][:100], "...\n")

    # B7: save chunks
    save_json(flat_chunks, "chunks.json")

    print("\nDONE 🚀")


    # define querry 
    querry = "Phương pháp của báo cáo này là gì ?"

    # use llm to select relevant section 


    

if __name__ == "__main__":
    main()