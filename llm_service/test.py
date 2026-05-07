import requests

response = requests.post(
    "http://localhost:5000/answer",
    json={
        "message": "Giải pháp được đề xuất là gì?",
        "post_id": "24"
    }
)

print(response.json())