# Multi-Artist Management System

## Overview

The Royally Tuned platform now supports **two modes of operation**:

1. **Independent Artist Mode** - Individual artists managing their own profile (original functionality)
2. **Manager/Admin Mode** - Record labels, managers, and administrators managing multiple artists

This dual-mode system preserves all existing features for independent artists while adding powerful multi-artist management capabilities.

## Architecture

### Database Schema

#### New Tables

1. **`artists`** - Stores artist profiles separately from user accounts
   - Contains all artist-specific information (name, bio, social links, etc.)
   - Can be managed by one or more users
   - Replaces the direct user-to-profile relationship for artist data

2. **`artist_managers`** - Junction table linking users to artists
   - `user_id` - The manager/user
   - `artist_id` - The artist being managed
   - `role` - Permission level: `owner`, `manager`, or `viewer`

#### Updated Tables

All existing tables now support both modes:
- `tracks` - Added `artist_id` column (maintains `user_id` for backward compatibility)
- `checklist_items` - Added `artist_id` column
- `spotify_tokens` - Added `artist_id` column
- `activity_log` - Added `artist_id` column

#### User Roles

Added `user_role` enum to `profiles` table:
- `artist` - Independent artist (default)
- `manager` - Manages multiple artists
- `admin` - Administrative access
- `label` - Record label managing multiple artists

### Row Level Security (RLS)

Updated RLS policies allow:
- Users to access data for artists they manage
- Maintains security isolation between different artists
- Preserves existing permissions for independent artists

## Frontend Components

### ArtistContext

New context provider that manages:
- Currently selected artist
- List of all managed artists
- CRUD operations for artists
- Artist selection state

**Usage:**
```tsx
import { useArtist } from '../contexts/ArtistContext';

function MyComponent() {
  const { selectedArtist, managedArtists, selectArtist } = useArtist();
  
  // selectedArtist contains the currently active artist
  // managedArtists is an array of all artists the user manages
}
```

### ArtistSelector Component

Dropdown component that appears in the navigation when a user manages multiple artists:
- Shows all managed artists with their profile images
- Allows quick switching between artists
- Includes "Add New Artist" functionality
- Automatically hides for independent artists (single artist)

### Provider Hierarchy

```tsx
<AuthProvider>
  <ArtistProvider>
    <App />
  </ArtistProvider>
</AuthProvider>
```

## Migration Strategy

### For Existing Users

The migration script (`001_multi_artist_support.sql`) automatically:
1. Creates an artist profile for each existing user
2. Links the user to their artist profile as "owner"
3. Updates all existing tracks, checklist items, etc. to reference the new artist
4. Preserves all existing data and relationships

### Running the Migration

1. **Backup your database** before running any migration
2. Run the migration in Supabase SQL Editor:
   ```sql
   -- Run the migration file
   \i supabase/migrations/001_multi_artist_support.sql
   
   -- Execute the migration function
   SELECT migrate_existing_users_to_artists();
   ```

## Usage Scenarios

### Scenario 1: Independent Artist (No Changes)

An independent artist continues to use the platform exactly as before:
- They have one artist profile (automatically created)
- The ArtistSelector doesn't appear (only one artist)
- All features work identically to the original system

### Scenario 2: Manager with Multiple Artists

A manager or label representative can:
1. Create multiple artist profiles
2. Switch between artists using the ArtistSelector
3. Manage tracks, registrations, and data for each artist separately
4. Invite other team members to manage specific artists

### Scenario 3: Artist Transitioning to Manager

An existing independent artist who wants to manage other artists:
1. Their existing artist profile is preserved
2. They can create additional artist profiles
3. The ArtistSelector appears once they have 2+ artists
4. They can switch between their own profile and managed artists

## API Endpoints

### Create Artist
```
POST /api/artists/create
Body: { userId: string, artistName: string }
```

Creates a new artist profile and links it to the user as owner.

## Best Practices

### For Independent Artists
- No action required - the system works exactly as before
- Your existing data is automatically migrated to the new structure

### For Managers/Labels
1. Create separate artist profiles for each artist you manage
2. Use descriptive artist names to easily identify them
3. Set appropriate role permissions when adding team members
4. Switch to the correct artist before adding tracks or making changes

### For Developers
1. Always use `selectedArtist.id` when creating new records
2. Check `managedArtists.length` to determine if multi-artist UI should show
3. Use the `useArtist()` hook to access artist context
4. Maintain backward compatibility by supporting both `user_id` and `artist_id`

## Future Enhancements

Potential additions to the multi-artist system:
- Team collaboration (multiple users managing the same artist)
- Permission granularity (read-only access, specific feature access)
- Artist invitation system (invite artists to claim their profiles)
- Bulk operations across multiple artists
- Artist-specific analytics and reporting
- White-label customization per artist

## Troubleshooting

### ArtistSelector not appearing
- Check that the user has multiple artists in `artist_managers` table
- Verify `ArtistProvider` is wrapping the app in `main.tsx`

### Data not showing for selected artist
- Ensure records have `artist_id` set correctly
- Check RLS policies are properly configured
- Verify the user has appropriate permissions in `artist_managers`

### Migration issues
- Ensure all existing users have profiles before running migration
- Check for foreign key constraint violations
- Verify the `handle_new_user()` trigger is updated

