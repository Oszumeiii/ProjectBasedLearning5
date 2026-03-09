-- ============================================
-- Migration: Thêm author_id vào bảng reports
-- ============================================
-- Khi sinh viên tạo báo cáo, hệ thống tự gắn author_id = user đang đăng nhập
-- Giúp hiển thị tên tác giả và kiểm soát quyền sở hữu

ALTER TABLE reports
ADD COLUMN IF NOT EXISTS author_id BIGINT REFERENCES users(id);

-- Tạo index cho tìm kiếm nhanh theo author
CREATE INDEX IF NOT EXISTS idx_reports_author_id ON reports(author_id);

-- (Tuỳ chọn) Backfill author_id cho reports cũ dựa trên projects.student_id
-- UPDATE reports r
-- SET author_id = p.student_id
-- FROM projects p
-- WHERE r.project_id = p.id AND r.author_id IS NULL;
