-- ============================================================
-- ROYALLY TUNED - Complete Supabase Database Schema
-- Music Royalties Management Platform
-- ============================================================
-- Run this entire script in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================

-- Subscription status types
CREATE TYPE subscription_status AS ENUM ('free', 'pro', 'enterprise', 'cancelled', 'past_due');

-- Track registration status for each platform
CREATE TYPE registration_status AS ENUM ('not_started', 'pending', 'submitted', 'verified', 'rejected');

-- Checklist item categories
CREATE TYPE checklist_category AS ENUM ('registration', 'setup', 'verification', 'optimization', 'distribution');

-- Collaborator roles for splits
CREATE TYPE collaborator_role AS ENUM ('artist', 'producer', 'songwriter', 'publisher', 'label', 'featured', 'other');

-- PRO (Performance Rights Organization) affiliations
CREATE TYPE pro_affiliation AS ENUM ('ascap', 'bmi', 'sesac', 'socan', 'prs', 'gema', 'other', 'none');

-- Background options for profile customization
CREATE TYPE background_option AS ENUM ('gradient', 'solid', 'image', 'animated');

-- ============================================================
-- PROFILES TABLE
-- Stores user profile information linked to Supabase Auth
-- ============================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    
    -- Artist Information
    artist_name TEXT,
    legal_name TEXT,
    bio TEXT,
    
    -- Music Industry Identifiers
    ipi_number TEXT, -- Interested Parties Information number
    isni_number TEXT, -- International Standard Name Identifier
    pro_affiliation pro_affiliation DEFAULT 'none',
    publisher_name TEXT,
    
    -- Profile Customization
    profile_color TEXT DEFAULT '#8B5CF6', -- Default purple
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
    
    -- Stripe Integration
    stripe_customer_id TEXT UNIQUE,
    subscription_status subscription_status DEFAULT 'free',
    subscription_tier TEXT DEFAULT 'free',
    subscription_period_end TIMESTAMPTZ,
    
    -- Metadata
    onboarding_completed BOOLEAN DEFAULT FALSE,
    email_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX idx_profiles_subscription ON profiles(subscription_status);
CREATE INDEX idx_profiles_artist_name ON profiles USING gin(artist_name gin_trgm_ops);

-- ============================================================
-- TRACKS TABLE
-- Stores all user tracks with metadata and registration status
-- ============================================================
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Track Information
    title TEXT NOT NULL,
    album TEXT,
    genre TEXT,
    release_date DATE,
    duration_seconds INTEGER,
    cover_art_url TEXT,
    audio_preview_url TEXT,
    
    -- Music Industry Identifiers
    isrc TEXT, -- International Standard Recording Code
    iswc TEXT, -- International Standard Musical Work Code
    upc TEXT, -- Universal Product Code (for album/single)
    
    -- Writers/Composers (stored as array)
    writers TEXT[] DEFAULT '{}',
    composers TEXT[] DEFAULT '{}',
    
    -- Platform Registration Status (JSONB for flexibility)
    registration_status JSONB DEFAULT '{
        "pro": "not_started",
        "sound_exchange": "not_started",
        "mlc": "not_started",
        "distributor": "not_started",
        "sync_licensing": "not_started"
    }',
    
    -- Performance Metrics
    total_streams BIGINT DEFAULT 0,
    monthly_streams INTEGER DEFAULT 0,
    total_earnings DECIMAL(12, 2) DEFAULT 0.00,
    monthly_earnings DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_tracks_user ON tracks(user_id);
CREATE INDEX idx_tracks_title ON tracks USING gin(title gin_trgm_ops);
CREATE INDEX idx_tracks_isrc ON tracks(isrc);
CREATE INDEX idx_tracks_release_date ON tracks(release_date DESC);
CREATE INDEX idx_tracks_earnings ON tracks(total_earnings DESC);
CREATE INDEX idx_tracks_streams ON tracks(total_streams DESC);

-- ============================================================
-- SPLITS TABLE
-- Stores royalty split percentages for collaborators on tracks
-- ============================================================
CREATE TABLE splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    
    -- Collaborator Information
    collaborator_name TEXT NOT NULL,
    collaborator_email TEXT,
    collaborator_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    role collaborator_role NOT NULL DEFAULT 'artist',
    
    -- Split Percentage (stored as decimal, e.g., 50.00 for 50%)
    percentage DECIMAL(5, 2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    
    -- Payment Information
    is_verified BOOLEAN DEFAULT FALSE,
    payment_status TEXT DEFAULT 'pending',
    total_paid DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure no duplicate collaborators on same track
    UNIQUE(track_id, collaborator_email)
);

-- Index for faster lookups
CREATE INDEX idx_splits_track ON splits(track_id);
CREATE INDEX idx_splits_collaborator ON splits(collaborator_user_id);
CREATE INDEX idx_splits_email ON splits(collaborator_email);

-- ============================================================
-- CHECKLIST ITEMS TABLE
-- Stores user's registration/setup checklist progress
-- ============================================================
CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Item Details
    title TEXT NOT NULL,
    description TEXT,
    category checklist_category NOT NULL DEFAULT 'setup',
    
    -- Status
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    
    -- Ordering
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    external_link TEXT, -- Link to registration page
    help_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user's checklist
CREATE INDEX idx_checklist_user ON checklist_items(user_id);
CREATE INDEX idx_checklist_category ON checklist_items(category);
CREATE INDEX idx_checklist_completed ON checklist_items(user_id, completed);

-- ============================================================
-- STREAM CALCULATIONS TABLE
-- Stores stream-to-royalty calculations for reference
-- ============================================================
CREATE TABLE stream_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Calculation Parameters
    platform TEXT NOT NULL, -- spotify, apple_music, youtube, etc.
    streams INTEGER NOT NULL,
    rate_per_stream DECIMAL(10, 6) NOT NULL,
    
    -- Results
    estimated_earnings DECIMAL(12, 2) NOT NULL,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user calculations
CREATE INDEX idx_calculations_user ON stream_calculations(user_id);
CREATE INDEX idx_calculations_platform ON stream_calculations(platform);

-- ============================================================
-- EARNINGS TABLE
-- Tracks detailed earnings/royalty payments
-- ============================================================
CREATE TABLE earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
    
    -- Earning Details
    source TEXT NOT NULL, -- Platform or source of earnings
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Period
    period_start DATE,
    period_end DATE,
    payment_date DATE,
    
    -- Status
    status TEXT DEFAULT 'pending', -- pending, paid, disputed
    
    -- Metadata
    statement_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for earnings queries
CREATE INDEX idx_earnings_user ON earnings(user_id);
CREATE INDEX idx_earnings_track ON earnings(track_id);
CREATE INDEX idx_earnings_date ON earnings(payment_date DESC);
CREATE INDEX idx_earnings_source ON earnings(source);

-- ============================================================
-- NOTIFICATIONS TABLE
-- Stores user notifications
-- ============================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Notification Content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, success, warning, error
    
    -- Status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    -- Action
    action_url TEXT,
    action_label TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;

-- ============================================================
-- SPOTIFY TOKENS TABLE
-- Stores OAuth tokens for users who connect their Spotify accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS spotify_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    scope TEXT,
    expires_at BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spotify_tokens_user ON spotify_tokens(user_id);

-- ============================================================
-- ACTIVITY LOG TABLE
-- Tracks user activity for dashboard insights
-- ============================================================
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Activity Details
    action TEXT NOT NULL, -- track_added, split_updated, payment_received, etc.
    entity_type TEXT, -- track, split, payment, etc.
    entity_id UUID,
    
    -- Additional Data
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for activity queries
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_action ON activity_log(action);
CREATE INDEX idx_activity_date ON activity_log(created_at DESC);

-- ============================================================
-- DEFAULT CHECKLIST ITEMS
-- Template items that get copied for new users
-- ============================================================
CREATE TABLE default_checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category checklist_category NOT NULL,
    sort_order INTEGER DEFAULT 0,
    external_link TEXT,
    help_text TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email)
    VALUES (NEW.id, NEW.email);
    
    -- Copy default checklist items for new user
    INSERT INTO checklist_items (user_id, title, description, category, sort_order, external_link, help_text)
    SELECT 
        NEW.id,
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

-- Function to validate split percentages (must equal 100%)
CREATE OR REPLACE FUNCTION validate_splits()
RETURNS TRIGGER AS $$
DECLARE
    total_percentage DECIMAL(5, 2);
BEGIN
    SELECT COALESCE(SUM(percentage), 0) INTO total_percentage
    FROM splits
    WHERE track_id = NEW.track_id AND id != COALESCE(NEW.id, uuid_nil());
    
    total_percentage := total_percentage + NEW.percentage;
    
    IF total_percentage > 100 THEN
        RAISE EXCEPTION 'Total split percentage cannot exceed 100 percent. Current total would be: %', total_percentage;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO activity_log (user_id, action, entity_type, entity_id, metadata)
    VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_metadata)
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for tracks
CREATE TRIGGER update_tracks_updated_at
    BEFORE UPDATE ON tracks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for splits
CREATE TRIGGER update_splits_updated_at
    BEFORE UPDATE ON splits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for checklist_items
CREATE TRIGGER update_checklist_updated_at
    BEFORE UPDATE ON checklist_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create profile when new user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Validate splits don't exceed 100%
CREATE TRIGGER validate_splits_percentage
    BEFORE INSERT OR UPDATE ON splits
    FOR EACH ROW
    EXECUTE FUNCTION validate_splits();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Public profiles can be viewed by anyone (for artist pages)
CREATE POLICY "Public profiles are viewable"
    ON profiles FOR SELECT
    USING (artist_name IS NOT NULL);

-- ============================================================
-- TRACKS POLICIES
-- ============================================================

-- Users can view their own tracks
CREATE POLICY "Users can view own tracks"
    ON tracks FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own tracks
CREATE POLICY "Users can insert own tracks"
    ON tracks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own tracks
CREATE POLICY "Users can update own tracks"
    ON tracks FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own tracks
CREATE POLICY "Users can delete own tracks"
    ON tracks FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- SPLITS POLICIES
-- ============================================================

-- Users can view splits on their tracks
CREATE POLICY "Users can view splits on own tracks"
    ON splits FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tracks 
            WHERE tracks.id = splits.track_id 
            AND tracks.user_id = auth.uid()
        )
    );

-- Collaborators can view splits where they are included
CREATE POLICY "Collaborators can view their splits"
    ON splits FOR SELECT
    USING (collaborator_user_id = auth.uid());

-- Users can manage splits on their own tracks
CREATE POLICY "Users can insert splits on own tracks"
    ON splits FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tracks 
            WHERE tracks.id = splits.track_id 
            AND tracks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update splits on own tracks"
    ON splits FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM tracks 
            WHERE tracks.id = splits.track_id 
            AND tracks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete splits on own tracks"
    ON splits FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM tracks 
            WHERE tracks.id = splits.track_id 
            AND tracks.user_id = auth.uid()
        )
    );

-- ============================================================
-- CHECKLIST ITEMS POLICIES
-- ============================================================

-- Users can view their own checklist items
CREATE POLICY "Users can view own checklist items"
    ON checklist_items FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own checklist items
CREATE POLICY "Users can update own checklist items"
    ON checklist_items FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can insert their own checklist items
CREATE POLICY "Users can insert own checklist items"
    ON checklist_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own checklist items
CREATE POLICY "Users can delete own checklist items"
    ON checklist_items FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- STREAM CALCULATIONS POLICIES
-- ============================================================

-- Users can view their own calculations
CREATE POLICY "Users can view own calculations"
    ON stream_calculations FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own calculations
CREATE POLICY "Users can insert own calculations"
    ON stream_calculations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- EARNINGS POLICIES
-- ============================================================

-- Users can view their own earnings
CREATE POLICY "Users can view own earnings"
    ON earnings FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own earnings
CREATE POLICY "Users can insert own earnings"
    ON earnings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================
-- ACTIVITY LOG POLICIES
-- ============================================================

-- Users can view their own activity
CREATE POLICY "Users can view own activity"
    ON activity_log FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS (Run in Supabase Dashboard > Storage)
-- ============================================================
-- Note: Storage buckets are created via the Supabase Dashboard
-- Here are the SQL equivalents for reference:

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public)
VALUES ('banner-images', 'banner-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for cover art
INSERT INTO storage.buckets (id, name, public)
VALUES ('cover-art', 'cover-art', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES
-- ============================================================

-- Profile images policies
CREATE POLICY "Users can upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Profile images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can update own profile images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own profile images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Banner images policies
CREATE POLICY "Users can upload banner images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'banner-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Banner images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'banner-images');

CREATE POLICY "Users can update own banner images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'banner-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own banner images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'banner-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Gallery images policies
CREATE POLICY "Users can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'gallery-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Gallery images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-images');

CREATE POLICY "Users can update own gallery images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'gallery-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own gallery images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'gallery-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Cover art policies
CREATE POLICY "Users can upload cover art"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'cover-art' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Cover art is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'cover-art');

CREATE POLICY "Users can update own cover art"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'cover-art' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own cover art"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'cover-art' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================
-- SEED DATA - Default Checklist Items
-- ============================================================

INSERT INTO default_checklist_items (title, description, category, sort_order, external_link, help_text) VALUES
-- Registration Items
('Register with your PRO', 'Sign up with ASCAP, BMI, SESAC, or your local PRO to collect performance royalties', 'registration', 1, 'https://www.ascap.com/', 'Performance Rights Organizations collect royalties when your music is played publicly'),
('Create SoundExchange account', 'Register to collect digital performance royalties from streaming services', 'registration', 2, 'https://www.soundexchange.com/', 'SoundExchange collects royalties for non-interactive streaming like Pandora and SiriusXM'),
('Register with The MLC', 'Sign up with The Mechanical Licensing Collective to collect mechanical royalties', 'registration', 3, 'https://www.themlc.com/', 'The MLC collects mechanical royalties from streaming services in the US'),
('Set up distributor account', 'Choose a distributor to get your music on streaming platforms', 'registration', 4, NULL, 'Popular options include DistroKid, TuneCore, CD Baby, and AWAL'),

-- Setup Items
('Get your IPI Number', 'Obtain your Interested Parties Information number from your PRO', 'setup', 5, NULL, 'Your IPI number is a unique identifier used to track your royalties worldwide'),
('Register your ISNI', 'Get your International Standard Name Identifier', 'setup', 6, 'https://isni.org/', 'ISNI is a global standard for identifying creators and contributors'),
('Link your songs in your PRO', 'Register all your compositions with your PRO', 'setup', 7, NULL, 'Make sure to add all writers and publishers for proper royalty splits'),

-- Verification Items  
('Verify Spotify for Artists', 'Claim your artist profile on Spotify', 'verification', 8, 'https://artists.spotify.com/', 'Verification gives you access to analytics and profile customization'),
('Verify Apple Music for Artists', 'Claim your artist profile on Apple Music', 'verification', 9, 'https://artists.apple.com/', 'Access to analytics and promotional tools'),
('Verify YouTube Official Artist Channel', 'Set up your Official Artist Channel on YouTube', 'verification', 10, NULL, 'Consolidates your music across YouTube and YouTube Music'),
('Create TV Music Rights License', 'Prepare a TV music rights license to clear sync and television uses', 'verification', 11, NULL, 'Use this to license recordings for TV/film sync usages'),
('Prepare Co-Production Agreement', 'Draft and save a co-production agreement for collaborations and joint projects', 'verification', 12, NULL, 'Protects partner rights and revenue splits for co-productions'),

-- Optimization Items
('Set up publishing admin', 'Consider a publishing administrator to collect global royalties', 'optimization', 11, NULL, 'Publishing admins like Songtrust or CD Baby Pro help collect international royalties'),
('Register with international PROs', 'Register your works with international collecting societies', 'optimization', 12, NULL, 'This ensures you collect royalties from international performances'),
('Set up sync licensing', 'Make your music available for TV, film, and ads', 'optimization', 13, NULL, 'Platforms like Musicbed, Artlist, and Epidemic Sound offer sync opportunities');

-- Copyright registration seeds
INSERT INTO default_checklist_items (title, description, category, sort_order, external_link, help_text) VALUES
('Copyright Registration (PA)', 'Register your musical composition with the US Copyright Office using the PA (Performing Arts) form', 'registration', 14, 'https://www.copyright.gov/forms/pa.pdf', 'Register the composition (PA) to protect the written musical work and lyrics'),
('Copyright Registration (SR)', 'Register your sound recording (master) with the US Copyright Office using the SR form', 'registration', 15, 'https://www.copyright.gov/forms/sr.pdf', 'Register the sound recording (SR) to protect the master recording');

-- ============================================================
-- VIEWS (Optional - for convenient querying)
-- ============================================================

-- View for track summaries with splits total
CREATE OR REPLACE VIEW track_summaries AS
SELECT 
    t.*,
    COALESCE(SUM(s.percentage), 0) as total_split_percentage,
    COUNT(s.id) as collaborator_count,
    p.artist_name as owner_artist_name
FROM tracks t
LEFT JOIN splits s ON t.id = s.track_id
LEFT JOIN profiles p ON t.user_id = p.id
GROUP BY t.id, p.artist_name;

-- View for user dashboard stats
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT 
    p.id as user_id,
    p.artist_name,
    COUNT(DISTINCT t.id) as total_tracks,
    COALESCE(SUM(t.total_streams), 0) as total_streams,
    COALESCE(SUM(t.total_earnings), 0) as total_earnings,
    COUNT(CASE WHEN ci.completed THEN 1 END) as completed_checklist_items,
    COUNT(ci.id) as total_checklist_items,
    p.subscription_status
FROM profiles p
LEFT JOIN tracks t ON p.id = t.user_id
LEFT JOIN checklist_items ci ON p.id = ci.user_id
GROUP BY p.id, p.artist_name, p.subscription_status;

-- ============================================================
-- HELPER FUNCTIONS FOR FRONTEND
-- ============================================================

-- Function to get user's complete dashboard data
CREATE OR REPLACE FUNCTION get_dashboard_data(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'profile', (SELECT row_to_json(p) FROM profiles p WHERE p.id = p_user_id),
        'tracks', (SELECT json_agg(row_to_json(t)) FROM tracks t WHERE t.user_id = p_user_id),
        'recent_earnings', (
            SELECT json_agg(row_to_json(e)) 
            FROM (SELECT * FROM earnings WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 10) e
        ),
        'checklist_progress', (
            SELECT json_build_object(
                'completed', COUNT(*) FILTER (WHERE completed = true),
                'total', COUNT(*)
            )
            FROM checklist_items WHERE user_id = p_user_id
        ),
        'notifications', (
            SELECT json_agg(row_to_json(n)) 
            FROM (SELECT * FROM notifications WHERE user_id = p_user_id AND read = false ORDER BY created_at DESC LIMIT 5) n
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update track streams/earnings
CREATE OR REPLACE FUNCTION update_track_metrics(
    p_track_id UUID,
    p_streams BIGINT,
    p_earnings DECIMAL(12, 2)
)
RETURNS VOID AS $$
BEGIN
    UPDATE tracks 
    SET 
        total_streams = total_streams + p_streams,
        total_earnings = total_earnings + p_earnings,
        monthly_streams = monthly_streams + p_streams,
        monthly_earnings = monthly_earnings + p_earnings,
        updated_at = NOW()
    WHERE id = p_track_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SCHEDULED FUNCTIONS (Use Supabase Edge Functions or pg_cron)
-- ============================================================

-- Reset monthly stats (run on 1st of each month)
CREATE OR REPLACE FUNCTION reset_monthly_stats()
RETURNS VOID AS $$
BEGIN
    UPDATE tracks SET monthly_streams = 0, monthly_earnings = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- GRANTS (Ensure Supabase can access everything)
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================================
-- 🎉 SETUP COMPLETE!
-- ============================================================
-- Your Royally Tuned database is now ready!
-- 
-- Next Steps:
-- 1. Go to your Supabase Dashboard > SQL Editor
-- 2. Paste this entire script and run it
-- 3. Go to Storage and verify the buckets were created
-- 4. Update your .env with your Supabase URL and anon key
-- 5. Start building! 🚀
-- ============================================================
