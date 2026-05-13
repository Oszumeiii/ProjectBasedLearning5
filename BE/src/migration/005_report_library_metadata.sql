-- 005: Add library metadata columns to reports for advanced search
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS tags          TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS abstract      TEXT,
  ADD COLUMN IF NOT EXISTS report_type   TEXT    CHECK (report_type IN ('project','thesis','research','internship')),
  ADD COLUMN IF NOT EXISTS academic_year TEXT,
  ADD COLUMN IF NOT EXISTS semester      TEXT;

CREATE INDEX IF NOT EXISTS idx_reports_tags ON reports USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_academic_year ON reports(academic_year);
CREATE INDEX IF NOT EXISTS idx_reports_abstract_fts ON reports
  USING gin(to_tsvector('simple', coalesce(abstract, '')));
