import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Globe, MapPin, Briefcase, CheckCircle, ExternalLink, Hash, Calendar } from 'lucide-react';

export default function CompanyProfileModal({ company, onClose }) {
  if (!company) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-[#111827] rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">

          {/* Header */}
          <div className="relative">
            <div className="h-20 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-t-2xl" />
            <div className="px-6 pb-4">
              <div className="flex items-end gap-4 -mt-8 mb-3">
                <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-gray-900 shadow-lg overflow-hidden bg-white flex-shrink-0">
                  {company.companyLogoUrl ? (
                    <img src={company.companyLogoUrl} alt={company.companyName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl">
                      {company.companyName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="pb-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-extrabold text-gray-900 dark:text-white text-xl leading-tight">
                      {company.companyName}
                    </h2>
                    {company.companyVerified && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  {company.companyIndustry && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{company.companyIndustry}</p>
                  )}
                </div>
              </div>

              {/* Quick info pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {company.companyLocation && (
                  <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    <MapPin className="w-3 h-3" /> {company.companyLocation}
                  </span>
                )}
                {company.companyWebsite && (
                  <a href={company.companyWebsite} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full hover:underline">
                    <Globe className="w-3 h-3" /> Website <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              {/* About */}
              {company.companyDescription && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                    {company.companyDescription}
                  </p>
                </div>
              )}

              {/* Open Internships from this company */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> Open Internships
                </h3>
                {company.openInternships && company.openInternships.length > 0 ? (
                  <div className="space-y-2">
                    {company.openInternships.map((intern) => (
                      <div key={intern.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{intern.title}</p>
                          {intern.stipend && (
                            <span className="text-xs font-bold text-emerald-600 flex-shrink-0">{intern.stipend}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {intern.domain && <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">{intern.domain}</span>}
                          {intern.location && <span className="text-xs text-gray-500 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{intern.location}</span>}
                          {intern.duration && <span className="text-xs text-gray-400 flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{intern.duration}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No open internships currently</p>
                )}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
