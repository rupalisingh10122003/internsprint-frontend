import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle, Bell, ArrowRight, Search, TrendingUp, Zap, Bookmark, FileText, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getMyApplications, getNotifications } from '../../api/internships';

const statusConfig = {
  applied:             { label: 'Applied',             color: 'badge-yellow' },
  under_review:        { label: 'Under Review',        color: 'badge-blue' },
  shortlisted:         { label: 'Shortlisted',         color: 'badge-purple' },
  interview_scheduled: { label: 'Interview Scheduled', color: 'badge-blue' },
  accepted:            { label: 'Accepted',            color: 'badge-green' },
  rejected:            { label: 'Rejected',            color: 'badge-red' },
};

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

export default function StudentDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, notifRes] = await Promise.all([getMyApplications(), getNotifications()]);
        setApplications(appRes.data.data || []);
        setNotifications(notifRes.data.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Applied',    value: applications.length,                                                 icon: Briefcase,   color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-blue-100 dark:border-blue-900/40' },
    { label: 'In Review',  value: applications.filter(a => a.status === 'under_review').length,        icon: Clock,       color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20',  border: 'border-amber-100 dark:border-amber-900/40' },
    { label: 'Interviews', value: applications.filter(a => a.status === 'interview_scheduled').length, icon: TrendingUp,  color: 'text-violet-600',  bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-100 dark:border-violet-900/40' },
    { label: 'Accepted',   value: applications.filter(a => a.status === 'accepted').length,            icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-900/40' },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const recentApps = applications.slice(0, 5);

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
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Good to see you back 👋</p>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              <span className="gradient-text">{user?.name?.split(' ')[0]}</span>'s Dashboard
            </h1>
          </motion.div>
          <motion.div variants={fadeUp}>
            <Link to="/student/browse" className="btn-primary shadow-lg shadow-blue-500/20">
              <Search className="w-4 h-4" /> Find Internships
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="show" variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp}
              className={`bg-white dark:bg-[#111827] rounded-2xl border ${stat.border} p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200`}>
              <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white leading-none">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT — Recent Applications */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Applications</h2>
                <Link to="/student/applications"
                  className="text-sm text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentApps.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No applications yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">Start applying to internships to track them here</p>
                  <Link to="/student/browse" className="btn-primary text-sm">Browse Internships</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentApps.map((app, i) => {
                    const s = statusConfig[app.status] || { label: app.status, color: 'badge-blue' };
                    return (
                      <motion.div key={app.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {app.companyName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{app.internshipTitle}</p>
                            <p className="text-xs text-gray-400">{app.companyName}</p>
                          </div>
                        </div>
                        <span className={s.color + ' badge'}>{s.label}</span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          {/* END LEFT */}

          {/* RIGHT — Notifications + Quick Actions + CTA */}
          <div className="space-y-5">

            {/* Notifications */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Notifications
                  {unreadCount > 0 && (
                    <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </h2>
              </div>
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No notifications yet</p>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 4).map((n) => (
                    <div key={n.id}
                      className={`p-3 rounded-xl ${!n.isRead
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800'
                        : 'bg-gray-50 dark:bg-gray-800/60'}`}>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-xs">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
              <div className="space-y-1">
                {[
                  { to: '/student/browse',       icon: Search,    label: 'Find Internships',  color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
                  { to: '/student/applications', icon: Briefcase, label: 'My Applications',   color: 'text-violet-600',  bg: 'bg-violet-50 dark:bg-violet-900/20' },
                  { to: '/student/saved',        icon: Bookmark,  label: 'Saved Internships', color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
                  { to: '/student/resume',       icon: FileText,  label: 'ATS Resume',        color: 'text-cyan-600',    bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
                  { to: '/student/profile',      icon: User,      label: 'Update Profile',    color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                ].map((action) => (
                  <Link key={action.to} to={action.to}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                    <div className={`w-8 h-8 ${action.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <action.icon className={`w-4 h-4 ${action.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                      {action.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Profile CTA */}
            <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-600 to-cyan-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white mb-1">Complete Your Profile</h3>
                <p className="text-blue-100 text-xs mb-4 leading-relaxed">
                  A complete profile gets 3x more views from companies.
                </p>
                <Link to="/student/profile"
                  className="block text-center bg-white text-blue-600 font-bold py-2 rounded-xl text-sm hover:bg-blue-50 transition-colors">
                  Update Now →
                </Link>
              </div>
            </div>

          </div>
          {/* END RIGHT */}

        </div>
      </div>
    </div>
  );
}
