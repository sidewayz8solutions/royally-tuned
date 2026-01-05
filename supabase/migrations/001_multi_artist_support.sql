-- ============================================================
-- MIGRATION: Multi-Artist Management Support
-- Adds support for managers/admins to manage multiple artists
-- while keeping all existing features for independent artists
-- ============================================================

-- Add user_role enum
CREATE TYPE user_role AS ENUM ('artist', 'manager', 'admin', 'label');

-- Add user_role column to profiles table
ALTER TABLE profiles ADD COLUMN user_role user_role DEFAULT 'artist';

-- Create index for user_role
CREATE INDEX idx_profiles_user_role ON profiles(user_role);

-- ============================================================
-- ARTISTS TABLE
-- Stores artist profiles that can be managed by users
-- For independent artists: one artist profile linked to their user
-- For managers: multiple artist profiles they manage
-- ============================================================
CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Artist Information (mirrors profile fields)
    artist_name TEXT NOT NULL,
    legal_name TEXT,
    bio TEXT,
    
    -- Music Industry Identifiers
    ipi_number TEXT,
    isni_number TEXT,
    pro_affiliation pro_affiliation DEFAULT 'none',
    publisher_name TEXT,
    
    -- Profile Customization
    profile_color TEXT DEFAULT '#8B5CF6',
    background_option background_option DEFAULT 'gradient',
    custom_background_url TEXT,
    profile_image_url TEXT,
    banner_image_url TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    
    -- Social Links
    website TEXT,
    instagram TEXT,
    spotify TEXT,
    twitter TEXT,
    youtube TEXT,
    tiktok TEXT,
    soundcloud TEXT,
    apple_music TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for artist name search
CREATE INDEX idx_artists_name ON artists USING gin(artist_name gin_trgm_ops);
CREATE INDEX idx_artists_active ON artists(is_active);

-- ============================================================
-- ARTIST_MANAGERS TABLE
-- Junction table linking users (managers) to artists they manage
-- ============================================================
CREATE TABLE artist_managers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    
    -- Permission level
    role TEXT DEFAULT 'manager', -- 'owner', 'manager', 'viewer'
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique user-artist pairs
    UNIQUE(user_id, artist_id)
);

-- Indexes for fast lookups
CREATE INDEX idx_artist_managers_user ON artist_managers(user_id);
CREATE INDEX idx_artist_managers_artist ON artist_managers(artist_id);

-- ============================================================
-- UPDATE EXISTING TABLES TO SUPPORT ARTISTS
-- ============================================================

-- Add artist_id to tracks table (nullable for backward compatibility)
ALTER TABLE tracks ADD COLUMN artist_id UUID REFERENCES artists(id) ON DELETE CASCADE;
CREATE INDEX idx_tracks_artist ON tracks(artist_id);

-- Add artist_id to checklist_items table
ALTER TABLE checklist_items ADD COLUMN artist_id UUID REFERENCES artists(id) ON DELETE CASCADE;
CREATE INDEX idx_checklist_artist ON checklist_items(artist_id);

-- Add artist_id to spotify_tokens table
ALTER TABLE spotify_tokens ADD COLUMN artist_id UUID REFERENCES artists(id) ON DELETE CASCADE;
CREATE INDEX idx_spotify_tokens_artist ON spotify_tokens(artist_id);

-- Add artist_id to activity_log table
ALTER TABLE activity_log ADD COLUMN artist_id UUID REFERENCES artists(id) ON DELETE CASCADE;
CREATE INDEX idx_activity_artist ON activity_log(artist_id);

-- ============================================================
-- MIGRATION FUNCTION
-- Migrate existing users to the new artist system
-- Creates an artist profile for each existing user
-- ============================================================
CREATE OR REPLACE FUNCTION migrate_existing_users_to_artists()
RETURNS void AS $$
DECLARE
    profile_record RECORD;
    new_artist_id UUID;
BEGIN
    -- For each existing profile, create an artist and link it
    FOR profile_record IN SELECT * FROM profiles LOOP
        -- Create artist profile from user profile
        INSERT INTO artists (
            artist_name, legal_name, bio,
            ipi_number, isni_number, pro_affiliation, publisher_name,
            profile_color, background_option, custom_background_url,
            profile_image_url, banner_image_url, gallery_images,
            website, instagram, spotify, twitter, youtube, tiktok, soundcloud, apple_music
        ) VALUES (
            COALESCE(profile_record.artist_name, 'My Artist Profile'),
            profile_record.legal_name, profile_record.bio,
            profile_record.ipi_number, profile_record.isni_number, 
            profile_record.pro_affiliation, profile_record.publisher_name,
            profile_record.profile_color, profile_record.background_option, 
            profile_record.custom_background_url,
            profile_record.profile_image_url, profile_record.banner_image_url, 
            profile_record.gallery_images,
            profile_record.website, profile_record.instagram, profile_record.spotify,
            profile_record.twitter, profile_record.youtube, profile_record.tiktok,
            profile_record.soundcloud, profile_record.apple_music
        ) RETURNING id INTO new_artist_id;

        -- Link user to their artist profile as owner
        INSERT INTO artist_managers (user_id, artist_id, role)
        VALUES (profile_record.id, new_artist_id, 'owner');

        -- Update existing tracks to link to new artist
        UPDATE tracks SET artist_id = new_artist_id WHERE user_id = profile_record.id;

        -- Update existing checklist items to link to new artist
        UPDATE checklist_items SET artist_id = new_artist_id WHERE user_id = profile_record.id;

        -- Update existing spotify tokens to link to new artist
        UPDATE spotify_tokens SET artist_id = new_artist_id WHERE user_id = profile_record.id;

        -- Update existing activity log to link to new artist
        UPDATE activity_log SET artist_id = new_artist_id WHERE user_id = profile_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES FOR NEW TABLES
-- ============================================================

-- Enable RLS on new tables
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_managers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ARTISTS POLICIES
-- ============================================================

-- Users can view artists they manage
CREATE POLICY "Users can view managed artists"
    ON artists FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM artist_managers
            WHERE artist_managers.artist_id = artists.id
            AND artist_managers.user_id = auth.uid()
        )
    );

-- Users can update artists they own or manage
CREATE POLICY "Users can update managed artists"
    ON artists FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM artist_managers
            WHERE artist_managers.artist_id = artists.id
            AND artist_managers.user_id = auth.uid()
            AND artist_managers.role IN ('owner', 'manager')
        )
    );

-- Users can insert new artists (they become the owner)
CREATE POLICY "Users can create artists"
    ON artists FOR INSERT
    WITH CHECK (true);

-- Users can delete artists they own
CREATE POLICY "Users can delete owned artists"
    ON artists FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM artist_managers
            WHERE artist_managers.artist_id = artists.id
            AND artist_managers.user_id = auth.uid()
            AND artist_managers.role = 'owner'
        )
    );

-- ============================================================
-- ARTIST_MANAGERS POLICIES
-- ============================================================

-- Users can view their own artist relationships
CREATE POLICY "Users can view own artist relationships"
    ON artist_managers FOR SELECT
    USING (auth.uid() = user_id);

-- Owners can manage artist relationships
CREATE POLICY "Owners can manage artist relationships"
    ON artist_managers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM artist_managers am
            WHERE am.artist_id = artist_managers.artist_id
            AND am.user_id = auth.uid()
            AND am.role = 'owner'
        )
    );

-- ============================================================
-- UPDATE EXISTING RLS POLICIES FOR MULTI-ARTIST SUPPORT
-- ============================================================

-- Drop old tracks policies
DROP POLICY IF EXISTS "Users can view own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can insert own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can update own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can delete own tracks" ON tracks;

-- New tracks policies supporting both user_id and artist_id
CREATE POLICY "Users can view tracks for managed artists"
    ON tracks FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM artist_managers
            WHERE artist_managers.artist_id = tracks.artist_id
            AND artist_managers.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert tracks for managed artists"
    ON tracks FOR INSERT
    WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM artist_managers
            WHERE artist_managers.artist_id = tracks.artist_id
            AND artist_managers.user_id = auth.uid()
            AND artist_managers.role IN ('owner', 'manager')
        )
    );

CREATE POLICY "Users can update tracks for managed artists"
    ON tracks FOR UPDATE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM artist_managers
            WHERE artist_managers.artist_id = tracks.artist_id
            AND artist_managers.user_id = auth.uid()
            AND artist_managers.role IN ('owner', 'manager')
        )
    );

CREATE POLICY "Users can delete tracks for managed artists"
    ON tracks FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM artist_managers
            WHERE artist_managers.artist_id = tracks.artist_id
            AND artist_managers.user_id = auth.uid()
            AND artist_managers.role IN ('owner', 'manager')
        )
    );

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to create artist and link to user
CREATE OR REPLACE FUNCTION create_artist_for_user(
    p_user_id UUID,
    p_artist_name TEXT,
    p_role TEXT DEFAULT 'owner'
)
RETURNS UUID AS $$
DECLARE
    v_artist_id UUID;
BEGIN
    -- Create artist
    INSERT INTO artists (artist_name)
    VALUES (p_artist_name)
    RETURNING id INTO v_artist_id;

    -- Link user to artist
    INSERT INTO artist_managers (user_id, artist_id, role)
    VALUES (p_user_id, v_artist_id, p_role);

    RETURN v_artist_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all artists for a user
CREATE OR REPLACE FUNCTION get_user_artists(p_user_id UUID)
RETURNS TABLE (
    artist_id UUID,
    artist_name TEXT,
    role TEXT,
    profile_image_url TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.artist_name,
        am.role,
        a.profile_image_url,
        a.is_active
    FROM artists a
    INNER JOIN artist_managers am ON a.id = am.artist_id
    WHERE am.user_id = p_user_id
    ORDER BY am.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- UPDATED TRIGGERS
-- ============================================================

-- Update the handle_new_user function to create an artist profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_artist_id UUID;
BEGIN
    -- Create user profile
    INSERT INTO profiles (id, email)
    VALUES (NEW.id, NEW.email);

    -- Create default artist profile for new user
    v_artist_id := create_artist_for_user(NEW.id, 'My Artist Profile', 'owner');

    -- Copy default checklist items for new user's artist
    INSERT INTO checklist_items (user_id, artist_id, title, description, category, sort_order, external_link, help_text)
    SELECT
        NEW.id,
        v_artist_id,
        title,
        description,
        category,
        sort_order,
        external_link,
        help_text
    FROM default_checklist_items
    WHERE is_active = TRUE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


