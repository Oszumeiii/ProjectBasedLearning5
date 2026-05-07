import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = int(os.getenv("PG_PORT", 5432))
PG_DATABASE = os.getenv("PG_DATABASE", "")
PG_USER = os.getenv("PG_USER", "")
PG_PASSWORD = os.getenv("PG_PASSWORD", "")


def get_pg_connection():
    return psycopg2.connect(
        host=PG_HOST,
        port=PG_PORT,
        database=PG_DATABASE,
        user=PG_USER,
        password=PG_PASSWORD,
    )


def update_report_status(report_id, status, error_message=None):
    """
    Cập nhật embedding_status của report trong PostgreSQL chính.
    status: 'processing' | 'completed' | 'failed'
    """
    try:
        conn = get_pg_connection()
        cur = conn.cursor()

        if status == "processing":
            cur.execute(
                "UPDATE reports SET embedding_status = 'processing' WHERE id = %s",
                (report_id,),
            )
        elif status == "completed":
            cur.execute(
                """UPDATE reports 
                   SET embedding_status = 'done', 
                       status = CASE WHEN status = 'pending' THEN 'under_review' ELSE status END
                   WHERE id = %s""",
                (report_id,),
            )
        elif status == "failed":
            cur.execute(
                """UPDATE reports 
                   SET embedding_status = 'failed', 
                       embedding_error = %s 
                   WHERE id = %s""",
                (error_message, report_id),
            )

        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Lỗi khi update report status trong PostgreSQL: {e}")


def save_report_references(report_id, references):
    """
    Lưu danh sách tài liệu tham khảo vào table report_references.
    Xóa references cũ trước khi insert mới (hỗ trợ resubmit).
    """
    try:
        conn = get_pg_connection()
        cur = conn.cursor()

        cur.execute("DELETE FROM report_references WHERE report_id = %s", (report_id,))

        for idx, ref in enumerate(references):
            cur.execute(
                """INSERT INTO report_references 
                   (report_id, title, authors, year, source, url, ref_order)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (
                    report_id,
                    ref.get("title"),
                    ref.get("authors"),
                    ref.get("year"),
                    ref.get("source"),
                    ref.get("url"),
                    idx,
                ),
            )

        conn.commit()
        cur.close()
        conn.close()
        print(f"✅ Đã lưu {len(references)} references cho report #{report_id}")
    except Exception as e:
        print(f"❌ Lỗi khi lưu references vào PostgreSQL: {e}")
