-- 004: Report References (extracted by worker pipeline)
CREATE TABLE IF NOT EXISTS report_references (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    authors TEXT,
    year INTEGER,
    source TEXT,
    url TEXT,
    ref_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_references_report_id ON report_references(report_id);
