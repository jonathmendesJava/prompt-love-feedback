-- Add response_data column to responses table for complex responses (matrix, multiple choice)
ALTER TABLE responses ADD COLUMN IF NOT EXISTS response_data JSONB;

-- Add scale_config column to questions table for type-specific configurations
ALTER TABLE questions ADD COLUMN IF NOT EXISTS scale_config JSONB;