import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { ManagedArtist, Artist } from '../types';

interface ArtistContextValue {
  // Current selected artist
  selectedArtist: ManagedArtist | null;
  
  // All artists managed by the user
  managedArtists: ManagedArtist[];
  
  // Loading states
  loading: boolean;
  
  // Actions
  selectArtist: (artistId: string) => void;
  refreshArtists: () => Promise<void>;
  createArtist: (artistName: string) => Promise<{ ok: boolean; artistId?: string; error?: string }>;
  updateArtist: (artistId: string, updates: Partial<Artist>) => Promise<{ ok: boolean; error?: string }>;
  deleteArtist: (artistId: string) => Promise<{ ok: boolean; error?: string }>;
}

const ArtistContext = createContext<ArtistContextValue | undefined>(undefined);

// Cache key for selected artist
const SELECTED_ARTIST_KEY = 'rt_selected_artist';

export function ArtistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [managedArtists, setManagedArtists] = useState<ManagedArtist[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(() => {
    // Initialize from localStorage
    return localStorage.getItem(SELECTED_ARTIST_KEY);
  });
  const [loading, setLoading] = useState(true);

  // Fetch all artists managed by the user
  const fetchManagedArtists = useCallback(async () => {
    if (!user || !supabase) {
      setManagedArtists([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('artist_managers')
        .select(`
          role,
          artist_id,
          artists (
            id,
            artist_name,
            legal_name,
            bio,
            ipi_number,
            isni_number,
            pro_affiliation,
            publisher_name,
            profile_color,
            background_option,
            custom_background_url,
            profile_image_url,
            banner_image_url,
            gallery_images,
            website,
            instagram,
            spotify,
            twitter,
            youtube,
            tiktok,
            soundcloud,
            apple_music,
            is_active,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching managed artists:', error);
        setManagedArtists([]);
        return;
      }

      const artists: ManagedArtist[] = (data || [])
        .filter(item => item.artists)
        .map(item => ({
          id: item.artists.id,
          artistName: item.artists.artist_name,
          legalName: item.artists.legal_name,
          bio: item.artists.bio,
          ipiNumber: item.artists.ipi_number,
          isniNumber: item.artists.isni_number,
          proAffiliation: item.artists.pro_affiliation,
          publisherName: item.artists.publisher_name,
          profileColor: item.artists.profile_color,
          backgroundOption: item.artists.background_option,
          customBackgroundUrl: item.artists.custom_background_url,
          profileImageUrl: item.artists.profile_image_url,
          bannerImageUrl: item.artists.banner_image_url,
          galleryImages: item.artists.gallery_images,
          website: item.artists.website,
          instagram: item.artists.instagram,
          spotify: item.artists.spotify,
          twitter: item.artists.twitter,
          youtube: item.artists.youtube,
          tiktok: item.artists.tiktok,
          soundcloud: item.artists.soundcloud,
          appleMusic: item.artists.apple_music,
          isActive: item.artists.is_active,
          createdAt: item.artists.created_at,
          updatedAt: item.artists.updated_at,
          managerRole: item.role as 'owner' | 'manager' | 'viewer',
        }));

      setManagedArtists(artists);

      // Auto-select first artist if none selected or selected artist no longer exists
      if (artists.length > 0) {
        const currentlySelected = selectedArtistId && artists.find(a => a.id === selectedArtistId);
        if (!currentlySelected) {
          setSelectedArtistId(artists[0].id);
          localStorage.setItem(SELECTED_ARTIST_KEY, artists[0].id);
        }
      } else {
        setSelectedArtistId(null);
        localStorage.removeItem(SELECTED_ARTIST_KEY);
      }
    } catch (err) {
      console.error('Error in fetchManagedArtists:', err);
      setManagedArtists([]);
    } finally {
      setLoading(false);
    }
  }, [user, selectedArtistId]);

  // Refresh artists
  const refreshArtists = useCallback(async () => {
    setLoading(true);
    await fetchManagedArtists();
  }, [fetchManagedArtists]);

  // Select an artist
  const selectArtist = useCallback((artistId: string) => {
    setSelectedArtistId(artistId);
    localStorage.setItem(SELECTED_ARTIST_KEY, artistId);
  }, []);

  // Create a new artist
  const createArtist = useCallback(async (artistName: string) => {
    if (!user || !supabase) {
      return { ok: false, error: 'Not authenticated' };
    }

    try {
      // Create artist
      const { data: artistData, error: artistError } = await supabase
        .from('artists')
        .insert({ artist_name: artistName })
        .select()
        .single();

      if (artistError || !artistData) {
        return { ok: false, error: artistError?.message || 'Failed to create artist' };
      }

      // Link user to artist as owner
      const { error: linkError } = await supabase
        .from('artist_managers')
        .insert({
          user_id: user.id,
          artist_id: artistData.id,
          role: 'owner',
        });

      if (linkError) {
        return { ok: false, error: linkError.message };
      }

      // Refresh artists list
      await refreshArtists();

      return { ok: true, artistId: artistData.id };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [user, refreshArtists]);

  // Update an artist
  const updateArtist = useCallback(async (artistId: string, updates: Partial<Artist>) => {
    if (!supabase) {
      return { ok: false, error: 'Not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('artists')
        .update({
          artist_name: updates.artistName,
          legal_name: updates.legalName,
          bio: updates.bio,
          ipi_number: updates.ipiNumber,
          isni_number: updates.isniNumber,
          pro_affiliation: updates.proAffiliation,
          publisher_name: updates.publisherName,
          profile_color: updates.profileColor,
          background_option: updates.backgroundOption,
          custom_background_url: updates.customBackgroundUrl,
          profile_image_url: updates.profileImageUrl,
          banner_image_url: updates.bannerImageUrl,
          gallery_images: updates.galleryImages,
          website: updates.website,
          instagram: updates.instagram,
          spotify: updates.spotify,
          twitter: updates.twitter,
          youtube: updates.youtube,
          tiktok: updates.tiktok,
          soundcloud: updates.soundcloud,
          apple_music: updates.appleMusic,
          is_active: updates.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', artistId);

      if (error) {
        return { ok: false, error: error.message };
      }

      // Refresh artists list
      await refreshArtists();

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [refreshArtists]);

  // Delete an artist
  const deleteArtist = useCallback(async (artistId: string) => {
    if (!supabase) {
      return { ok: false, error: 'Not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('artists')
        .delete()
        .eq('id', artistId);

      if (error) {
        return { ok: false, error: error.message };
      }

      // Refresh artists list
      await refreshArtists();

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [refreshArtists]);

  // Load artists on mount and when user changes
  useEffect(() => {
    fetchManagedArtists();
  }, [fetchManagedArtists]);

  // Get the currently selected artist object
  const selectedArtist = useMemo(() => {
    if (!selectedArtistId) return null;
    return managedArtists.find(a => a.id === selectedArtistId) || null;
  }, [selectedArtistId, managedArtists]);

  const value: ArtistContextValue = {
    selectedArtist,
    managedArtists,
    loading,
    selectArtist,
    refreshArtists,
    createArtist,
    updateArtist,
    deleteArtist,
  };

  return <ArtistContext.Provider value={value}>{children}</ArtistContext.Provider>;
}

export function useArtist() {
  const ctx = useContext(ArtistContext);
  if (!ctx) throw new Error('useArtist must be used within ArtistProvider');
  return ctx;
}


