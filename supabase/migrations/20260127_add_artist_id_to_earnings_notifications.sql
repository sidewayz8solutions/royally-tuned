-- Add per-artist scoping to earnings + notifications
-- Paste into Supabase SQL Editor, or run via Supabase CLI migrations.

BEGIN;

-- ============================================================
-- 1) Add artist_id columns + FK constraints + indexes
-- ============================================================

ALTER TABLE earnings
  ADD COLUMN IF NOT EXISTS artist_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'earnings_artist_id_fkey'
  ) THEN
    ALTER TABLE earnings
      ADD CONSTRAINT earnings_artist_id_fkey
      FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_earnings_artist ON earnings(artist_id);


ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS artist_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_artist_id_fkey'
  ) THEN
    ALTER TABLE notifications
      ADD CONSTRAINT notifications_artist_id_fkey
      FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE CASCADE;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_notifications_artist ON notifications(artist_id);


-- ============================================================
-- 2) Backfill existing rows
-- ============================================================

-- Earnings: prefer deriving artist_id from the linked track
UPDATE earnings e
SET artist_id = t.artist_id
FROM tracks t
WHERE e.artist_id IS NULL
  AND e.track_id IS NOT NULL
  AND t.id = e.track_id
  AND t.artist_id IS NOT NULL;

-- Earnings fallback: if an earning has no track_id, assign user's first artist
UPDATE earnings e
SET artist_id = am.artist_id
FROM LATERAL (
  SELECT artist_id
  FROM artist_managers
  WHERE user_id = e.user_id
  ORDER BY created_at ASC
  LIMIT 1
) am
WHERE e.artist_id IS NULL;

-- Notifications: assign user's first artist (you can later update specific notifications per artist)
UPDATE notifications n
SET artist_id = am.artist_id
FROM LATERAL (
  SELECT artist_id
  FROM artist_managers
  WHERE user_id = n.user_id
  ORDER BY created_at ASC
  LIMIT 1
) am
WHERE n.artist_id IS NULL;


-- ============================================================
-- 3) Keep earnings.artist_id automatically in sync with track_id
-- ============================================================

CREATE OR REPLACE FUNCTION set_earnings_artist_id_from_track()
RETURNS TRIGGER AS $$
BEGIN
  -- If track_id is set, derive artist_id from tracks
  IF NEW.track_id IS NOT NULL THEN
    SELECT t.artist_id INTO NEW.artist_id
    FROM tracks t
    WHERE t.id = NEW.track_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_earnings_artist_id_from_track ON earnings;
CREATE TRIGGER trg_set_earnings_artist_id_from_track
BEFORE INSERT OR UPDATE OF track_id ON earnings
FOR EACH ROW
EXECUTE FUNCTION set_earnings_artist_id_from_track();


-- ============================================================
-- 4) RLS policies (artist-scoped via artist_managers)
-- ============================================================

-- Ensure RLS is enabled (no-op if already enabled)
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop older user-only policies if they exist
DROP POLICY IF EXISTS "Users can view own earnings" ON earnings;
DROP POLICY IF EXISTS "Users can insert own earnings" ON earnings;
DROP POLICY IF EXISTS "Users can update own earnings" ON earnings;
DROP POLICY IF EXISTS "Users can delete own earnings" ON earnings;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- EARNINGS
CREATE POLICY "Users can view earnings for managed artists"
  ON earnings FOR SELECT
  USING (
    user_id = auth.uid()
    OR (
      artist_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM artist_managers am
        WHERE am.artist_id = earnings.artist_id
          AND am.user_id = auth.uid()
      )
    )
  );

-- Allow inserts when:
-- - user_id matches auth.uid()
-- - and either artist_id is a managed artist OR track_id belongs to a managed artist
CREATE POLICY "Users can insert earnings for managed artists"
  ON earnings FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      (
        artist_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM artist_managers am
          WHERE am.artist_id = earnings.artist_id
            AND am.user_id = auth.uid()
            AND am.role IN ('owner', 'manager')
        )
      )
      OR (
        track_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM tracks t
          JOIN artist_managers am
            ON am.artist_id = t.artist_id
          WHERE t.id = earnings.track_id
            AND am.user_id = auth.uid()
            AND am.role IN ('owner', 'manager')
        )
      )
    )
  );

CREATE POLICY "Users can update earnings for managed artists"
  ON earnings FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (
      artist_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM artist_managers am
        WHERE am.artist_id = earnings.artist_id
          AND am.user_id = auth.uid()
          AND am.role IN ('owner', 'manager')
      )
    )
  )
  WITH CHECK (
    user_id = auth.uid()
  );

CREATE POLICY "Users can delete earnings for managed artists"
  ON earnings FOR DELETE
  USING (
    user_id = auth.uid()
    OR (
      artist_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM artist_managers am
        WHERE am.artist_id = earnings.artist_id
          AND am.user_id = auth.uid()
          AND am.role IN ('owner', 'manager')
      )
    )
  );


-- NOTIFICATIONS
CREATE POLICY "Users can view notifications for managed artists"
  ON notifications FOR SELECT
  USING (
    user_id = auth.uid()
    OR (
      artist_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM artist_managers am
        WHERE am.artist_id = notifications.artist_id
          AND am.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert notifications for managed artists"
  ON notifications FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      artist_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM artist_managers am
        WHERE am.artist_id = notifications.artist_id
          AND am.user_id = auth.uid()
          AND am.role IN ('owner', 'manager')
      )
    )
  );

CREATE POLICY "Users can update notifications for managed artists"
  ON notifications FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (
      artist_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM artist_managers am
        WHERE am.artist_id = notifications.artist_id
          AND am.user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    user_id = auth.uid()
  );

COMMIT;
