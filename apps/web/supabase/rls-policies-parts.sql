-- RLS Policies for Parts Table (Two-Way Sync)
--
-- Run this in Supabase SQL Editor to enable mobile app writes.
-- This allows authenticated users to manage parts for their own shows.

-- Enable RLS on parts table (if not already enabled)
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can read parts from their own shows
CREATE POLICY "Users can view parts from their shows"
ON parts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM shows
    WHERE shows.id = parts.show_id
    AND shows.user_id = auth.uid()
  )
);

-- INSERT: Users can create parts for their own shows
CREATE POLICY "Users can create parts for their shows"
ON parts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shows
    WHERE shows.id = parts.show_id
    AND shows.user_id = auth.uid()
  )
);

-- UPDATE: Users can update parts from their own shows
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

-- DELETE: Users can delete parts from their own shows
CREATE POLICY "Users can delete parts from their shows"
ON parts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM shows
    WHERE shows.id = parts.show_id
    AND shows.user_id = auth.uid()
  )
);
