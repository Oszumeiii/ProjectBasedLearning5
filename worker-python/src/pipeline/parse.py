import re
import json
import time
import uuid
import requests

from src.database.supabase_client import SupabaseRepository
supabase_repo = SupabaseRepository()
# Local LLM service configuration
LLM_SERVICE_URL = "http://localhost:5000"
LLM_SERVICE_TIMEOUT = 30


class Node:
    def __init__(self, title, level):
        self.id = str(uuid.uuid4())
        self.title = title
        self.level = level
        self.content = []
        self.summary = "" 
        self.children = []
        self.parent = None
        self.path = ""
        self.embedding = None

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "level": self.level,
            "content": "\n".join(self.content).strip(),
            "summary": self.summary,
            "path": self.path,
            "children": [child.to_dict() for child in self.children],
            "embedding": self.embedding
        }


# =========================
# PARSE MARKDOWN → TREE
# =========================
def parse_markdown(md_text: str) -> Node:
    lines = md_text.split("\n")

    root = Node("ROOT", 0)
    stack = [root]

    for line in lines:
        line = line.rstrip()
        header_match = re.match(r'^\s*(#+)\s+(.*)', line)

        if header_match:
            hashes, title = header_match.groups()
            level = len(hashes)

            new_node = Node(title.strip(), level)

            while stack and stack[-1].level >= level:
                stack.pop()

            parent = stack[-1]
            new_node.parent = parent
            parent.children.append(new_node)

            stack.append(new_node)

        else:
            if stack:
                stack[-1].content.append(line)

    return root


# =========================
# BUILD PATH (A > B > C)
# =========================
def build_path(node, current_path=""):
    if node.title != "ROOT":
        node.path = f"{current_path} > {node.title}" if current_path else node.title
    else:
        node.path = ""

    for child in node.children:
        build_path(child, node.path)


# =========================
# SUMMARY GENERATION
# =========================

def _truncate_text(text, max_chars=3000):
    if len(text) <= max_chars:
        return text
    truncated = text[:max_chars]
    if "\n" in truncated:
        truncated = truncated[: truncated.rfind("\n")]
    return truncated + "\n[...]"


def generate_summary_prompt(node):
    content = "\n".join(node.content).strip()
    if not content:
        return None

    prompt = (
        "Bạn là một trợ lý AI chuyên tóm tắt tài liệu kỹ thuật và báo cáo học thuật. "
        "Hãy đọc kỹ nội dung dưới đây và viết một đoạn tóm tắt ngắn gọn, chính xác.\n\n"
        f"Tiêu đề: {node.title}\n"
        f"Đường dẫn mục: {node.path}\n"
        "Nội dung: \n"
        f"{_truncate_text(content, max_chars=3000)}\n\n"
        "Yêu cầu:\n"
        "- Tóm tắt các ý chính của nội dung.\n"
        "- Giữ câu ngắn gọn, dễ hiểu.\n"
        "- Nếu nội dung là tiếng Việt, trả lời bằng tiếng Việt.\n"
        "- Không thêm ý kiến cá nhân.\n"
        "- Không tóm tắt các phần trống hoặc chỉ ghi tiêu đề.\n"
    )
    return prompt




# Topic:
# Keywords:
# Questions:
def summarize_node(node):
    content = node.content
    if not content:
        return ""

    prompt = f"""
Bạn là AI tạo semantic summary cho hệ thống RAG.

Mục tiêu:
- tối ưu semantic retrieval
- giữ technical keywords
- giúp query match đúng section

Yêu cầu:
- <= 100 words
- ngắn gọn
- giữ thuật ngữ kỹ thuật
- mô tả section này trả lời gì

Content:
{content}
"""

    response = requests.post(
        f"{LLM_SERVICE_URL}/summary",
        json={
            "content": prompt,  # Gửi thẳng prompt vào trường content
            "max_new_tokens": 150 # Tăng nhẹ để đủ format Topic/Keywords
        },
        timeout=60
    )
    
    response.raise_for_status()
    data = response.json()
    return data.get("summary", "")



def summarize_document(content):
    if not content:
        return ""

    prompt = f"""Bạn là AI tạo global summary cho hệ thống RAG.
Mục tiêu:
- Tạo global summary giúp người dùng hiểu nhanh nội dung chính của toàn bộ tài liệu.
- Tóm tắt ngắn gọn, dễ hiểu, không quá 200 words.
Yêu cầu:
- Tập trung vào các điểm chính, kết luận, và insights quan trọng.
- Không đi vào chi tiết nhỏ, chỉ nêu ra ý chính.
Content:
{content}
"""
    response = requests.post(
        f"{LLM_SERVICE_URL}/summary",
        json={
            "content": prompt,
            "max_new_tokens": 512
        },
        timeout=LLM_SERVICE_TIMEOUT
    )
    response.raise_for_status()
    data = response.json()
    return data.get("summary", "")




from concurrent.futures import ThreadPoolExecutor, as_completed
import time


def process_node(node):
    try:
        node.summary = summarize_node(node)

        embedding = supabase_repo.get_embedding_vector(node.summary)

        node.embedding = embedding

        print(
            f"✅ {node.path} | embedding dim = {len(embedding)}"
        )

    except Exception as exc:
        node.summary = ""
        node.embedding = None

        print(
            f"[WARN] Failed {node.path}: {exc}"
        )

    return node


def generate_summaries_and_embedding_for_tree(
    root,
    summary_level=5,
    max_workers=4,
    max_nodes=None,
):
    candidates = []

    def collect(n):
        if 0 < n.level <= summary_level:
            content = "\n".join(n.content).strip()

            if content:
                candidates.append(n)

        for c in n.children:
            collect(c)

    collect(root)

    print(f"Total nodes to summarize: {len(candidates)}")

    candidates = sorted(
        candidates,
        key=lambda n: (n.level, n.path)
    )

    if max_nodes:
        candidates = candidates[:max_nodes]

    # =========================
    # PARALLEL EXECUTION
    # =========================

    with ThreadPoolExecutor(max_workers=max_workers) as executor:

        futures = [
            executor.submit(process_node, node)
            for node in candidates
        ]

        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"[THREAD ERROR] {e}")
        
        high_level_summaries = []

        for node in candidates:
            if node.level <= 2 and hasattr(node, "summary"):
                high_level_summaries.append(node.summary)

        combined = "\n".join(high_level_summaries)

        if combined.strip():

            global_summary = summarize_document(combined)
            print(f"\n📄 GLOBAL SUMMARY:\n{global_summary}\n")

            # root.global_embedding = embedding_model.encode(
            #     root.global_summary
            # )

    return root , global_summary    
            
            
# =========================
# FLATTEN TREE → LIST (để embed)
# =========================
def flatten_tree(node):
    result = []

    def dfs(n):
        if n.level > 0:
            result.append({
                "id": n.id,
                "title": n.title,
                "content": "\n".join(n.content).strip(),
                "summary": n.summary,
                "path": n.path,
                "level": n.level,
                "embedding": n.embedding
            })
        for c in n.children:
            dfs(c)

    dfs(node)
    return result


# =========================
# SAVE / LOAD
# =========================
def save_json(data, output_path):
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_markdown(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


# =========================
# DEBUG PRINT TREE
# =========================
def print_tree(node, indent=0):
    print("  " * indent + f"- {node.title} ({node.level})")
    for child in node.children:
        print_tree(child, indent + 1)


