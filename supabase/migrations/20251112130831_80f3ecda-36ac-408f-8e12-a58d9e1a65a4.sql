-- Add client branding fields to projects table
ALTER TABLE projects 
ADD COLUMN client_brand_name TEXT,
ADD COLUMN client_logo_url TEXT;