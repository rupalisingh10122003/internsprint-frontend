import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, CheckCircle, XCircle, Calendar, Eye, Mail, GraduationCap, Code, FileText, ExternalLink, Clock, Star, ChevronDown, ChevronUp, Phone } from 'lucide-react';
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
  const [selectedApp, setSelectedApp] = useState(null);
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
      if (selectedApp?.id === applicationId) setSelectedApp(prev => ({ ...prev, status: newStatus }));
      toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleScheduleInterview = async () => {
    if (!interviewDate || !interviewTime) { toast.error('Please select date and time'); return; }
    setUpdating(interviewApp.id);
    try {
      await updateApplicationStatus(interviewApp.id, 'interview_scheduled');
      setApplications(prev => prev.map(a => a.id === interviewApp.id ? { ...a, status: 'interview_scheduled', interviewDate, interviewTime, interviewLink, interviewNote } : a));
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
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0F1E] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0F1E]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="flex items-center gap-4 mb-8">
          <Link to="/company" className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5">Applications</p>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Manage Applications</h1>
          </div>
          <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 px-3 py-1.5 rounded-xl">
            {applications.length} total applicants
          </span>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {Object.entries(statusConfig).map(([key, val]) => {
            const count = applications.filter(a => a.status === key).length;
            return (
              <button key={key} onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
                className={`bg-white dark:bg-[#111827] border rounded-2xl text-center py-3 px-2 cursor-pointer transition-all hover:shadow-md ${filterStatus === key ? 'ring-2 ring-blue-500 border-blue-200 dark:border-blue-700' : 'border-gray-100 dark:border-gray-800'}`}>
                <div className="text-xl font-extrabold text-gray-900 dark:text-white">{count}</div>
                <span className={`${val.color} badge text-xs mt-1`}>{val.label}</span>
              </button>
            );
          })}
        </div>

        {filterStatus !== 'all' && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">Showing: <strong>{statusConfig[filterStatus]?.label}</strong></span>
            <button onClick={() => setFilterStatus('all')} className="text-xs text-blue-600 hover:underline">Clear</button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Applications List */}
          <div>
            {filteredApps.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800">
                <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  {filterStatus === 'all' ? 'No applications yet' : `No ${statusConfig[filterStatus]?.label} applications`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApps.map((app, i) => {
                  const s = statusConfig[app.status] || { label: app.status, color: 'badge-blue' };
                  const isSelected = selectedApp?.id === app.id;

                  return (
                    <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedApp(isSelected ? null : app)}
                      className={`bg-white dark:bg-[#111827] rounded-2xl border cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 border-blue-200 dark:border-blue-700' : 'border-gray-100 dark:border-gray-800'}`}>

                      <div className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {app.studentName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{app.studentName || `Applicant #${app.id}`}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{app.studentEmail}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`${s.color} badge text-xs`}>{s.label}</span>
                          {isSelected ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>

                      {app.status === 'interview_scheduled' && app.interviewDate && (
                        <div className="px-4 pb-3">
                          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center gap-2 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              Interview: {new Date(app.interviewDate).toLocaleDateString('en-IN')} at {app.interviewTime}
                            </span>
                            {app.interviewLink && (
                              <a href={app.interviewLink} target="_blank" rel="noopener noreferrer"
                                className="ml-auto text-blue-600 hover:underline flex items-center gap-1">
                                Join <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Student Detail Panel */}
          <AnimatePresence>
            {selectedApp && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 h-fit sticky top-24">

                {/* Student Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {selectedApp.studentName?.charAt(0) || 'S'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{selectedApp.studentName}</h3>
                      {applications.indexOf(selectedApp) === 0 && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3" /> First Applicant
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      <a href={`mailto:${selectedApp.studentEmail}`} className="hover:text-blue-600 hover:underline">{selectedApp.studentEmail}</a>
                    </div>
                    <span className={`${statusConfig[selectedApp.status]?.color || 'badge-blue'} badge text-xs mt-1`}>
                      {statusConfig[selectedApp.status]?.label || selectedApp.status}
                    </span>
                  </div>
                </div>

                {/* Education */}
                {(selectedApp.studentCollege || selectedApp.studentDegree) && (
                  <div className="mb-4 p-3.5 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-2">Education</p>
                    <div className="flex items-start gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {selectedApp.studentCollege}
                        </p>
                        {selectedApp.studentDegree && <p className="text-xs text-gray-500">{selectedApp.studentDegree}</p>}
                        {selectedApp.studentCgpa && <p className="text-xs text-gray-500 mt-0.5">CGPA: <strong>{selectedApp.studentCgpa}</strong></p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Skills */}
                {selectedApp.studentSkills && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Code className="w-3.5 h-3.5" /> Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApp.studentSkills.split(',').map(skill => (
                        <span key={skill} className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg font-medium">{skill.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedApp.studentBio && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">About</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">{selectedApp.studentBio}</p>
                  </div>
                )}

                {/* Resume & Links */}
                {(selectedApp.resumeUrl || selectedApp.studentLinkedin || selectedApp.studentGithub) && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Links & Resume</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedApp.resumeUrl && (
                        <a href={selectedApp.resumeUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl font-medium transition-colors">
                          <FileText className="w-4 h-4" /> View Resume <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {selectedApp.studentLinkedin && (
                        <a href={selectedApp.studentLinkedin.startsWith('http') ? selectedApp.studentLinkedin : `https://${selectedApp.studentLinkedin}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-white bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-xl font-medium transition-colors">
                          <span className="font-bold text-xs border border-white/50 rounded px-1">in</span> LinkedIn
                        </a>
                      )}
                      {selectedApp.studentGithub && (
                        <a href={selectedApp.studentGithub.startsWith('http') ? selectedApp.studentGithub : `https://${selectedApp.studentGithub}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-white bg-gray-800 hover:bg-gray-900 px-3 py-1.5 rounded-xl font-medium transition-colors">
                          <span className="font-bold text-xs">GH</span> GitHub
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                {selectedApp.coverLetter && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Cover Letter</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl leading-relaxed">{selectedApp.coverLetter}</p>
                  </div>
                )}

                {/* Actions */}
                {(nextActions[selectedApp.status] || []).length > 0 && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Update Status</p>
                    <div className="flex gap-2 flex-wrap">
                      {(nextActions[selectedApp.status] || []).map(action => (
                        <button key={action.status}
                          onClick={() => handleStatusUpdate(selectedApp.id, action.status, selectedApp)}
                          disabled={updating === selectedApp.id}
                          className={`${action.color} text-sm py-2 px-4 flex items-center gap-1.5`}>
                          {updating === selectedApp.id
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
        </div>
      </div>

      {/* Interview Modal */}
      {showInterviewModal && interviewApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#111827] rounded-2xl shadow-2xl w-full max-w-md p-6">
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
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date *</label>
                  <input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} className="input text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Time *</label>
                  <input type="time" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} className="input text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Meeting Link (optional)</label>
                <input type="url" value={interviewLink} onChange={e => setInterviewLink(e.target.value)}
                  placeholder="https://meet.google.com/..." className="input text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Note to Candidate (optional)</label>
                <textarea value={interviewNote} onChange={e => setInterviewNote(e.target.value)}
                  placeholder="Instructions for the candidate..." rows={3} className="input text-sm resize-none" />
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
