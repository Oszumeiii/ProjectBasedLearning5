import os
from supabase import create_client
from dotenv import load_dotenv

# BƯỚC 1: Nạp các biến từ file .env
load_dotenv() 

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Lỗi: SUPABASE_URL hoặc SUPABASE_KEY không tìm thấy trong file .env")

supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)



def upload_to_supabase(flat_chunks, report_id=None):
    """Upload chunks vào Supabase table 'nodes'. report_id dùng làm post_id."""
    post_id_value = report_id if report_id is not None else 0
    data_to_insert = []
    for idx, chunk in enumerate(flat_chunks):
        data_to_insert.append({
            "post_id": post_id_value,
            "title": chunk.get("title"),
            "summary": chunk.get("summary"),
            "content": chunk.get("content"),
            "path": chunk.get("path"),
            "level": chunk.get("level"),
            "node_order": idx,
        })

    try:
        response = supabase_client.table("nodes").insert(data_to_insert).execute()
        print(f"✅ Đã upload {len(data_to_insert)} chunks vào Supabase (report_id={post_id_value})")
        return response
    except Exception as e:
        print(f"❌ Lỗi khi insert vào Supabase: {e}")
        return None