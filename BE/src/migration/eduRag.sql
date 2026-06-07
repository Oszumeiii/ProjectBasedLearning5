-- ================================================================
-- EduRAG — Migration V1 FINAL (Production Ready)
-- PostgreSQL 15+ | pgvector required
-- Author  : EduRAG Backend Team
-- Version : 1.0.0
-- Date    : 2025
--
-- Chạy lần đầu:
--   psql -U postgres -d edurag -f migration_v1_final.sql
--
-- Rollback:
--   psql -U postgres -d edurag -f rollback_v1.sql
-- ================================================================

BEGIN;

-- ================================================================
-- 0. EXTENSIONS
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- UUID generation
CREATE EXTENSION IF NOT EXISTS "vector";       -- pgvector cho RAG
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- trigram index cho full-text search
CREATE EXTENSION IF NOT EXISTS "unaccent";     -- bỏ dấu tiếng Việt khi search


-- ================================================================
-- 0.1 HELPER FUNCTION — updated_at trigger
-- ================================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 0.2 HELPER MACRO — tự tạo trigger updated_at cho 1 bảng
-- ================================================================
CREATE OR REPLACE FUNCTION fn_create_updated_at_trigger(tbl TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format(
        'CREATE TRIGGER trg_%s_updated_at
         BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at()',
        tbl, tbl
    );
END;
$$ LANGUAGE plpgsql;


-- ================================================================
-- 1. USERS  (bảng trung tâm — thay thế hoàn toàn bảng students)
-- ================================================================
CREATE TABLE IF NOT EXISTS users (
    id                        BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    -- Đăng nhập
    email                     TEXT        UNIQUE NOT NULL,
    password_hash             TEXT,                          -- NULL khi chưa kích hoạt

    -- Thông tin cá nhân
    full_name                 TEXT        NOT NULL,
    phone                     TEXT,
    avatar_url                TEXT,
    date_of_birth             DATE,
    gender                    TEXT        CHECK (gender IN ('male','female','other')),

    -- Vai trò & phân quyền
    role                      TEXT        NOT NULL DEFAULT 'student'
                              CHECK (role IN ('student','lecturer','manager','admin')),

    -- Thông tin học vụ (chỉ dùng khi role = student)
    student_code              TEXT        UNIQUE,            -- MSSV
    class_name                TEXT,                          -- VD: CNTT2021A
    intake_year               SMALLINT,                      -- năm nhập học: 2021
    expected_graduation_year  SMALLINT,                      -- năm tốt nghiệp dự kiến

    -- Thông tin học thuật (dùng cho cả student & lecturer)
    major                     TEXT,                          -- chuyên ngành
    department                TEXT,                          -- khoa

    -- Thông tin giảng viên (chỉ dùng khi role = lecturer/manager)
    academic_title            TEXT,                          -- GS, PGS, TS, ThS
    specialization            TEXT,                          -- lĩnh vực chuyên môn

    -- Trạng thái tài khoản
    is_active                 BOOLEAN     NOT NULL DEFAULT FALSE,  -- FALSE cho đến khi kích hoạt
    is_verified               BOOLEAN     NOT NULL DEFAULT FALSE,
    account_status            TEXT        NOT NULL DEFAULT 'pending_activation'
                              CHECK (account_status IN (
                                  'pending_activation',     -- mới import, chưa kích hoạt
                                  'active',                 -- đang hoạt động
                                  'locked',                 -- bị khóa (sai mật khẩu nhiều lần)
                                  'suspended',              -- bị đình chỉ
                                  'graduated'               -- đã tốt nghiệp (SV)
                              )),

    -- Token kích hoạt lần đầu (import → gửi email)
    activation_token          TEXT        UNIQUE,
    activation_expires_at     TIMESTAMPTZ,

    -- Token đặt lại mật khẩu
    password_reset_token      TEXT        UNIQUE,
    password_reset_expires_at TIMESTAMPTZ,

    -- Bảo mật đăng nhập
    failed_login_count        SMALLINT    NOT NULL DEFAULT 0,
    locked_until              TIMESTAMPTZ,                   -- tự mở khóa sau thời gian này
    last_login_at             TIMESTAMPTZ,
    last_login_ip             INET,

    -- Import metadata
    imported_batch_id         BIGINT,                        -- FK sau khi tạo bảng import_batches
    source                    TEXT        NOT NULL DEFAULT 'import'
                              CHECK (source IN ('import','manual','sso')),

    -- Audit
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                TIMESTAMPTZ                    -- soft delete
);

-- Indexes
CREATE INDEX idx_users_role           ON users(role);
CREATE INDEX idx_users_department     ON users(department);
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_users_student_code   ON users(student_code)   WHERE student_code IS NOT NULL;
CREATE INDEX idx_users_class_name     ON users(class_name)     WHERE class_name   IS NOT NULL;
CREATE INDEX idx_users_active         ON users(id)             WHERE deleted_at   IS NULL AND is_active = TRUE;
CREATE INDEX idx_users_activation     ON users(activation_token) WHERE activation_token IS NOT NULL;
CREATE INDEX idx_users_reset_token    ON users(password_reset_token) WHERE password_reset_token IS NOT NULL;
-- Full-text search tên sinh viên (có hỗ trợ không dấu)
CREATE INDEX idx_users_fullname_trgm  ON users USING gin(full_name gin_trgm_ops);

SELECT fn_create_updated_at_trigger('users');


-- ================================================================
-- 2. USER IMPORT BATCHES  (lịch sử import từng đợt)
-- ================================================================
CREATE TABLE IF NOT EXISTS user_import_batches (
    id            BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    imported_by   BIGINT      NOT NULL REFERENCES users(id),
    file_name     TEXT        NOT NULL,
    file_url      TEXT,                                      -- lưu file gốc để audit
    batch_type    TEXT        NOT NULL DEFAULT 'student'
                  CHECK (batch_type IN ('student','lecturer')),
    semester      TEXT,                                      -- HK import gắn với kỳ nào
    total_rows    INT         NOT NULL DEFAULT 0,
    success_rows  INT         NOT NULL DEFAULT 0,
    failed_rows   INT         NOT NULL DEFAULT 0,
    skipped_rows  INT         NOT NULL DEFAULT 0,            -- trùng MSSV, bỏ qua
    error_detail  JSONB       NOT NULL DEFAULT '[]',         -- [{row,student_code,reason}]
    status        TEXT        NOT NULL DEFAULT 'processing'
                  CHECK (status IN ('processing','completed','failed')),
    imported_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_import_batches_imported_by ON user_import_batches(imported_by);
CREATE INDEX idx_import_batches_status      ON user_import_batches(status);

-- Bổ sung FK từ users → import_batches
ALTER TABLE users
    ADD CONSTRAINT fk_users_import_batch
    FOREIGN KEY (imported_batch_id) REFERENCES user_import_batches(id)
    ON DELETE SET NULL;


-- ================================================================
-- 3. REFRESH TOKENS  (JWT refresh token rotation)
-- ================================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id            BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id       BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash    TEXT        UNIQUE NOT NULL,               -- lưu hash, không lưu plain
    device_info   TEXT,                                      -- browser/app info
    ip_address    INET,
    is_revoked    BOOLEAN     NOT NULL DEFAULT FALSE,
    expires_at    TIMESTAMPTZ NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at    TIMESTAMPTZ
);

CREATE INDEX idx_refresh_tokens_user_id   ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash      ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_active    ON refresh_tokens(user_id, is_revoked)
    WHERE is_revoked = FALSE;


-- ================================================================
-- 4. COURSES  (lớp học phần / đợt làm đồ án / đợt khóa luận)
-- ================================================================
CREATE TABLE IF NOT EXISTS courses (
    id            BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    code          TEXT        UNIQUE NOT NULL,               -- VD: DA2024-CNTT-01
    name          TEXT        NOT NULL,
    description   TEXT,
    semester      TEXT        NOT NULL,                      -- HK1-2025
    academic_year TEXT        NOT NULL,                      -- 2024-2025

    -- Phân loại — quyết định ai được tạo
    course_type   TEXT        NOT NULL DEFAULT 'project'
                  CHECK (course_type IN (
                      'project',     -- đồ án môn học     → lecturer tạo được
                      'thesis',      -- khóa luận TN      → chỉ manager tạo
                      'research',    -- NCKH               → lecturer hoặc manager
                      'internship'   -- thực tập tốt nghiệp
                  )),

    lecturer_id   BIGINT      NOT NULL REFERENCES users(id), -- GV phụ trách chính
    max_students  SMALLINT    NOT NULL DEFAULT 30,
    is_active     BOOLEAN     NOT NULL DEFAULT TRUE,

    -- Thời hạn nộp báo cáo
    submission_start  DATE,
    submission_end    DATE,
    defense_date      DATE,                                  -- ngày bảo vệ

    -- Audit
    created_by    BIGINT      NOT NULL REFERENCES users(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ
);

CREATE INDEX idx_courses_lecturer_id  ON courses(lecturer_id);
CREATE INDEX idx_courses_semester     ON courses(semester);
CREATE INDEX idx_courses_course_type  ON courses(course_type);
CREATE INDEX idx_courses_active       ON courses(id) WHERE deleted_at IS NULL AND is_active = TRUE;

SELECT fn_create_updated_at_trigger('courses');


-- ================================================================
-- 5. COURSE LECTURERS  (nhiều GV cùng tham gia 1 lớp)
-- ================================================================
CREATE TABLE IF NOT EXISTS course_lecturers (
    id          BIGINT  PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    course_id   BIGINT  NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lecturer_id BIGINT  NOT NULL REFERENCES users(id),
    role_in_course TEXT NOT NULL DEFAULT 'supervisor'
                CHECK (role_in_course IN (
                    'supervisor',   -- GV hướng dẫn
                    'reviewer',     -- GV phản biện
                    'committee'     -- thành viên hội đồng
                )),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (course_id, lecturer_id, role_in_course)
);

CREATE INDEX idx_course_lecturers_course_id   ON course_lecturers(course_id);
CREATE INDEX idx_course_lecturers_lecturer_id ON course_lecturers(lecturer_id);


-- ================================================================
-- 6. ENROLLMENTS  (sinh viên tham gia lớp)
-- ================================================================
CREATE TABLE IF NOT EXISTS enrollments (
    id          BIGINT  PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    course_id   BIGINT  NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id  BIGINT  NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    status      TEXT    NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','dropped','completed','failed')),
    final_grade TEXT,                                        -- A+, A, B+, B, C+, C, D, F
    final_score NUMERIC(4,2) CHECK (final_score BETWEEN 0 AND 10),
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE (course_id, student_id)
);

CREATE INDEX idx_enrollments_course_id  ON enrollments(course_id);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_status     ON enrollments(status);


-- ================================================================
-- 7. PROJECTS  (đồ án của sinh viên)
-- ================================================================
CREATE TABLE IF NOT EXISTS projects (
    id          BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title       TEXT        NOT NULL,
    description TEXT,
    student_id  BIGINT      NOT NULL REFERENCES users(id),
    course_id   BIGINT      REFERENCES courses(id),
    supervisor_id BIGINT    REFERENCES users(id),            -- GV hướng dẫn chính
    start_date  DATE        NOT NULL,
    end_date    DATE,
    status      TEXT        NOT NULL DEFAULT 'pending'
                CHECK (status IN (
                    'pending',       -- chờ duyệt đề tài
                    'approved',      -- đề tài được duyệt
                    'in_progress',   -- đang thực hiện
                    'submitted',     -- đã nộp báo cáo
                    'defending',     -- đang bảo vệ
                    'completed',     -- hoàn thành
                    'cancelled'      -- hủy
                )),
    tags        TEXT[],                                      -- từ khóa đề tài
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_projects_student_id    ON projects(student_id);
CREATE INDEX idx_projects_course_id     ON projects(course_id);
CREATE INDEX idx_projects_supervisor_id ON projects(supervisor_id);
CREATE INDEX idx_projects_status        ON projects(status);
CREATE INDEX idx_projects_tags          ON projects USING gin(tags);

SELECT fn_create_updated_at_trigger('projects');


-- ================================================================
-- 8. RESEARCH PAPERS  (NCKH của sinh viên)
-- ================================================================
CREATE TABLE IF NOT EXISTS research_papers (
    id               BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title            TEXT        NOT NULL,
    abstract         TEXT,
    keywords         TEXT[],
    student_id       BIGINT      NOT NULL REFERENCES users(id),
    supervisor_id    BIGINT      REFERENCES users(id),       -- GV hướng dẫn NCKH
    course_id        BIGINT      REFERENCES courses(id),
    publication_date DATE,
    journal_name     TEXT,
    conference_name  TEXT,
    doi              TEXT        UNIQUE,
    issn             TEXT,
    index_type       TEXT        CHECK (index_type IN ('ISI','Scopus','other',NULL)),
    status           TEXT        NOT NULL DEFAULT 'draft'
                     CHECK (status IN (
                         'draft',
                         'submitted',
                         'under_review',
                         'revision',      -- cần chỉnh sửa
                         'accepted',
                         'published',
                         'rejected'
                     )),
    file_url         TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMPTZ
);

CREATE INDEX idx_research_papers_student_id    ON research_papers(student_id);
CREATE INDEX idx_research_papers_supervisor_id ON research_papers(supervisor_id);
CREATE INDEX idx_research_papers_status        ON research_papers(status);
CREATE INDEX idx_research_papers_index_type    ON research_papers(index_type);
CREATE INDEX idx_research_papers_keywords      ON research_papers USING gin(keywords);

SELECT fn_create_updated_at_trigger('research_papers');


-- ================================================================
-- 9. REPORTS  (báo cáo nộp vào hệ thống)
-- ================================================================
CREATE TABLE IF NOT EXISTS reports (
    id               BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title            TEXT        NOT NULL,
    description      TEXT,
    content          TEXT,                                   -- text đã extract từ file

    -- File gốc
    file_url         TEXT,                                   -- S3/MinIO path
    file_name        TEXT,                                   -- tên file gốc
    file_size        BIGINT,                                 -- bytes
    file_type        TEXT        CHECK (file_type IN ('pdf','docx','zip','other')),
    file_hash        TEXT,                                   -- SHA256 để detect duplicate

    -- Liên kết
    author_id        BIGINT      NOT NULL REFERENCES users(id),
    project_id       BIGINT      REFERENCES projects(id),
    course_id        BIGINT      REFERENCES courses(id),
    research_paper_id BIGINT     REFERENCES research_papers(id),

    -- Trạng thái duyệt
    status           TEXT        NOT NULL DEFAULT 'pending'
                     CHECK (status IN (
                         'pending',          -- vừa nộp
                         'processing',       -- đang xử lý file (extract + embed)
                         'under_review',     -- GV đang xem
                         'revision_needed',  -- yêu cầu chỉnh sửa
                         'approved',         -- đã duyệt
                         'rejected'          -- từ chối
                     )),

    -- Trạng thái RAG embedding pipeline
    embedding_status TEXT        NOT NULL DEFAULT 'pending'
                     CHECK (embedding_status IN ('pending','processing','done','failed')),
    embedding_error  TEXT,                                   -- lý do nếu failed
    embedded_at      TIMESTAMPTZ,

    -- Phê duyệt
    reviewed_by      BIGINT      REFERENCES users(id),
    review_note      TEXT,
    submitted_at     TIMESTAMPTZ,
    approved_at      TIMESTAMPTZ,
    rejected_at      TIMESTAMPTZ,

    -- Thống kê
    view_count       BIGINT      NOT NULL DEFAULT 0,
    download_count   BIGINT      NOT NULL DEFAULT 0,
    visibility       TEXT        NOT NULL DEFAULT 'course'
                     CHECK (visibility IN ('private','course','department','public')),

    -- Audit
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMPTZ
);

CREATE INDEX idx_reports_author_id        ON reports(author_id);
CREATE INDEX idx_reports_course_id        ON reports(course_id);
CREATE INDEX idx_reports_project_id       ON reports(project_id);
CREATE INDEX idx_reports_status           ON reports(status);
CREATE INDEX idx_reports_embedding_status ON reports(embedding_status)
    WHERE embedding_status != 'done';
CREATE INDEX idx_reports_visibility       ON reports(visibility);
CREATE INDEX idx_reports_created_at       ON reports(created_at DESC);
CREATE INDEX idx_reports_file_hash        ON reports(file_hash) WHERE file_hash IS NOT NULL;
-- Full-text search tiêu đề báo cáo
CREATE INDEX idx_reports_title_trgm       ON reports USING gin(title gin_trgm_ops);
-- Full-text search nội dung (chỉ áp dụng khi content được extract)
CREATE INDEX idx_reports_content_fts      ON reports
    USING gin(to_tsvector('simple', coalesce(content, '')));

SELECT fn_create_updated_at_trigger('reports');


-- ================================================================
-- 10. REPORT VERSIONS  (version control từng lần nộp lại)
-- ================================================================
CREATE TABLE IF NOT EXISTS report_versions (
    id             BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    report_id      BIGINT      NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    version_number SMALLINT    NOT NULL,                     -- 1, 2, 3...
    content        TEXT,
    file_url       TEXT,
    file_size      BIGINT,
    file_hash      TEXT,
    change_summary TEXT,                                     -- "Sửa chương 3, bổ sung tài liệu"
    created_by     BIGINT      NOT NULL REFERENCES users(id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (report_id, version_number)
);

CREATE INDEX idx_report_versions_report_id ON report_versions(report_id);


-- ================================================================
-- 11. REPORT CHUNKS  (RAG — vector embeddings từng đoạn)
-- ================================================================
CREATE TABLE IF NOT EXISTS report_chunks (
    id           BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    report_id    BIGINT      NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    chunk_index  INT         NOT NULL,                       -- thứ tự trong báo cáo
    chunk_text   TEXT        NOT NULL,
    embedding    VECTOR(384),                                -- PhoBERT: 384 | BGE: 768
    token_count  SMALLINT,                                   -- số token (quản lý context)
    char_count   INT,

    -- Metadata vị trí trong tài liệu
    page_number  SMALLINT,
    section      TEXT,                                       -- 'abstract','introduction','chapter_2'
    section_title TEXT,                                      -- tiêu đề section cụ thể

    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (report_id, chunk_index)
);

CREATE INDEX idx_chunks_report_id ON report_chunks(report_id);

-- HNSW index cho cosine similarity — chuẩn cho RAG retrieval
-- m=16 ef_construction=64: cân bằng tốt giữa tốc độ build và độ chính xác
CREATE INDEX idx_chunks_embedding_hnsw ON report_chunks
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);


-- ================================================================
-- 12. PLAGIARISM CHECKS  (kiểm tra đạo văn)
-- ================================================================
CREATE TABLE IF NOT EXISTS plagiarism_checks (
    id              BIGINT          PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    report_id       BIGINT          NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    checked_by      BIGINT          REFERENCES users(id),   -- NULL = auto / system
    plagiarism_rate NUMERIC(5, 2)   NOT NULL
                    CHECK (plagiarism_rate BETWEEN 0 AND 100),

    -- Kết quả chi tiết
    similar_reports JSONB           NOT NULL DEFAULT '[]',
    -- Format: [{"report_id":12,"title":"...","author":"...","similarity":78.5,"matched_sections":["chương 2"]}]

    matched_chunks  JSONB           NOT NULL DEFAULT '[]',
    -- Format: [{"chunk_id":55,"similar_chunk_id":88,"score":0.95}]

    method          TEXT            NOT NULL DEFAULT 'vector'
                    CHECK (method IN ('vector','fingerprint','manual')),

    -- Kết luận
    verdict         TEXT            NOT NULL DEFAULT 'clean'
                    CHECK (verdict IN (
                        'clean',       -- < 20%
                        'warning',     -- 20–40%
                        'flagged',     -- 40–70%
                        'rejected'     -- > 70%
                    )),
    note            TEXT,
    checked_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plagiarism_report_id ON plagiarism_checks(report_id);
CREATE INDEX idx_plagiarism_verdict   ON plagiarism_checks(verdict);


-- ================================================================
-- 13. FEEDBACK  (GV → SV: nhận xét báo cáo)
-- ================================================================
CREATE TABLE IF NOT EXISTS feedback (
    id            BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    report_id     BIGINT      NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    reviewer_id   BIGINT      NOT NULL REFERENCES users(id),
    feedback_text TEXT        NOT NULL,
    score         NUMERIC(4, 2)
                  CHECK (score IS NULL OR score BETWEEN 0 AND 10),
    criteria_scores JSONB     DEFAULT '{}',
    -- Format: {"novelty":8.5,"methodology":7.0,"presentation":9.0}
    is_private    BOOLEAN     NOT NULL DEFAULT FALSE,        -- TRUE = chỉ GV thấy
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_report_id   ON feedback(report_id);
CREATE INDEX idx_feedback_reviewer_id ON feedback(reviewer_id);

SELECT fn_create_updated_at_trigger('feedback');


-- ================================================================
-- 14. PEER REVIEWS  (SV → SV: phản biện chéo)
-- ================================================================
CREATE TABLE IF NOT EXISTS peer_reviews (
    id           BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    report_id    BIGINT      NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    reviewer_id  BIGINT      NOT NULL REFERENCES users(id),
    review_text  TEXT        NOT NULL,
    rating       SMALLINT    CHECK (rating BETWEEN 1 AND 5),
    is_anonymous BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (report_id, reviewer_id)                          -- 1 SV chỉ review 1 lần
);

CREATE INDEX idx_peer_reviews_report_id   ON peer_reviews(report_id);
CREATE INDEX idx_peer_reviews_reviewer_id ON peer_reviews(reviewer_id);


-- ================================================================
-- 15. REPORT DEFICIENCIES  (thiếu sót được ghi nhận)
-- ================================================================
CREATE TABLE IF NOT EXISTS report_deficiencies (
    id            BIGINT      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    report_id     BIGINT      NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    identified_by BIGINT      NOT NULL REFERENCES users(id),
    deficiency    TEXT        NOT NULL,
    severity      TEXT        NOT NULL DEFAULT 'minor'
                  CHECK (severity IN ('minor','major','critical')),
    category      TEXT        CHECK (category IN (
                      'content',       -- nội dung thiếu/sai
                      'format',        -- định dạng không đúng
                      'citation',      -- trích dẫn sai
                      'methodology',   -- phương pháp nghiên cứu
                      'result',        -- kết quả chưa rõ
                      'other'
                  )),
    is_resolved   BOOLEAN     NOT NULL DEFAULT FALSE,
    resolved_at   TIMESTAMPTZ,
    resolved_by   BIGINT      REFERENCES users(id),
    identified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deficiencies_report_id ON report_deficiencies(report_id);
CREATE INDEX idx_deficiencies_resolved  ON report_deficiencies(is_resolved)
    WHERE is_resolved = FALSE;


-- ================================================================
-- 16. MENTORSHIPS  (GV hướng dẫn ↔ SV)
-- ================================================================
CREATE TABLE IF NOT EXISTS mentorships (
    id          BIGINT  PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    student_id  BIGINT  NOT NULL REFERENCES users(id),
    mentor_id   BIGINT  NOT NULL REFERENCES users(id),
    project_id  BIGINT  REFERENCES projects(id),
    course_id   BIGINT  REFERENCES courses(id),
    start_date  DATE    NOT NULL,
    end_date    DATE,
    status      TEXT    NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','completed','terminated')),
    note        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, mentor_id, project_id)
);

CREATE INDEX idx_mentorships_student_id ON mentorships(student_id);
CREATE INDEX idx_mentorships_mentor_id  ON mentorships(mentor_id);
CREATE INDEX idx_mentorships_project_id ON mentorships(project_id);


-- ================================================================
-- 17. PROGRESS TRACKING  (milestone của project)
-- ================================================================
CREATE TABLE IF NOT EXISTS progress_tracking (
    id           BIGINT  PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    project_id   BIGINT  NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone    TEXT    NOT NULL,
    description  TEXT,
    order_index  SMALLINT NOT NULL DEFAULT 0,               -- thứ tự hiển thị
    status       TEXT    NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','in_progress','completed','overdue','skipped')),
    due_date     DATE,
    completed_at TIMESTAMPTZ,
    completed_by BIGINT  REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_progress_project_id ON progress_tracking(project_id);
CREATE INDEX idx_progress_status     ON progress_tracking(status);
CREATE INDEX idx_progress_due_date   ON progress_tracking(due_date)
    WHERE status != 'completed';

SELECT fn_create_updated_at_trigger('progress_tracking');


-- ================================================================
-- 18. FAVORITES  (đánh dấu báo cáo yêu thích)
-- ================================================================
CREATE TABLE IF NOT EXISTS favorites (
    id         BIGINT  PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id    BIGINT  NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    report_id  BIGINT  NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, report_id)
);

CREATE INDEX idx_favorites_user_id   ON favorites(user_id);
CREATE INDEX idx_favorites_report_id ON favorites(report_id);


-- ================================================================
-- 19. REPORT RATINGS  (đánh giá báo cáo 1–5 sao)
-- ================================================================
CREATE TABLE IF NOT EXISTS report_ratings (
    id         BIGINT  PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id    BIGINT  NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    report_id  BIGINT  NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, report_id)
);

CREATE INDEX idx_ratings_report_id ON report_ratings(report_id);
CREATE INDEX idx_ratings_user_id   ON report_ratings(user_id);

SELECT fn_create_updated_at_trigger('report_ratings');


-- ================================================================
-- 20. RAG QUERY LOGS  (lịch sử truy vấn AI)
-- ================================================================
CREATE TABLE IF NOT EXISTS rag_query_logs (
    id               BIGINT  PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id          BIGINT  NOT NULL REFERENCES users(id),
    session_id       TEXT,                                   -- nhóm các query cùng phiên
    query_text       TEXT    NOT NULL,
    query_embedding  VECTOR(384),

    -- Kết quả trả về
    result_summary   TEXT,
    source_chunks    JSONB   NOT NULL DEFAULT '[]',
    -- Format: [{"chunk_id":1,"report_id":5,"report_title":"...","score":0.92,"excerpt":"..."}]
    total_sources    SMALLINT NOT NULL DEFAULT 0,

    -- Hiệu năng
    latency_ms       INT,
    retrieval_ms     INT,                                    -- thời gian tìm vector
    generation_ms    INT,                                    -- thời gian LLM generate

    -- Phản hồi chất lượng
    feedback         TEXT    CHECK (feedback IN ('helpful','not_helpful','partial', NULL)),
    feedback_note    TEXT,

    -- Filter người dùng áp dụng
    filters          JSONB   DEFAULT '{}',
    -- Format: {"course_id":3,"year":2024,"status":"approved"}

    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rag_logs_user_id    ON rag_query_logs(user_id);
CREATE INDEX idx_rag_logs_session_id ON rag_query_logs(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_rag_logs_created_at ON rag_query_logs(created_at DESC);
CREATE INDEX idx_rag_logs_feedback   ON rag_query_logs(feedback)   WHERE feedback IS NOT NULL;


-- ================================================================
-- 21. NOTIFICATIONS  (thông báo trong hệ thống)
-- ================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id         BIGINT  PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id    BIGINT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       TEXT    NOT NULL,
    -- VD: 'report.approved','report.rejected','feedback.received',
    --     'plagiarism.flagged','deadline.reminder','account.activated'
    title      TEXT    NOT NULL,
    message    TEXT    NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    read_at    TIMESTAMPTZ,

    -- Liên kết đối tượng
    ref_type   TEXT    CHECK (ref_type IN ('report','project','course','feedback','user', NULL)),
    ref_id     BIGINT,

    -- Kênh gửi
    channels   TEXT[]  NOT NULL DEFAULT ARRAY['in_app'],
    -- VD: ARRAY['in_app','email'] — đã gửi qua kênh nào
    sent_at    TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread  ON notifications(user_id)
    WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type    ON notifications(type);


-- ================================================================
-- 22. RESOURCES LIBRARY  (tài liệu hướng dẫn hệ thống)
-- ================================================================
CREATE TABLE IF NOT EXISTS resources (
    id          BIGINT  PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title       TEXT    NOT NULL,
    description TEXT,
    url         TEXT    NOT NULL,
    category    TEXT    NOT NULL DEFAULT 'other'
                CHECK (category IN ('guide','template','rubric','sample_report','reference','other')),
    course_type TEXT    CHECK (course_type IN ('project','thesis','research','all', NULL)),
    uploaded_by BIGINT  REFERENCES users(id),
    is_public   BOOLEAN NOT NULL DEFAULT TRUE,
    download_count BIGINT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resources_category ON resources(category);


-- ================================================================
-- 23. EVALUATION CRITERIA  (tiêu chí chấm điểm từng loại lớp)
-- ================================================================
CREATE TABLE IF NOT EXISTS evaluation_criteria (
    id           BIGINT  PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    course_id    BIGINT  NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name         TEXT    NOT NULL,                           -- VD: "Tính mới và sáng tạo"
    description  TEXT,
    weight       NUMERIC(4, 2) NOT NULL
                 CHECK (weight > 0 AND weight <= 100),      -- trọng số %
    max_score    NUMERIC(4, 2) NOT NULL DEFAULT 10,
    order_index  SMALLINT NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eval_criteria_course_id ON evaluation_criteria(course_id);


-- ================================================================
-- 24. AUDIT LOGS  (ghi lại mọi thao tác quan trọng)
-- ================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id           BIGINT  PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id      BIGINT  REFERENCES users(id) ON DELETE SET NULL,
    action       TEXT    NOT NULL,
    -- Format: 'resource.operation' VD: 'report.approve','user.lock','course.create'
    target_type  TEXT    NOT NULL,
    target_id    BIGINT  NOT NULL,
    old_values   JSONB,                                      -- trạng thái trước
    new_values   JSONB,                                      -- trạng thái sau
    ip_address   INET,
    user_agent   TEXT,
    request_id   UUID    DEFAULT uuid_generate_v4(),         -- trace ID
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id    ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_target     ON audit_logs(target_type, target_id);
CREATE INDEX idx_audit_logs_action     ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);


-- ================================================================
-- 25. SYSTEM CONFIGS  (cấu hình hệ thống linh hoạt)
-- ================================================================
CREATE TABLE IF NOT EXISTS system_configs (
    key         TEXT  PRIMARY KEY,
    value       JSONB NOT NULL,
    description TEXT,
    updated_by  BIGINT REFERENCES users(id),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cấu hình mặc định
INSERT INTO system_configs (key, value, description) VALUES
    ('plagiarism.threshold.warning',  '20',   'Ngưỡng % cảnh báo đạo văn'),
    ('plagiarism.threshold.flagged',  '40',   'Ngưỡng % gắn cờ đạo văn'),
    ('plagiarism.threshold.rejected', '70',   'Ngưỡng % tự động từ chối'),
    ('rag.embedding_model',    '"phobert-base"',   'Model embedding đang dùng'),
    ('rag.chunk_size',         '512',              'Token mỗi chunk'),
    ('rag.chunk_overlap',      '50',               'Token overlap giữa các chunk'),
    ('rag.top_k',              '5',                'Số chunk lấy khi truy vấn'),
    ('upload.max_file_size_mb','50',               'Giới hạn upload MB'),
    ('upload.allowed_types',   '["pdf","docx","zip"]', 'Loại file được phép'),
    ('auth.access_token_expire_minutes',  '30',   'Thời hạn access token (phút)'),
    ('auth.refresh_token_expire_days',    '30',   'Thời hạn refresh token (ngày)'),
    ('auth.max_failed_login',             '5',    'Số lần sai mật khẩu trước khi khóa'),
    ('auth.lock_duration_minutes',        '30',   'Thời gian tự mở khóa tài khoản')
ON CONFLICT (key) DO NOTHING;


-- ================================================================
-- 26. SEED DATA — tài khoản khởi tạo hệ thống
-- ================================================================
-- LƯU Ý: password_hash bên dưới là placeholder
-- Thay bằng bcrypt hash thật trước khi deploy:
--   python -c "import bcrypt; print(bcrypt.hashpw(b'Admin@2025', bcrypt.gensalt(12)).decode())"

INSERT INTO users (
    email, password_hash, full_name, role,
    department, is_active, is_verified, account_status, source
) VALUES
(
    'admin@edurag.vn',
    '$2b$12$REPLACE_WITH_REAL_BCRYPT_HASH_ADMIN',
    'Quản trị viên hệ thống',
    'admin', 'Phòng CNTT',
    TRUE, TRUE, 'active', 'manual'
),
(
    'quanly.khoa@edurag.vn',
    '$2b$12$REPLACE_WITH_REAL_BCRYPT_HASH_MANAGER',
    'TS. Trần Thị Lan',
    'manager', 'Khoa CNTT',
    TRUE, TRUE, 'active', 'manual'
),
(
    'gv.nguyenminhkhoa@edurag.vn',
    '$2b$12$REPLACE_WITH_REAL_BCRYPT_HASH_LECTURER',
    'TS. Nguyễn Minh Khoa',
    'lecturer', 'Khoa CNTT',
    TRUE, TRUE, 'active', 'manual'
)
ON CONFLICT (email) DO NOTHING;


-- ================================================================
-- COMMIT
-- ================================================================
COMMIT;


