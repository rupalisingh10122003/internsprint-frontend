import { useState, useEffect } from 'react';
import { User, Code, Link, Save, Award, Upload, CheckCircle, ExternalLink, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getStudentProfile, updateStudentProfile } from '../../api/internships';
import api from '../../api/axios';

const skillSuggestions = ['Java', 'Python', 'React', 'Node.js', 'MySQL', 'MongoDB', 'Spring Boot', 'Machine Learning', 'TensorFlow', 'Figma', 'Adobe XD', 'SEO', 'Git', 'Docker', 'AWS'];

export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    college: '', degree: '', year: '', cgpa: '',
    skills: '', bio: '', linkedin: '', github: '',
    resumeUrl: '', projects: '', certifications: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skillList, setSkillList] = useState([]);

  useEffect(() => {
    getStudentProfile()
      .then(res => {
        const data = res.data.data;
        setProfile(data || {});
        setSkillList(data?.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !skillList.includes(s)) setSkillList([...skillList, s]);
    setSkillInput('');
  };

  const removeSkill = (skill) => setSkillList(skillList.filter(s => s !== skill));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStudentProfile({ ...profile, skills: skillList.join(',') });
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/api/student/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(prev => ({ ...prev, resumeUrl: res.data.data }));
      toast.success('Resume uploaded successfully!');
    } catch {
      toast.error('Upload failed. Try pasting the URL instead.');
    } finally {
      setUploading(false);
    }
  };

  const completionFields = [
    { label: 'College', done: !!profile.college },
    { label: 'Degree', done: !!profile.degree },
    { label: 'Bio', done: !!profile.bio },
    { label: 'Skills', done: skillList.length > 0 },
    { label: 'Resume', done: !!profile.resumeUrl },
    { label: 'Projects', done: !!profile.projects },
    { label: 'Certifications', done: !!profile.certifications },
  ];
  const score = Math.round((completionFields.filter(f => f.done).length / completionFields.length) * 100);

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Your Profile</p>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Profile</h1>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="btn-primary shadow-lg shadow-blue-500/20 flex items-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left Sidebar */}
          <div className="space-y-5">

            {/* Avatar card */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-blue-500/20">
                {user?.name?.charAt(0)}
              </div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">{user?.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{user?.email}</p>
              <span className="badge-blue badge mt-3">Student</span>
            </div>

            {/* Profile strength */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Profile Strength</h3>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-extrabold gradient-text">{score}%</span>
                <span className="text-xs text-gray-400 font-medium pb-1">
                  {score < 50 ? 'Beginner' : score < 80 ? 'Intermediate' : 'Strong ✨'}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-4">
                <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8 }}
                  className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
              </div>
              <div className="space-y-2">
                {completionFields.map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      {done && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                    <span className={`text-xs font-medium ${done ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic Info */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Basic Information</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">College</label>
                  <input value={profile.college || ''} onChange={e => setProfile({ ...profile, college: e.target.value })} placeholder="Bharati Vidyapeeth..." className="input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Degree</label>
                  <input value={profile.degree || ''} onChange={e => setProfile({ ...profile, degree: e.target.value })} placeholder="B.E. Computer Engineering" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Year of Study</label>
                  <select value={profile.year || ''} onChange={e => setProfile({ ...profile, year: e.target.value })} className="input">
                    <option value="">Select year</option>
                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">CGPA</label>
                  <input type="number" step="0.01" min="0" max="10" value={profile.cgpa || ''} onChange={e => setProfile({ ...profile, cgpa: e.target.value })} placeholder="8.5" className="input" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Bio</label>
                <textarea value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell companies about yourself..." rows={3} className="input resize-none" />
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-violet-50 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Skills</h3>
              </div>
              <div className="flex gap-2 mb-4">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
                  placeholder="Type a skill and press Enter..." className="input flex-1" />
                <button onClick={() => addSkill(skillInput)} className="btn-primary px-5">Add</button>
              </div>
              {skillList.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  {skillList.map(skill => (
                    <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="text-blue-300 hover:text-red-500 transition-colors text-base leading-none ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-2 font-medium">Quick add:</p>
                <div className="flex flex-wrap gap-2">
                  {skillSuggestions.filter(s => !skillList.includes(s)).slice(0, 10).map(skill => (
                    <button key={skill} onClick={() => addSkill(skill)}
                      className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Projects</h3>
              </div>
              <textarea value={profile.projects || ''} onChange={e => setProfile({ ...profile, projects: e.target.value })}
                placeholder={`InternSprint | React, Spring Boot, MySQL | Full-stack internship platform with AI matching\nPortfolio Website | HTML, CSS, JS | Personal portfolio with dark mode`}
                rows={4} className="input resize-none" />
              <p className="text-xs text-gray-400 mt-2">One project per line — Name | Tech Stack | Description</p>
            </div>

            {/* Certifications */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Certifications</h3>
              </div>
              <textarea value={profile.certifications || ''} onChange={e => setProfile({ ...profile, certifications: e.target.value })}
                placeholder={`AWS Cloud Practitioner - Amazon - 2025\nReact Developer Certification - Meta - 2024`}
                rows={3} className="input resize-none" />
              <p className="text-xs text-gray-400 mt-2">One per line — Name - Issuer - Year</p>
            </div>

            {/* Links & Resume */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center">
                  <Link className="w-4 h-4 text-cyan-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Links & Resume</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">LinkedIn URL</label>
                  <input value={profile.linkedin || ''} onChange={e => setProfile({ ...profile, linkedin: e.target.value })} placeholder="https://linkedin.com/in/yourname" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">GitHub URL</label>
                  <input value={profile.github || ''} onChange={e => setProfile({ ...profile, github: e.target.value })} placeholder="https://github.com/yourname" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Resume (PDF)</label>
                  <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm font-semibold mb-3 ${uploading ? 'border-blue-300 text-blue-400 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10'}`}>
                    {uploading
                      ? <><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Uploading...</>
                      : <><Upload className="w-4 h-4" /> Upload PDF (max 5MB)</>}
                    <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" disabled={uploading} />
                  </label>
                  {profile.resumeUrl && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl mb-3">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1 flex-1 truncate">
                        Resume uploaded — Click to view <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mb-1.5">Or paste a URL (Google Drive, Dropbox)</p>
                  <input value={profile.resumeUrl || ''} onChange={e => setProfile({ ...profile, resumeUrl: e.target.value })} placeholder="https://drive.google.com/..." className="input" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
