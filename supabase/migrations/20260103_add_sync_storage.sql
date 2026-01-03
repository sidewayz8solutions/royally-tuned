-- ============================================================
-- Migration: Create Storage Bucket for Sync Files
-- Date: 2026-01-03
-- Description: Sets up Supabase Storage bucket for sync package files
-- ============================================================

-- Create the sync-files bucket (run this in Supabase Dashboard > Storage)
-- Or use the storage API:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sync-files',
  'sync-files',
  false,  -- Private bucket (requires auth)
  104857600,  -- 100MB max file size (for large WAV files)
  ARRAY[
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'audio/mpeg',
    'audio/mp3',
    'application/pdf',
    'image/jpeg',
    'image/png'
  ]
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Storage Policies
-- ============================================================

-- Policy: Users can upload files to their own folder
CREATE POLICY "Users can upload sync files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'sync-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own files
CREATE POLICY "Users can view own sync files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'sync-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update own sync files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'sync-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own sync files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'sync-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================
-- File Organization Structure:
-- sync-files/
--   {user_id}/
--     {track_id}/
--       master.wav
--       instrumental.wav
--       acapella.wav
--       master.mp3
--       splits-sheet.pdf
--       one-stop-auth.pdf
-- ============================================================

-- Helper function to get public URL for a sync file
CREATE OR REPLACE FUNCTION get_sync_file_url(
  p_user_id UUID,
  p_track_id UUID,
  p_filename TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN 'sync-files/' || p_user_id::text || '/' || p_track_id::text || '/' || p_filename;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update sync_files JSONB when a file is uploaded
CREATE OR REPLACE FUNCTION update_track_sync_file(
  p_track_id UUID,
  p_file_type TEXT,  -- 'mp3', 'master_wav', 'acapella_wav', 'instrumental_wav', 'splits_sheet', 'one_stop'
  p_file_url TEXT
)
RETURNS VOID AS $$
DECLARE
  v_key TEXT;
BEGIN
  -- Map file type to JSONB key
  v_key := p_file_type || '_url';
  
  UPDATE tracks 
  SET 
    sync_files = jsonb_set(
      COALESCE(sync_files, '{}'::jsonb),
      ARRAY[v_key],
      to_jsonb(p_file_url)
    ),
    -- Also mark the corresponding checklist item as ready
    sync_checklist = jsonb_set(
      COALESCE(sync_checklist, '{}'::jsonb),
      ARRAY[p_file_type || '_ready'],
      'true'::jsonb
    ),
    updated_at = NOW()
  WHERE id = p_track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

