import { useState } from 'react';
import { useArtist } from '../contexts/ArtistContext';
import { ChevronDown, Plus, User } from 'lucide-react';

export default function ArtistSelector() {
  const { selectedArtist, managedArtists, selectArtist, createArtist } = useArtist();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newArtistName, setNewArtistName] = useState('');
  const [error, setError] = useState('');

  const handleSelectArtist = (artistId: string) => {
    selectArtist(artistId);
    setIsOpen(false);
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtistName.trim()) {
      setError('Artist name is required');
      return;
    }

    const result = await createArtist(newArtistName.trim());
    if (result.ok) {
      setNewArtistName('');
      setIsCreating(false);
      setError('');
      if (result.artistId) {
        selectArtist(result.artistId);
      }
    } else {
      setError(result.error || 'Failed to create artist');
    }
  };

  // Don't show selector if user only has one artist (independent artist mode)
  if (managedArtists.length <= 1) {
    return null;
  }

  return (
    <div className="relative">
      {/* Selected Artist Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {selectedArtist?.profileImageUrl ? (
          <img
            src={selectedArtist.profileImageUrl}
            alt={selectedArtist.artistName}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: selectedArtist?.profileColor || '#8B5CF6' }}
          >
            {selectedArtist?.artistName?.charAt(0).toUpperCase() || 'A'}
          </div>
        )}
        <span className="font-medium text-gray-900 dark:text-white">
          {selectedArtist?.artistName || 'Select Artist'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false);
              setIsCreating(false);
              setError('');
            }}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
            {/* Artist List */}
            <div className="max-h-64 overflow-y-auto">
              {managedArtists.map((artist) => (
                <button
                  key={artist.id}
                  onClick={() => handleSelectArtist(artist.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedArtist?.id === artist.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                  }`}
                >
                  {artist.profileImageUrl ? (
                    <img
                      src={artist.profileImageUrl}
                      alt={artist.artistName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      style={{ backgroundColor: artist.profileColor || '#8B5CF6' }}
                    >
                      {artist.artistName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-white">{artist.artistName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{artist.managerRole}</div>
                  </div>
                  {selectedArtist?.id === artist.id && (
                    <div className="w-2 h-2 rounded-full bg-purple-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Create New Artist */}
            <div className="border-t border-gray-200 dark:border-gray-700">
              {isCreating ? (
                <form onSubmit={handleCreateArtist} className="p-4">
                  <input
                    type="text"
                    value={newArtistName}
                    onChange={(e) => setNewArtistName(e.target.value)}
                    placeholder="Artist name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    autoFocus
                  />
                  {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setNewArtistName('');
                        setError('');
                      }}
                      className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-purple-600 dark:text-purple-400 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add New Artist</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

