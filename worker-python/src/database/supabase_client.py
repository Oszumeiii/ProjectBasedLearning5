import os
from supabase import create_client, Client
from dotenv import load_dotenv

from src.database import supabase_client

class SupabaseRepository:
    def __init__(self):
        load_dotenv()
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        if not url or not key:
            raise ValueError("Thiếu cấu hình SUPABASE_URL hoặc SUPABASE_KEY")
            
        self.client: Client = create_client(url, key)
        self.table_name = "nodes"

    def insert_report_nodes(self, flat_chunks, post_id: int):
        """Đẩy dữ liệu chunks từ worker lên database"""
        data = [
            {
                "post_id": post_id,
                "title": chunk.get("title"),
                "summary": chunk.get("summary"),
                "content": chunk.get("content"),
                "path": chunk.get("path"),
                "level": chunk.get("level"),
                "node_order": idx
            }
            for idx, chunk in enumerate(flat_chunks)
        ]
        
        try:
            return self.client.table(self.table_name).insert(data).execute()
        except Exception as e:
            print(f"❌ Error inserting nodes: {e}")
            return None

    def get_nodes_and_summary_node_by_post(self, post_id: int):
        """Fetch toàn bộ cấu trúc báo cáo (dùng cho hiển thị mục lục/nội dung)"""
        try:
            return self.client.table(self.table_name)\
                .select("*")\
                .eq("post_id", post_id)\
                .order("node_order")\
                .execute().data()
                
        except Exception as e:
            print(f"❌ Error fetching nodes: {e}")
            return None

    
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
