import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Eye, XCircle, Plus, TrendingUp, AlertTriangle, Users, MapPin, Clock, Code} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getCompanyInternships, closeInternship } from '../../api/internships';

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // grid | table

  useEffect(() => {
    getCompanyInternships()
      .then(res => setInternships(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleClose = async (id) => {
    try {
      await closeInternship(id);
      setInternships(prev => prev.map(i => i.id === id ? { ...i, status: 'closed' } : i));
      toast.success('Internship closed');
    } catch { toast.error('Failed to close internship'); }
  };

  const openCount = internships.filter(i => i.status === 'open').length;
  const closedCount = internships.filter(i => i.status === 'closed').length;

  const stats = [
    { label: 'Total Listings', value: internships.length, icon: Briefcase,    color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-100 dark:border-blue-900/40' },
    { label: 'Open',           value: openCount,           icon: TrendingUp,   color: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-900/40' },
    { label: 'Closed',         value: closedCount,         icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',     border: 'border-red-100 dark:border-red-900/40' },
    { label: 'Find Candidates',value: '→',                 icon: Users,        color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-100 dark:border-violet-900/40', link: '/company/candidates' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0F1E] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0F1E]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div initial="hidden" animate="show" variants={stagger}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.div variants={fadeUp}>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Company Dashboard</p>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
            </h1>
          </motion.div>
          <motion.div variants={fadeUp} className="flex gap-3">
            <Link to="/company/candidates" className="btn-secondary flex items-center gap-2">
              <Users className="w-4 h-4" /> Find Candidates
            </Link>
            <Link to="/company/post" className="btn-primary shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4" /> Post Internship
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="show" variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp}>
              {stat.link ? (
                <Link to={stat.link}
                  className={`bg-white dark:bg-[#111827] rounded-2xl border ${stat.border} p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200 block`}>
                  <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <div className={`text-2xl font-extrabold ${stat.color} leading-none`}>{stat.value}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{stat.label}</div>
                  </div>
                </Link>
              ) : (
                <div className={`bg-white dark:bg-[#111827] rounded-2xl border ${stat.border} p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200`}>
                  <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">{stat.value}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{stat.label}</div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Verification warning */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Only verified companies can post internships</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Contact admin to verify your company if you can't post.</p>
          </div>
        </div>

        {/* Listings */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">My Internship Listings</h2>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
                {['grid', 'table'].map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${view === v ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
              <Link to="/company/post" className="btn-primary text-sm py-1.5 px-4">
                <Plus className="w-3.5 h-3.5" /> New
              </Link>
            </div>
          </div>

          <div className="p-6">
            {internships.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No internships posted yet</p>
                <p className="text-sm text-gray-400 mb-5">Create your first listing to start receiving applications</p>
                <Link to="/company/post" className="btn-primary text-sm">Post Your First Internship</Link>
              </div>
            ) : view === 'grid' ? (
              <div className="grid md:grid-cols-2 gap-4">
                {internships.map((internship, i) => (
                  <motion.div key={internship.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm">{internship.title}</h3>
                          <span className={`badge text-xs ${internship.status === 'open' ? 'badge-green' : 'badge-red'}`}>
                            {internship.status === 'open' ? '● Open' : '● Closed'}
                          </span>
                        </div>
                        {internship.domain && <span className="badge-blue badge text-xs">{internship.domain}</span>}
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      {internship.location && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin className="w-3 h-3" /> {internship.location}
                        </div>
                      )}
                      {internship.duration && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" /> {internship.duration}
                        </div>
                      )}
                      {internship.skillsRequired && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Code className="w-3 h-3" />
                          <span className="truncate">{internship.skillsRequired.split(',').slice(0, 3).join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div>
                        {internship.stipend && <p className="text-sm font-bold text-emerald-600">{internship.stipend}</p>}
                        {internship.deadline && <p className="text-xs text-gray-400">Deadline: {new Date(internship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/company/applications/${internship.id}`}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 rounded-lg">
                          <Eye className="w-3.5 h-3.5" /> Applications
                        </Link>
                        {internship.status === 'open' && (
                          <button onClick={() => handleClose(internship.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline bg-red-50 dark:bg-red-900/20 px-2.5 py-1.5 rounded-lg">
                            <XCircle className="w-3.5 h-3.5" /> Close
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      {['Position', 'Domain', 'Location', 'Status', 'Deadline', 'Actions'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {internships.map((internship, i) => (
                      <motion.tr key={internship.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 pr-4">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{internship.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{internship.stipend}</p>
                        </td>
                        <td className="py-4 pr-4"><span className="badge-blue badge text-xs">{internship.domain || '—'}</span></td>
                        <td className="py-4 pr-4"><span className="text-sm text-gray-600 dark:text-gray-300">{internship.location || '—'}</span></td>
                        <td className="py-4 pr-4">
                          <span className={`badge ${internship.status === 'open' ? 'badge-green' : 'badge-red'}`}>
                            {internship.status === 'open' ? '● Open' : '● Closed'}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {internship.deadline ? new Date(internship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Link to={`/company/applications/${internship.id}`}
                              className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                              <Eye className="w-3.5 h-3.5" /> View
                            </Link>
                            {internship.status === 'open' && (
                              <button onClick={() => handleClose(internship.id)}
                                className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline">
                                <XCircle className="w-3.5 h-3.5" /> Close
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
