BEGIN;

CREATE TABLE IF NOT EXISTS assignments (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignment_type TEXT NOT NULL DEFAULT 'report'
        CHECK (assignment_type IN ('report', 'exercise', 'project', 'quiz')),
    deadline TIMESTAMPTZ NOT NULL,
    max_score NUMERIC(5,2) NOT NULL DEFAULT 10.00,
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
    allow_late_submission BOOLEAN NOT NULL DEFAULT FALSE,
    late_penalty_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT assignments_max_score_check CHECK (max_score > 0 AND max_score <= 100),
    CONSTRAINT assignments_late_penalty_check CHECK (late_penalty_percent >= 0 AND late_penalty_percent <= 100)
);

CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_deadline ON assignments(deadline);
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments(created_by);
CREATE INDEX IF NOT EXISTS idx_assignments_active_course_id ON assignments(course_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_id BIGINT REFERENCES reports(id) ON DELETE SET NULL,
    submission_text TEXT,
    status TEXT NOT NULL DEFAULT 'not_submitted'
        CHECK (status IN ('not_submitted', 'submitted', 'late', 'graded', 'returned')),
    submitted_at TIMESTAMPTZ,
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    score NUMERIC(5,2),
    feedback TEXT,
    graded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    graded_at TIMESTAMPTZ,
    submission_count SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT assignment_submissions_score_check CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
    UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON assignment_submissions(status);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_report_id ON assignment_submissions(report_id);

CREATE TABLE IF NOT EXISTS class_posts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_class_posts_course_id ON class_posts(course_id);
CREATE INDEX IF NOT EXISTS idx_class_posts_author_id ON class_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_class_posts_pinned ON class_posts(course_id, is_pinned) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS class_post_comments (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    post_id BIGINT NOT NULL REFERENCES class_posts(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_class_post_comments_post_id ON class_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_class_post_comments_author_id ON class_post_comments(author_id);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_assignments_updated_at') THEN
        PERFORM fn_create_updated_at_trigger('assignments');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_assignment_submissions_updated_at') THEN
        PERFORM fn_create_updated_at_trigger('assignment_submissions');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_class_posts_updated_at') THEN
        PERFORM fn_create_updated_at_trigger('class_posts');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_class_post_comments_updated_at') THEN
        PERFORM fn_create_updated_at_trigger('class_post_comments');
    END IF;
END $$;

COMMIT;
