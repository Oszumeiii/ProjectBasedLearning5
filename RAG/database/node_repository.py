from database.supabase_client import supabase


# =========================
# INSERT NODE
# =========================
def insert_node(node_data):
    response = supabase.table("nodes").insert(node_data).execute()
    return response.data


# =========================
# INSERT TREE (RECURSIVE)
# =========================
def insert_tree(root, document_id, parent_id=None, order=0):
    """
    Lưu toàn bộ tree vào DB (recursive)
    """

    node_data = {
        "document_id": document_id,
        "title": root.title,
        "summary": root.summary,
        "content": "\n".join(root.content).strip(),
        "level": root.level,
        "parent_id": parent_id,
        "node_order": order
    }

    result = insert_node(node_data)
    node_id = result[0]["id"]

    # Insert children
    for i, child in enumerate(root.children):
        insert_tree(child, document_id, parent_id=node_id, order=i)


# =========================
# GET NODES BY DOCUMENT
# =========================
def get_nodes_by_document(document_id):
    response = supabase.table("nodes") \
        .select("*") \
        .eq("document_id", document_id) \
        .order("node_order") \
        .execute()

    return response.data


# =========================
# DELETE NODES BY DOCUMENT
# =========================
def delete_nodes_by_document(document_id):
    supabase.table("nodes") \
        .delete() \
        .eq("document_id", document_id) \
        .execute()