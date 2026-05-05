import asyncio
from parser_node import get_nodes_from_markdown
from parse import build_path, flatten_tree, parse_markdown, print_tree, save_json
from utils.pdf_processor import extract_pdf_clean
from utils.pdf_processor import extract_title
from utils.toc_processor import classify_lines, convert_doc_to_markdown
from utils.toc_processor import toc_to_markdown


# def main ():
#     #pdf_path = "data/raw_docs/baocao_006.pdf"
#     pdf_path = "data/raw_docs/pbl_report.pdf"
#     documents = extract_pdf_clean(pdf_path)


#     # Print the cleaned documents for verification
#     for doc in documents:
#         print(f"Page {doc['page']}:\n{doc['text']}\n{'-'*40}\n")

    
#     # Extract title candidates for TOC processing
#     title_candidates = extract_title(documents)
#     print("Title Candidates:")
#     for title in title_candidates:
#         print(title)

#     # Classify lines to filter out TOC entries
#     toc_lines = classify_lines(title_candidates) # oke
#     print("\nFiltered TOC Lines:")
#     print(toc_lines)
    

#     # Convert doc to markdown
#     md_lines , structured_toc = toc_to_markdown(toc_lines)
#     print("\nGenerated Markdown:")
#     print(md_lines)
    
#     print("\nStructured TOC:")
#     print(structured_toc)


#     # convert doc to markdown
#     markdown_document = convert_doc_to_markdown(documents, structured_toc)
    
#     # save file .md 
#     with open("output.md", "w") as f:
#         f.write(markdown_document)

#     print("\nFinal Markdown Document:")
#     print(markdown_document)

def main():
    base_nodes, objects = get_nodes_from_markdown("Output.md")        
    
    
    
    
    
    

    # # B2: parse markdown → tree
    # root = parse_markdown(markdown_document)

    # # B3: build path
    # build_path(root)

    # # asyncio.run(generate_summaries_for_tree(root))

    # # B4: debug treec
    # print("\n=== TREE ===")
    # print_tree(root)

    # # B5: lưu tree
    # save_json(root.to_dict(), "pages.json")


    # # B6: flatten → chunks (RAG dùng cái này)
    # flat_chunks = flatten_tree(root)

    # print("\n=== CHUNKS ===")
    # for c in flat_chunks:
    #     print(c["path"])
    #     print(c["content"][:100], "...\n")

    # # B7: save chunks
    # save_json(flat_chunks, "chunks.json")

    # print("\nDONE 🚀")


    # # define querry 
    # querry = "Phương pháp của báo cáo này là gì ?"

    # use llm to select relevant section 


    

if __name__ == "__main__":
    main()