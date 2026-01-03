-- ============================================================
-- Migration: Add Sync Licensing Metadata to Tracks
-- Date: 2026-01-03
-- Description: Adds structured writer/publisher info and sync checklist
-- ============================================================

-- Add writers with PRO affiliation (replaces simple writers array)
-- Format: [{"name": "John Doe", "pro": "ASCAP", "ipi": "123456789"}, ...]
ALTER TABLE tracks 
ADD COLUMN IF NOT EXISTS writers_detailed JSONB DEFAULT '[]';

-- Add publishers with PRO affiliation
-- Format: [{"name": "Big Music Publishing", "pro": "BMI", "ipi": "987654321"}, ...]
ALTER TABLE tracks 
ADD COLUMN IF NOT EXISTS publishers_detailed JSONB DEFAULT '[]';

-- Add sync checklist for tracking sync-ready status
-- Based on "Record for Sync" requirements
ALTER TABLE tracks 
ADD COLUMN IF NOT EXISTS sync_checklist JSONB DEFAULT '{
    "mp3_ready": false,
    "master_wav_ready": false,
    "acapella_wav_ready": false,
    "instrumental_wav_ready": false,
    "splits_sheet_ready": false,
    "one_stop_ready": false
}';

-- Add file URLs for sync package assets (for future file upload feature)
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS sync_files JSONB DEFAULT '{
    "mp3_url": null,
    "master_wav_url": null,
    "acapella_wav_url": null,
    "instrumental_wav_url": null,
    "splits_sheet_url": null,
    "one_stop_url": null
}';

-- Add one-stop licensing availability flag
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS is_one_stop BOOLEAN DEFAULT FALSE;

-- Add instrumental availability flag  
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS has_instrumental BOOLEAN DEFAULT FALSE;

-- Add clean version flag (no samples/uncleared content)
ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS is_clean_master BOOLEAN DEFAULT FALSE;

-- Comment on new columns for documentation
COMMENT ON COLUMN tracks.writers_detailed IS 'Array of writer objects with name, PRO affiliation, and optional IPI number';
COMMENT ON COLUMN tracks.publishers_detailed IS 'Array of publisher objects with name, PRO affiliation, and optional IPI number';
COMMENT ON COLUMN tracks.sync_checklist IS 'Checklist tracking sync-ready status: MP3, WAVs, splits sheet, one-stop auth';
COMMENT ON COLUMN tracks.sync_files IS 'URLs to uploaded sync package files stored in Supabase Storage';
COMMENT ON COLUMN tracks.is_one_stop IS 'Whether all rights are controlled for one-stop licensing';
COMMENT ON COLUMN tracks.has_instrumental IS 'Whether an instrumental version is available';
COMMENT ON COLUMN tracks.is_clean_master IS 'Whether the master is clean (no uncleared samples)';

-- Create index on sync checklist for filtering sync-ready tracks
CREATE INDEX IF NOT EXISTS idx_tracks_sync_checklist ON tracks USING gin(sync_checklist);

-- Helper function to check if a track is fully sync-ready
CREATE OR REPLACE FUNCTION is_track_sync_ready(p_track_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_checklist JSONB;
BEGIN
    SELECT sync_checklist INTO v_checklist FROM tracks WHERE id = p_track_id;
    
    RETURN (
        (v_checklist->>'mp3_ready')::boolean AND
        (v_checklist->>'master_wav_ready')::boolean AND
        (v_checklist->>'acapella_wav_ready')::boolean AND
        (v_checklist->>'instrumental_wav_ready')::boolean AND
        (v_checklist->>'splits_sheet_ready')::boolean AND
        (v_checklist->>'one_stop_ready')::boolean
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- View for sync-ready tracks
CREATE OR REPLACE VIEW sync_ready_tracks AS
SELECT 
    t.*,
    is_track_sync_ready(t.id) as is_sync_ready,
    (
        CASE WHEN (t.sync_checklist->>'mp3_ready')::boolean THEN 1 ELSE 0 END +
        CASE WHEN (t.sync_checklist->>'master_wav_ready')::boolean THEN 1 ELSE 0 END +
        CASE WHEN (t.sync_checklist->>'acapella_wav_ready')::boolean THEN 1 ELSE 0 END +
        CASE WHEN (t.sync_checklist->>'instrumental_wav_ready')::boolean THEN 1 ELSE 0 END +
        CASE WHEN (t.sync_checklist->>'splits_sheet_ready')::boolean THEN 1 ELSE 0 END +
        CASE WHEN (t.sync_checklist->>'one_stop_ready')::boolean THEN 1 ELSE 0 END
    ) as sync_items_complete,
    6 as sync_items_total
FROM tracks t
WHERE t.is_active = TRUE;

