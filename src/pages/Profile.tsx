import { useState, useRef, useEffect } from 'react';
import { User, Mail, Music, Building, Save, CheckCircle, Crown, Camera, ImagePlus, X, Palette, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FadeInOnScroll } from '../components/animations';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const colorOptions = [
  { name: 'Royal Purple', value: '#7c3aed', class: 'bg-royal-600' },
  { name: 'Gold', value: '#fbbf24', class: 'bg-gold-400' },
  { name: 'Crimson', value: '#dc2626', class: 'bg-crimson-500' },
  { name: 'Emerald', value: '#10b981', class: 'bg-emerald-500' },
  { name: 'Ocean', value: '#0ea5e9', class: 'bg-sky-500' },
  { name: 'Pink', value: '#ec4899', class: 'bg-pink-500' },
  { name: 'Orange', value: '#f97316', class: 'bg-orange-500' },
];

const backgroundOptions = [
  { name: 'Dark', value: 'bg-[#0a0a0a]', preview: '#0a0a0a' },
  { name: 'Gradient Purple', value: 'bg-gradient-to-br from-royal-950 to-[#0a0a0a]', preview: 'linear-gradient(to bottom right, #2e1065, #0a0a0a)' },
  { name: 'Gradient Gold', value: 'bg-gradient-to-br from-amber-950 to-[#0a0a0a]', preview: 'linear-gradient(to bottom right, #451a03, #0a0a0a)' },
  { name: 'Gradient Blue', value: 'bg-gradient-to-br from-blue-950 to-[#0a0a0a]', preview: 'linear-gradient(to bottom right, #172554, #0a0a0a)' },
  { name: 'Mesh', value: 'mesh-bg bg-[#0a0a0a]', preview: '#1a1a1a' },
];

export default function Profile() {
  const { user, signOut } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileColor, setProfileColor] = useState('#7c3aed');
  const [bgOption, setBgOption] = useState(backgroundOptions[0]);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    artistName: '',
    legalName: '',
    email: user?.email || '',
    ipiNumber: '',
    proAffiliation: '',
    publisherName: '',
    bio: '',
    website: '',
    instagram: '',
    spotify: '',
  });

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!supabase || !user?.id) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
        } else if (data) {
          setFormData({
            artistName: data.artist_name || '',
            legalName: data.legal_name || '',
            email: data.email || user?.email || '',
            ipiNumber: data.ipi_number || '',
            proAffiliation: data.pro_affiliation || '',
            publisherName: data.publisher_name || '',
            bio: data.bio || '',
            website: data.website || '',
            instagram: data.instagram || '',
            spotify: data.spotify || '',
          });
          if (data.profile_color) setProfileColor(data.profile_color);
          if (data.profile_image_url) setProfileImage(data.profile_image_url);
          if (data.banner_image_url) setBannerImage(data.banner_image_url);
          if (data.gallery_images) setGalleryImages(data.gallery_images);
          // Load background from custom_background_url which stores the actual CSS value
          if (data.custom_background_url) {
            const bg = backgroundOptions.find(b => b.value === data.custom_background_url);
            if (bg) setBgOption(bg);
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user?.id, user?.email]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'profile' | 'gallery') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'banner') setBannerImage(result);
        else if (type === 'profile') setProfileImage(result);
        else if (type === 'gallery') setGalleryImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!supabase || !user?.id) {
      // Fallback: just show saved for demo
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }

    setSaving(true);
    try {
      // Map background option name to database enum value
      const bgEnumValue = bgOption.name.toLowerCase().includes('gradient') ? 'gradient' : 'solid';
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: formData.email || user.email,
          artist_name: formData.artistName,
          legal_name: formData.legalName,
          bio: formData.bio,
          ipi_number: formData.ipiNumber,
          pro_affiliation: formData.proAffiliation || 'none',
          publisher_name: formData.publisherName,
          profile_color: profileColor,
          background_option: bgEnumValue,
          custom_background_url: bgOption.value, // Store the actual CSS class/value
          website: formData.website,
          instagram: formData.instagram,
          spotify: formData.spotify,
          gallery_images: galleryImages,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error('Error saving profile:', error);
        alert('Failed to save profile. Please try again.');
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-royal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen -mt-24 pt-24 ${bgOption.value}`}>
      <div className="max-w-5xl mx-auto px-6">
        {/* Banner & Profile Picture Section */}
        <FadeInOnScroll>
          <div className="relative mb-24">
            {/* Banner */}
            <div
              className="h-48 md:h-64 rounded-2xl overflow-hidden relative group cursor-pointer"
              onClick={() => bannerInputRef.current?.click()}
              style={{ background: bannerImage ? `url(${bannerImage}) center/cover` : `linear-gradient(135deg, ${profileColor}40, ${profileColor}10)` }}
            >
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <input ref={bannerInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
            </div>

            {/* Profile Picture */}
            <div className="absolute -bottom-16 left-8">
              <div
                className="w-32 h-32 rounded-2xl border-4 border-[#0a0a0a] overflow-hidden relative group cursor-pointer"
                onClick={() => profileInputRef.current?.click()}
                style={{
                  background: profileImage ? `url(${profileImage}) center/cover` : profileColor,
                }}
              >
                {!profileImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <User className="w-12 h-12 text-white/60" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <input ref={profileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} />
              </div>
            </div>

            {/* Artist Name Display */}
            <div className="absolute -bottom-16 left-44">
              <h1 className="text-2xl font-bold text-white">{formData.artistName || 'Your Artist Name'}</h1>
              <p className="text-white/50 text-sm">{formData.bio ? formData.bio.slice(0, 60) + '...' : 'Add a bio below'}</p>
            </div>
          </div>
        </FadeInOnScroll>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <FadeInOnScroll delay={0.1} className="lg:col-span-2 space-y-8">
            {/* Photo Gallery */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ImagePlus className="w-5 h-5" /> Photo Gallery
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {galleryImages.map((img, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeGalleryImage(i)} className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </motion.div>
                ))}
                {galleryImages.length < 6 && (
                  <div
                    onClick={() => galleryInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-royal-500/50 transition-colors"
                  >
                    <ImagePlus className="w-8 h-8 text-white/30" />
                    <input ref={galleryInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'gallery')} />
                  </div>
                )}
              </div>
              <p className="text-xs text-white/40 mt-3">Add up to 6 photos to showcase your music journey</p>
            </div>

            {/* Artist Info Form */}
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Artist Information</h2>
              <p className="text-sm text-white/50 mb-6">This information is used to auto-fill royalty registration forms.</p>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-white/70 mb-2">Artist / Stage Name</label>
                  <div className="relative">
                    <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="text"
                      value={formData.artistName}
                      onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                      placeholder="Your artist name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">Legal Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="text"
                      value={formData.legalName}
                      onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                      placeholder="Your legal name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white/50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-white/70 mb-2">IPI Number</label>
                  <input
                    type="text"
                    value={formData.ipiNumber}
                    onChange={(e) => setFormData({ ...formData, ipiNumber: e.target.value })}
                    placeholder="e.g., 00123456789"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-2">PRO Affiliation</label>
                  <select
                    value={formData.proAffiliation}
                    onChange={(e) => setFormData({ ...formData, proAffiliation: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-royal-500"
                  >
                    <option value="">Select PRO</option>
                    <option value="bmi">BMI</option>
                    <option value="ascap">ASCAP</option>
                    <option value="sesac">SESAC</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">Publisher Name (if applicable)</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="text"
                    value={formData.publisherName}
                    onChange={(e) => setFormData({ ...formData, publisherName: e.target.value })}
                    placeholder="Your publishing company"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell fans about yourself, your music, and your journey..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-3">Profile Accent Color</label>
                <div className="flex gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setProfileColor(color.value)}
                      className={`w-10 h-10 rounded-full ${color.class} flex items-center justify-center transition-transform hover:scale-110 ${profileColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a]' : ''}`}
                    >
                      {profileColor === color.value && <CheckCircle className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex text-sm text-white/70 mb-3 items-center gap-2">
                  <Palette className="w-4 h-4" /> Page Background
                </label>
                <div className="flex gap-3 flex-wrap">
                  {backgroundOptions.map((bg) => (
                    <button
                      key={bg.name}
                      onClick={() => setBgOption(bg)}
                      className={`w-12 h-12 rounded-xl transition-transform hover:scale-110 ${bgOption.name === bg.name ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a]' : ''}`}
                      style={{ background: bg.preview }}
                    />
                  ))}
                </div>
              </div>
              </div>

              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 w-full justify-center py-4 disabled:opacity-50">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          </FadeInOnScroll>

        {/* Sidebar */}
        <FadeInOnScroll delay={0.2}>
          <div className="space-y-6">
            {/* Subscription */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Premium</h3>
                  <p className="text-xs text-green-400">Active</p>
                </div>
              </div>
              <p className="text-sm text-white/50 mb-4">$35/month • Next billing: Jan 15, 2024</p>
              <button className="w-full py-2 text-sm border border-white/20 rounded-lg text-white/60 hover:bg-white/5 transition-colors">
                Manage Subscription
              </button>
            </div>

            {/* Sign Out */}
            <button onClick={signOut} className="w-full py-3 text-sm border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors">
              Sign Out
            </button>
          </div>
        </FadeInOnScroll>
        </div>
      </div>
    </div>
  );
}