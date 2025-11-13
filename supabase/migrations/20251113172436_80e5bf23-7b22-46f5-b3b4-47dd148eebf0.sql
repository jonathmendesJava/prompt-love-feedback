-- Adicionar campos de personalização de logo à tabela projects
ALTER TABLE projects 
ADD COLUMN logo_position TEXT DEFAULT 'top' CHECK (logo_position IN ('top', 'left', 'right', 'bottom', 'only')),
ADD COLUMN logo_size TEXT DEFAULT 'medium' CHECK (logo_size IN ('small', 'medium', 'large', 'custom')),
ADD COLUMN logo_custom_height INTEGER DEFAULT 64 CHECK (logo_custom_height >= 24 AND logo_custom_height <= 200);