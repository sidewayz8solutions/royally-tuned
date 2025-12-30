import { useState } from 'react';
import { User, Mail, Music, Building, Save, Upload, CheckCircle, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FadeInOnScroll } from '../components/animations';

const colorOptions = [
  { name: 'Royal Purple', value: '#7c3aed', class: 'bg-royal-600' },
  { name: 'Gold', value: '#fbbf24', class: 'bg-gold-400' },
  { name: 'Crimson', value: '#dc2626', class: 'bg-crimson-500' },
  { name: 'Emerald', value: '#10b981', class: 'bg-emerald-500' },
  { name: 'Ocean', value: '#0ea5e9', class: 'bg-sky-500' },
];

export default function Profile() {
  const { user, signOut } = useAuth();
  const [saved, setSaved] = useState(false);
  const [profileColor, setProfileColor] = useState('#7c3aed');
  const [formData, setFormData] = useState({
    artistName: '',
    legalName: '',
    email: user?.email || '',
    ipiNumber: '',
    proAffiliation: '',
    publisherName: '',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      <FadeInOnScroll>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-white/50">Manage your account and preferences</p>
        </div>
      </FadeInOnScroll>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <FadeInOnScroll delay={0.1} className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Artist Information</h2>
            <p className="text-sm text-white/50 mb-6">
              This information is used to auto-fill royalty registration forms.
            </p>

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

              <button onClick={handleSave} className="btn-primary flex items-center gap-2 w-full justify-center py-4">
                {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
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

            {/* Upload Documents */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">Upload Documents</h3>
              <p className="text-sm text-white/50 mb-4">
                Upload photos of forms and we'll extract the data automatically.
              </p>
              <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-royal-500/50 transition-colors">
                <Upload className="w-8 h-8 text-white/40" />
                <span className="text-sm text-white/50">Click to upload</span>
                <input type="file" className="hidden" accept="image/*,.pdf" />
              </label>
            </div>

            {/* Sign Out */}
            <button onClick={signOut} className="w-full py-3 text-sm border border-crimson-500/30 text-crimson-400 rounded-xl hover:bg-crimson-500/10 transition-colors">
              Sign Out
            </button>
          </div>
        </FadeInOnScroll>
      </div>
    </div>
  );
}