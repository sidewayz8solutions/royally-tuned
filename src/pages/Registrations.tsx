import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, User, Music, Building, Mail, Phone, MapPin, Calendar,
  CheckCircle, ExternalLink,
  Globe, Hash, CreditCard, Landmark, Copyright, Radio, Disc
} from 'lucide-react';
import { FadeInOnScroll } from '../components/animations';

type FormType = 'master' | 'pro' | 'mlc' | 'soundexchange' | 'copyright';

interface MasterFormData {
  legalName: string;
  artistName: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  ipiNumber: string;
  isniNumber: string;
  proAffiliation: 'bmi' | 'ascap' | 'sesac' | 'other' | '';
  proMemberNumber: string;
  publisherName: string;
  publisherIpi: string;
  isSelfPublished: boolean;
  paymentMethod: 'direct_deposit' | 'check' | '';
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  trackTitle: string;
  isrcCode: string;
  iswcCode: string;
  releaseDate: string;
  writers: string;
  producers: string;
}

const initialFormData: MasterFormData = {
  legalName: '', artistName: '', dateOfBirth: '', ssn: '', email: '', phone: '',
  street: '', city: '', state: '', zip: '', country: 'United States',
  ipiNumber: '', isniNumber: '', proAffiliation: '', proMemberNumber: '',
  publisherName: '', publisherIpi: '', isSelfPublished: true,
  paymentMethod: '', bankName: '', routingNumber: '', accountNumber: '',
  trackTitle: '', isrcCode: '', iswcCode: '', releaseDate: '', writers: '', producers: '',
};

const formTabs = [
  { id: 'master' as FormType, label: 'Your Info', icon: User, description: 'Enter your info once' },
  { id: 'pro' as FormType, label: 'PRO', icon: Radio, description: 'BMI / ASCAP / SESAC' },
  { id: 'mlc' as FormType, label: 'MLC', icon: Disc, description: 'Mechanical Licensing' },
  { id: 'soundexchange' as FormType, label: 'SoundExchange', icon: Globe, description: 'Digital Performance' },
  { id: 'copyright' as FormType, label: 'US Copyright', icon: Copyright, description: 'Copyright Office' },
];

export default function Registrations() {
  const [activeForm, setActiveForm] = useState<FormType>('master');
  const [formData, setFormData] = useState<MasterFormData>(initialFormData);
  const [savedSections, setSavedSections] = useState<Set<string>>(new Set());

  const updateField = (field: keyof MasterFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCompletionPercentage = () => {
    const fields = Object.values(formData);
    const filled = fields.filter(v => v !== '' && v !== false).length;
    return Math.round((filled / fields.length) * 100);
  };

  const markSectionSaved = (section: string) => {
    setSavedSections(prev => new Set([...prev, section]));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-12">
      <FadeInOnScroll>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Registration Hub</h1>
          <p className="text-white/50">Enter your info once, auto-fill all your royalty registration forms</p>
        </div>
      </FadeInOnScroll>

      <FadeInOnScroll delay={0.1}>
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/70">Profile Completion</span>
            <span className="text-sm font-semibold text-yellow-400">{getCompletionPercentage()}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500" initial={{ width: 0 }} animate={{ width: `${getCompletionPercentage()}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>
      </FadeInOnScroll>

      <FadeInOnScroll delay={0.2}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {formTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeForm === tab.id;
            const isSaved = savedSections.has(tab.id);
            return (
              <button key={tab.id} onClick={() => setActiveForm(tab.id)} className={`relative p-4 rounded-xl border transition-all text-left ${isActive ? 'bg-yellow-400/10 border-yellow-400/50 shadow-lg shadow-yellow-400/10' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                {isSaved && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-green-500" />}
                <Icon className={`w-5 h-5 mb-2 ${isActive ? 'text-yellow-400' : 'text-white/50'}`} />
                <div className={`font-medium text-sm ${isActive ? 'text-yellow-400' : 'text-white'}`}>{tab.label}</div>
                <div className="text-xs text-white/40 mt-0.5">{tab.description}</div>
              </button>
            );
          })}
        </div>
      </FadeInOnScroll>

      <AnimatePresence mode="wait">
        <motion.div key={activeForm} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {activeForm === 'master' && <MasterDataForm formData={formData} updateField={updateField} onSave={() => markSectionSaved('master')} />}
          {activeForm === 'pro' && <PROFormPreview formData={formData} />}
          {activeForm === 'mlc' && <MLCFormPreview formData={formData} />}
          {activeForm === 'soundexchange' && <SoundExchangeFormPreview formData={formData} />}
          {activeForm === 'copyright' && <CopyrightFormPreview formData={formData} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder = '', type = 'text', icon }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; icon?: React.ReactNode; }) {
  return (
    <div>
      <label className="block text-sm text-white/70 mb-2">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30">{icon}</div>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 ${icon ? 'pl-12' : 'pl-4'} pr-4 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/50`} />
      </div>
    </div>
  );
}

function FormField({ label, value, missing = false }: { label: string; value: string; missing?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/5">
      <span className="text-white/50 text-sm">{label}</span>
      <span className={`text-sm ${missing ? 'text-yellow-400 italic' : 'text-white'}`}>{value || 'Not provided'}</span>
    </div>
  );
}

function MasterDataForm({ formData, updateField, onSave }: { formData: MasterFormData; updateField: (field: keyof MasterFormData, value: string | boolean) => void; onSave: () => void; }) {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); onSave(); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><User className="w-5 h-5 text-yellow-400" /> Personal Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <InputField label="Legal Full Name" value={formData.legalName} onChange={(v) => updateField('legalName', v)} placeholder="John Doe" icon={<User />} />
          <InputField label="Artist / Stage Name" value={formData.artistName} onChange={(v) => updateField('artistName', v)} placeholder="J.Doe" icon={<Music />} />
          <InputField label="Date of Birth" value={formData.dateOfBirth} onChange={(v) => updateField('dateOfBirth', v)} type="date" icon={<Calendar />} />
          <InputField label="SSN (last 4 or full)" value={formData.ssn} onChange={(v) => updateField('ssn', v)} placeholder="XXX-XX-XXXX" icon={<Hash />} />
          <InputField label="Email" value={formData.email} onChange={(v) => updateField('email', v)} placeholder="artist@email.com" type="email" icon={<Mail />} />
          <InputField label="Phone" value={formData.phone} onChange={(v) => updateField('phone', v)} placeholder="(555) 123-4567" type="tel" icon={<Phone />} />
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-yellow-400" /> Address</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><InputField label="Street Address" value={formData.street} onChange={(v) => updateField('street', v)} placeholder="123 Music Lane" /></div>
          <InputField label="City" value={formData.city} onChange={(v) => updateField('city', v)} placeholder="Nashville" />
          <InputField label="State" value={formData.state} onChange={(v) => updateField('state', v)} placeholder="TN" />
          <InputField label="ZIP Code" value={formData.zip} onChange={(v) => updateField('zip', v)} placeholder="37203" />
          <InputField label="Country" value={formData.country} onChange={(v) => updateField('country', v)} placeholder="United States" />
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-yellow-400" /> Professional IDs</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <InputField label="IPI Number" value={formData.ipiNumber} onChange={(v) => updateField('ipiNumber', v)} placeholder="00123456789" />
          <InputField label="ISNI Number" value={formData.isniNumber} onChange={(v) => updateField('isniNumber', v)} placeholder="0000 0001 2345 6789" />
          <div>
            <label className="block text-sm text-white/70 mb-2">PRO Affiliation</label>
            <select value={formData.proAffiliation} onChange={(e) => updateField('proAffiliation', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-400/50">
              <option value="">Select PRO</option>
              <option value="bmi">BMI</option>
              <option value="ascap">ASCAP</option>
              <option value="sesac">SESAC</option>
              <option value="other">Other</option>
            </select>
          </div>
          <InputField label="PRO Member Number" value={formData.proMemberNumber} onChange={(v) => updateField('proMemberNumber', v)} placeholder="Your PRO ID" />
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Building className="w-5 h-5 text-yellow-400" /> Publisher Information</h2>
        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={formData.isSelfPublished} onChange={(e) => updateField('isSelfPublished', e.target.checked)} className="w-5 h-5 rounded border-white/20 bg-white/5 text-yellow-400 focus:ring-yellow-400" />
            <span className="text-white/70">I am self-published (no external publisher)</span>
          </label>
        </div>
        {!formData.isSelfPublished && (
          <div className="grid md:grid-cols-2 gap-4">
            <InputField label="Publisher Name" value={formData.publisherName} onChange={(v) => updateField('publisherName', v)} placeholder="Publisher Co." />
            <InputField label="Publisher IPI" value={formData.publisherIpi} onChange={(v) => updateField('publisherIpi', v)} placeholder="00987654321" />
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-yellow-400" /> Payment Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Payment Method</label>
            <select value={formData.paymentMethod} onChange={(e) => updateField('paymentMethod', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-400/50">
              <option value="">Select Method</option>
              <option value="direct_deposit">Direct Deposit</option>
              <option value="check">Check</option>
            </select>
          </div>
          {formData.paymentMethod === 'direct_deposit' && (
            <>
              <InputField label="Bank Name" value={formData.bankName} onChange={(v) => updateField('bankName', v)} placeholder="Bank of America" icon={<Landmark />} />
              <InputField label="Routing Number" value={formData.routingNumber} onChange={(v) => updateField('routingNumber', v)} placeholder="123456789" />
              <InputField label="Account Number" value={formData.accountNumber} onChange={(v) => updateField('accountNumber', v)} placeholder="••••••1234" />
            </>
          )}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Disc className="w-5 h-5 text-yellow-400" /> Track Information (for Copyright)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <InputField label="Track Title" value={formData.trackTitle} onChange={(v) => updateField('trackTitle', v)} placeholder="My Song Title" icon={<Music />} />
          <InputField label="Release Date" value={formData.releaseDate} onChange={(v) => updateField('releaseDate', v)} type="date" icon={<Calendar />} />
          <InputField label="ISRC Code" value={formData.isrcCode} onChange={(v) => updateField('isrcCode', v)} placeholder="USRC12345678" />
          <InputField label="ISWC Code" value={formData.iswcCode} onChange={(v) => updateField('iswcCode', v)} placeholder="T-123.456.789-0" />
          <InputField label="Writers (comma separated)" value={formData.writers} onChange={(v) => updateField('writers', v)} placeholder="John Doe, Jane Smith" />
          <InputField label="Producers (comma separated)" value={formData.producers} onChange={(v) => updateField('producers', v)} placeholder="Producer Name" />
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
        {saved ? <CheckCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
        {saved ? 'Saved!' : 'Save All Information'}
      </button>
    </div>
  );
}

function PROFormPreview({ formData }: { formData: MasterFormData }) {
  const proName = formData.proAffiliation ? formData.proAffiliation.toUpperCase() : 'PRO';
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Radio className="w-6 h-6 text-yellow-400" /> {proName} Registration Form</h2>
          <p className="text-white/50 text-sm mt-1">Performance Rights Organization - Songwriter/Publisher Registration</p>
        </div>
        <a href={formData.proAffiliation === 'bmi' ? 'https://www.bmi.com/join' : formData.proAffiliation === 'ascap' ? 'https://www.ascap.com/join' : 'https://www.sesac.com'} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2 text-sm"><ExternalLink className="w-4 h-4" /> Go to {proName}</a>
      </div>
      <div className="space-y-1">
        <FormField label="Legal Name" value={formData.legalName} missing={!formData.legalName} />
        <FormField label="Stage/Professional Name" value={formData.artistName} missing={!formData.artistName} />
        <FormField label="Date of Birth" value={formData.dateOfBirth} missing={!formData.dateOfBirth} />
        <FormField label="SSN" value={formData.ssn ? '•••-••-' + formData.ssn.slice(-4) : ''} missing={!formData.ssn} />
        <FormField label="Email" value={formData.email} missing={!formData.email} />
        <FormField label="Phone" value={formData.phone} missing={!formData.phone} />
        <FormField label="Address" value={`${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`} missing={!formData.street} />
        <FormField label="IPI Number" value={formData.ipiNumber} missing={!formData.ipiNumber} />
        <FormField label="Publisher" value={formData.isSelfPublished ? 'Self-Published' : formData.publisherName} />
      </div>
      <div className="mt-6 p-4 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
        <p className="text-yellow-400 text-sm">💡 Copy this info when filling out your {proName} application. Your IPI number will be assigned after registration.</p>
      </div>
    </div>
  );
}

function MLCFormPreview({ formData }: { formData: MasterFormData }) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Disc className="w-6 h-6 text-yellow-400" /> MLC Registration Form</h2>
          <p className="text-white/50 text-sm mt-1">Mechanical Licensing Collective - Claim Your Mechanical Royalties</p>
        </div>
        <a href="https://www.themlc.com/join" target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2 text-sm"><ExternalLink className="w-4 h-4" /> Go to MLC</a>
      </div>
      <div className="space-y-1">
        <FormField label="Legal Name" value={formData.legalName} missing={!formData.legalName} />
        <FormField label="Professional Name" value={formData.artistName} missing={!formData.artistName} />
        <FormField label="Email" value={formData.email} missing={!formData.email} />
        <FormField label="Phone" value={formData.phone} missing={!formData.phone} />
        <FormField label="Address" value={`${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`} missing={!formData.street} />
        <FormField label="IPI Number" value={formData.ipiNumber} missing={!formData.ipiNumber} />
        <FormField label="ISNI Number" value={formData.isniNumber} />
        <FormField label="PRO Affiliation" value={formData.proAffiliation?.toUpperCase() || ''} missing={!formData.proAffiliation} />
        <FormField label="Publisher" value={formData.isSelfPublished ? 'Self-Published' : formData.publisherName} />
      </div>
      <div className="mt-6 p-4 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
        <p className="text-yellow-400 text-sm">💡 The MLC collects mechanical royalties from streaming services. Registration is FREE and essential for songwriters.</p>
      </div>
    </div>
  );
}

function SoundExchangeFormPreview({ formData }: { formData: MasterFormData }) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Globe className="w-6 h-6 text-yellow-400" /> SoundExchange Registration</h2>
          <p className="text-white/50 text-sm mt-1">Digital Performance Royalties - Featured Artists & Sound Recording Owners</p>
        </div>
        <a href="https://www.soundexchange.com/artist-copyright-owner/register/" target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2 text-sm"><ExternalLink className="w-4 h-4" /> Go to SoundExchange</a>
      </div>
      <div className="space-y-1">
        <FormField label="Legal Name" value={formData.legalName} missing={!formData.legalName} />
        <FormField label="Artist/Band Name" value={formData.artistName} missing={!formData.artistName} />
        <FormField label="SSN/TIN" value={formData.ssn ? '•••-••-' + formData.ssn.slice(-4) : ''} missing={!formData.ssn} />
        <FormField label="Date of Birth" value={formData.dateOfBirth} missing={!formData.dateOfBirth} />
        <FormField label="Email" value={formData.email} missing={!formData.email} />
        <FormField label="Phone" value={formData.phone} missing={!formData.phone} />
        <FormField label="Mailing Address" value={`${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`} missing={!formData.street} />
        <FormField label="ISNI Number" value={formData.isniNumber} />
        <FormField label="Payment Method" value={formData.paymentMethod === 'direct_deposit' ? 'Direct Deposit' : formData.paymentMethod === 'check' ? 'Check' : ''} missing={!formData.paymentMethod} />
      </div>
      <div className="mt-6 p-4 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
        <p className="text-yellow-400 text-sm">💡 SoundExchange collects royalties from digital radio (Pandora, SiriusXM, etc.). Register as both Featured Artist AND Sound Recording Owner if you own your masters.</p>
      </div>
    </div>
  );
}

function CopyrightFormPreview({ formData }: { formData: MasterFormData }) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Copyright className="w-6 h-6 text-yellow-400" /> US Copyright Registration</h2>
          <p className="text-white/50 text-sm mt-1">Form PA (Performing Arts) - Register Your Musical Works</p>
        </div>
        <a href="https://www.copyright.gov/registration/" target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2 text-sm"><ExternalLink className="w-4 h-4" /> Go to Copyright.gov</a>
      </div>
      <div className="mb-6 p-4 bg-white/5 rounded-xl">
        <h3 className="text-white font-medium mb-2">Work Being Registered</h3>
        <div className="space-y-1">
          <FormField label="Title of Work" value={formData.trackTitle} missing={!formData.trackTitle} />
          <FormField label="ISRC Code" value={formData.isrcCode} />
          <FormField label="ISWC Code" value={formData.iswcCode} />
          <FormField label="Date of Creation/Release" value={formData.releaseDate} missing={!formData.releaseDate} />
          <FormField label="Author(s)/Writer(s)" value={formData.writers || formData.legalName} missing={!formData.writers && !formData.legalName} />
        </div>
      </div>
      <div className="space-y-1">
        <FormField label="Claimant Name" value={formData.legalName} missing={!formData.legalName} />
        <FormField label="Claimant Address" value={`${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`} missing={!formData.street} />
        <FormField label="Email for Correspondence" value={formData.email} missing={!formData.email} />
        <FormField label="Phone" value={formData.phone} missing={!formData.phone} />
      </div>
      <div className="mt-6 p-4 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
        <p className="text-yellow-400 text-sm">💡 Copyright registration costs $45-$65 per work. It provides legal protection and is required before filing infringement lawsuits.</p>
      </div>
    </div>
  );
}

