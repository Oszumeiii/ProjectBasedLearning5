from app.core.model import LLMModel

llm = LLMModel()


def summarize_text(content: str, max_new_tokens=200):
    messages = [
        {
            "role": "system",
            "content": (
                "Bạn là AI chuyên tóm tắt tài liệu học thuật "
                "và báo cáo kỹ thuật."
            )
        },
        {
            "role": "user",
            "content": f"""
Hãy tóm tắt nội dung sau ngắn gọn nhưng đầy đủ ý chính:

{content}
"""
        }
    ]

    return llm.generate(
        messages=messages,
        max_new_tokens=max_new_tokens,
        temperature=0.3
    )
    
    
    
    
    
    

def summarize_section_for_indexing(content: str, max_new_tokens=300): 
    messages = [ 
        { 
            "role": "system", 
            "content": ( 
                "Bạn là chuyên gia trích xuất dữ liệu tài liệu. "
                "Nhiệm vụ của bạn là tạo bản tóm tắt đặc trưng cho từng phần của văn bản "
                "để hỗ trợ việc tìm kiếm và lựa chọn section phù hợp nhất." 
            ) 
        }, 
        { 
            "role": "user", 
            "content": f""" 
Hãy phân tích section sau và tóm tắt theo định dạng:
- CHỦ ĐỀ: <Chủ đề chính của đoạn>
- TỪ KHÓA: <Các thuật ngữ quan trọng nhất, cách nhau bằng dấu phẩy>
- MỤC ĐÍCH: <Đoạn này dùng để làm gì? Ví dụ: Giới thiệu, Giải thuật, Kết quả thực nghiệm...>
- TÓM TẮT: <Nội dung cốt lõi trong 2-3 câu>

Nội dung:
{content} 
""" 
        } 
    ] 

    return llm.generate( 
        messages=messages, 
        max_new_tokens=max_new_tokens, 
        temperature=0.1 
    )