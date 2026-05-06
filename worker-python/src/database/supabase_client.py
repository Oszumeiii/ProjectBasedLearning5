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



# có thể viết clean hơn t mới viết đơn giản để upload , có thể tạo repository riêng để quản lý database và các thao tác liên quan đến database hoặc abstract thành class SupabaseClient để dễ quản lý hơn
def upload_to_supabase(flat_chunks, post_id_value=24):
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
        return response
    except Exception as e:
        print(f"Lỗi khi insert vào Supabase: {e}")
        return None