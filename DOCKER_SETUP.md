# Docker Setup — EduRAG

## Yêu cầu
- Docker Desktop đã cài đặt
- PostgreSQL sử dụng Supabase (external, không trong Docker)

## Kiến trúc

```
┌─────────────┐    ┌──────────────┐    ┌───────────────┐
│  Frontend    │───▶│   Backend    │───▶│  PostgreSQL   │
│  :3000       │    │   :3001      │    │  (Supabase)   │
└─────────────┘    └──────┬───────┘    └───────────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        ┌──────────┐ ┌─────────┐ ┌──────────────┐
        │  Redis   │ │  MinIO  │ │ llm_service  │
        │  :6379   │ │  :9000  │ │   :5000      │
        └──────────┘ └─────────┘ └──────┬───────┘
                          ▲             │
                          │             ▼
                    ┌─────────────┐  Supabase
                    │   Worker    │  (nodes/vectors)
                    │  (Python)   │
                    └─────────────┘
```

## 1. Chạy môi trường dev

```bash
docker compose up --build
```

Services:

| Service | URL | Mô tả |
|---------|-----|-------|
| Frontend | http://localhost:3000 | React dev server |
| Backend API | http://localhost:3001/api | Express API |
| LLM Service | http://localhost:5000 | FastAPI (AI/RAG) |
| MinIO API | http://localhost:9000 | Object storage |
| MinIO Console | http://localhost:9001 | MinIO web UI |
| Redis | localhost:6379 | Cache & queue |

Bucket `edurag-reports` được **tự động tạo** khi khởi động.

### Đổi port nếu bị trùng

```bash
FRONTEND_PORT=3300 BACKEND_PORT=3301 LLM_PORT=5100 docker compose up --build
```

## 2. Chạy production

```bash
docker compose -f docker-compose.prod.yml --profile prod up --build
```

Production sẽ:
- Build frontend tĩnh với nginx
- Build backend từ TypeScript đã compile
- llm_service không mount volume code (dùng image)

## 3. Biến môi trường

Mỗi service đọc `.env` riêng:

| Service | File .env |
|---------|-----------|
| Backend | `BE/.env` |
| Worker Python | `worker-python/.env` |
| LLM Service | `llm_service/.env` |

Docker Compose tự override các biến nội bộ (Redis host, MinIO host, LLM_SERVICE_URL) để các container giao tiếp qua Docker network.

### Biến quan trọng (override bởi compose)

| Biến | Giá trị trong Docker | Mô tả |
|------|---------------------|-------|
| `REDIS_URL` | `redis://redis:6379` | Backend → Redis |
| `MINIO_ENDPOINT` | `minio` | Backend/Worker → MinIO |
| `LLM_SERVICE_URL` | `http://llm-service:5000` | Backend → LLM |
| `RAG_SERVICE_URL` | `http://llm-service:5000` | Backend → RAG |

## 4. Lưu ý

- **LLM Service** lần đầu chạy sẽ tải model (~2-5GB), có thể mất vài phút. Model được cache trong Docker volume `llm_model_cache`.
- **PostgreSQL** không nằm trong Docker — dùng Supabase external theo `BE/.env`.
- **File .env** đã được gitignore. Tạo từ `.env.example` nếu cần.

## 5. Dừng / xóa

```bash
# Dừng
docker compose down

# Dừng và xóa volume (mất data MinIO + Redis)
docker compose down -v
```
