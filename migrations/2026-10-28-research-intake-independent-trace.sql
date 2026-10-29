-- Migration for existing installations of the research_intake table.
-- Review the target database and take a verified backup before applying.
-- This changes only the independent_trace column; it does not inspect or alter data.
ALTER TABLE research_intake
  MODIFY COLUMN independent_trace TEXT NULL;
