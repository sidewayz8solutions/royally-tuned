import { CheckCircle2, Circle, Upload, FileAudio, FileText, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import type { SyncChecklist as SyncChecklistType, SyncFiles } from '../types';
import { SYNC_CHECKLIST_ITEMS } from '../types';

interface SyncChecklistProps {
  checklist: SyncChecklistType;
  files?: SyncFiles;
  onChange?: (key: keyof SyncChecklistType, value: boolean) => void;
  onFileUpload?: (key: keyof SyncFiles) => void;
  readOnly?: boolean;
  compact?: boolean;
}

// Icon mapping for each checklist item
const getIcon = (key: keyof SyncChecklistType) => {
  switch (key) {
    case 'mp3_ready':
    case 'master_wav_ready':
    case 'acapella_wav_ready':
    case 'instrumental_wav_ready':
      return FileAudio;
    case 'splits_sheet_ready':
      return FileText;
    case 'one_stop_ready':
      return Shield;
    default:
      return Circle;
  }
};

export default function SyncChecklist({
  checklist,
  files,
  onChange,
  onFileUpload,
  readOnly = false,
  compact = false,
}: SyncChecklistProps) {
  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-royal-400" />
          Sync Ready Checklist
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60">
            {completedCount}/{totalCount} complete
          </span>
          {completedCount === totalCount && (
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
              SYNC READY
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            completedCount === totalCount
              ? 'bg-gradient-to-r from-green-500 to-emerald-400'
              : 'bg-gradient-to-r from-royal-500 to-royal-400'
          }`}
        />
      </div>

      {/* Checklist items */}
      <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {SYNC_CHECKLIST_ITEMS.map((item, index) => {
          const isComplete = checklist[item.key];
          const Icon = getIcon(item.key);
          const hasFile = files && item.fileKey && files[item.fileKey];

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isComplete
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-white/5 border border-white/10 hover:border-white/20'
              } ${!readOnly && 'cursor-pointer'}`}
              onClick={() => !readOnly && onChange?.(item.key, !isComplete)}
            >
              {/* Checkbox */}
              <div className={`flex-shrink-0 ${isComplete ? 'text-green-400' : 'text-white/30'}`}>
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>

              {/* Icon */}
              <Icon className={`w-5 h-5 flex-shrink-0 ${isComplete ? 'text-green-400' : 'text-white/40'}`} />

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isComplete ? 'text-green-300' : 'text-white'}`}>
                  {item.label}
                </p>
                {!compact && (
                  <p className="text-xs text-white/50 truncate">{item.description}</p>
                )}
              </div>

              {/* Upload button (future feature) */}
              {!readOnly && onFileUpload && item.fileKey && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileUpload(item.fileKey!);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    hasFile
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-white/10 text-white/50 hover:bg-white/20'
                  }`}
                  title={hasFile ? 'File uploaded' : 'Upload file'}
                >
                  <Upload className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

