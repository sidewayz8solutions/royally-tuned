import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileAudio, FileText, Check, AlertCircle,
  Loader2, Download, Trash2
} from 'lucide-react';

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  currentFileUrl?: string | null;
  currentFileName?: string;
  onUpload: (file: File) => Promise<string | null>; // Returns URL on success
  onDelete?: () => Promise<void>;
  label: string;
  description?: string;
  disabled?: boolean;
}

export default function FileUpload({
  accept = '*/*',
  maxSize = 100,
  currentFileUrl,
  currentFileName,
  onUpload,
  onDelete,
  label,
  description,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentFileUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (filename?: string) => {
    if (!filename) return FileText;
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['wav', 'mp3', 'aiff', 'flac'].includes(ext || '')) return FileAudio;
    return FileText;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File too large. Maximum size is ${maxSize}MB`;
    }
    return null;
  };

  const handleUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress (actual progress would come from upload)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const url = await onUpload(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (url) {
        setUploadedUrl(url);
        setTimeout(() => setUploadProgress(0), 500);
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [disabled]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      await onDelete();
      setUploadedUrl(null);
    } catch (err) {
      setError('Failed to delete file');
    }
  };

  const FileIcon = getFileIcon(currentFileName || uploadedUrl || undefined);
  const hasFile = !!uploadedUrl;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/80">{label}</label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !hasFile && inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-4 transition-all
          ${isDragging ? 'border-royal-400 bg-royal-500/10' : 'border-white/20'}
          ${hasFile ? 'bg-green-500/5 border-green-500/30' : 'hover:border-white/40'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 py-2"
            >
              <Loader2 className="w-8 h-8 text-royal-400 animate-spin" />
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  className="h-full bg-royal-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-sm text-white/60">Uploading... {uploadProgress}%</span>
            </motion.div>
          ) : hasFile ? (
            <motion.div
              key="uploaded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-green-500/20 rounded-lg">
                <FileIcon className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">
                  {currentFileName || 'File uploaded'}
                </p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Uploaded
                </p>
              </div>
              <div className="flex gap-2">
                {uploadedUrl && (
                  <a
                    href={uploadedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-white/60" />
                  </a>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 py-2"
            >
              <Upload className={`w-8 h-8 ${isDragging ? 'text-royal-400' : 'text-white/40'}`} />
              <div className="text-center">
                <p className="text-sm text-white/70">
                  {isDragging ? 'Drop file here' : 'Drag & drop or click to upload'}
                </p>
                {description && (
                  <p className="text-xs text-white/40 mt-1">{description}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

