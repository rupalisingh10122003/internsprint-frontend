import { useState, useEffect } from 'react';
import { Users, Building2, Briefcase, CheckCircle, Trash2, Shield, TrendingUp, BarChart3, PieChart, Mail, Globe, MapPin, Calendar, Eye, GraduationCap, Code, User, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';
import Navbar from '../../components/Navbar';
import { getAllUsers, getAllCompanies, getAllInternshipsAdmin, verifyCompany, unverifyCompany, deleteInternshipAdmin, deactivateUser } from '../../api/internships';

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    Promise.all([getAllUsers(), getAllCompanies(), getAllInternshipsAdmin()])
      .then(([uRes, cRes, iRes]) => {
        setUsers(uRes.data.data || []);
        setCompanies(cRes.data.data || []);
        setInternships(iRes.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (id, verify) => {
    try {
      const fn = verify ? verifyCompany : unverifyCompany;
      const res = await fn(id);
      setCompanies(prev => prev.map(c => c.id === id ? res.data.data : c));
      if (selectedCompany?.id === id) setSelectedCompany(res.data.data);
      toast.success(verify ? 'Company verified!' : 'Verification revoked');
    } catch { toast.error('Failed to update company'); }
  };

  const handleDeleteInternship = async (id) => {
    if (!window.confirm('Delete this internship?')) return;
    try {
      await deleteInternshipAdmin(id);
      setInternships(prev => prev.filter(i => i.id !== id));
      toast.success('Internship deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await deactivateUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: false } : u));
      if (selectedUser?.id === id) setSelectedUser(prev => ({ ...prev, isActive: false }));
      toast.success('User deactivated');
    } catch { toast.error('Failed to deactivate user'); }
  };

  const roleData = [
    { name: 'Students', value: users.filter(u => u.role === 'student').length },
    { name: 'Companies', value: users.filter(u => u.role === 'company').length },
    { name: 'Admins', value: users.filter(u => u.role === 'admin').length },
  ].filter(d => d.value > 0);

  const domainData = internships.reduce((acc, i) => {
    const domain = i.domain || 'Other';
    const existing = acc.find(d => d.name === domain);
    if (existing) existing.count++;
    else acc.push({ name: domain, count: 1 });
    return acc;
  }, []).sort((a, b) => b.count - a.count).slice(0, 6);

  const companyStatusData = [
    { name: 'Verified', value: companies.filter(c => c.isVerified).length },
    { name: 'Pending', value: companies.filter(c => !c.isVerified).length },
  ].filter(d => d.value > 0);

  const internshipStatusData = [
    { name: 'Open', value: internships.filter(i => i.status === 'open').length },
    { name: 'Closed', value: internships.filter(i => i.status === 'closed').length },
  ].filter(d => d.value > 0);

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', filter: () => { setTab('users'); setUserFilter('all'); } },
    { label: 'Companies', value: companies.length, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', filter: () => setTab('companies') },
    { label: 'Verified', value: companies.filter(c => c.isVerified).length, icon: Shield, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', filter: () => setTab('companies') },
    { label: 'Internships', value: internships.length, icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', filter: () => setTab('internships') },
    { label: 'Open Roles', value: internships.filter(i => i.status === 'open').length, icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-900/20', filter: () => setTab('internships') },
    { label: 'Active Users', value: users.filter(u => u.isActive).length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', filter: () => { setTab('users'); setUserFilter('all'); } },
  ];

  const filteredUsers = userFilter === 'all' ? users : users.filter(u => u.role === userFilter);

  if (loading) return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0F1E] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0F1E]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Platform Control</p>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" /> Admin Panel
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.button key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} onClick={stat.filter}
              className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col items-center text-center py-4 px-2 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
            </motion.button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-fit overflow-x-auto">
          {[
            { key: 'overview', label: 'Analytics', icon: BarChart3 },
            { key: 'companies', label: 'Companies', count: companies.length },
            { key: 'internships', label: 'Internships', count: internships.length },
            { key: 'users', label: 'Users', count: users.length },
          ].map(({ key, label, count, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${tab === key ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              {Icon && <Icon className="w-4 h-4" />}
              {label}
              {count !== undefined && <span className="text-xs opacity-60">({count})</span>}
            </button>
          ))}
        </div>

        {/* Analytics */}
        {tab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" /> Internships by Domain
              </h3>
              {domainData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={domainData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-48 flex items-center justify-center text-gray-400">No data yet</div>}
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" /> User Distribution
              </h3>
              {roleData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                      {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : <div className="h-48 flex items-center justify-center text-gray-400">No data yet</div>}
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Company Status</h3>
              {companyStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <RechartsPie>
                    <Pie data={companyStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, value }) => `${name}: ${value}`}>
                      <Cell fill="#10b981" /><Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip /><Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : <div className="h-40 flex items-center justify-center text-gray-400">No companies yet</div>}
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Internship Status</h3>
              {internshipStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <RechartsPie>
                    <Pie data={internshipStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, value }) => `${name}: ${value}`}>
                      <Cell fill="#3b82f6" /><Cell fill="#6b7280" />
                    </Pie>
                    <Tooltip /><Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : <div className="h-40 flex items-center justify-center text-gray-400">No internships yet</div>}
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:col-span-2 bg-gradient-to-br from-blue-600 to-cyan-500 border-0">
              <h3 className="font-bold text-white mb-4 text-lg">Platform Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: users.length },
                  { label: 'Active Students', value: users.filter(u => u.role === 'student' && u.isActive).length },
                  { label: 'Verified Companies', value: companies.filter(c => c.isVerified).length },
                  { label: 'Open Internships', value: internships.filter(i => i.status === 'open').length },
                ].map((item) => (
                  <div key={item.label} className="text-center bg-white/10 rounded-xl p-4">
                    <div className="text-3xl font-extrabold text-white">{item.value}</div>
                    <div className="text-blue-100 text-sm mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Companies Tab */}
        {tab === 'companies' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Company Verification
                <span className="ml-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full font-normal">
                  {companies.filter(c => !c.isVerified).length} pending
                </span>
              </h2>
              <div className="space-y-3">
                {companies.map((company, i) => (
                  <motion.button key={company.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedCompany(selectedCompany?.id === company.id ? null : company)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all text-left ${selectedCompany?.id === company.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' : 'bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                        {company.companyName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{company.companyName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{company.industry || 'Industry N/A'} • {company.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`badge text-xs ${company.isVerified ? 'badge-green' : 'badge-yellow'}`}>
                        {company.isVerified ? '✓ Verified' : '⏳ Pending'}
                      </span>
                      <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {selectedCompany && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 h-fit">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                        {selectedCompany.companyName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{selectedCompany.companyName}</h3>
                        <span className={`badge text-xs ${selectedCompany.isVerified ? 'badge-green' : 'badge-yellow'}`}>
                          {selectedCompany.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedCompany(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                <div className="space-y-2.5 mb-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Company Information</p>
                  {selectedCompany.logoUrl && (
                    <div className="flex justify-center mb-3">
                      <img src={selectedCompany.logoUrl} alt="logo" className="w-16 h-16 rounded-xl object-contain border border-gray-200 dark:border-gray-700 bg-white p-1" />
                    </div>
                  )}
                  {selectedCompany.tagline && <p className="text-xs italic text-gray-500 text-center mb-2">"{selectedCompany.tagline}"</p>}
                  {selectedCompany.industry && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" /><span><strong>Industry:</strong> {selectedCompany.industry}</span></div>}
                  {selectedCompany.companyType && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Shield className="w-4 h-4 text-gray-400 flex-shrink-0" /><span><strong>Type:</strong> {selectedCompany.companyType}</span></div>}
                  {selectedCompany.companySize && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Users className="w-4 h-4 text-gray-400 flex-shrink-0" /><span><strong>Size:</strong> {selectedCompany.companySize}</span></div>}
                  {selectedCompany.foundedYear && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" /><span><strong>Founded:</strong> {selectedCompany.foundedYear}</span></div>}
                  {selectedCompany.user?.email && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Mail className="w-4 h-4 text-gray-400 flex-shrink-0" /><a href={`mailto:${selectedCompany.user.email}`} className="hover:text-blue-600 hover:underline truncate">{selectedCompany.user.email}</a></div>}
                  {selectedCompany.phone && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Phone className="w-4 h-4 text-gray-400 flex-shrink-0" /><span>{selectedCompany.phone}</span></div>}
                  {selectedCompany.website && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Globe className="w-4 h-4 text-gray-400 flex-shrink-0" /><a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline truncate">{selectedCompany.website}</a></div>}
                  {selectedCompany.linkedinUrl && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><span className="w-4 h-4 bg-blue-700 text-white rounded flex items-center justify-center text-xs font-bold flex-shrink-0">in</span><a href={selectedCompany.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline truncate">{selectedCompany.linkedinUrl}</a></div>}
                  {selectedCompany.location && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" /><span>{selectedCompany.location}</span></div>}
                  {selectedCompany.createdAt && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" /><span>Registered: {new Date(selectedCompany.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>}
                  {(selectedCompany.gstin || selectedCompany.cin || selectedCompany.pan) && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1.5">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Legal IDs</p>
                      {selectedCompany.gstin && <div className="flex items-center justify-between text-xs"><span className="text-gray-500 font-medium">GSTIN</span><span className="font-mono font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">{selectedCompany.gstin}</span></div>}
                      {selectedCompany.cin && <div className="flex items-center justify-between text-xs"><span className="text-gray-500 font-medium">CIN</span><span className="font-mono font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">{selectedCompany.cin}</span></div>}
                      {selectedCompany.pan && <div className="flex items-center justify-between text-xs"><span className="text-gray-500 font-medium">PAN</span><span className="font-mono font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">{selectedCompany.pan}</span></div>}
                    </div>
                  )}
                  {selectedCompany.perks && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Perks</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCompany.perks.split(',').map((p, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full border border-amber-100 dark:border-amber-800">{p.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Posted Internships ({internships.filter(i => i.companyName === selectedCompany.companyName).length})</p>
                    {internships.filter(i => i.companyName === selectedCompany.companyName).length === 0 ? (
                      <p className="text-sm text-gray-400 italic">No internships posted yet</p>
                    ) : (
                      <div className="space-y-2">
                        {internships.filter(i => i.companyName === selectedCompany.companyName).map(intern => (
                          <div key={intern.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{intern.title}</span>
                              {intern.location && <span className="text-xs text-gray-400 ml-2">• {intern.location}</span>}
                            </div>
                            <span className={`badge text-xs ${intern.status === 'open' ? 'badge-green' : 'badge-red'}`}>{intern.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={() => handleVerify(selectedCompany.id, !selectedCompany.isVerified)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${selectedCompany.isVerified ? 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 border border-red-200 dark:border-red-800' : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/20'}`}>
                    {selectedCompany.isVerified ? '✕ Revoke Verification' : '✓ Verify Company'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Internships Tab */}
        {tab === 'internships' && (
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">All Internships</h2>
            <div className="space-y-3">
              {internships.map((internship, i) => (
                <motion.div key={internship.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{internship.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{internship.companyName}</span>
                      {internship.domain && <span className="badge-blue badge text-xs">{internship.domain}</span>}
                      {internship.location && <span className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{internship.location}</span>}
                      <span className={`badge text-xs ${internship.status === 'open' ? 'badge-green' : 'badge-red'}`}>{internship.status}</span>
                    </div>
                    {internship.skillsRequired && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {internship.skillsRequired.split(',').slice(0, 3).map(s => (
                          <span key={s} className="text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">{s.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleDeleteInternship(internship.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors ml-4 flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">All Users</h2>
                <div className="flex gap-1.5 flex-wrap">
                  {['all', 'student', 'company', 'admin'].map(role => (
                    <button key={role} onClick={() => { setUserFilter(role); setSelectedUser(null); }}
                      className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${userFilter === role ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      {role === 'all' ? `All (${users.length})` : `${role.charAt(0).toUpperCase() + role.slice(1)}s (${users.filter(u => u.role === role).length})`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {filteredUsers.map((user, i) => (
                  <motion.button key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-left ${selectedUser?.id === user.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' : 'bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${user.role === 'admin' ? 'bg-red-500' : user.role === 'company' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                        {user.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`badge text-xs ${user.role === 'admin' ? 'badge-red' : user.role === 'company' ? 'badge-purple' : 'badge-blue'}`}>{user.role}</span>
                      <span className={`badge text-xs ${user.isActive ? 'badge-green' : 'badge-red'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* User Detail Panel */}
            <AnimatePresence>
              {selectedUser && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 h-fit">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm ${selectedUser.role === 'admin' ? 'bg-red-500' : selectedUser.role === 'company' ? 'bg-purple-500' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
                        {selectedUser.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{selectedUser.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge text-xs ${selectedUser.role === 'admin' ? 'badge-red' : selectedUser.role === 'company' ? 'badge-purple' : 'badge-blue'}`}>{selectedUser.role}</span>
                          <span className={`badge text-xs ${selectedUser.isActive ? 'badge-green' : 'badge-red'}`}>{selectedUser.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="space-y-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Account Information</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a href={`mailto:${selectedUser.email}`} className="hover:text-blue-600 hover:underline">{selectedUser.email}</a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>User ID: #{selectedUser.id}</span>
                    </div>
                    {selectedUser.createdAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>Joined: {new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>

                  {/* Student-specific info */}
                  {selectedUser.role === 'student' && (
                    <div className="space-y-2.5 bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 mb-4 border border-blue-100 dark:border-blue-900/30">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3">Student Details</p>
                      {selectedUser.college ? (
                        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <GraduationCap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>{selectedUser.college}{selectedUser.degree ? ` — ${selectedUser.degree}` : ''}{selectedUser.cgpa ? ` • CGPA: ${selectedUser.cgpa}` : ''}</span>
                        </div>
                      ) : <p className="text-xs text-gray-400 italic">No college info added</p>}
                      {selectedUser.skills ? (
                        <div className="flex items-start gap-2">
                          <Code className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div className="flex flex-wrap gap-1">
                            {selectedUser.skills.split(',').map(s => (
                              <span key={s} className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md">{s.trim()}</span>
                            ))}
                          </div>
                        </div>
                      ) : <p className="text-xs text-gray-400 italic">No skills added</p>}
                      {selectedUser.resumeUrl && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-500" />
                          <a href={selectedUser.resumeUrl} target="_blank" rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View Resume →</a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Company-specific info */}
                  {selectedUser.role === 'company' && (
                    <div className="space-y-2 bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4 mb-4 border border-purple-100 dark:border-purple-900/30">
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-3">Company Activity</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {(() => {
                          const uc = companies.find(c => c.user?.id === selectedUser.id);
                          return <div><p className="text-sm font-bold text-gray-800 dark:text-gray-100">{uc?.companyName || 'No company linked'}</p><p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Internships: <strong>{internships.filter(i => uc && i.companyName === uc.companyName).length}</strong></p></div>;
                        })()}                      
                      </p>
                    </div>
                  )}

                  {selectedUser.isActive && selectedUser.role !== 'admin' && (
                    <button onClick={() => handleDeactivate(selectedUser.id)}
                      className="w-full py-2.5 rounded-xl font-semibold text-sm bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 transition-all border border-red-200 dark:border-red-800">
                      Deactivate User
                    </button>
                  )}
                  {!selectedUser.isActive && (
                    <div className="w-full py-2.5 rounded-xl text-center text-sm text-gray-400 bg-gray-100 dark:bg-gray-800">
                      User is already deactivated
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
