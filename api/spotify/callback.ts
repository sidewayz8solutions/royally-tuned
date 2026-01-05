import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { code, state, error } = req.query || {};
    if (error) {
      console.error('spotify callback error', error);
      return res.status(400).send('Spotify auth error');
    }
    if (!code || !state) return res.status(400).send('Missing code or state');

    const parsed = JSON.parse(Buffer.from(state as string, 'base64').toString('utf-8')) as { userId?: string };
    const userId = parsed?.userId;
    if (!userId) return res.status(400).send('Invalid state');

    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REDIRECT_URI) {
      return res.status(500).json({ error: 'Spotify not configured on server' });
    }

    // Exchange code for tokens
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI as string,
    });

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: params.toString(),
    });

    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('spotify token exchange failed', tokenJson);
      return res.status(500).json({ error: 'Token exchange failed' });
    }

    const { access_token, refresh_token, expires_in, scope } = tokenJson;
    const expires_at = Math.floor(Date.now() / 1000) + Number(expires_in || 0);

    // Persist tokens to DB (upsert by user_id)
    await supabaseAdmin.from('spotify_tokens').upsert({ user_id: userId, access_token, refresh_token, scope, expires_at }, { onConflict: 'user_id' });

    // Redirect back to app
    const origin = process.env.PUBLIC_APP_URL || 'http://localhost:5173';
    res.writeHead(302, { Location: `${origin}/app?spotify=connected` });
    return res.end();
  } catch (e) {
    console.error('spotify callback error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
