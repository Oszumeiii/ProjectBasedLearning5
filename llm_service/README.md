# LLM Service - LiquidAI/LFM2.5-1.2B-Instruct

Dịch vụ LLM đơn giản được xây dựng trên mô hình LiquidAI/LFM2.5-1.2B-Instruct.

## Cài đặt

### 1. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### 2. Cấu hình môi trường
Sao chép `.env.example` thành `.env` và chỉnh sửa các tham số:

```bash
cp .env.example .env
```

```bash
# .env
MAX_NEW_TOKENS=256
TEMPERATURE=0.7
DEVICE=cuda  # hoặc cpu
```

## Sử dụng

### 1. Sử dụng trực tiếp trong Python

```python
from llm_service import LLMModel

# Khởi tạo model
llm = LLMModel()

# Chat đơn giản
response = llm.chat("Xin chào, bạn là ai?")
print(response)

# Với lịch sử hội thoại
messages = [
    {"role": "user", "content": "Xin chào"},
    {"role": "assistant", "content": "Xin chào! Tôi có thể giúp gì cho bạn?"},
    {"role": "user", "content": "Bạn có thể làm gì?"}
]
response = llm.generate(messages)
print(response)
```

### 2. Sử dụng API Flask

```bash
# Cách 1: Chạy từ root folder (khuyến nghị)
python run_llm_server.py

# Cách 2: Chạy như module
python -m llm_service.server
```

#### Endpoints:

- **GET /health** - Kiểm tra trạng thái
  ```bash
  curl http://localhost:5000/health
  ```

- **POST /generate** - Tạo phản hồi từ messages
  ```bash
  curl -X POST http://localhost:5000/generate \
    -H "Content-Type: application/json" \
    -d '{
      "messages": [{"role": "user", "content": "Xin chào"}],
      "max_new_tokens": 100
    }'
  ```

- **POST /chat** - Chat đơn giản
  ```bash
  curl -X POST http://localhost:5000/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "Xin chào"}'
  ```

- **GET /config** - Xem cấu hình hiện tại
  ```bash
  curl http://localhost:5000/config
  ```

## Cấu trúc

- `__init__.py` - Package initializer
- `config.py` - Cấu hình
- `tokenizer.py` - Tokenizer loader
- `model.py` - Model loader và interface
- `utils.py` - Hàm tiện ích
- `server.py` - Flask API server
- `requirements.txt` - Dependencies

## Tham số cấu hình

| Tham số | Mô tả | Mặc định |
|---------|-------|---------|
| `MAX_NEW_TOKENS` | Số token tối đa được tạo | 256 |
| `TEMPERATURE` | Độ ngẫu nhiên của phản hồi | 0.7 |
| `TOP_P` | Nucleus sampling parameter | 0.9 |
| `TOP_K` | Top-K sampling parameter | 50 |
| `DEVICE` | Thiết bị (cuda/cpu) | cuda |
| `USE_HALF_PRECISION` | Sử dụng float16 | true |

## Ghi chú

- Model `LiquidAI/LFM2.5-1.2B-Instruct` sẽ tự động download từ Hugging Face lần đầu tiên
- Đảm bảo có đủ GPU memory (hoặc CPU memory nếu dùng CPU)
- Để tăng tốc độ, bạn có thể sử dụng quantization (LOAD_IN_8BIT=true)
