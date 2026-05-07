import os
from supabase import create_client, Client
from dotenv import load_dotenv

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

    def get_nodes_by_post(self, post_id: int):
        """Fetch toàn bộ cấu trúc báo cáo (dùng cho hiển thị mục lục/nội dung)"""
        try:
            return self.client.table(self.table_name)\
                .select("*")\
                .eq("post_id", post_id)\
                .order("node_order")\
                .execute()
        except Exception as e:
            print(f"❌ Error fetching nodes: {e}")
            return None

    def query_report(self, post_id: int, user_query: str, llm_client=None):
        """
        Truy vấn báo cáo bằng cách sử dụng LLM để xác định node liên quan nhất.
        
        Args:
            post_id: ID của báo cáo
            user_query: Câu hỏi của sinh viên
            llm_client: Client LLM (nếu không truyền sẽ dùng Gemini)
        
        Returns:
            Dict chứa thông tin node liên quan nhất và câu trả lời
        """
        # 1. Lấy tất cả nodes của báo cáo
        nodes_response = self.get_nodes_by_post(post_id)
        if not nodes_response or not nodes_response.data:
            return {"error": "Không tìm thấy báo cáo hoặc nodes"}
        
        nodes = nodes_response.data
        
        # 2. Chuẩn bị thông tin nodes (không bao gồm content)
        nodes_info = []
        for node in nodes:
            node_info = {
                "id": node["id"],
                "title": node["title"],
                "summary": node["summary"],
                "path": node["path"],
                "level": node["level"]
            }
            nodes_info.append(node_info)
        
        # 3. Tạo prompt cho LLM
        prompt = self._create_query_prompt(user_query, nodes_info)
        
        # 4. Gọi LLM để xác định node liên quan nhất
        if llm_client is None:
            # Sử dụng Gemini mặc định
            from utils.client_llm import client as gemini_client
            response = gemini_client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=prompt
            )
            llm_response = response.text.strip()
        else:
            # Sử dụng LLM client được truyền vào
            llm_response = llm_client.generate(prompt)
        
        # 5. Parse response để lấy node_id
        selected_node_id = self._parse_llm_response(llm_response)
        
        # 6. Lấy thông tin node được chọn (bao gồm content)
        selected_node = None
        for node in nodes:
            if node["id"] == selected_node_id:
                selected_node = node
                break
        
        if not selected_node:
            return {"error": "Không tìm thấy node được chọn"}
        
        return {
            "selected_node": {
                "id": selected_node["id"],
                "title": selected_node["title"],
                "summary": selected_node["summary"],
                "content": selected_node["content"],
                "path": selected_node["path"],
                "level": selected_node["level"]
            },
            "llm_reasoning": llm_response,
            "user_query": user_query
        }

    def _create_query_prompt(self, user_query: str, nodes_info: list) -> str:
        """Tạo prompt để LLM chọn node liên quan nhất"""
        nodes_text = "\n".join([
            f"Node {i+1}:\n"
            f"  ID: {node['id']}\n"
            f"  Tiêu đề: {node['title']}\n"
            f"  Tóm tắt: {node['summary']}\n"
            f"  Đường dẫn: {node['path']}\n"
            f"  Cấp độ: {node['level']}\n"
            for i, node in enumerate(nodes_info)
        ])
        
        prompt = f"""
Bạn là trợ lý AI chuyên về phân tích và trả lời câu hỏi từ báo cáo học thuật.

Nhiệm vụ: Dựa vào câu hỏi của sinh viên và danh sách các phần trong báo cáo, hãy xác định PHẦN NÀO LIÊN QUAN NHẤT để trả lời câu hỏi.

Câu hỏi của sinh viên: "{user_query}"

Danh sách các phần trong báo cáo:
{nodes_text}

Yêu cầu:
1. Phân tích câu hỏi và xác định chủ đề chính
2. So sánh với tóm tắt của từng phần
3. Chọn phần có liên quan nhất (chỉ trả về ID của node đó)
4. Nếu không có phần nào liên quan, trả về "NO_RELEVANT_NODE"

Định dạng trả về: Chỉ trả về ID của node được chọn, không giải thích thêm.
Ví dụ: node_12345678-1234-1234-1234-123456789012
"""
        return prompt

    def _parse_llm_response(self, response: str) -> str:
        """Parse response từ LLM để lấy node ID"""
        response = response.strip()
        
        # Loại bỏ markdown code blocks nếu có
        if response.startswith("```"):
            response = response.strip("```").strip()
        
        # Tìm UUID pattern
        import re
        uuid_pattern = r'[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}'
        match = re.search(uuid_pattern, response)
        
        if match:
            return match.group(0)
        
        # Nếu không tìm thấy UUID, trả về response gốc
        return response
    