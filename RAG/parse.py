import re
import json
import uuid


class Node:
    def __init__(self, title, level):
        self.id = str(uuid.uuid4())
        self.title = title
        self.level = level
        self.content = []
        self.summary = ""  # placeholder for future summary field
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


