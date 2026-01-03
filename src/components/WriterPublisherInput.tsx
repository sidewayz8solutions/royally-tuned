import { useState } from 'react';
import { Plus, Trash2, User, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WriterDetailed, PublisherDetailed, PROAffiliation } from '../types';

const PRO_OPTIONS: PROAffiliation[] = [
  'ASCAP', 'BMI', 'SESAC', 'GMR', 'SOCAN', 'PRS', 'GEMA', 'APRA', 'Other', 'None'
];

interface WriterPublisherInputProps {
  writers: WriterDetailed[];
  publishers: PublisherDetailed[];
  onWritersChange: (writers: WriterDetailed[]) => void;
  onPublishersChange: (publishers: PublisherDetailed[]) => void;
  readOnly?: boolean;
}

export default function WriterPublisherInput({
  writers,
  publishers,
  onWritersChange,
  onPublishersChange,
  readOnly = false,
}: WriterPublisherInputProps) {
  const [activeTab, setActiveTab] = useState<'writers' | 'publishers'>('writers');

  const addWriter = () => {
    onWritersChange([...writers, { name: '', pro: 'None' }]);
  };

  const addPublisher = () => {
    onPublishersChange([...publishers, { name: '', pro: 'None' }]);
  };

  const updateWriter = (index: number, field: keyof WriterDetailed, value: string) => {
    const updated = [...writers];
    updated[index] = { ...updated[index], [field]: value };
    onWritersChange(updated);
  };

  const updatePublisher = (index: number, field: keyof PublisherDetailed, value: string) => {
    const updated = [...publishers];
    updated[index] = { ...updated[index], [field]: value };
    onPublishersChange(updated);
  };

  const removeWriter = (index: number) => {
    onWritersChange(writers.filter((_, i) => i !== index));
  };

  const removePublisher = (index: number) => {
    onPublishersChange(publishers.filter((_, i) => i !== index));
  };

  const renderPersonRow = (
    person: WriterDetailed | PublisherDetailed,
    index: number,
    type: 'writer' | 'publisher'
  ) => {
    const isWriter = type === 'writer';
    const update = isWriter ? updateWriter : updatePublisher;
    const remove = isWriter ? removeWriter : removePublisher;

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="flex gap-2 items-start"
      >
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Name */}
          <input
            type="text"
            value={person.name}
            onChange={(e) => update(index, 'name', e.target.value)}
            placeholder={isWriter ? "Writer name" : "Publisher name"}
            className="input-field text-sm"
            disabled={readOnly}
          />
          {/* PRO */}
          <select
            value={person.pro}
            onChange={(e) => update(index, 'pro', e.target.value as PROAffiliation)}
            className="input-field text-sm"
            disabled={readOnly}
          >
            {PRO_OPTIONS.map((pro) => (
              <option key={pro} value={pro}>{pro}</option>
            ))}
          </select>
          {/* IPI (optional) */}
          <input
            type="text"
            value={person.ipi || ''}
            onChange={(e) => update(index, 'ipi', e.target.value)}
            placeholder="IPI # (optional)"
            className="input-field text-sm"
            disabled={readOnly}
          />
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={() => remove(index)}
            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('writers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'writers'
              ? 'bg-royal-500/20 text-royal-400'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          Writers ({writers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('publishers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'publishers'
              ? 'bg-royal-500/20 text-royal-400'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Publishers ({publishers.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {activeTab === 'writers' ? (
            <>
              {writers.map((w, i) => renderPersonRow(w, i, 'writer'))}
              {!readOnly && (
                <button type="button" onClick={addWriter} className="btn-secondary w-full py-2 text-sm">
                  <Plus className="w-4 h-4 mr-1 inline" /> Add Writer
                </button>
              )}
            </>
          ) : (
            <>
              {publishers.map((p, i) => renderPersonRow(p, i, 'publisher'))}
              {!readOnly && (
                <button type="button" onClick={addPublisher} className="btn-secondary w-full py-2 text-sm">
                  <Plus className="w-4 h-4 mr-1 inline" /> Add Publisher
                </button>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

