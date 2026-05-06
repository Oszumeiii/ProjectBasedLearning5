from collections import Counter
import re
from utils.text_utils import is_page_number, remove_headers_footers



def detect_repeated_lines(pages, threshold=0.6):
    """
    pages: list[str]
    threshold: % số trang mà line xuất hiện
    """
    line_counts = Counter()
    total_pages = len(pages)

    for text in pages:
        lines = text.split("\n")
        unique_lines = set(line.strip() for line in lines if line.strip())

        for line in unique_lines:
            line_counts[line] += 1

    repeated_lines = set()
    for line, count in line_counts.items():
        if count / total_pages >= threshold:
            repeated_lines.add(line)

    return repeated_lines

    


def remove_page_numbers(text):
    lines = text.split("\n")

    cleaned = [
        line for line in lines
        if not is_page_number(line)
    ]

    return "\n".join(cleaned)


def extract_title(document): 
    import re

    header = []
    for doc in document:
        sentences = doc['text'].split('\n')
        for sentence in sentences:
            s = sentence.strip()

            if (
                len(s) < 80 and
                (
                    re.match(r'^Chương\s+\w+', s) or   # Chương I, II...
                    re.match(r'^\d+\.', s) or          # 1. 2. 3.
                    s.isupper()                       # MỤC LỤC, BÁO CÁO
                )
            ):
                header.append(s)
    return header

def extract_pdf_clean(pdf_path):
    import pdfplumber

    raw_pages = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                raw_pages.append(text)

    repeated_lines = detect_repeated_lines(raw_pages)

    documents = []

    for i, text in enumerate(raw_pages):
        text = remove_headers_footers(text, repeated_lines)
        text = remove_page_numbers(text)

        documents.append({
            "page": i + 1,
            "text": text
        })

    return documents
