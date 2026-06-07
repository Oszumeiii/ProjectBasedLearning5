import requests
import time
import json
from datetime import datetime

API_URL = "http://localhost:5000/answer"

POST_ID = "24"

questions = [
    "Cách huấn luyện mô hình CNN được nhắc trong báo cáo này như thế nào?",
    "Mục tiêu chính của đề tài là gì?",
    "Dataset được sử dụng gồm những gì?",
    "Kiến trúc hệ thống được xây dựng ra sao?",
    "Các bước tiền xử lý dữ liệu gồm những gì?",
    "Mô hình AI nào được sử dụng trong nghiên cứu?",
    "Kết quả thực nghiệm đạt được là gì?",
    "Độ chính xác của mô hình là bao nhiêu?",
    "Hệ thống sử dụng thuật toán nào để phân loại?",
    "Các hạn chế của nghiên cứu là gì?",
    "Hướng phát triển trong tương lai được đề xuất như thế nào?",
    "Kết luận chính của báo cáo là gì?",

    # Thêm 8 câu hỏi mới
    "Phương pháp đánh giá mô hình được thực hiện như thế nào?",
    "Các công nghệ hoặc framework nào được sử dụng trong hệ thống?",
    "Quy trình xử lý dữ liệu đầu vào của hệ thống gồm những bước nào?",
    "Mô hình được triển khai trên nền tảng phần cứng nào?",
    "Các chỉ số đánh giá hiệu năng của hệ thống là gì?",
    "Những khó khăn hoặc thách thức được đề cập trong quá trình triển khai là gì?",
    "Hệ thống có hỗ trợ mở rộng hoặc tối ưu trong tương lai không?",
    "Đóng góp chính của nghiên cứu này so với các phương pháp trước là gì?"
]

results = []

print("🚀 START TESTING")

for index, question in enumerate(questions, start=1):

    print(f"\n📌 Question {index}: {question}")

    start_time = time.time()

    try:
        response = requests.post(
            API_URL,
            json={
                "message": question,
                "post_id": POST_ID
            },
            timeout=120
        )

        end_time = time.time()

        processing_time = round(end_time - start_time, 3)

        response_json = response.json()

        result = {
            "question_index": index,
            "question": question,
            "status_code": response.status_code,
            "processing_time_seconds": processing_time,
            "timestamp": datetime.now().isoformat(),
            "success": True,
            "response": response_json
        }

        print(f"✅ Done in {processing_time} seconds")

    except Exception as e:

        end_time = time.time()

        processing_time = round(end_time - start_time, 3)

        result = {
            "question_index": index,
            "question": question,
            "processing_time_seconds": processing_time,
            "timestamp": datetime.now().isoformat(),
            "success": False,
            "error": str(e)
        }

        print(f"❌ Error: {e}")

    results.append(result)

# Save to JSON file
output = {
    "post_id": POST_ID,
    "total_questions": len(questions),
    "created_at": datetime.now().isoformat(),
    "results": results
}

with open("rag_benchmark_results.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=4)

print("\n💾 Results saved to rag_benchmark_results.json")