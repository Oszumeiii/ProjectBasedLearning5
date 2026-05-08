import requests

response = requests.post(
    "http://localhost:5000/answer",
    json={
        "message": "Cách huấn luyện mô hình CNN được nhắc trong báo cáo này như thế nào?",
        "post_id": "24"
    }
)

print(response.json())