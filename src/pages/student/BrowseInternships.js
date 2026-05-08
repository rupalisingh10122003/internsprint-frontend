import { useState, useEffect } from 'react';
import { Search, MapPin, Code, Filter, Zap, Briefcase, Clock, ArrowRight, Building2, Bookmark, BookmarkCheck, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import { searchInternships, applyToInternship, getStudentProfile, getAIMatches, getSkillGap, saveInternship, unsaveInternship, getSavedInternships } from '../../api/internships';

const domains = ['All', 'Web Development', 'Machine Learning', 'UI/UX Design', 'Data Science', 'Digital Marketing', 'Mobile Development'];

export default function BrowseInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ keyword: '', location: '' });
  const [activeDomain, setActiveDomain] = useState('All');
  const [applying, setApplying] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [checkingFit, setCheckingFit] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ remote: '', sort: 'latest' });

  const fetchInternships = async (params = {}) => {
    setLoading(true);
    setAiMode(false);
    try {
      const res = await searchInternships(params);
      let data = res.data.data || [];
      // Client-side location filter for exact city match
      if (params.location) {
        const loc = params.location.toLowerCase().trim();
        data = data.filter(i => i.location?.toLowerCase().includes(loc));
      }
      data = applyClientFilters(data, params);
      setInternships(data);
    } catch (err) {
      toast.error('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  const applyClientFilters = (data, params = {}) => {
    let filtered = [...data];
    if (filters.remote === 'remote') filtered = filtered.filter(i => i.location?.toLowerCase().includes('remote'));
    if (filters.remote === 'onsite') filtered = filtered.filter(i => !i.location?.toLowerCase().includes('remote'));
    if (filters.sort === 'latest') filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return filtered;
  };

    useEffect(() => {
        fetchInternships(); // eslint-disable-line react-hooks/exhaustive-deps
        getSavedInternships().then(res => {
          const ids = new Set((res.data.data || []).map(i => i.id));
          setSavedIds(ids);
        }).catch(() => {});
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (search.keyword) params.keyword = search.keyword;
    if (search.location) params.location = search.location;
    if (activeDomain !== 'All') params.domain = activeDomain;
    fetchInternships(params);
  };

  const handleDomainFilter = (domain) => {
    setActiveDomain(domain);
    const params = {};
    if (search.keyword) params.keyword = search.keyword;
    if (search.location) params.location = search.location;
    if (domain !== 'All') params.domain = domain;
    fetchInternships(params);
  };

  const handleAIMatch = async () => {
    try {
      setLoading(true);
      const profile = await getStudentProfile();
      const skills = profile.data.data?.skills;
      if (!skills) { toast.error('Add skills to your profile first!'); setLoading(false); return; }
      const res = await getAIMatches(skills);
      const mapped = (res.data.matches || []).map(m => ({
        id: m.id, title: m.title, domain: m.domain, location: m.location,
        skillsRequired: m.skills_required, stipend: m.stipend, duration: m.duration,
        deadline: m.deadline, companyName: m.company_name,
        companyVerified: !!m.is_verified, matchPercent: m.matchPercent,
      }));
      setInternships(mapped);
      setAiMode(true);
      toast.success(`AI found ${mapped.length} matches!`);
    } catch { toast.error('AI service unavailable'); }
    finally { setLoading(false); }
  };

  const handleCheckFit = async (internship) => {
    setCheckingFit(internship.id);
    try {
      const profile = await getStudentProfile();
      const studentSkills = profile.data.data?.skills || '';
      if (!studentSkills) { toast.error('Add skills to your profile first!'); return; }
      const res = await getSkillGap(studentSkills, internship.skillsRequired || '');
      const gap = res.data;
      toast(
        `Fit: ${gap.gapScore}% | Missing: ${gap.missingSkills.length > 0 ? gap.missingSkills.join(', ') : 'None!'}`,
        { icon: gap.gapScore >= 70 ? '✅' : gap.gapScore >= 40 ? '⚠️' : '❌', duration: 5000 }
      );
    } catch { toast.error('AI service unavailable'); }
    finally { setCheckingFit(null); }
  };

  const handleSave = async (internship) => {
    setSavingId(internship.id);
    try {
      if (savedIds.has(internship.id)) {
        await unsaveInternship(internship.id);
        setSavedIds(prev => { const n = new Set(prev); n.delete(internship.id); return n; });
        toast.success('Removed from saved');
      } else {
        await saveInternship(internship.id);
        setSavedIds(prev => new Set([...prev, internship.id]));
        toast.success('Internship saved!');
      }
    } catch { toast.error('Failed to save'); }
    finally { setSavingId(null); }
  };

  const openApplyModal = (internship) => { setSelectedInternship(internship); setCoverLetter(''); setShowModal(true); };

  const handleApply = async () => {
    if (!selectedInternship) return;
    setApplying(selectedInternship.id);
    try {
      await applyToInternship(selectedInternship.id, { coverLetter });
      toast.success(`Applied to ${selectedInternship.title}!`);
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally { setApplying(null); }
  };

  const clearAll = () => {
    setActiveDomain('All');
    setSearch({ keyword: '', location: '' });
    setFilters({ remote: '', sort: 'latest' });
    fetchInternships();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
            Find Your Perfect <span className="gradient-text">Internship</span>
          </h1>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={search.keyword} onChange={e => setSearch({ ...search, keyword: e.target.value })}
                placeholder="Search by skill, title, or domain..." className="input pl-12" />
            </div>
            <div className="relative md:w-52">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={search.location} onChange={e => setSearch({ ...search, location: e.target.value })}
                placeholder="City e.g. Pune, Mumbai" className="input pl-12" />
            </div>
            <button type="submit" className="btn-primary flex items-center gap-2 px-6">
              <Filter className="w-4 h-4" /> Search
            </button>
            <button type="button" onClick={handleAIMatch} className="btn-outline flex items-center gap-2 px-6">
              <Zap className="w-4 h-4" /> AI Match
            </button>
            <button type="button" onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline flex items-center gap-2 px-4 ${showFilters ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : ''}`}>
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </form>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Work Type</label>
                    <select value={filters.remote} onChange={e => setFilters({ ...filters, remote: e.target.value })} className="input text-sm py-2">
                      <option value="">All</option>
                      <option value="remote">Remote</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Sort By</label>
                    <select value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })} className="input text-sm py-2">
                      <option value="latest">Latest</option>
                      <option value="relevant">Most Relevant</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button onClick={clearAll} className="btn-secondary text-sm py-2 w-full flex items-center gap-1 justify-center">
                      <X className="w-3 h-3" /> Clear All
                    </button>
                  </div>
                  <div className="flex items-end">
                    <button onClick={() => fetchInternships({ keyword: search.keyword, location: search.location })}
                      className="btn-primary text-sm py-2 w-full">Apply Filters</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active search indicators */}
          {(search.location || search.keyword || activeDomain !== 'All') && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-gray-500">Active filters:</span>
              {search.keyword && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full flex items-center gap-1">
                Keyword: {search.keyword} <button onClick={() => { setSearch(s => ({...s, keyword: ''})); fetchInternships({ location: search.location }); }}><X className="w-3 h-3" /></button>
              </span>}
              {search.location && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full flex items-center gap-1">
                Location: {search.location} <button onClick={() => { setSearch(s => ({...s, location: ''})); fetchInternships({ keyword: search.keyword }); }}><X className="w-3 h-3" /></button>
              </span>}
              {activeDomain !== 'All' && <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full flex items-center gap-1">
                Domain: {activeDomain} <button onClick={() => { setActiveDomain('All'); fetchInternships({ keyword: search.keyword, location: search.location }); }}><X className="w-3 h-3" /></button>
              </span>}
            </div>
          )}

          {aiMode && (
            <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
              <Zap className="w-4 h-4" /> Showing AI-ranked matches
              <button onClick={() => fetchInternships()} className="ml-2 text-xs underline">Clear</button>
            </div>
          )}

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {domains.map(domain => (
              <button key={domain} onClick={() => handleDomainFilter(domain)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeDomain === domain ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {domain}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {loading ? 'Searching...' : `${internships.length} internship${internships.length !== 1 ? 's' : ''} found${search.location ? ` in "${search.location}"` : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full mb-2" />
              </div>
            ))}
          </div>
        ) : internships.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No internships found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {search.location ? `No internships found in "${search.location}". Try a different city or clear the location filter.` : 'Try different keywords or clear your filters'}
            </p>
            <button onClick={clearAll} className="btn-primary">Clear All Filters</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {internships.map((internship, i) => (
              <motion.div key={internship.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} className="card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

                {aiMode && internship.matchPercent !== undefined && (
                  <div className={`mb-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg w-fit ${internship.matchPercent >= 70 ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : internship.matchPercent >= 30 ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                    <Zap className="w-3 h-3" />
                    {internship.matchPercent > 0 ? `${internship.matchPercent}% match` : 'Low match'}
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {internship.companyName?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{internship.title}</h3>
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                        <Building2 className="w-3 h-3" />{internship.companyName}
                        {internship.companyVerified && <span className="badge-green badge ml-1 text-xs">✓ Verified</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleSave(internship)} disabled={savingId === internship.id}
                    className={`p-2 rounded-xl transition-all ${savedIds.has(internship.id) ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}>
                    {savedIds.has(internship.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {internship.domain && <span className="badge-blue badge">{internship.domain}</span>}
                  {internship.location && (
                    <span className={`badge flex items-center gap-1 ${internship.location.toLowerCase().includes('remote') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                      <MapPin className="w-3 h-3" />{internship.location}
                    </span>
                  )}
                  {internship.duration && <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-1"><Clock className="w-3 h-3" />{internship.duration}</span>}
                </div>

                {internship.skillsRequired && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2"><Code className="w-3 h-3" /> Skills required</div>
                    <div className="flex flex-wrap gap-1">
                      {internship.skillsRequired.split(',').slice(0, 4).map(skill => (
                        <span key={skill} className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-medium">{skill.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    {internship.stipend && <span className="text-sm font-semibold text-green-600 dark:text-green-400">{internship.stipend}</span>}
                    {internship.deadline && <p className="text-xs text-gray-400 mt-0.5">Deadline: {new Date(internship.deadline).toLocaleDateString('en-IN')}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleCheckFit(internship)} disabled={checkingFit === internship.id}
                      className="text-xs text-blue-500 dark:text-blue-400 hover:underline font-medium">
                      {checkingFit === internship.id ? <span className="flex items-center gap-1"><div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />Checking...</span> : 'Check fit'}
                    </button>
                    <button onClick={() => openApplyModal(internship)} className="btn-primary text-sm py-2 px-4 flex items-center gap-1">
                      Apply <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
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
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">{selectedInternship.companyName?.charAt(0)}</div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{selectedInternship.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedInternship.companyName}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cover Letter <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                placeholder="Tell the company why you're a great fit..." rows={5} className="input resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleApply} disabled={applying === selectedInternship.id} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {applying === selectedInternship.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Submit Application'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
