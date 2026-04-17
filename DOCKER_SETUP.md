# Docker setup

## Yêu cầu
- Cài Docker Desktop
- Backend vẫn dùng Supabase/PostgreSQL như `.env` hiện tại

## 1. Chạy môi trường local dev
Từ thư mục gốc dự án:

```bash
docker compose up --build
```

Mặc định file compose hiện publish:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3301/api`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

Nếu máy bạn đã có backend/frontend local đang chiếm cổng `3001` hoặc `3000`, có thể đổi cổng publish khi chạy Docker:

```bash
FRONTEND_PORT=3300 BACKEND_PORT=3301 MINIO_API_PORT=9100 MINIO_CONSOLE_PORT=9101 docker compose up --build
```

Service sau khi chạy:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- MinIO API: http://localhost:9000
- MinIO Console: http://localhost:9001

Thông tin đăng nhập MinIO mặc định:
- user: `minioadmin`
- password: `minioadmin`

## 2. Chạy production-like
```bash
docker compose -f docker-compose.prod.yml --profile prod up --build
```

Nếu cần tránh trùng cổng với local app:

```bash
FRONTEND_PORT=4300 BACKEND_PORT=4301 MINIO_API_PORT=9200 MINIO_CONSOLE_PORT=9201 docker compose -f docker-compose.prod.yml --profile prod up --build
```

Production-like sẽ:
- build frontend tĩnh bằng nginx
- build backend từ bản TypeScript đã compile
- vẫn dùng MinIO riêng trong Docker

## 3. Biến môi trường quan trọng
Backend đang đọc `.env` trong `BE/.env`.
Khi chạy Docker, compose sẽ tự override các biến MinIO sau:
- `MINIO_ENDPOINT=minio`
- `MINIO_PORT=9000`
- `MINIO_USE_SSL=false`
- `MINIO_PUBLIC_URL=http://localhost:9000` (để link tải trả về dùng host có thể truy cập từ trình duyệt)

Bạn nên giữ:
- `CLIENT_URL=http://localhost:3000`
- các biến DB Supabase đúng theo môi trường của bạn

## 4. Kiểm tra upload/download
Sau khi stack chạy:
1. đăng nhập hệ thống
2. nộp file bài tập hoặc upload report
3. kiểm tra bucket `edurag-reports` trong MinIO Console
4. thử tải file từ thư viện hoặc màn hình chấm bài

## 5. Dừng môi trường
```bash
docker compose down
```

Xóa luôn volume MinIO:
```bash
docker compose down -v
```
