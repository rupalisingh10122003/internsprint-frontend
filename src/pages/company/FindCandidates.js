import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Users, ArrowLeft, Search, GraduationCap, Code, Star, ExternalLink, FileText, Mail, ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { getCompanyInternships, findMatchingStudents } from '../../api/internships';

const getResumeViewUrl = (url) => {
  if (!url) return '#';
  if (url.includes('res.cloudinary.com') && url.includes('/raw/upload/')) {
    return url.replace('/raw/upload/', '/raw/upload/fl_attachment:false/');
  }
  if (url.includes('drive.google.com') || url.includes('dropbox.com')) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`;
  }
  return url;
};

export default function FindCandidates() {
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [customSkills, setCustomSkills] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    getCompanyInternships()
      .then(res => setInternships(res.data.data || []))
      .catch(console.error);
  }, []);

  const handleSearch = async () => {
    const skills = selectedInternship ? selectedInternship.skillsRequired : customSkills;
    if (!skills) { toast.error('Select an internship or enter required skills'); return; }
    setLoading(true);
    try {
      const res = await findMatchingStudents(skills);
      setMatches(res.data.matches || []);
      setSearched(true);
      setSearchFilter('');
      if (!res.data.matches?.length) {
        toast('No students with matching skills found yet', { icon: 'ℹ️' });
      } else {
        toast.success(`Found ${res.data.matches.length} matching candidates!`);
      }
    } catch {
      toast.error('AI service warming up — please retry in 30 seconds', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (pct) => {
    if (pct >= 70) return 'text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800';
    if (pct >= 40) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800';
    return 'text-gray-500 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
  };

  const getMatchLabel = (pct) => pct >= 70 ? 'Strong Match' : pct >= 40 ? 'Partial Match' : 'Low Match';

  const filteredMatches = matches.filter(s => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (s.name || '').toLowerCase().includes(q) ||
      (s.skills || '').toLowerCase().includes(q) ||
      (s.college || '').toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0F1E]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="flex items-center gap-4 mb-8">
          <Link to="/company" className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5">Company</p>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="w-7 h-7 text-blue-600" /> AI Candidate Matching
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Find the most relevant students for your role</p>
          </div>
        </div>

        {/* Search Panel */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-8">
          <h2 className="font-bold text-gray-900 dark:text-white mb-5 text-lg">What role are you hiring for?</h2>

          {internships.filter(i => i.status === 'open').length > 0 && (
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Match against your open internships
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {internships.filter(i => i.status === 'open').map(internship => (
                  <button key={internship.id}
                    onClick={() => { setSelectedInternship(internship); setCustomSkills(''); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedInternship?.id === internship.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'}`}>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{internship.title}</p>
                    {internship.skillsRequired && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{internship.skillsRequired}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-sm text-gray-400 font-medium">or enter custom skills</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Required Skills</label>
            <input
              value={selectedInternship ? selectedInternship.skillsRequired : customSkills}
              onChange={e => { setCustomSkills(e.target.value); setSelectedInternship(null); }}
              placeholder="e.g. Python, Machine Learning, TensorFlow, SQL"
              className="input-field" />
          </div>

          <button onClick={handleSearch} disabled={loading} className="btn-primary flex items-center gap-2 px-8 py-3">
            {loading
              ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Finding candidates...</>
              : <><Search className="w-5 h-5" /> Find Matching Candidates</>}
          </button>
          {loading && <p className="text-xs text-gray-400 mt-2">AI service may take up to 30s to warm up...</p>}
        </div>

        {searched && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {matches.length > 0 ? `${matches.length} Candidates Found` : 'No candidates found'}
              </h2>
              {matches.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
                    placeholder="Filter by name, skill..." className="input-field pl-9 py-2 text-sm w-56" />
                  {searchFilter && (
                    <button onClick={() => setSearchFilter('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredMatches.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800">
                <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {matches.length === 0 ? 'No matching students yet' : 'No results for filter'}
                </h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  {matches.length === 0
                    ? 'No students with matching skills have registered yet. Try broader requirements.'
                    : 'Try a different search term.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMatches.map((student, i) => (
                  <motion.div key={student.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-all">

                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                          {student.name?.charAt(0) || 'S'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{student.name}</h3>
                            {i === 0 && student.matchPercent > 0 && (
                              <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">
                                <Star className="w-3 h-3" /> Best Match
                              </span>
                            )}
                          </div>
                          {student.college && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              <GraduationCap className="w-3.5 h-3.5" />
                              {student.college}{student.degree ? ` — ${student.degree}` : ''}
                              {student.cgpa ? ` · CGPA: ${student.cgpa}` : ''}
                            </div>
                          )}
                          <a href={`mailto:${student.email}`} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors">
                            <Mail className="w-3 h-3" />{student.email}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className={`inline-flex flex-col items-center px-4 py-2 rounded-xl ${getMatchColor(student.matchPercent)}`}>
                          <span className="text-2xl font-extrabold">{student.matchPercent}%</span>
                          <span className="text-xs font-semibold">{getMatchLabel(student.matchPercent)}</span>
                        </div>
                        <button onClick={() => setExpandedId(expandedId === student.id ? null : student.id)}
                          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                          {expandedId === student.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {expandedId === student.id ? 'Less' : 'More'}
                        </button>
                      </div>
                    </div>

                    {/* Skills with match highlight */}
                    {student.skills && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <Code className="w-3 h-3" /> Skills
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {student.skills.split(',').map(skill => {
                            const required = (selectedInternship?.skillsRequired || customSkills).toLowerCase();
                            const skillLower = skill.trim().toLowerCase();
                            const isMatch = required.split(',').some(r => r.trim().toLowerCase() === skillLower || r.trim().toLowerCase().includes(skillLower) || skillLower.includes(r.trim().toLowerCase()));
                            return (
                              <span key={skill} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${isMatch
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                                {isMatch && '✓ '}{skill.trim()}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedId === student.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3 overflow-hidden">
                          {student.bio && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">About</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">{student.bio}</p>
                            </div>
                          )}
                          {student.resumeUrl && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Resume</p>
                              <div className="flex gap-2">
                                <a href={getResumeViewUrl(student.resumeUrl)} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl font-medium transition-colors">
                                  <FileText className="w-4 h-4" /> View Resume <ExternalLink className="w-3 h-3" />
                                </a>
                                <a href={student.resumeUrl} download target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-xl font-medium transition-colors">
                                  ↓ Download
                                </a>
                              </div>
                            </div>
                          )}
                          {(student.linkedin || student.github) && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Profiles</p>
                              <div className="flex gap-3 flex-wrap">
                                {student.linkedin && (
                                  <a href={student.linkedin.startsWith('http') ? student.linkedin : `https://${student.linkedin}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-white bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-xl font-medium transition-colors">
                                    <span className="font-bold text-xs border border-white/50 rounded px-1">in</span>
                                    LinkedIn <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {student.github && (
                                  <a href={student.github.startsWith('http') ? student.github : `https://${student.github}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-white bg-gray-800 hover:bg-gray-900 px-3 py-1.5 rounded-xl font-medium transition-colors">
                                    <span className="font-bold text-xs">GH</span>
                                    GitHub <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
