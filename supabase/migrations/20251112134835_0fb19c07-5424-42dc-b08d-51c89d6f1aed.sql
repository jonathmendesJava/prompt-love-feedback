
-- Remove a constraint antiga
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_question_type_check;

-- Adiciona a constraint atualizada com todos os tipos de perguntas
ALTER TABLE questions ADD CONSTRAINT questions_question_type_check 
CHECK (question_type IN (
  'text',
  'nps',
  'csat',
  'ces',
  'stars',
  'emojis',
  'hearts',
  'multiple_choice',
  'single_choice',
  'like_dislike',
  'matrix',
  'likert'
));
