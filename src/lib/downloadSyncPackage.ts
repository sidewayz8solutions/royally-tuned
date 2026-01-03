import type { SyncFiles } from '../types';

// File type to display name mapping
const FILE_LABELS: Record<string, string> = {
  mp3_url: 'master.mp3',
  master_wav_url: 'master.wav',
  acapella_wav_url: 'acapella.wav',
  instrumental_wav_url: 'instrumental.wav',
  splits_sheet_url: 'splits-sheet.pdf',
  one_stop_url: 'one-stop-auth.pdf',
};

/**
 * Download all available sync files
 * Opens each file URL in a new tab for download
 */
export async function downloadAllSyncFiles(files: SyncFiles): Promise<void> {
  const availableFiles = Object.entries(files).filter(
    ([_, url]) => url !== null && url !== undefined
  ) as [keyof SyncFiles, string][];

  if (availableFiles.length === 0) {
    throw new Error('No files available to download');
  }

  // Download each file with a slight delay to prevent browser blocking
  for (const [key, url] of availableFiles) {
    try {
      const filename = FILE_LABELS[key] || 'file';
      await downloadFile(url, filename);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      console.error(`Failed to download ${key}:`, err);
    }
  }
}

/**
 * Download a single file
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (err) {
    // Fallback: open in new tab
    window.open(url, '_blank');
    throw err;
  }
}

/**
 * Generate a shareable link for the sync package
 * In a real implementation, this would create a signed URL or public share link
 */
export function generateShareableLink(
  trackId: string,
  userId: string,
  _expiresIn: number = 7 // days - reserved for future use
): string {
  // This is a placeholder - in production you'd generate a signed URL
  // or create a share token in the database
  const baseUrl = window.location.origin;
  const shareToken = btoa(`${userId}:${trackId}:${Date.now()}`);
  return `${baseUrl}/share/${shareToken}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

