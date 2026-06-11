-- Add summary column to reports table for AI-generated summaries
ALTER TABLE reports ADD COLUMN IF NOT EXISTS summary TEXT;
