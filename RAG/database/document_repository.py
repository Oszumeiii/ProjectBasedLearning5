from database.supabase_client import supabase


# =========================
# CREATE DOCUMENT (class_posts)
# =========================
def create_document(course_id, author_id, content):
    data = {
        "course_id": course_id,
        "author_id": author_id,
        "content": content
    }

    response = supabase.table("class_posts").insert(data).execute()
    return response.data[0]["id"]


# =========================
# GET DOCUMENT
# =========================
def get_document(doc_id):
    response = supabase.table("class_posts") \
        .select("*") \
        .eq("id", doc_id) \
        .single() \
        .execute()

    return response.data