import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Building2, Globe, Briefcase, FileText, BadgeCheck, MapPin, Hash, Upload, Save, Edit3, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import api from '../../api/axios';
import axios from 'axios';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dzeckhheq/image/upload';
const CLOUDINARY_PRESET = 'ml_default';

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Education', 'E-Commerce',
  'Manufacturing', 'Consulting', 'Media & Entertainment', 'Logistics',
  'Real Estate', 'Legal', 'Agriculture', 'Automotive', 'Retail', 'Other'
];

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function CompanyProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const logoRef = useRef();

  useEffect(() => {
    api.get('/company/profile')
      .then(res => {
        const data = res.data.data;
        setProfile(data);
        setForm(data);
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Logo must be under 2MB'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', CLOUDINARY_PRESET);
      const res = await axios.post(CLOUDINARY_URL, fd);
      setForm(f => ({ ...f, logoUrl: res.data.secure_url }));
      toast.success('Logo uploaded!');
    } catch { toast.error('Logo upload failed'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    // Validate GSTIN if provided
    if (form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin)) {
      toast.error('Invalid GSTIN format (e.g. 27AAPFU0939F1ZV)');
      return;
    }
    setSaving(true);
    try {
      const res = await api.put('/company/profile', form);
      setProfile(res.data.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to save profile'); }
    finally { setSaving(false); }
  };

  const handleCancel = () => { setForm(profile); setEditing(false); };

  if (loading) return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0F1E] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0F1E]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Company</p>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Company <span className="gradient-text">Profile</span>
            </h1>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="btn-primary flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel}
                  className="btn-secondary flex items-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="btn-primary flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-5">

          {/* Logo + Identity */}
          <motion.div initial="hidden" animate="show" variants={fadeUp}
            className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-start gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden relative group">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                  {editing && (
                    <button onClick={() => logoRef.current.click()}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                      {uploading
                        ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <Upload className="w-5 h-5 text-white" />}
                    </button>
                  )}
                </div>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                {editing && (
                  <p className="text-xs text-gray-400 text-center mt-1">Click to upload</p>
                )}
              </div>

              {/* Name + Verification */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {editing ? (
                    <input value={form.companyName || ''} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                      className="input-field text-xl font-bold w-full"
                      placeholder="Company Name" />
                  ) : (
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile?.companyName}</h2>
                  )}
                  {profile?.isVerified && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
                {!profile?.isVerified && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">⚠ Pending admin verification</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* GSTIN — featured prominently */}
          <motion.div initial="hidden" animate="show" variants={fadeUp}
            className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Hash className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">GST Identification</h3>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                GSTIN
              </label>
              {editing ? (
                <div>
                  <input value={form.gstin || ''}
                    onChange={e => setForm(f => ({ ...f, gstin: e.target.value.toUpperCase() }))}
                    className="input-field font-mono tracking-widest"
                    placeholder="e.g. 27AAPFU0939F1ZV"
                    maxLength={15} />
                  <p className="text-xs text-gray-400 mt-1">
                    15-character GST number issued by the Government of India. Required for GST-registered businesses.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {profile?.gstin ? (
                    <>
                      <span className="font-mono text-lg font-bold tracking-widest text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                        {profile.gstin}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                        <BadgeCheck className="w-3.5 h-3.5" /> GST Registered
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400 italic">No GSTIN added — click Edit Profile to add</span>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Basic Info */}
          <motion.div initial="hidden" animate="show" variants={fadeUp}
            className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-violet-50 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-violet-600" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Business Details</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Industry
                </label>
                {editing ? (
                  <select value={form.industry || ''} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                    className="input-field">
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                ) : (
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.industry || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  <MapPin className="w-3 h-3 inline mr-1" />Location
                </label>
                {editing ? (
                  <input value={form.location || ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="input-field" placeholder="e.g. Pune, Maharashtra" />
                ) : (
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.location || '—'}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  <Globe className="w-3 h-3 inline mr-1" />Website
                </label>
                {editing ? (
                  <input value={form.website || ''} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    className="input-field" placeholder="https://yourcompany.com" />
                ) : (
                  profile?.website
                    ? <a href={profile.website} target="_blank" rel="noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline">{profile.website}</a>
                    : <p className="text-sm text-gray-400">—</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div initial="hidden" animate="show" variants={fadeUp}
            className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">About the Company</h3>
            </div>
            {editing ? (
              <textarea value={form.description || ''}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input-field resize-none" rows={5}
                placeholder="Describe your company — mission, culture, what you do..." />
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {profile?.description || <span className="text-gray-400 italic">No description yet.</span>}
              </p>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
