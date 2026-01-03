import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { SyncFiles } from '../types';

// File type to filename mapping
const FILE_NAMES: Record<string, string> = {
  mp3: 'master.mp3',
  master_wav: 'master.wav',
  acapella_wav: 'acapella.wav',
  instrumental_wav: 'instrumental.wav',
  splits_sheet: 'splits-sheet.pdf',
  one_stop: 'one-stop-auth.pdf',
};

interface UseSyncFileUploadOptions {
  userId: string;
  trackId: string;
  onSuccess?: (fileType: string, url: string) => void;
  onError?: (error: Error) => void;
}

export function useSyncFileUpload({
  userId,
  trackId,
  onSuccess,
  onError,
}: UseSyncFileUploadOptions) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (fileType: string, file: File): Promise<string | null> => {
    if (!supabase) {
      setError('Supabase not configured');
      return null;
    }

    const filename = FILE_NAMES[fileType];
    if (!filename) {
      setError(`Unknown file type: ${fileType}`);
      return null;
    }

    // Build storage path: {userId}/{trackId}/{filename}
    const storagePath = `${userId}/${trackId}/${filename}`;

    setUploading(fileType);
    setError(null);

    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('sync-files')
        .upload(storagePath, file, {
          upsert: true, // Replace if exists
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL (or signed URL for private bucket)
      const { data: urlData } = supabase.storage
        .from('sync-files')
        .getPublicUrl(storagePath);

      const publicUrl = urlData.publicUrl;

      // Update the track's sync_files in database
      const fileKey = `${fileType}_url` as keyof SyncFiles;
      const checklistKey = `${fileType}_ready`;

      // Try using RPC function first
      await supabase
        .from('tracks')
        .update({
          sync_files: supabase.rpc('jsonb_set_value', {
            target: 'sync_files',
            path: `{${fileKey}}`,
            value: publicUrl,
          }),
          [`sync_checklist->${checklistKey}`]: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', trackId);

      // Try RPC update, fall back to simple update
      try {
        await supabase.rpc('update_track_sync_file', {
          p_track_id: trackId,
          p_file_type: fileType,
          p_file_url: publicUrl,
        });
      } catch {
        // Fallback to simple update if RPC doesn't exist
        await supabase
          .from('tracks')
          .update({
            sync_files: {
              [`${fileType}_url`]: publicUrl,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', trackId);
      }

      onSuccess?.(fileType, publicUrl);
      return publicUrl;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
      return null;
    } finally {
      setUploading(null);
    }
  }, [userId, trackId, onSuccess, onError]);

  const deleteFile = useCallback(async (fileType: string): Promise<void> => {
    if (!supabase) {
      setError('Supabase not configured');
      return;
    }

    const filename = FILE_NAMES[fileType];
    if (!filename) return;

    const storagePath = `${userId}/${trackId}/${filename}`;

    try {
      await supabase.storage
        .from('sync-files')
        .remove([storagePath]);

      // Clear the URL in database
      await supabase
        .from('tracks')
        .update({
          [`sync_files->${fileType}_url`]: null,
          [`sync_checklist->${fileType}_ready`]: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', trackId);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
    }
  }, [userId, trackId, onError]);

  return {
    uploadFile,
    deleteFile,
    uploading,
    error,
    isUploading: uploading !== null,
  };
}

