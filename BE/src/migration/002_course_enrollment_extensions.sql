-- Mở rộng: mã tham gia lớp, enrollment chờ duyệt
-- Chạy sau eduRag.sql

ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_code TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_enrollment_code_unique
  ON courses (enrollment_code) WHERE enrollment_code IS NOT NULL;

ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_status_check;
ALTER TABLE enrollments ADD CONSTRAINT enrollments_status_check
  CHECK (status IN ('pending', 'active', 'dropped', 'completed', 'failed', 'rejected'));

-- đảm bảo 1 sinh viên chỉ có 1 bản ghi ghi danh trong 1 lớp
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_course_student_unique
  ON enrollments (course_id, student_id);
