import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, artistName } = req.body;

    if (!userId || !artistName) {
      return res.status(400).json({ error: 'Missing userId or artistName' });
    }

    // Verify user exists
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !userData?.user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create artist profile
    const { data: artistData, error: artistError } = await supabaseAdmin
      .from('artists')
      .insert({
        artist_name: artistName,
      })
      .select()
      .single();

    if (artistError || !artistData) {
      console.error('Error creating artist:', artistError);
      return res.status(500).json({ error: 'Failed to create artist' });
    }

    // Link user to artist as owner
    const { error: linkError } = await supabaseAdmin
      .from('artist_managers')
      .insert({
        user_id: userId,
        artist_id: artistData.id,
        role: 'owner',
      });

    if (linkError) {
      console.error('Error linking user to artist:', linkError);
      // Clean up the artist if linking fails
      await supabaseAdmin.from('artists').delete().eq('id', artistData.id);
      return res.status(500).json({ error: 'Failed to link artist to user' });
    }

    return res.status(200).json({
      success: true,
      artist: {
        id: artistData.id,
        artistName: artistData.artist_name,
      },
    });
  } catch (error) {
    console.error('Error in create artist endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

