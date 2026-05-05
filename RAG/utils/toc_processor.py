import json
import re

from utils.text_utils import is_toc_page_by_density
from utils.client_llm import client

def build_toc_structure(toc_lines):
    # Placeholder for building TOC structure (e.g., using indentation, numbering)
    # This can be implemented using LLM or rule-based logic based on the classified TOC lines.
    pass



def classify_lines(lines):
    init_prompt = """
You are an expert document structure analyst specializing in hierarchical extraction for RAG systems.

Task:
Convert the provided Table of Contents (TOC) into a structured JSON format that reflects a perfect parent-child hierarchy and remove any invalid entries.

--------------------------------
HIERARCHY STRATEGY (CRITICAL)
--------------------------------
Assign 'level' (Integer, 0-indexed) based on professional report standards:

- Level 0 (Root): 
  - Major Chapters (e.g., "Chương I", "Chương II").
  - Independent sections (e.g., "TÓM TẮT ĐỒ ÁN", "DANH MỤC BẢNG").
  
- Level 1 (Section): 
  - Main sections under a chapter (e.g., "1. Thực trạng", "2. Các vấn đề cần giải quyết").
  - Note: Even if it's a single digit like "1", if it follows a "Chương", it is Level 1.

- Level 2 (Sub-section): 
  - Nested sections (e.g., "1.1. Linh kiện sử dụng", "1.2. Thông số kỹ thuật").

- Level 3 (Sub-sub-section): 
  - Deeply nested details (e.g., "1.2.1. Cảm biến AD8232").

--------------------------------
EXTRACTION RULES
--------------------------------
1. structure_id (String | null): The numbering part ONLY (e.g., "Chương I", "1.1", "1.2.1").
2. title (String): The FULL title text. 
   - KEEP the numbering prefix (e.g., "Chương I: Giới thiệu...").
   - REMOVE all trailing dots (.........) and page numbers at the end.
3. page (Integer | null): The extracted page number. Set to null if missing.

--------------------------------
OUTPUT FORMAT
--------------------------------
Return ONLY a valid JSON object. No prose, no markdown code blocks.

{
  "table_of_contents": [
    {
      "level": 0,
      "structure_id": "Chương I",
      "title": "Chương I: Giới thiệu tổng quan đề tài",
      "page": 5
    },
    {
      "level": 1,
      "structure_id": "1",
      "title": "1. Thực trạng",
      "page": 6
    },
    {
      "level": 2,
      "structure_id": "1.1",
      "title": "1.1. Bối cảnh dự án",
      "page": 7
    }
  ]
}
"""

    if isinstance(lines, list):
        lines_text = "\n".join(lines)
    else:
        lines_text = str(lines)

    prompt = init_prompt + "\n\nINPUT TABLE OF CONTENTS:\n" + lines_text

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt
    )

    return response.text



# This function is used to filter out non-TOC lines using LLM
def filter_lines_llm(lines, model="gemini-3-flash-preview"):
    import json

    # Convert input → text
    if isinstance(lines, list):
        lines_text = "\n".join(lines)
    else:
        lines_text = str(lines)

    prompt = f"""
You are an expert in document structure extraction.

Task:
From the given list of lines, FILTER OUT lines that are NOT part of a Table of Contents.

--------------------------------
REMOVE (very important)
--------------------------------
- Cover page content (university name, report title, student name)
- Metadata (date, location, author)
- Decorative or standalone text
- Short meaningless lines (e.g., "(VNĐ)", "...")

--------------------------------
KEEP ONLY
--------------------------------
- Chapter titles (e.g., "Chương I", "Chapter 1")
- Section titles (e.g., "1.", "1.1", "1.1.1")
- Valid TOC entries (may or may not have page numbers)

--------------------------------
STRICT RULES
--------------------------------
- DO NOT modify text
- DO NOT merge lines
- DO NOT hallucinate new lines
- KEEP original order

--------------------------------
INPUT
--------------------------------
{lines_text}

--------------------------------
OUTPUT FORMAT (JSON ONLY)
--------------------------------
{{
  "filtered_lines": [
    "line 1",
    "line 2"
  ]
}}
"""

    response = client.models.generate_content(
        model=model,
        contents=prompt
    )

    text = response.text.strip()
    try:
        if text.startswith("```"):
            text = text.strip("```")
            text = text.replace("json", "").strip()

        result = json.loads(text)
        return result.get("filtered_lines", [])
    except Exception:
        return lines
    


import json

def toc_to_markdown(toc_json):
    if isinstance(toc_json, str):
        toc_json = json.loads(toc_json)

    md_lines = []
    structured_toc = []

    for item in toc_json["table_of_contents"]:
        if item["title"] is None:
            continue

        level = item["level"]
        title = item["title"].strip()
        prefix = "#" * (level + 1)

        md_lines.append(f"{prefix} {title}")
        structured_toc.append((title, prefix))

    return md_lines, structured_toc


def is_toc_page(page_text, structured_toc):
    text_lower = page_text.lower()

    # rule 1: có chữ mục lục
    if "mục lục" in text_lower:
        return True

    # rule 2: density
    # count = sum(1 for title, _ in structured_toc if title in page_text)
    # if count >= 5:
    #     return True

    return False


def convert_doc_to_markdown(document, structured_toc):
    result = []

    for page in document:
        page_text = page['text']

        if is_toc_page(page_text , structured_toc):
            continue

        lines = page_text.split("\n")
        new_lines = []

        for line in lines:
            replaced = False

            for title, prefix in structured_toc:
                if re.match(rf'^\s*{re.escape(title)}', line):
                    new_lines.append(f"{prefix} {title}")
                    replaced = True
                    break

            if not replaced:
                new_lines.append(line)

        result.append("\n".join(new_lines))

    return "\n\n".join(result)