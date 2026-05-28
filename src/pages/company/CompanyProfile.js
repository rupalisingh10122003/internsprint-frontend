import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Building2, Globe, Briefcase, FileText, BadgeCheck, MapPin, Hash, Upload, Save, Edit3, X, CheckCircle, Users, Calendar, Award, Phone, Mail } from 'lucide-react';
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

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

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
    api.get('/api/company/profile')
      .then(res => {
        const data = res.data.data;
        setProfile(data);
        setForm(data || {});
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
    if (form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin)) {
      toast.error('Invalid GSTIN format (e.g. 27AAPFU0939F1ZV)');
      return;
    }
    setSaving(true);
    try {
      const res = await api.put('/api/company/profile', form);
      setProfile(res.data.data);
      setForm(res.data.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save profile');
    } finally { setSaving(false); }
  };

  const handleCancel = () => { setForm(profile); setEditing(false); };
  const f = (field) => form[field] || '';
  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  if (loading) return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0F1E] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0F1E]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Company</p>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Company <span className="gradient-text">Profile</span>
            </h1>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn-primary flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="btn-secondary flex items-center gap-2">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left — Logo & Identity */}
          <div className="space-y-5">

            {/* Logo Card */}
            <motion.div initial="hidden" animate="show" variants={fadeUp}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden mx-auto">
                  {f('logoUrl') ? (
                    <img src={f('logoUrl')} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                {editing && (
                  <button onClick={() => logoRef.current.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors">
                    {uploading
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Upload className="w-4 h-4 text-white" />}
                  </button>
                )}
              </div>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />

              <h2 className="font-bold text-gray-900 dark:text-white text-lg">{profile?.companyName || 'Company Name'}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{profile?.email}</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                {profile?.isVerified ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified Company
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full border border-amber-100 dark:border-amber-800">
                    ⚠ Pending Verification
                  </span>
                )}
              </div>
              {editing && <p className="text-xs text-gray-400 mt-2">Click the + button to update logo</p>}
            </motion.div>

            {/* GSTIN Card */}
            <motion.div initial="hidden" animate="show" variants={fadeUp}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Hash className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">GST Identification</h3>
              </div>
              {editing ? (
                <>
                  <input value={f('gstin')} onChange={e => setForm(p => ({ ...p, gstin: e.target.value.toUpperCase() }))}
                    className="input-field font-mono tracking-widest text-sm" placeholder="27AAPFU0939F1ZV" maxLength={15} />
                  <p className="text-xs text-gray-400 mt-1.5">15-char GST number. Leave blank if not registered.</p>
                </>
              ) : (
                profile?.gstin ? (
                  <div>
                    <p className="font-mono text-base font-bold tracking-widest text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                      {profile.gstin}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
                      <BadgeCheck className="w-3.5 h-3.5" /> GST Registered
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic text-center py-2">Not added — click Edit to add</p>
                )
              )}
            </motion.div>

            {/* Quick Stats */}
            {!editing && profile && (
              <motion.div initial="hidden" animate="show" variants={fadeUp}
                className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-5">
                <h3 className="font-bold text-white text-sm mb-3">Company at a Glance</h3>
                <div className="space-y-2">
                  {profile.industry && <div className="flex items-center gap-2 text-blue-100 text-xs"><Briefcase className="w-3.5 h-3.5" />{profile.industry}</div>}
                  {profile.location && <div className="flex items-center gap-2 text-blue-100 text-xs"><MapPin className="w-3.5 h-3.5" />{profile.location}</div>}
                  {profile.website && <div className="flex items-center gap-2 text-blue-100 text-xs"><Globe className="w-3.5 h-3.5" /><a href={profile.website} target="_blank" rel="noreferrer" className="hover:text-white truncate">{profile.website.replace('https://', '')}</a></div>}
                  {profile.email && <div className="flex items-center gap-2 text-blue-100 text-xs"><Mail className="w-3.5 h-3.5" />{profile.email}</div>}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right — Details */}
          <div className="lg:col-span-2 space-y-5">

            {/* Company Name (edit mode) */}
            {editing && (
              <motion.div initial="hidden" animate="show" variants={fadeUp}
                className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Company Name</label>
                <input value={f('companyName')} onChange={set('companyName')} className="input-field text-lg font-semibold" placeholder="Your Company Name" />
              </motion.div>
            )}

            {/* Business Details */}
            <motion.div initial="hidden" animate="show" variants={fadeUp}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-violet-50 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Business Details</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Industry</label>
                  {editing ? (
                    <select value={f('industry')} onChange={set('industry')} className="input-field">
                      <option value="">Select Industry</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  ) : <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.industry || '—'}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Company Size</label>
                  {editing ? (
                    <select value={f('companySize')} onChange={set('companySize')} className="input-field">
                      <option value="">Select Size</option>
                      {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                    </select>
                  ) : <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.companySize ? `${profile.companySize} employees` : '—'}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"><MapPin className="w-3 h-3 inline mr-1" />Headquarters</label>
                  {editing ? (
                    <input value={f('location')} onChange={set('location')} className="input-field" placeholder="e.g. Pune, Maharashtra" />
                  ) : <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.location || '—'}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"><Calendar className="w-3 h-3 inline mr-1" />Founded Year</label>
                  {editing ? (
                    <input value={f('foundedYear')} onChange={set('foundedYear')} className="input-field" placeholder="e.g. 2018" maxLength={4} />
                  ) : <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.foundedYear || '—'}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"><Globe className="w-3 h-3 inline mr-1" />Website</label>
                  {editing ? (
                    <input value={f('website')} onChange={set('website')} className="input-field" placeholder="https://yourcompany.com" />
                  ) : (
                    profile?.website
                      ? <a href={profile.website} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-600 hover:underline">{profile.website}</a>
                      : <p className="text-sm text-gray-400">—</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div initial="hidden" animate="show" variants={fadeUp}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-cyan-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Contact Information</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Contact Phone</label>
                  {editing ? (
                    <input value={f('phone')} onChange={set('phone')} className="input-field" placeholder="+91 9876543210" />
                  ) : <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.phone || '—'}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">LinkedIn Page</label>
                  {editing ? (
                    <input value={f('linkedin')} onChange={set('linkedin')} className="input-field" placeholder="linkedin.com/company/yourcompany" />
                  ) : (
                    profile?.linkedin
                      ? <a href={profile.linkedin} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">{profile.linkedin}</a>
                      : <p className="text-sm text-gray-400">—</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* About */}
            <motion.div initial="hidden" animate="show" variants={fadeUp}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">About the Company</h3>
              </div>
              {editing ? (
                <>
                  <textarea value={f('description')} onChange={set('description')}
                    className="input-field resize-none" rows={5}
                    placeholder="Describe your company — mission, vision, culture, what you do, why candidates should join..." />
                  <p className="text-xs text-gray-400 mt-1.5">{(f('description') || '').length} / 1000 characters</p>
                </>
              ) : (
                profile?.description
                  ? <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{profile.description}</p>
                  : <p className="text-sm text-gray-400 italic">No description added yet. Click Edit Profile to add your company story.</p>
              )}
            </motion.div>

            {/* Perks & Benefits */}
            <motion.div initial="hidden" animate="show" variants={fadeUp}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Perks & Benefits</h3>
              </div>
              {editing ? (
                <>
                  <textarea value={f('perks')} onChange={set('perks')}
                    className="input-field resize-none" rows={3}
                    placeholder="e.g. Flexible hours, Remote work, Health insurance, Learning budget, Team outings..." />
                  <p className="text-xs text-gray-400 mt-1.5">Comma-separated or one per line</p>
                </>
              ) : (
                profile?.perks
                  ? <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{profile.perks}</p>
                  : <p className="text-sm text-gray-400 italic">No perks listed yet.</p>
              )}
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
