# Example: Updating Dashboard for Multi-Artist Support

## Changes Required

### 1. Import the Artist Context

```tsx
// Add this import
import { useArtist } from '../contexts/ArtistContext';
```

### 2. Get Selected Artist from Context

```tsx
export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshUser, user } = useAuth();
  const { selectedArtist } = useArtist(); // ADD THIS LINE
  const [loading, setLoading] = useState(true);
  // ... rest of state
```

### 3. Update Data Fetching to Use Artist ID

**Before:**
```tsx
const [tracksResult, earningsResult, notificationsResult] = await Promise.allSettled([
  client
    .from('tracks')
    .select('*')
    .eq('user_id', user.id)  // OLD: using user_id
    .eq('is_active', true),
  client
    .from('earnings')
    .select('*, tracks(title)')
    .eq('user_id', user.id)  // OLD: using user_id
    .order('created_at', { ascending: false })
    .limit(50),
  client
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)  // OLD: using user_id
    .order('created_at', { ascending: false })
    .limit(10),
]);
```

**After:**
```tsx
// Don't fetch if no artist is selected
if (!selectedArtist) {
  setLoading(false);
  return;
}

const [tracksResult, earningsResult, notificationsResult] = await Promise.allSettled([
  client
    .from('tracks')
    .select('*')
    .eq('artist_id', selectedArtist.id)  // NEW: using artist_id
    .eq('is_active', true),
  client
    .from('earnings')
    .select('*, tracks(title)')
    .eq('artist_id', selectedArtist.id)  // NEW: using artist_id
    .order('created_at', { ascending: false })
    .limit(50),
  client
    .from('notifications')
    .select('*')
    .eq('artist_id', selectedArtist.id)  // NEW: using artist_id
    .order('created_at', { ascending: false })
    .limit(10),
]);
```

### 4. Update useEffect Dependencies

```tsx
useEffect(() => {
  if (!user || !selectedArtist) {  // ADD selectedArtist check
    setLoading(false);
    return;
  }
  // ... fetch data
}, [user, selectedArtist]);  // ADD selectedArtist to dependencies
```

### 5. Show Artist Name in Header

```tsx
<div className="text-center mb-12">
  <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
    {selectedArtist?.artistName || 'Dashboard'}
  </h1>
  <p className="text-xl text-gray-400">
    Track your royalties, streams, and earnings
  </p>
</div>
```

### 6. Handle No Artist Selected State

```tsx
// Add this early return after hooks
if (!selectedArtist) {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center py-20">
        <Music className="w-16 h-16 mx-auto mb-4 text-gray-500" />
        <h2 className="text-2xl font-bold text-white mb-2">No Artist Selected</h2>
        <p className="text-gray-400">
          Please select an artist from the dropdown to view their dashboard.
        </p>
      </div>
    </div>
  );
}
```

## Complete Updated Code Snippet

```tsx
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Music, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { FadeInOnScroll, StaggerContainer, StaggerItem, TiltCard } from '../components/animations';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useArtist } from '../contexts/ArtistContext'; // NEW
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshUser, user } = useAuth();
  const { selectedArtist } = useArtist(); // NEW
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const supabaseMissing = !supabase;

  // Handle no artist selected
  if (!selectedArtist) {
    return (
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center py-20">
          <Music className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="text-2xl font-bold text-white mb-2">No Artist Selected</h2>
          <p className="text-gray-400">
            Please select an artist from the dropdown to view their dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Fetch data with artist_id instead of user_id
  useEffect(() => {
    if (!user || !selectedArtist || !supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [tracksResult, earningsResult, notificationsResult] = await Promise.allSettled([
          supabase
            .from('tracks')
            .select('*')
            .eq('artist_id', selectedArtist.id) // CHANGED
            .eq('is_active', true),
          supabase
            .from('earnings')
            .select('*, tracks(title)')
            .eq('artist_id', selectedArtist.id) // CHANGED
            .order('created_at', { ascending: false })
            .limit(50),
          supabase
            .from('notifications')
            .select('*')
            .eq('artist_id', selectedArtist.id) // CHANGED
            .order('created_at', { ascending: false })
            .limit(10),
        ]);

        if (!isMounted) return;

        // ... rest of data processing
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user, selectedArtist]); // ADDED selectedArtist

  // ... rest of component
}
```

## Testing the Changes

1. **Test as Independent Artist (1 artist)**
   - Should work exactly as before
   - No artist selector visible
   - Data loads normally

2. **Test as Manager (2+ artists)**
   - Artist selector appears
   - Switching artists updates dashboard
   - Each artist shows their own data
   - No data leakage between artists

3. **Test Edge Cases**
   - No artist selected (shows message)
   - Artist with no data (shows empty state)
   - Switching artists while loading

