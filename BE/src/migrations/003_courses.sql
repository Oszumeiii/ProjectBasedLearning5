-- ============================================
-- Migration: Hệ thống Lớp Học Phần (Courses)
-- ============================================

-- Bảng Courses (lớp học phần)
CREATE TABLE IF NOT EXISTS courses (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,                -- VD: "Đồ án tốt nghiệp - Nhóm 1"
  code TEXT UNIQUE NOT NULL,         -- VD: "DA2024-01"
  description TEXT,
  semester TEXT,                     -- VD: "HK1-2025"
  lecturer_id BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng Enrollments (sinh viên tham gia lớp)
CREATE TABLE IF NOT EXISTS enrollments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id BIGINT NOT NULL REFERENCES users(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (course_id, student_id)
);

-- Thêm course_id vào reports (liên kết report với lớp học phần)
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS course_id BIGINT REFERENCES courses(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_lecturer_id ON courses(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_reports_course_id ON reports(course_id);
