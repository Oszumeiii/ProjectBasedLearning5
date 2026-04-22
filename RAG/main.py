from utils.pdf_processor import extract_pdf_clean
from utils.pdf_processor import extract_title
from utils.toc_processor import classify_lines
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
    markdown = toc_to_markdown(toc_lines)
    print("\nGenerated Markdown:")
    print(markdown)



    

if __name__ == "__main__":
    main()