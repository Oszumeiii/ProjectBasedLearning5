import re
import json
import time
import uuid
import requests

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

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "level": self.level,
            "content": "\n".join(self.content).strip(),
            "summary": self.summary,
            "path": self.path,
            "children": [child.to_dict() for child in self.children]
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


def summarize_node(node, model="liquid"):
    """Generate summary using local LLM service (Liquid model)."""
    prompt = generate_summary_prompt(node)
    if prompt is None:
        return ""

    try:
        # Call local LLM service
        response = requests.post(
            f"{LLM_SERVICE_URL}/generate",
            json={
                "messages": [
                    {"role": "system", "content": "Bạn là một trợ lý AI chuyên tóm tắt tài liệu kỹ thuật."},
                    {"role": "user", "content": prompt}
                ],
                "max_new_tokens": 500
            },
            timeout=LLM_SERVICE_TIMEOUT
        )
        response.raise_for_status()
        
        data = response.json()
        summary = data.get("response", "").strip()
        
        # Clean up code blocks if present
        if summary.startswith("```"):
            summary = summary.strip("`\n ")
        
        return summary
    except requests.exceptions.ConnectionError:
        print(f"[ERROR] Could not connect to LLM service at {LLM_SERVICE_URL}")
        print("[INFO] Make sure llm_service is running: python3 run_llm_server.py")
        return ""
    except Exception as e:
        print(f"[ERROR] LLM service error: {e}")
        return ""


def generate_summaries_for_tree(
    root,
    summary_level=5,
    max_requests_per_minute=4,
    max_nodes=None,
    model="liquid",
    sleep_between_requests_seconds=15,
):
    """Populate node.summary for tree nodes using a rate-limited LLM summarization."""
    candidates = []

    def collect(n):
        if n.level > 0 and n.level <= summary_level:
            content = "\n".join(n.content).strip()
            if content:
                candidates.append(n)
        for c in n.children:
            collect(c)

    collect(root)
    
    print(f"Total nodes to summarize: {len(candidates)}")
    for n in candidates:
        print(f"- {n.path} (Content length: {len(n.content)})")

    if max_nodes is None:
        max_nodes = len(candidates)

    candidates = sorted(candidates, key=lambda n: (n.level, n.path))[:max_nodes]

    for idx, node in enumerate(candidates):
        try:
            node.summary = summarize_node(node, model=model)
        except Exception as exc:
            node.summary = ""
            print(f"[WARN] Summary generation failed for {node.path}: {exc}")

        if idx < len(candidates) - 1:
            time.sleep(sleep_between_requests_seconds)

    return root


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
                "level": n.level
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


