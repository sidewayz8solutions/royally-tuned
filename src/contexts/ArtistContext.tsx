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
      console.log('[ArtistContext] Fetching artists for user:', user.id);

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

      console.log('[ArtistContext] Query result:', { data, error });

      if (error) {
        console.error('[ArtistContext] Error fetching managed artists:', error);
        setManagedArtists([]);
        return;
      }

      const artists: ManagedArtist[] = (data || [])
        .filter(item => item.artists)
        .map(item => {
          // Supabase returns nested objects, handle both array and object cases
          const artist = Array.isArray(item.artists) ? item.artists[0] : item.artists;
          return {
            id: artist.id,
            artistName: artist.artist_name,
            legalName: artist.legal_name,
            bio: artist.bio,
            ipiNumber: artist.ipi_number,
            isniNumber: artist.isni_number,
            proAffiliation: artist.pro_affiliation,
            publisherName: artist.publisher_name,
            profileColor: artist.profile_color,
            backgroundOption: artist.background_option,
            customBackgroundUrl: artist.custom_background_url,
            profileImageUrl: artist.profile_image_url,
            bannerImageUrl: artist.banner_image_url,
            galleryImages: artist.gallery_images,
            website: artist.website,
            instagram: artist.instagram,
            spotify: artist.spotify,
            twitter: artist.twitter,
            youtube: artist.youtube,
            tiktok: artist.tiktok,
            soundcloud: artist.soundcloud,
            appleMusic: artist.apple_music,
            isActive: artist.is_active,
            createdAt: artist.created_at,
            updatedAt: artist.updated_at,
            managerRole: item.role as 'owner' | 'manager' | 'viewer',
          };
        });

      console.log('[ArtistContext] Processed artists:', artists);
      setManagedArtists(artists);

      // Auto-select first artist if none selected or selected artist no longer exists
      if (artists.length > 0) {
        const currentlySelected = selectedArtistId && artists.find(a => a.id === selectedArtistId);
        if (!currentlySelected) {
          console.log('[ArtistContext] Auto-selecting first artist:', artists[0].id);
          setSelectedArtistId(artists[0].id);
          localStorage.setItem(SELECTED_ARTIST_KEY, artists[0].id);
        } else {
          console.log('[ArtistContext] Artist already selected:', currentlySelected.id);
        }
      } else {
        console.log('[ArtistContext] No artists found, clearing selection');
        setSelectedArtistId(null);
        localStorage.removeItem(SELECTED_ARTIST_KEY);
      }
    } catch (err) {
      console.error('[ArtistContext] Error in fetchManagedArtists:', err);
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

  // Create a new artist (trigger automatically adds user as owner in artist_managers)
  const createArtist = useCallback(async (artistName: string) => {
    if (!user || !supabase) {
      return { ok: false, error: 'Not authenticated' };
    }

    try {
      // Simple insert - the database trigger handle_new_artist()
      // automatically creates the artist_managers record
      const { data: artistData, error: insertError } = await supabase
        .from('artists')
        .insert({ artist_name: artistName })
        .select('id')
        .single();

      if (insertError || !artistData) {
        console.error('[ArtistContext] Insert error:', insertError);
        return { ok: false, error: insertError?.message || 'Failed to create artist' };
      }

      // Refresh artists list
      await refreshArtists();

      return { ok: true, artistId: artistData.id };
    } catch (err) {
      console.error('[ArtistContext] createArtist error:', err);
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


