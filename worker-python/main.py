import json
import time
import os
from unittest import result
import redis
from dotenv import load_dotenv
from src.pipeline.pipeline import run_pipeline

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
QUEUE_NAME = "pdf_processing_queue"

try:
    r = redis.Redis(
        host=REDIS_HOST, 
        port=REDIS_PORT, 
        decode_responses=True,
        socket_timeout=None 
    )
    print(f"📡 Đã kết nối Redis tại {REDIS_HOST}:{REDIS_PORT}")
    
except Exception as e:
    print(f"❌ Không thể kết nối Redis: {e}")
    exit(1)

def process_job(job_data):
    """Hàm xử lý logic chính cho mỗi báo cáo PDF"""
    try:
        post_id = job_data.get("post_id")
        pdf_path = job_data.get("pdf_path")

        if not post_id or not pdf_path:
            print("⚠️ Job data thiếu post_id hoặc pdf_path")
            return

        print(f"\n--- 🛠 Đang xử lý Post ID: {post_id} ---")
        print(f"📂 File: {pdf_path}")
        flat_chunks = run_pipeline(pdf_path)

        if flat_chunks is not None:
            print(f"✅ Hoàn tất! Đã đẩy {len(flat_chunks)} nodes lên Supabase.")
        else:
            print(f"❌ Thất bại khi đẩy dữ liệu lên Supabase.")

    except Exception as e:
        print(f"🚨 Lỗi nghiêm trọng trong quá trình xử lý job: {e}")


def main():
    """Vòng lặp Worker chính"""
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