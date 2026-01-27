-- ============================================================
-- FIX: Artist Creation RLS Policy
-- Date: 2026-01-27
-- Issue: New artist creation fails due to RLS policy
-- Solution: Add trigger to automatically create artist_manager entry
-- ============================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can create artists" ON artists;

-- Create new policy that allows authenticated users to insert artists
CREATE POLICY "Users can create artists"
    ON artists FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- Create function to automatically add creator as owner in artist_managers
CREATE OR REPLACE FUNCTION handle_new_artist()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert the creator as the owner of the artist
    INSERT INTO artist_managers (artist_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'owner');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_artist_created ON artists;

-- Create trigger that fires after artist insert
CREATE TRIGGER on_artist_created
    AFTER INSERT ON artists
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_artist();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON artist_managers TO authenticated;
