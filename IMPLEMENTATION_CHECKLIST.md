# Multi-Artist Implementation Checklist

## ✅ Completed

### Database Schema
- [x] Created `artists` table for artist profiles
- [x] Created `artist_managers` junction table
- [x] Added `user_role` enum and column to profiles
- [x] Added `artist_id` columns to existing tables (tracks, checklist_items, spotify_tokens, activity_log)
- [x] Created migration script with backward compatibility
- [x] Updated RLS policies for multi-artist access
- [x] Created helper functions (create_artist_for_user, get_user_artists)
- [x] Updated handle_new_user trigger

### Frontend Context & Components
- [x] Created `ArtistContext` for managing selected artist
- [x] Created `ArtistSelector` component for switching artists
- [x] Updated TypeScript types (Artist, ManagedArtist, UserRole, etc.)
- [x] Integrated ArtistProvider into app hierarchy
- [x] Added ArtistSelector to AppNav

### API Endpoints
- [x] Created `/api/artists/create` endpoint

### Documentation
- [x] Created comprehensive MULTI_ARTIST_GUIDE.md
- [x] Created architecture diagram
- [x] Created implementation checklist

## 🔄 Next Steps (To Complete Implementation)

### 1. Database Migration
```bash
# Run in Supabase SQL Editor
\i supabase/migrations/001_multi_artist_support.sql
SELECT migrate_existing_users_to_artists();
```

### 2. Update Existing Pages to Use Artist Context

#### Dashboard Page
- [ ] Update to use `selectedArtist.id` instead of `user.id`
- [ ] Filter data by `artist_id`
- [ ] Show artist name in header

#### Tracks Page
- [ ] Update track creation to include `artist_id`
- [ ] Filter tracks by `selectedArtist.id`
- [ ] Update track queries

#### Profile Page
- [ ] Update to edit `selectedArtist` data instead of user profile
- [ ] Save changes to artists table
- [ ] Handle artist-specific settings

#### Checklist Page
- [ ] Filter checklist items by `artist_id`
- [ ] Create new items with `artist_id`

#### Toolkit Page
- [ ] Update calculations to use artist-specific data

### 3. Additional API Endpoints Needed

- [ ] `/api/artists/update` - Update artist profile
- [ ] `/api/artists/delete` - Delete artist (owner only)
- [ ] `/api/artists/list` - Get all artists for a user
- [ ] `/api/artists/invite` - Invite team member to manage artist
- [ ] `/api/artists/remove-manager` - Remove manager from artist

### 4. UI Enhancements

- [ ] Add "Manage Artists" page for managers
  - View all artists
  - Edit artist details
  - Manage team members
  - View artist-specific analytics

- [ ] Add role indicator badges
  - Show "Owner", "Manager", or "Viewer" badge
  - Different permissions based on role

- [ ] Add onboarding flow for managers
  - Prompt to set user_role on first login
  - Guide through creating first artist

- [ ] Add artist settings page
  - Artist-specific customization
  - Team management
  - Transfer ownership

### 5. Update Existing Components

Files that need updates to support artist context:

```
src/pages/Dashboard.tsx
src/pages/Tracks.tsx
src/pages/Profile.tsx
src/pages/Checklist.tsx
src/pages/Toolkit.tsx
src/pages/Registrations.tsx
```

For each file:
1. Import `useArtist` hook
2. Get `selectedArtist` from context
3. Use `selectedArtist.id` for queries
4. Handle case where no artist is selected

### 6. Testing Checklist

- [ ] Test independent artist flow (single artist)
  - Verify ArtistSelector doesn't appear
  - Verify all features work as before
  - Verify data migration worked correctly

- [ ] Test manager flow (multiple artists)
  - Create multiple artists
  - Switch between artists
  - Verify data isolation
  - Test permissions (owner vs manager vs viewer)

- [ ] Test edge cases
  - User with no artists
  - Deleting last artist
  - Switching artists mid-operation
  - RLS policy enforcement

### 7. Security Audit

- [ ] Verify RLS policies prevent unauthorized access
- [ ] Test that managers can't access other artists' data
- [ ] Verify role-based permissions work correctly
- [ ] Test API endpoints require authentication
- [ ] Ensure sensitive operations require owner role

### 8. Performance Optimization

- [ ] Add database indexes for artist queries
- [ ] Optimize artist switching (cache data)
- [ ] Lazy load artist data
- [ ] Add pagination for large artist lists

## Example Code Updates

### Before (Independent Artist)
```tsx
// Old way - directly using user.id
const { data: tracks } = await supabase
  .from('tracks')
  .select('*')
  .eq('user_id', user.id);
```

### After (Multi-Artist Support)
```tsx
// New way - using selectedArtist.id
import { useArtist } from '../contexts/ArtistContext';

function TracksPage() {
  const { selectedArtist } = useArtist();
  
  const { data: tracks } = await supabase
    .from('tracks')
    .select('*')
    .eq('artist_id', selectedArtist?.id);
}
```

## Deployment Steps

1. **Backup Production Database**
2. **Run Migration in Staging**
3. **Test All Features in Staging**
4. **Deploy Frontend Changes**
5. **Run Migration in Production**
6. **Monitor for Issues**
7. **Communicate Changes to Users**

## Rollback Plan

If issues occur:
1. Revert frontend deployment
2. Keep database changes (they're backward compatible)
3. Fix issues in development
4. Redeploy when ready

The migration is designed to be non-breaking - existing functionality continues to work via `user_id` columns.

