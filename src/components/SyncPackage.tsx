import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Folder, FolderOpen, FileAudio, FileText, Download, Loader2
} from 'lucide-react';
import FileUpload from './FileUpload';
import { downloadAllSyncFiles } from '../lib/downloadSyncPackage';
import type { SyncFiles, SyncChecklist } from '../types';

// Sync package file configuration
const SYNC_PACKAGE_FILES = [
  {
    key: 'mp3' as const,
    label: 'MP3 (Master)',
    filename: 'master.mp3',
    accept: 'audio/mpeg,audio/mp3',
    icon: FileAudio,
    description: 'High quality MP3 with embedded metadata',
  },
  {
    key: 'master_wav' as const,
    label: 'Master WAV',
    filename: 'master.wav',
    accept: 'audio/wav,audio/x-wav',
    icon: FileAudio,
    description: '24-bit WAV master recording',
  },
  {
    key: 'acapella_wav' as const,
    label: 'Acapella WAV',
    filename: 'acapella.wav',
    accept: 'audio/wav,audio/x-wav',
    icon: FileAudio,
    description: 'Vocals only version',
  },
  {
    key: 'instrumental_wav' as const,
    label: 'Instrumental WAV',
    filename: 'instrumental.wav',
    accept: 'audio/wav,audio/x-wav',
    icon: FileAudio,
    description: 'Beat/instrumental only version',
  },
  {
    key: 'splits_sheet' as const,
    label: 'Splits Sheet',
    filename: 'splits-sheet.pdf',
    accept: 'application/pdf,image/*',
    icon: FileText,
    description: 'Signed ownership agreement',
  },
  {
    key: 'one_stop' as const,
    label: 'One-Stop Authorization',
    filename: 'one-stop-auth.pdf',
    accept: 'application/pdf,image/*',
    icon: FileText,
    description: 'Sync licensing authorization',
  },
];

interface SyncPackageProps {
  trackId?: string;
  trackTitle: string;
  files: SyncFiles;
  checklist?: SyncChecklist;
  onFileUpload: (fileType: string, file: File) => Promise<string | null>;
  onFileDelete?: (fileType: string) => Promise<void>;
  readOnly?: boolean;
}

export default function SyncPackage({
  trackTitle,
  files,
  onFileUpload,
  onFileDelete,
  readOnly = false,
}: SyncPackageProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const uploadedCount = Object.values(files).filter(Boolean).length;
  const totalFiles = SYNC_PACKAGE_FILES.length;
  const isComplete = uploadedCount === totalFiles;
  const hasAnyFiles = uploadedCount > 0;

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      await downloadAllSyncFiles(files);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate folder name from track title
  const folderName = trackTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    + '-sync-package';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <FolderOpen className="w-6 h-6 text-gold-400" />
          ) : (
            <Folder className="w-6 h-6 text-gold-400" />
          )}
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              {folderName}/
              {isComplete && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                  COMPLETE
                </span>
              )}
            </h3>
            <p className="text-sm text-white/50">
              {uploadedCount}/{totalFiles} files • Sync Package
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasAnyFiles && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDownloadAll(); }}
              disabled={isDownloading}
              className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloading ? 'Downloading...' : `Download ${isComplete ? 'All' : `(${uploadedCount})`}`}
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(uploadedCount / totalFiles) * 100}%` }}
          className={`h-full rounded-full ${
            isComplete 
              ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
              : 'bg-gradient-to-r from-gold-500 to-gold-400'
          }`}
        />
      </div>

      {/* File list */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 pl-4 border-l-2 border-white/10"
        >
          {SYNC_PACKAGE_FILES.map((fileConfig, index) => {
            const fileUrl = files[`${fileConfig.key}_url` as keyof SyncFiles];

            return (
              <motion.div
                key={fileConfig.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <FileUpload
                  label={fileConfig.label}
                  description={fileConfig.description}
                  accept={fileConfig.accept}
                  currentFileUrl={fileUrl}
                  currentFileName={fileConfig.filename}
                  onUpload={(file) => onFileUpload(fileConfig.key, file)}
                  onDelete={onFileDelete ? () => onFileDelete(fileConfig.key) : undefined}
                  disabled={readOnly}
                  maxSize={100}
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

