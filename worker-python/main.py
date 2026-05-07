import json
import time
import os
import tempfile
import redis
from dotenv import load_dotenv
from minio import Minio
from src.pipeline.pipeline import run_pipeline
from src.database.pg_client import update_report_status

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
QUEUE_NAME = "pdf_processing_queue"

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost")
MINIO_PORT = int(os.getenv("MINIO_PORT", 9000))
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "edurag-reports")

minio_client = Minio(
    f"{MINIO_ENDPOINT}:{MINIO_PORT}",
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False
)

try:
    r = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        decode_responses=True,
        socket_timeout=None
    )
    r.ping()
    print(f"📡 Đã kết nối Redis tại {REDIS_HOST}:{REDIS_PORT}")
except Exception as e:
    print(f"❌ Không thể kết nối Redis: {e}")
    exit(1)


def download_from_minio(file_key):
    """Download file từ MinIO vào thư mục tạm, trả về đường dẫn file tạm."""
    suffix = os.path.splitext(file_key)[1] or ".pdf"
    fd, tmp_path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    try:
        minio_client.fget_object(MINIO_BUCKET, file_key, tmp_path)
        return tmp_path
    except Exception as e:
        os.unlink(tmp_path)
        raise e


def process_job(job_data):
    """Xử lý một job từ queue."""
    report_id = job_data.get("report_id")
    file_key = job_data.get("file_key")
    file_type = job_data.get("file_type")
    post_id = job_data.get("post_id")  # Chỉ có khi job đến từ class_posts

    if not report_id or not file_key:
        print("⚠️ Job data thiếu report_id hoặc file_key")
        return

    print(f"\n--- 🛠 Đang xử lý Report ID: {report_id} ---")
    print(f"📂 File key: {file_key} (type: {file_type})")

    update_report_status(report_id, "processing", None)

    tmp_path = None
    try:
        tmp_path = download_from_minio(file_key)
        print(f"📥 Đã download file từ MinIO → {tmp_path}")

        flat_chunks = run_pipeline(tmp_path, report_id=report_id, post_id=post_id)

        if flat_chunks is not None:
            update_report_status(report_id, "completed", None)
            print(f"✅ Hoàn tất! Đã xử lý {len(flat_chunks)} chunks cho report #{report_id}")
        else:
            update_report_status(report_id, "failed", "Pipeline returned None")
            print(f"❌ Pipeline trả về None cho report #{report_id}")

    except Exception as e:
        error_msg = str(e)[:500]
        update_report_status(report_id, "failed", error_msg)
        print(f"🚨 Lỗi khi xử lý report #{report_id}: {e}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


def main():
    """Vòng lặp Worker chính."""
    print(f"🤖 Python Worker đang nghe hàng đợi: '{QUEUE_NAME}'...")

    while True:
        try:
            result = r.brpop(QUEUE_NAME, timeout=0)

            if result:
                _, message = result
                job_data = json.loads(message)

                start_time = time.time()
                process_job(job_data)
                end_time = time.time()

                print(f"⏱ Thời gian xử lý: {round(end_time - start_time, 2)} giây")

        except redis.ConnectionError:
            print("⚠️ Mất kết nối Redis. Đang thử lại sau 5s...")
            time.sleep(5)
        except KeyboardInterrupt:
            print("\n👋 Worker đang dừng...")
            break
        except Exception as e:
            print(f"🚨 Worker Error: {e}")
            time.sleep(1)


if __name__ == "__main__":
    main()
