import { useState, useEffect } from 'react';
import { Briefcase, Clock, CheckCircle, XCircle, Calendar, Building2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { getMyApplications, withdrawApplication } from '../../api/internships';

const statusConfig = {
  applied:             { label: 'Applied',             color: 'badge-yellow', icon: Clock },
  under_review:        { label: 'Under Review',        color: 'badge-blue',   icon: Clock },
  shortlisted:         { label: 'Shortlisted',         color: 'badge-purple', icon: CheckCircle },
  interview_scheduled: { label: 'Interview Scheduled', color: 'badge-blue',   icon: Calendar },
  accepted:            { label: 'Accepted',            color: 'badge-green',  icon: CheckCircle },
  rejected:            { label: 'Rejected',            color: 'badge-red',    icon: XCircle },
};

const stages = ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'accepted'];

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [withdrawing, setWithdrawing] = useState(null);

  useEffect(() => {
    getMyApplications()
      .then(res => setApplications(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Withdraw this application? This cannot be undone.')) return;
    setWithdrawing(applicationId);
    try {
      await withdrawApplication(applicationId);
      setApplications(prev => prev.filter(a => a.id !== applicationId));
      toast.success('Application withdrawn');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw');
    } finally {
      setWithdrawing(null);
    }
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  const counts = {
    applied:             applications.filter(a => a.status === 'applied').length,
    under_review:        applications.filter(a => a.status === 'under_review').length,
    shortlisted:         applications.filter(a => a.status === 'shortlisted').length,
    interview_scheduled: applications.filter(a => a.status === 'interview_scheduled').length,
    accepted:            applications.filter(a => a.status === 'accepted').length,
    rejected:            applications.filter(a => a.status === 'rejected').length,
  };

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
        <div className="mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Track your journey</p>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Applications</h1>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')}
                className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                ← Show All ({applications.length})
              </button>
            )}
          </div>
        </div>

        {/* Stat cards — click to filter, click again to clear */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {[
            { key: 'applied',             label: 'Applied',     color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20',   ring: 'ring-amber-400' },
            { key: 'under_review',        label: 'In Review',   color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20',     ring: 'ring-blue-400' },
            { key: 'shortlisted',         label: 'Shortlisted', color: 'text-violet-600',  bg: 'bg-violet-50 dark:bg-violet-900/20', ring: 'ring-violet-400' },
            { key: 'interview_scheduled', label: 'Interview',   color: 'text-cyan-600',    bg: 'bg-cyan-50 dark:bg-cyan-900/20',     ring: 'ring-cyan-400' },
            { key: 'accepted',            label: 'Accepted',    color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', ring: 'ring-emerald-400' },
            { key: 'rejected',            label: 'Rejected',    color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20',       ring: 'ring-red-400' },
          ].map(({ key, label, color, bg, ring }) => (
            <button key={key} onClick={() => setFilter(filter === key ? 'all' : key)}
              className={`${bg} rounded-2xl p-3 text-center border-2 transition-all hover:shadow-sm ${
                filter === key ? `ring-2 ${ring} border-transparent scale-105 shadow-md` : 'border-transparent hover:scale-102'
              }`}>
              <div className={`text-2xl font-extrabold ${color}`}>{counts[key]}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{label}</div>
            </button>
          ))}
        </div>

        {/* Results label */}
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-4">
          {filter === 'all'
            ? `${applications.length} total application${applications.length !== 1 ? 's' : ''}`
            : `${filtered.length} ${filter.replace(/_/g, ' ')} application${filtered.length !== 1 ? 's' : ''}`}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              {filter === 'all' ? 'No applications yet' : `No ${filter.replace(/_/g, ' ')} applications`}
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
              {filter === 'all' ? 'Start applying to internships to see them here' : 'Try a different filter above'}
            </p>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="btn-primary text-sm">Show All Applications</button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((app, i) => {
              const s = statusConfig[app.status] || { label: app.status, color: 'badge-blue', icon: Clock };
              const StatusIcon = s.icon;
              const currentStageIdx = stages.indexOf(app.status);
              const canWithdraw = ['applied', 'under_review'].includes(app.status);

              return (
                <motion.div key={app.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md transition-all duration-200">

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm">
                        {app.companyName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">{app.internshipTitle}</h3>
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                          <Building2 className="w-3.5 h-3.5" />{app.companyName}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2">
                      <span className={`${s.color} badge flex items-center gap-1.5`}>
                        <StatusIcon className="w-3.5 h-3.5" />{s.label}
                      </span>
                      {app.interviewDate && (
                        <div className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
                          <Calendar className="w-3.5 h-3.5" />
                          Interview: {new Date(app.interviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                      {canWithdraw && (
                        <button onClick={() => handleWithdraw(app.id)} disabled={withdrawing === app.id}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition-colors">
                          {withdrawing === app.id
                            ? <div className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>

                  {app.status !== 'rejected' && (
                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center">
                        {stages.map((stage, idx) => {
                          const isCompleted = idx <= currentStageIdx;
                          const isCurrent = idx === currentStageIdx;
                          return (
                            <div key={stage} className="flex items-center flex-1">
                              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isCompleted ? isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50 shadow-md' : 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                {isCompleted && !isCurrent ? '✓' : idx + 1}
                              </div>
                              {idx < stages.length - 1 && (
                                <div className={`flex-1 h-1 mx-1.5 rounded-full transition-all ${idx < currentStageIdx ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-800'}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-2">
                        {stages.map(stage => (
                          <span key={stage} className="text-gray-400 dark:text-gray-500 capitalize text-center" style={{ fontSize: '10px', flex: 1 }}>
                            {stage.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {app.status === 'rejected' && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-2">
                        <XCircle className="w-4 h-4" /> Not selected this time — keep going, the right opportunity is ahead!
                      </p>
                    </div>
                  )}

                  {app.status === 'accepted' && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-semibold">
                        <CheckCircle className="w-4 h-4" /> 🎉 Congratulations! You got the internship!
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
