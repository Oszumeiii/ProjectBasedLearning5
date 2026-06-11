# Chạy local (không Docker)

## FE

```bash
cd FE/client
npm start
```

## BE

```bash
cd BE
npm run dev
```

## llm_service

```bash
cd llm_service
python3 -m app.main
```

## worker-python

```bash
cd worker-python
python3 main.py
```

## Yêu cầu thêm

- **Redis**: `docker run -d -p 6379:6379 --name redis redis:7-alpine`
- **MinIO**: `docker run -d -p 9000:9000 -p 9001:9001 --name minio -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin minio/minio server /data --console-address ":9001"`
- Tạo bucket: mở http://localhost:9001 → tạo bucket `edurag-reports`

# Chạy Docker (tất cả cùng lúc)

```bash
docker compose up --build
```

Xem chi tiết: [DOCKER_SETUP.md](DOCKER_SETUP.md)
