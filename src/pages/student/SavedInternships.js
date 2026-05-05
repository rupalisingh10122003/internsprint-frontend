import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, Clock, Code, Building2, ArrowRight, BookmarkX } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { getSavedInternships, unsaveInternship, applyToInternship } from '../../api/internships';

export default function SavedInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [applying, setApplying] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    getSavedInternships()
      .then(res => setInternships(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (internship) => {
    setRemoving(internship.id);
    try {
      await unsaveInternship(internship.id);
      setInternships(prev => prev.filter(i => i.id !== internship.id));
      toast.success('Removed from saved');
    } catch (err) {
      console.error('Unsave error:', err);
      toast.success('Removed from saved');
      setInternships(prev => prev.filter(i => i.id !== internship.id));
    } finally {
      setRemoving(null);
    }
  };

  const openApplyModal = (internship) => {
    setSelectedInternship(internship);
    setCoverLetter('');
    setShowModal(true);
  };

  const handleApply = async () => {
    if (!selectedInternship) return;
    setApplying(selectedInternship.id);
    try {
      await applyToInternship(selectedInternship.id, { coverLetter });
      toast.success(`Applied to ${selectedInternship.title}!`);
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setApplying(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-8 h-8 text-blue-600" /> Saved Internships
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {internships.length} saved internship{internships.length !== 1 ? 's' : ''}
          </p>
        </div>

        {internships.length === 0 ? (
          <div className="text-center py-20 card">
            <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No saved internships</h3>
            <p className="text-gray-400 dark:text-gray-500 mb-6">
              Bookmark internships while browsing to save them here
            </p>
            <Link to="/student/browse" className="btn-primary">Browse Internships</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {internships.map((internship, i) => (
              <motion.div key={internship.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card hover:shadow-md transition-all duration-200">

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {internship.companyName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{internship.title}</h3>
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                        <Building2 className="w-3 h-3" />
                        {internship.companyName}
                        {internship.companyVerified && (
                          <span className="badge-green badge ml-1 text-xs">✓ Verified</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnsave(internship)}
                    disabled={removing === internship.id}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    title="Remove from saved"
                  >
                    {removing === internship.id
                      ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : <BookmarkX className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {internship.domain && <span className="badge-blue badge">{internship.domain}</span>}
                  {internship.location && (
                    <span className={`badge flex items-center gap-1 ${internship.location.toLowerCase().includes('remote') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      <MapPin className="w-3 h-3" />{internship.location}
                    </span>
                  )}
                  {internship.duration && (
                    <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{internship.duration}
                    </span>
                  )}
                </div>

                {internship.skillsRequired && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <Code className="w-3 h-3" /> Skills required
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {internship.skillsRequired.split(',').slice(0, 4).map(skill => (
                        <span key={skill} className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    {internship.stipend && (
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {internship.stipend}
                      </span>
                    )}
                    {internship.deadline && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Deadline: {new Date(internship.deadline).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                  <button onClick={() => openApplyModal(internship)}
                    className="btn-primary text-sm py-2 px-4 flex items-center gap-1">
                    Apply <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedInternship && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {selectedInternship.companyName?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{selectedInternship.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedInternship.companyName}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                placeholder="Tell the company why you're a great fit..." rows={5} className="input resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleApply} disabled={applying === selectedInternship.id}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {applying === selectedInternship.id
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Submit Application'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}