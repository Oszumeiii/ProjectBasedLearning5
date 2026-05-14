import re
import logging

from app.schemas.schemas import Message


class SearchService:

    def __init__(self, llm_service):
        self.llm_service = llm_service

    def find_relevant_node_id(
        self,
        user_query: str,
        nodes_summary_list: list
    ) -> str:

        if not nodes_summary_list:
            return None

        prompt = self._build_selection_prompt(
            user_query,
            nodes_summary_list
        )
        
        print(f"🔍 Selection prompt:\n{prompt}")
        try:

            llm_response = self.llm_service.generate(
                messages=[
                    Message(
                        role="user",
                        content=prompt
                    )
                ],
                max_new_tokens=64,
                temperature=0.1
            )
            print(f"🔍 LLM raw response: {llm_response}")

            logging.info(f"LLM RESPONSE: {llm_response}")

            selected_id = self._extract_id(llm_response)

            if (
                selected_id == "NO_RELEVANT_NODE"
                or not selected_id
            ):
                return None

            return selected_id

        except Exception as e:
            logging.error(
                f"Lỗi trong SearchService: {str(e)}"
            )
            return None

    def _build_selection_prompt(
        self,
        query: str,
        summary_nodes: list
    ) -> str:
        """
        Tạo prompt cho LLM chọn node phù hợp nhất với kỹ thuật Few-shot.
        """
        nodes_context = ""
        
        print(summary_nodes[0])
        for i, node in enumerate(summary_nodes):
            nodes_context += (
                #f"Node {i+1}:\n"
                f"  ID: {node.get('id')}\n"
                f"  Tiêu đề: {node.get('title')}\n"
                f"  Tóm tắt: {node.get('summary')}\n"
                #f"  Path: {node.get('path')}\n"
                "------------------\n"
            )

        return f"""
    Bạn là AI chuyên gia phân tích cấu trúc báo cáo. 

    ### NHIỆM VỤ:
    Dựa trên DANH SÁCH NODES, hãy chọn ID của node có khả năng chứa thông tin để trả lời CÂU HỎI nhất.

    ### QUY TẮC ĐẦU RA:
    1. Chỉ trả về duy nhất chuỗi ID (ví dụ: 1 hoặc 550e8400-e29b-41d4-a716-446655440000).
    2. Nếu không có node nào liên quan, trả về: NO_RELEVANT_NODE
    3. Tuyệt đối KHÔNG giải thích, KHÔNG thêm văn bản thừa.

    ### VÍ DỤ:
    - Câu hỏi: "Đề tài này có các chức năng là gì?" -> Kết quả: 1
    - Câu hỏi: "Thời tiết hôm nay?" -> Kết quả: NO_RELEVANT_NODE

    ### DANH SÁCH NODES:
    {nodes_context}

    ### CÂU HỎI CỦA NGƯỜI DÙNG:
    "{query}"

    KẾT QUẢ (Chỉ điền ID, không kèm số thứ tự):"""

    import re

    def _extract_id(self, text: str) -> str:
        """
        Trích xuất ID thông minh, xử lý được các trường hợp AI trả về dạng list 
        như '1. 92' hoặc 'Kết quả là: 92'.
        """
        if not text:
            return None

        # 1. Làm sạch văn bản ban đầu
        text = text.strip()
        
        # 2. Kiểm tra NO_RELEVANT_NODE
        if "NO_RELEVANT_NODE" in text.upper():
            return "NO_RELEVANT_NODE"

        # 3. Tìm UUID trước (vì UUID có định dạng rất đặc thù)
        uuid_pattern = r'[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}'
        match_uuid = re.search(uuid_pattern, text, re.IGNORECASE)
        if match_uuid:
            return match_uuid.group(0)

        # 4. Xử lý trường hợp AI trả về dạng số (ví dụ: "1. 92", "Node: 91", "91.")
        # Loại bỏ các tiền tố phổ biến mà AI hay thêm vào
        clean_text = re.sub(r'^(node|kết quả|id|result)[:\s\-]*', '', text, flags=re.IGNORECASE)
        # Loại bỏ số thứ tự ở đầu dòng dạng "1. " hoặc "1/ "
        clean_text = re.sub(r'^\d+[\.\)\/]\s*', '', clean_text)
        
        # Tìm con số ID thực tế còn lại
        match_number = re.search(r'\d+', clean_text)
        if match_number:
            return match_number.group(0)

        return None