-- Migration for existing installations of the research_intake table.
-- Review the target database and take a verified backup before applying.
-- Apply before deploying code that requires the submission_key column.
-- Existing records remain valid because the new column is nullable.
ALTER TABLE research_intake
  ADD COLUMN submission_key VARCHAR(128) NULL,
  ADD UNIQUE KEY uq_research_intake_submission_key (submission_key);
