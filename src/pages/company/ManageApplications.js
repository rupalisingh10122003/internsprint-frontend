import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, CheckCircle, XCircle, Calendar, Eye, Mail, GraduationCap, Code, FileText, ExternalLink, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/Navbar';
import { getInternshipApplications, updateApplicationStatus } from '../../api/internships';

const statusConfig = {
  applied:             { label: 'Applied',             color: 'badge-yellow' },
  under_review:        { label: 'Under Review',        color: 'badge-blue' },
  shortlisted:         { label: 'Shortlisted',         color: 'badge-purple' },
  interview_scheduled: { label: 'Interview Scheduled', color: 'badge-blue' },
  accepted:            { label: 'Accepted',            color: 'badge-green' },
  rejected:            { label: 'Rejected',            color: 'badge-red' },
};

const nextActions = {
  applied:             [{ status: 'under_review', label: 'Move to Review', color: 'btn-primary' }, { status: 'rejected', label: 'Reject', color: 'btn-secondary text-red-500' }],
  under_review:        [{ status: 'shortlisted', label: 'Shortlist', color: 'btn-primary' }, { status: 'rejected', label: 'Reject', color: 'btn-secondary text-red-500' }],
  shortlisted:         [{ status: 'interview_scheduled', label: 'Schedule Interview', color: 'btn-primary' }, { status: 'rejected', label: 'Reject', color: 'btn-secondary text-red-500' }],
  interview_scheduled: [{ status: 'accepted', label: 'Accept', color: 'btn-primary' }, { status: 'rejected', label: 'Reject', color: 'btn-secondary text-red-500' }],
  accepted:            [],
  rejected:            [],
};

export default function ManageApplications() {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewApp, setInterviewApp] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewLink, setInterviewLink] = useState('');
  const [interviewNote, setInterviewNote] = useState('');

  useEffect(() => {
    getInternshipApplications(id)
      .then(res => setApplications(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (applicationId, newStatus, app) => {
    if (newStatus === 'interview_scheduled') {
      setInterviewApp({ ...app, id: applicationId });
      setShowInterviewModal(true);
      return;
    }
    setUpdating(applicationId);
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, status: newStatus } : a));
      toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleScheduleInterview = async () => {
    if (!interviewDate || !interviewTime) {
      toast.error('Please select date and time');
      return;
    }
    setUpdating(interviewApp.id);
    try {
      await updateApplicationStatus(interviewApp.id, 'interview_scheduled');
      setApplications(prev => prev.map(a => a.id === interviewApp.id ? {
        ...a,
        status: 'interview_scheduled',
        interviewDate,
        interviewTime,
        interviewLink,
        interviewNote,
      } : a));
      toast.success(`Interview scheduled for ${new Date(interviewDate).toLocaleDateString('en-IN')} at ${interviewTime}`);
      setShowInterviewModal(false);
      setInterviewDate(''); setInterviewTime(''); setInterviewLink(''); setInterviewNote('');
    } catch {
      toast.error('Failed to schedule interview');
    } finally {
      setUpdating(null);
    }
  };

  const filteredApps = filterStatus === 'all' ? applications : applications.filter(a => a.status === filterStatus);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="flex items-center gap-4 mb-8">
          <Link to="/company" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Manage Applications</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{applications.length} total applicants</p>
          </div>
        </div>

        {/* Clickable Status Summary Cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {Object.entries(statusConfig).map(([key, val]) => {
            const count = applications.filter(a => a.status === key).length;
            return (
              <button key={key} onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
                className={`card text-center py-3 px-2 cursor-pointer transition-all hover:shadow-md ${filterStatus === key ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className="text-xl font-extrabold text-gray-900 dark:text-white">{count}</div>
                <span className={`${val.color} badge text-xs mt-1`}>{val.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter indicator */}
        {filterStatus !== 'all' && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Showing: <strong>{statusConfig[filterStatus]?.label}</strong></span>
            <button onClick={() => setFilterStatus('all')} className="text-xs text-blue-600 hover:underline">Clear filter</button>
          </div>
        )}

        {filteredApps.length === 0 ? (
          <div className="text-center py-16 card">
            <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {filterStatus === 'all' ? 'No applications yet' : `No ${statusConfig[filterStatus]?.label} applications`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((app, i) => {
              const s = statusConfig[app.status] || { label: app.status, color: 'badge-blue' };
              const actions = nextActions[app.status] || [];
              const isExpanded = expandedId === app.id;

              return (
                <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }} className="card hover:shadow-md transition-shadow">

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {app.studentName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{app.studentName || `Applicant #${app.id}`}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Mail className="w-3 h-3" />
                          <a href={`mailto:${app.studentEmail}`} className="hover:text-blue-600 hover:underline">{app.studentEmail}</a>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Applied {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`${s.color} badge`}>{s.label}</span>
                      <button onClick={() => setExpandedId(isExpanded ? null : app.id)}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {isExpanded ? 'Hide' : 'View Details'}
                      </button>
                    </div>
                  </div>

                  {/* Interview details if scheduled */}
                  {app.status === 'interview_scheduled' && app.interviewDate && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <div className="text-sm">
                        <span className="font-semibold text-blue-700 dark:text-blue-300">Interview: </span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {new Date(app.interviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} at {app.interviewTime}
                        </span>
                        {app.interviewLink && (
                          <a href={app.interviewLink} target="_blank" rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:underline flex items-center gap-1 inline-flex">
                            <ExternalLink className="w-3 h-3" /> Join Link
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Expanded view */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">

                        {/* Student Profile Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                          {app.studentCollege && (
                            <div className="flex items-start gap-2">
                              <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Education</p>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                  {app.studentCollege}
                                  {app.studentDegree && ` — ${app.studentDegree}`}
                                  {app.studentCgpa && ` • CGPA: ${app.studentCgpa}`}
                                </p>
                              </div>
                            </div>
                          )}
                          {app.studentSkills && (
                            <div className="flex items-start gap-2">
                              <Code className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Skills</p>
                                <div className="flex flex-wrap gap-1">
                                  {app.studentSkills.split(',').map(skill => (
                                    <span key={skill} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md">
                                      {skill.trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Resume */}
                        {app.resumeUrl && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                              View Resume <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* Cover Letter */}
                        {app.coverLetter && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Cover Letter</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl leading-relaxed">
                              {app.coverLetter}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        {actions.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Update Status</p>
                            <div className="flex gap-2 flex-wrap">
                              {actions.map(action => (
                                <button key={action.status}
                                  onClick={() => handleStatusUpdate(app.id, action.status, app)}
                                  disabled={updating === app.id}
                                  className={`${action.color} text-sm py-2 px-4 flex items-center gap-1.5`}>
                                  {updating === app.id
                                    ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    : action.status === 'accepted' ? <CheckCircle className="w-4 h-4" />
                                    : action.status === 'rejected' ? <XCircle className="w-4 h-4" />
                                    : <Calendar className="w-4 h-4" />}
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interview Scheduling Modal */}
      {showInterviewModal && interviewApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-5">
              <Calendar className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Schedule Interview</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{interviewApp.studentName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                  <input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Time *</label>
                  <input type="time" value={interviewTime} onChange={e => setInterviewTime(e.target.value)}
                    className="input text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Meeting Link (optional)</label>
                <input type="url" value={interviewLink} onChange={e => setInterviewLink(e.target.value)}
                  placeholder="https://meet.google.com/..." className="input text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Note to Candidate (optional)</label>
                <textarea value={interviewNote} onChange={e => setInterviewNote(e.target.value)}
                  placeholder="Any instructions for the candidate..."
                  rows={3} className="input text-sm resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowInterviewModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleScheduleInterview} disabled={updating === interviewApp?.id}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {updating === interviewApp?.id
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Calendar className="w-4 h-4" /> Schedule</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
