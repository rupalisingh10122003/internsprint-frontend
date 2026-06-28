import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Globe, MapPin, Briefcase, CheckCircle, ExternalLink, Phone, Linkedin, Calendar, Users, Award, Hash, BadgeCheck, Shield, Loader } from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export default function CompanyProfileModal({ company, onClose }) {
  const [fullProfile, setFullProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!company?.companyId) return;
    setLoading(true);
    setFullProfile(null);
    axios.get(`${API_BASE}/api/public/company/${company.companyId}`)
      .then(res => setFullProfile(res.data.data))
      .catch(() => setFullProfile(null))
      .finally(() => setLoading(false));
  }, [company?.companyId]);

  if (!company) return null;

  // Merge internship-level data with full profile (full profile takes priority)
  const p = fullProfile ? {
    companyName:     fullProfile.companyName,
    companyIndustry: fullProfile.industry,
    companyVerified: fullProfile.isVerified,
    companyLocation: fullProfile.location,
    companyWebsite:  fullProfile.website,
    companyLogoUrl:  fullProfile.logoUrl,
    companyDescription: fullProfile.description,
    phone:           fullProfile.phone,
    linkedinUrl:     fullProfile.linkedinUrl,
    companyType:     fullProfile.companyType,
    foundedYear:     fullProfile.foundedYear,
    companySize:     fullProfile.companySize,
    tagline:         fullProfile.tagline,
    perks:           fullProfile.perks,
    gstin:           fullProfile.gstin,
    cin:             fullProfile.cin,
    pan:             fullProfile.pan,
    openInternships: fullProfile.internships || [],
    totalInternships: fullProfile.totalInternships,
  } : company;

  const perksArray = p.perks ? p.perks.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-[#111827] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

          {/* Banner + Logo */}
          <div className="relative">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-t-2xl" />
            <button onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="px-6 pb-4">
              <div className="flex items-end gap-4 -mt-10 mb-3">
                <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-[#111827] shadow-lg overflow-hidden bg-white flex-shrink-0">
                  {p.companyLogoUrl ? (
                    <img src={p.companyLogoUrl} alt={p.companyName} className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl">
                      {p.companyName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="pb-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-extrabold text-gray-900 dark:text-white text-xl leading-tight">{p.companyName}</h2>
                    {p.companyVerified && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800 flex-shrink-0">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  {p.tagline && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 italic">"{p.tagline}"</p>}
                  {p.companyIndustry && <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">{p.companyIndustry}</p>}
                </div>
              </div>

              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <Loader className="w-4 h-4 animate-spin" /> Loading full profile...
                </div>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 space-y-5">

            {/* Quick info row */}
            <div className="flex flex-wrap gap-2">
              {p.companyLocation && (
                <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  <MapPin className="w-3 h-3" /> {p.companyLocation}
                </span>
              )}
              {p.foundedYear && (
                <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  <Calendar className="w-3 h-3" /> Est. {p.foundedYear}
                </span>
              )}
              {p.companySize && (
                <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  <Users className="w-3 h-3" /> {p.companySize}
                </span>
              )}
              {p.companyType && (
                <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                  <Shield className="w-3 h-3" /> {p.companyType}
                </span>
              )}
            </div>

            {/* About */}
            {p.companyDescription && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                  {p.companyDescription}
                </p>
              </div>
            )}

            {/* Perks */}
            {perksArray.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Perks & Benefits
                </h3>
                <div className="flex flex-wrap gap-2">
                  {perksArray.map((perk, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-100 dark:border-amber-800 font-medium">
                      ✦ {perk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact & Links */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contact & Links</h3>
              <div className="space-y-2">
                {p.companyWebsite && (
                  <a href={p.companyWebsite} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    <Globe className="w-4 h-4 flex-shrink-0" /> {p.companyWebsite}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {p.linkedinUrl && (
                  <a href={p.linkedinUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400 hover:underline">
                    <span className="w-4 h-4 bg-blue-700 text-white rounded flex items-center justify-center text-xs font-bold flex-shrink-0">in</span>
                    LinkedIn Page <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {p.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" /> {p.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Legal IDs */}
            {(p.gstin || p.cin || p.pan) && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" /> Legal Registration
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 space-y-2">
                  {p.gstin && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">GSTIN</span>
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">{p.gstin}</span>
                    </div>
                  )}
                  {p.cin && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">CIN</span>
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">{p.cin}</span>
                    </div>
                  )}
                  {p.pan && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">PAN</span>
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">{p.pan}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Open Internships */}
            {p.openInternships && p.openInternships.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> Open Internships ({p.openInternships.length})
                </h3>
                <div className="space-y-2">
                  {p.openInternships.map((intern) => (
                    <div key={intern.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{intern.title}</p>
                        {intern.stipend && <span className="text-xs font-bold text-emerald-600 flex-shrink-0">{intern.stipend}</span>}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {intern.domain && <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">{intern.domain}</span>}
                        {intern.location && <span className="text-xs text-gray-500 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{intern.location}</span>}
                        {intern.duration && <span className="text-xs text-gray-400">{intern.duration}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
