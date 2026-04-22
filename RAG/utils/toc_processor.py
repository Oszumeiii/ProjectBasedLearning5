from RAG.utils.client_llm import client


# This file contains functions to process Table of Contents (TOC) lines, including LLM-based classification and filtering.
def classify_lines(lines):

    init_prompt = """
You are a document structure extraction system.

Task:
You are given a Table of Contents extracted from OCR or text.
Your job is to convert it into a structured JSON format.

--------------------------------
EXTRACTION & STRUCTURE RULES
--------------------------------
You must clearly SEPARATE each line into 4 clean fields:

1. level (Integer): The depth of the section in the hierarchy (0-indexed).
   - "Chương I", "1" → level: 0
   - "1.1" → level: 1

2. structure_id (String | null): The numbering part ONLY (e.g., "1", "1.1", "Chương I"). If there is no numbering, set to null.

3. title (String): The FULL section title, INCLUDING its numbering prefix, but EXCLUDING trailing dots and page numbers.
   - Example Input: "Chương I: Giới thiệu tổng quan đề tài ......... 5"
   - Correct Title: "Chương I: Giới thiệu tổng quan đề tài" (Notice: the trailing dots and page number are removed, but "Chương I:" is KEPT).
   - Example Input: "1. Thực trạng ..... 6"
   - Correct Title: "1. Thực trạng"

4. page (Integer | null): The extracted page number, or null if none.

--------------------------------
OUTPUT FORMAT
--------------------------------
Return ONLY a valid JSON object:

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
    }
  ]
}

--------------------------------
CRITICAL RULES
--------------------------------
- Output MUST be valid JSON. No markdown formatting outside the JSON.
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