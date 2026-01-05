import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FadeInOnScroll } from '../components/animations';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const TEMPLATES: Record<string, { title: string; content: string }> = {
  'tv-music-rights-license': {
    title: 'TV Music Rights License',
    content: `TV MUSIC RIGHTS LICENSE\n\n1. In consideration of the payment of $_____, the undersigned grants to Licensee the non-exclusive right to record the following copyrighted musical composition(s) in synchronization with the Picture...`,
  },
  'co-production-agreement': {
    title: 'Co-Production Agreement',
    content: `CO-PRODUCTION AGREEMENT\n\nThis agreement confirms the understanding between the parties regarding the co-production of a television program...`,
  },
};

export default function FormEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const tpl = TEMPLATES[slug] || { title: slug.replace(/-/g, ' '), content: '' };
    setTitle(tpl.title);
    setContent(tpl.content);
  }, [slug]);

  const save = async () => {
    setSaving(true);
    setMessage(null);

    // Try saving to Supabase 'documents' table. If that fails or table not present, fall back to localStorage.
    try {
      if (supabase && user) {
        const { data, error } = await supabase
          .from('documents')
          .insert({ user_id: user.id, title, slug, content })
          .select()
          .single();

        if (error) {
          // Save to localStorage as fallback
          const key = `local_form_${user.id}_${slug}`;
          localStorage.setItem(key, JSON.stringify({ title, content, savedAt: Date.now() }));
          setMessage('Saved locally (database unavailable).');
        } else {
          setMessage('Saved successfully.');
        }
      } else if (user) {
        const key = `local_form_${user.id}_${slug}`;
        localStorage.setItem(key, JSON.stringify({ title, content, savedAt: Date.now() }));
        setMessage('Saved locally (no Supabase client).');
      } else {
        // Not logged in — prompt to login
        setMessage('Please log in to save this form.');
      }
    } catch (err: any) {
      const key = user ? `local_form_${user.id}_${slug}` : `local_form_guest_${slug}`;
      localStorage.setItem(key, JSON.stringify({ title, content, savedAt: Date.now() }));
      setMessage('Saved locally (error while saving).');
    }

    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <FadeInOnScroll>
        <div className="mb-6">
          <button className="text-sm text-white/60 hover:underline" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">{title}</h1>

        <div className="mb-4">
          <input className="w-full p-3 rounded-lg bg-white/5 text-white" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="mb-6">
          <textarea
            className="w-full min-h-[320px] p-4 rounded-lg bg-white/5 text-white font-mono"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <button onClick={save} disabled={saving} className="btn-primary px-6 py-3">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={() => {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title || 'form'}.txt`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }} className="px-4 py-2 bg-white/5 rounded-md text-white/70 hover:bg-white/10">Download</button>
          {message && <div className="text-sm text-white/60">{message}</div>}
        </div>
      </FadeInOnScroll>
    </div>
  );
}
