import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Safely extract userId (handle string | string[] | undefined)
        const rawUserId = req.query?.userId;
        const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
        if (!userId) return res.status(400).send('Missing userId');

        if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_REDIRECT_URI) {
            return res.status(500).json({ error: 'Spotify not configured on server' });
        }

        // Create a simple state containing the userId and a short nonce
        const state = Buffer.from(JSON.stringify({ userId, t: Date.now() })).toString('base64');

        const params = new URLSearchParams({
            client_id: process.env.SPOTIFY_CLIENT_ID as string,
            response_type: 'code',
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI as string,
            scope: 'user-read-email user-read-recently-played user-top-read',
            state,
            show_dialog: 'true',
        });

        const url = `https://accounts.spotify.com/authorize?${params.toString()}`;
        // Redirect user to Spotify authorization
        return res.redirect(302, url);
    } catch (e) {
        console.error('spotify auth error', e);
        return res.status(500).json({ error: 'Internal error' });
    }
}
