-- ============================================
-- Initial Schema for TempoMap
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. Create Shows Table
-- ============================================
CREATE TABLE IF NOT EXISTS shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('pdf_upload', 'dropbox', 'manual')),
  source_filename TEXT,
  pdf_url TEXT,
  musicxml_url TEXT,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('pending', 'processing', 'ready', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on shows
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;

-- Shows RLS Policies
CREATE POLICY "Users can view their own shows"
ON shows FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own shows"
ON shows FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own shows"
ON shows FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own shows"
ON shows FOR DELETE
USING (user_id = auth.uid());

-- Index for faster user queries
CREATE INDEX IF NOT EXISTS idx_shows_user_id ON shows(user_id);

-- ============================================
-- 2. Create Parts Table
-- ============================================
CREATE TABLE IF NOT EXISTS parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tempo INTEGER NOT NULL,
  beats INTEGER NOT NULL DEFAULT 4,
  measure_start INTEGER,
  measure_end INTEGER,
  rehearsal_mark TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on parts
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- Parts RLS Policies
CREATE POLICY "Users can view parts from their shows"
ON parts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM shows
    WHERE shows.id = parts.show_id
    AND shows.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create parts for their shows"
ON parts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shows
    WHERE shows.id = parts.show_id
    AND shows.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update parts from their shows"
ON parts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM shows
    WHERE shows.id = parts.show_id
    AND shows.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shows
    WHERE shows.id = parts.show_id
    AND shows.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete parts from their shows"
ON parts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM shows
    WHERE shows.id = parts.show_id
    AND shows.user_id = auth.uid()
  )
);

-- Index for faster show queries
CREATE INDEX IF NOT EXISTS idx_parts_show_id ON parts(show_id);

-- ============================================
-- 3. Create Storage Bucket for PDFs
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Users can upload PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pdfs'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view their own PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'pdfs'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own PDFs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pdfs'
  AND auth.uid() IS NOT NULL
);

-- ============================================
-- 4. Updated_at Trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shows_updated_at
  BEFORE UPDATE ON shows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
