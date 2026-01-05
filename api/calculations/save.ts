import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_supabaseAdmin.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { userId, payload } = (req.body as any) || {};
        if (!userId || !payload) return res.status(400).json({ error: 'Missing userId or payload' });

        // Verify user exists
        const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (userErr || !userData?.user) return res.status(400).json({ error: 'User not found' });

        // Insert calculation records per platform for easier querying
        const platforms = payload.platformStreams || {};
        const inserts = Object.keys(platforms).map((plat) => ({
            user_id: userId,
            platform: plat,
            streams: Number(platforms[plat] || 0),
            rate_per_stream: Number((payload.totals?.median || 0) / Math.max(1, payload.totalStreams || 1)),
            estimated_earnings: Number((payload.totals?.median || 0) * ((platforms[plat] || 0) / Math.max(1, payload.totalStreams || 1))),
            notes: JSON.stringify({ totals: payload.totals }),
        }));

        // Insert into stream_calculations
        for (const row of inserts) {
            await supabaseAdmin.from('stream_calculations').insert(row);
        }

        return res.status(200).json({ ok: true });
    } catch (e) {
        console.error('save calculation error', e);
        return res.status(500).json({ error: 'Internal error' });
    }
}
