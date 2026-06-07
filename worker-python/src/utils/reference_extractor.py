import json
import re
from src.utils.client_llm import client


EXTRACT_REFERENCES_PROMPT = """
Bạn là chuyên gia trích xuất tài liệu tham khảo (references/bibliography) từ báo cáo học thuật.

Nhiệm vụ:
Từ văn bản sau, hãy tìm và trích xuất danh sách TÀI LIỆU THAM KHẢO (References / Bibliography / Tài liệu tham khảo).

Quy tắc:
1. Tìm phần có tiêu đề "TÀI LIỆU THAM KHẢO", "REFERENCES", "BIBLIOGRAPHY", hoặc tương tự.
2. Parse từng entry thành JSON object với các trường:
   - title (String, bắt buộc): Tên tài liệu/bài báo/sách
   - authors (String | null): Tên tác giả (giữ nguyên format gốc)
   - year (Integer | null): Năm xuất bản
   - source (String | null): Tên tạp chí, hội nghị, nhà xuất bản, hoặc nguồn
   - url (String | null): URL/DOI nếu có
3. Nếu KHÔNG tìm thấy phần tài liệu tham khảo, trả về mảng rỗng [].
4. Trả về ĐÚNG JSON array, KHÔNG có markdown code blocks, KHÔNG có text thừa.

Văn bản:
---
{text}
---

Trả về JSON array:
"""


def extract_references(text):
    """
    Trích xuất danh sách tài liệu tham khảo từ text bằng Gemini LLM.
    Trả về list of dicts hoặc [] nếu không tìm thấy.
    """
    if not text or len(text.strip()) < 100:
        return []

    try:
        prompt = EXTRACT_REFERENCES_PROMPT.replace("{text}", text[-15000:])

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        raw_text = response.text.strip()

        raw_text = re.sub(r'^```(?:json)?\s*', '', raw_text)
        raw_text = re.sub(r'\s*```$', '', raw_text)

        references = json.loads(raw_text)

        if not isinstance(references, list):
            print("⚠️ Gemini trả về không phải array, bỏ qua")
            return []

        valid_refs = []
        for ref in references:
            if isinstance(ref, dict) and ref.get("title"):
                valid_refs.append({
                    "title": str(ref.get("title", "")).strip(),
                    "authors": str(ref.get("authors", "")).strip() or None,
                    "year": _parse_year(ref.get("year")),
                    "source": str(ref.get("source", "")).strip() or None,
                    "url": str(ref.get("url", "")).strip() or None,
                })

        print(f"📚 Đã trích xuất {len(valid_refs)} tài liệu tham khảo")
        return valid_refs

    except json.JSONDecodeError as e:
        print(f"⚠️ Không parse được JSON references từ Gemini: {e}")
        return []
    except Exception as e:
        print(f"⚠️ Lỗi khi trích xuất references: {e}")
        return []


def _parse_year(value):
    """Parse year từ nhiều format khác nhau."""
    if value is None:
        return None
    if isinstance(value, int):
        return value if 1900 <= value <= 2100 else None
    try:
        year = int(str(value).strip()[:4])
        return year if 1900 <= year <= 2100 else None
    except (ValueError, TypeError):
        return None
