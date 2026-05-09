import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, DollarSign, Code, ArrowRight, ArrowLeft, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { postInternship } from '../../api/internships';

const domains = ['Web Development', 'Machine Learning', 'UI/UX Design', 'Data Science', 'Digital Marketing', 'Mobile Development', 'DevOps', 'Cybersecurity', 'Blockchain', 'Other'];

const skillSuggestions = ['Java', 'Python', 'React', 'Node.js', 'MySQL', 'MongoDB', 'Spring Boot', 'Machine Learning', 'TensorFlow', 'Figma', 'Adobe XD', 'Flutter', 'Docker', 'AWS', 'Git'];

export default function PostInternship() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', domain: '', location: '', skillsRequired: '',
    description: '', stipend: '', duration: '', deadline: '',
  });
  const [skillList, setSkillList] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !skillList.includes(s)) setSkillList([...skillList, s]);
    setSkillInput('');
  };

  const removeSkill = (skill) => setSkillList(skillList.filter(s => s !== skill));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error('Please enter the internship title'); return; }
    setLoading(true);
    try {
      await postInternship({ ...form, skillsRequired: skillList.join(', ') });
      toast.success('Internship posted successfully!');
      navigate('/company');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post internship');
    } finally {
      setLoading(false);
    }
  };

  const completeness = [form.title, form.domain, form.location, skillList.length > 0, form.description, form.stipend, form.duration, form.deadline].filter(Boolean).length;
  const completePct = Math.round((completeness / 8) * 100);

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0F1E]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/company" className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5">New Listing</p>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Post an Internship</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">

            {/* Basic Info */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white">Basic Information</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Internship Title <span className="text-red-500">*</span>
                  </label>
                  <input name="title" value={form.title} onChange={handleChange}
                    placeholder="e.g. Software Developer Intern" className="input" required />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Domain</label>
                    <select name="domain" value={form.domain} onChange={handleChange} className="input">
                      <option value="">Select domain</option>
                      {domains.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</span>
                    </label>
                    <input name="location" value={form.location} onChange={handleChange}
                      placeholder="Pune / Remote / Mumbai" className="input" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange}
                    placeholder="Describe the role, responsibilities, and what the intern will learn..." rows={5} className="input resize-none" />
                </div>
              </div>
            </motion.div>

            {/* Duration & Compensation */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white">Duration & Compensation</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</span>
                  </label>
                  <input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 3 months" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Stipend</span>
                  </label>
                  <input name="stipend" value={form.stipend} onChange={handleChange} placeholder="e.g. ₹15,000/month" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Deadline</span>
                  </label>
                  <input type="date" name="deadline" value={form.deadline} onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]} className="input" />
                </div>
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-violet-50 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-violet-600" />
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white">Required Skills</h2>
              </div>
              <div className="flex gap-2 mb-4">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
                  placeholder="Type a skill and press Enter..." className="input flex-1" />
                <button type="button" onClick={() => addSkill(skillInput)} className="btn-primary px-5">Add</button>
              </div>
              {skillList.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  {skillList.map(skill => (
                    <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-blue-300 hover:text-red-500 transition-colors text-base leading-none">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-2 font-medium">Quick add:</p>
                <div className="flex flex-wrap gap-2">
                  {skillSuggestions.filter(s => !skillList.includes(s)).slice(0, 10).map(skill => (
                    <button type="button" key={skill} onClick={() => addSkill(skill)}
                      className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors font-medium">
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate('/company')} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <> Post Internship <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Completeness */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Listing Completeness</h3>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-extrabold gradient-text">{completePct}%</span>
                <span className="text-xs text-gray-400 pb-1">{completeness}/8 fields</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-4">
                <motion.div initial={{ width: 0 }} animate={{ width: `${completePct}%` }} transition={{ duration: 0.6 }}
                  className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Title', done: !!form.title },
                  { label: 'Domain', done: !!form.domain },
                  { label: 'Location', done: !!form.location },
                  { label: 'Skills', done: skillList.length > 0 },
                  { label: 'Description', done: !!form.description },
                  { label: 'Stipend', done: !!form.stipend },
                  { label: 'Duration', done: !!form.duration },
                  { label: 'Deadline', done: !!form.deadline },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      {done && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                    <span className={`text-xs font-medium ${done ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5">
              <h3 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-3">💡 Tips for Better Results</h3>
              <ul className="space-y-2">
                {[
                  'Add specific skills to attract the right candidates',
                  'Write a clear description of daily tasks',
                  'Mention exact stipend amount — it increases applications by 40%',
                  'Set a realistic deadline to create urgency',
                ].map((tip, i) => (
                  <li key={i} className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
