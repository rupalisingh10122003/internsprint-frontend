import { useState, useEffect, useRef } from 'react';
import { Download, FileText, Star, AlertCircle, CheckCircle, Zap, Plus, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getStudentProfile } from '../../api/internships';

const STORAGE_KEY = 'internsprint_resume_draft';

const ATS_KEYWORDS = {
  technical: ['javascript', 'python', 'java', 'react', 'node', 'sql', 'mysql', 'mongodb', 'spring', 'docker', 'git', 'aws', 'api', 'html', 'css', 'typescript', 'redux', 'graphql', 'rest', 'agile'],
  soft: ['communication', 'teamwork', 'leadership', 'problem-solving', 'analytical', 'creative', 'organized', 'detail-oriented', 'adaptable', 'collaborative'],
  action: ['developed', 'built', 'designed', 'implemented', 'created', 'managed', 'led', 'improved', 'optimized', 'delivered', 'achieved', 'increased', 'reduced', 'launched'],
};

function calculateATSScore(resume) {
  let score = 0;
  const issues = [];
  const suggestions = [];
  const fullText = [
    resume.summary, resume.skills,
    ...(resume.experience || []).map(e => `${e.role} ${e.company} ${e.description}`),
    ...(resume.projects || []).map(p => `${p.name} ${p.description} ${p.tech}`),
    ...(resume.education || []).map(e => `${e.degree} ${e.college}`),
  ].join(' ').toLowerCase();

  if (resume.name) score += 5;
  if (resume.email) score += 5;
  if (resume.phone) score += 5; else issues.push('Missing phone number');
  if (resume.summary && resume.summary.length > 50) score += 10;
  else { issues.push('Add a professional summary (50+ words)'); suggestions.push('Write a 2-3 sentence summary highlighting your skills and goals'); }
  const techMatches = ATS_KEYWORDS.technical.filter(k => (resume.skills || '').toLowerCase().includes(k));
  score += Math.min(20, techMatches.length * 2);
  if (techMatches.length < 5) { issues.push(`Only ${techMatches.length} recognized technical skills found`); suggestions.push('Add: ' + ATS_KEYWORDS.technical.filter(k => !(resume.skills || '').toLowerCase().includes(k)).slice(0, 5).join(', ')); }
  const actionMatches = ATS_KEYWORDS.action.filter(k => fullText.includes(k));
  score += Math.min(15, actionMatches.length * 3);
  if (actionMatches.length < 3) { issues.push('Use more action verbs in experience'); suggestions.push('Start with: ' + ATS_KEYWORDS.action.slice(0, 5).join(', ')); }
  if (resume.education?.some(e => e.college)) score += 10; else issues.push('Education section is incomplete');
  if (resume.experience?.some(e => e.company)) score += 10; else suggestions.push('Add internship or work experience');
  if (resume.projects?.some(p => p.name)) score += 10; else { issues.push('No projects listed'); suggestions.push('Add 2-3 projects with tech stack'); }
  if (resume.linkedin) score += 5; else suggestions.push('Add your LinkedIn URL');
  if (resume.github) score += 5; else suggestions.push('Add your GitHub URL');

  const finalScore = Math.min(100, score);
  const level = finalScore >= 80 ? 'Excellent' : finalScore >= 60 ? 'Good' : finalScore >= 40 ? 'Fair' : 'Needs Work';
  const color = finalScore >= 80 ? 'text-green-600' : finalScore >= 60 ? 'text-blue-600' : finalScore >= 40 ? 'text-yellow-600' : 'text-red-500';
  return { score: finalScore, level, color, issues, suggestions };
}

const EMPTY_RESUME = {
  name: '', email: '', phone: '', location: '',
  linkedin: '', github: '', summary: '', skills: '',
  education: [{ college: '', degree: '', year: '', cgpa: '' }],
  experience: [{ company: '', role: '', duration: '', description: '' }],
  projects: [{ name: '', tech: '', description: '', link: '' }],
  certifications: [{ name: '', issuer: '', year: '' }],
};

export default function ATSResumePage() {
  const { user } = useAuth();
  const resumeRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [resume, setResume] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : EMPTY_RESUME;
    } catch { return EMPTY_RESUME; }
  });
  const [atsResult, setAtsResult] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load profile ONCE only if no saved draft
  useEffect(() => {
    if (profileLoaded) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { setProfileLoaded(true); return; }
    getStudentProfile().then(res => {
      const p = res.data.data;
      setResume(prev => ({
        ...prev,
        name: user?.name || '',
        email: user?.email || '',
        linkedin: p?.linkedin || '',
        github: p?.github || '',
        skills: p?.skills || '',
        summary: p?.bio || '',
        education: p?.college
          ? [{ college: p.college, degree: p.degree || '', year: p.year || '', cgpa: p.cgpa || '' }]
          : prev.education,
      }));
    }).catch(() => {}).finally(() => setProfileLoaded(true));
  }, [user, profileLoaded]);

  // Auto-save to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
    setAtsResult(calculateATSScore(resume));
  }, [resume]);

  const update = (field, value) => setResume(prev => ({ ...prev, [field]: value }));
  const updateArray = (field, index, key, value) => {
    setResume(prev => {
      const arr = [...prev[field]];
      arr[index] = { ...arr[index], [key]: value };
      return { ...prev, [field]: arr };
    });
  };
  const addItem = (field, template) => setResume(prev => ({ ...prev, [field]: [...prev[field], template] }));
  const removeItem = (field, index) => setResume(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));

  const handleSaveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
    toast.success('Draft saved!');
  };

  // ── Pure jsPDF text-based PDF (ATS-friendly, no html2canvas) ──────────────
  const downloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pw = doc.internal.pageSize.getWidth();
      const margin = 18;
      const maxW = pw - margin * 2;
      let y = 20;

      const addText = (text, fontSize, isBold, color = [30, 30, 30], align = 'left', x = margin) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(...color);
        if (align === 'center') {
          doc.text(text, pw / 2, y, { align: 'center' });
        } else {
          const lines = doc.splitTextToSize(text, maxW);
          doc.text(lines, x, y);
          return lines.length;
        }
        return 1;
      };

      const checkPage = (needed = 10) => {
        if (y + needed > 280) { doc.addPage(); y = 20; }
      };

      const sectionHeader = (title) => {
        checkPage(12);
        y += 4;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text(title.toUpperCase(), margin, y);
        y += 1;
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.4);
        doc.line(margin, y, pw - margin, y);
        y += 5;
        doc.setTextColor(30, 30, 30);
      };

      // ── Name ──
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 20, 20);
      doc.text(resume.name || 'Your Name', pw / 2, y, { align: 'center' });
      y += 7;

      // ── Contact line ──
      const contactParts = [resume.email, resume.phone, resume.location].filter(Boolean);
      if (contactParts.length) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(contactParts.join('  |  '), pw / 2, y, { align: 'center' });
        y += 5;
      }
      const linkParts = [resume.linkedin, resume.github].filter(Boolean);
      if (linkParts.length) {
        doc.setFontSize(9);
        doc.setTextColor(37, 99, 235);
        doc.text(linkParts.join('  |  '), pw / 2, y, { align: 'center' });
        y += 5;
      }

      // ── Divider ──
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.6);
      doc.line(margin, y, pw - margin, y);
      y += 6;

      // ── Summary ──
      if (resume.summary) {
        sectionHeader('Professional Summary');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        const lines = doc.splitTextToSize(resume.summary, maxW);
        checkPage(lines.length * 5);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 2;
      }

      // ── Skills ──
      if (resume.skills) {
        sectionHeader('Technical Skills');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        const lines = doc.splitTextToSize(resume.skills, maxW);
        checkPage(lines.length * 5);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 2;
      }

      // ── Education ──
      const validEdu = (resume.education || []).filter(e => e.college);
      if (validEdu.length) {
        sectionHeader('Education');
        validEdu.forEach(edu => {
          checkPage(12);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(20, 20, 20);
          doc.text(edu.college, margin, y);
          if (edu.year) { doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100); doc.text(edu.year, pw - margin, y, { align: 'right' }); }
          y += 5;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(70, 70, 70);
          const degLine = [edu.degree, edu.cgpa ? `CGPA: ${edu.cgpa}` : ''].filter(Boolean).join(' — ');
          if (degLine) { doc.text(degLine, margin, y); y += 5; }
        });
      }

      // ── Experience ──
      const validExp = (resume.experience || []).filter(e => e.company);
      if (validExp.length) {
        sectionHeader('Experience');
        validExp.forEach(exp => {
          checkPage(15);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(20, 20, 20);
          doc.text(exp.role || '', margin, y);
          if (exp.duration) { doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100); doc.text(exp.duration, pw - margin, y, { align: 'right' }); }
          y += 5;
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(70, 70, 70);
          doc.text(exp.company || '', margin, y);
          y += 5;
          if (exp.description) {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);
            const lines = doc.splitTextToSize(exp.description, maxW);
            checkPage(lines.length * 4.5);
            doc.text(lines, margin, y);
            y += lines.length * 4.5 + 2;
          }
        });
      }

      // ── Projects ──
      const validProj = (resume.projects || []).filter(p => p.name);
      if (validProj.length) {
        sectionHeader('Projects');
        validProj.forEach(proj => {
          checkPage(15);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(20, 20, 20);
          doc.text(proj.name, margin, y);
          if (proj.link) { doc.setFontSize(8); doc.setTextColor(37, 99, 235); doc.text(proj.link, pw - margin, y, { align: 'right' }); }
          y += 5;
          if (proj.tech) { doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(90, 90, 90); doc.text(`Tech: ${proj.tech}`, margin, y); y += 4; }
          if (proj.description) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);
            const lines = doc.splitTextToSize(proj.description, maxW);
            checkPage(lines.length * 4.5);
            doc.text(lines, margin, y);
            y += lines.length * 4.5 + 2;
          }
        });
      }

      // ── Certifications ──
      const validCerts = (resume.certifications || []).filter(c => c.name);
      if (validCerts.length) {
        sectionHeader('Certifications');
        validCerts.forEach(cert => {
          checkPage(8);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(20, 20, 20);
          doc.text(`${cert.name}${cert.issuer ? ' — ' + cert.issuer : ''}`, margin, y);
          if (cert.year) { doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100); doc.text(cert.year, pw - margin, y, { align: 'right' }); }
          y += 6;
        });
      }

      doc.save(`${resume.name || 'resume'}_resume.pdf`);
      toast.success('Resume downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Download failed. Try again.');
    } finally {
      setDownloading(false);
    }
  };

  const scoreColor = atsResult?.score >= 80 ? 'text-green-600' : atsResult?.score >= 60 ? 'text-blue-600' : atsResult?.score >= 40 ? 'text-yellow-600' : 'text-red-500';
  const scoreBg = atsResult?.score >= 80 ? 'bg-green-50 dark:bg-green-900/20' : atsResult?.score >= 60 ? 'bg-blue-50 dark:bg-blue-900/20' : atsResult?.score >= 40 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-red-50 dark:bg-red-900/20';

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0A0F1E]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" /> ATS Resume Builder
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Auto-saved • ATS-optimized • Download as PDF</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSaveDraft} className="btn-secondary flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button onClick={downloadPDF} disabled={downloading} className="btn-primary flex items-center gap-2 px-6">
              {downloading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Download className="w-5 h-5" /> Download PDF</>}
            </button>
          </div>
        </div>

        {/* ATS Score Banner */}
        {atsResult && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-5 mb-6 border-0 ${scoreBg}`}>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="text-center flex-shrink-0">
                <div className={`text-5xl font-extrabold ${scoreColor}`}>{atsResult.score}</div>
                <div className="text-xs text-gray-500 mt-1">ATS Score</div>
                <div className={`text-sm font-bold mt-1 ${scoreColor}`}>{atsResult.level}</div>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                  <div className={`h-3 rounded-full transition-all duration-700 ${atsResult.score >= 80 ? 'bg-green-500' : atsResult.score >= 60 ? 'bg-blue-500' : atsResult.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${atsResult.score}%` }} />
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  {atsResult.issues.slice(0, 2).map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{issue}</span>
                    </div>
                  ))}
                  {atsResult.suggestions.slice(0, 2).map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-fit">
          {['editor', 'preview'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'editor' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">

              {/* Personal Info */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">1</span>
                  Personal Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[['name','Full Name','Pratik Kamble'],['email','Email','pratik@example.com'],['phone','Phone','+91 9876543210'],['location','Location','Pune, Maharashtra']].map(([field, label, ph]) => (
                    <div key={field}>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
                      <input value={resume[field]} onChange={e => update(field, e.target.value)}
                        placeholder={ph} className="input-field text-sm" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">LinkedIn URL</label>
                    <input value={resume.linkedin} onChange={e => update('linkedin', e.target.value)}
                      placeholder="linkedin.com/in/username" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">GitHub URL</label>
                    <input value={resume.github} onChange={e => update('github', e.target.value)}
                      placeholder="github.com/username" className="input-field text-sm" />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">2</span>
                  Professional Summary
                </h2>
                <textarea value={resume.summary} onChange={e => update('summary', e.target.value)}
                  placeholder="A motivated Computer Engineering student with strong skills in Java, React, and MySQL..."
                  rows={4} className="input-field resize-none text-sm" />
                <p className="text-xs text-gray-400 mt-2">{resume.summary.length} chars — aim for 200–400</p>
              </div>

              {/* Skills */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">3</span>
                  Skills
                </h2>
                <input value={resume.skills} onChange={e => update('skills', e.target.value)}
                  placeholder="Java, React, MySQL, Spring Boot, Python, Git, Docker, REST APIs"
                  className="input-field text-sm" />
                <p className="text-xs text-gray-400 mt-2">Comma-separated. Include technical + soft skills.</p>
              </div>

              {/* Education */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">4</span>
                    Education
                  </h2>
                  <button onClick={() => addItem('education', { college: '', degree: '', year: '', cgpa: '' })}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                {resume.education.map((edu, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <input value={edu.college} onChange={e => updateArray('education', i, 'college', e.target.value)} placeholder="College/University" className="input-field text-sm" />
                      <input value={edu.degree} onChange={e => updateArray('education', i, 'degree', e.target.value)} placeholder="Degree (e.g. B.E. Computer)" className="input-field text-sm" />
                      <input value={edu.year} onChange={e => updateArray('education', i, 'year', e.target.value)} placeholder="Year (e.g. 2022–2026)" className="input-field text-sm" />
                      <input value={edu.cgpa} onChange={e => updateArray('education', i, 'cgpa', e.target.value)} placeholder="CGPA (e.g. 8.5)" className="input-field text-sm" />
                    </div>
                    {i > 0 && <button onClick={() => removeItem('education', i)} className="text-xs text-red-500 mt-2 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>}
                  </div>
                ))}
              </div>

              {/* Experience */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">5</span>
                    Experience
                  </h2>
                  <button onClick={() => addItem('experience', { company: '', role: '', duration: '', description: '' })}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                {resume.experience.map((exp, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-3">
                    <div className="grid md:grid-cols-2 gap-3 mb-3">
                      <input value={exp.company} onChange={e => updateArray('experience', i, 'company', e.target.value)} placeholder="Company Name" className="input-field text-sm" />
                      <input value={exp.role} onChange={e => updateArray('experience', i, 'role', e.target.value)} placeholder="Role/Position" className="input-field text-sm" />
                      <input value={exp.duration} onChange={e => updateArray('experience', i, 'duration', e.target.value)} placeholder="Duration (e.g. Jun–Aug 2025)" className="input-field text-sm md:col-span-2" />
                    </div>
                    <textarea value={exp.description} onChange={e => updateArray('experience', i, 'description', e.target.value)}
                      placeholder="• Developed RESTful APIs using Spring Boot&#10;• Built React components reducing load time by 40%"
                      rows={3} className="input-field resize-none text-sm" />
                    {i > 0 && <button onClick={() => removeItem('experience', i)} className="text-xs text-red-500 mt-2 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>}
                  </div>
                ))}
              </div>

              {/* Projects */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">6</span>
                    Projects
                  </h2>
                  <button onClick={() => addItem('projects', { name: '', tech: '', description: '', link: '' })}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                {resume.projects.map((proj, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-3">
                    <div className="grid md:grid-cols-2 gap-3 mb-3">
                      <input value={proj.name} onChange={e => updateArray('projects', i, 'name', e.target.value)} placeholder="Project Name" className="input-field text-sm" />
                      <input value={proj.tech} onChange={e => updateArray('projects', i, 'tech', e.target.value)} placeholder="Tech Stack" className="input-field text-sm" />
                      <input value={proj.link} onChange={e => updateArray('projects', i, 'link', e.target.value)} placeholder="GitHub / Live URL" className="input-field text-sm md:col-span-2" />
                    </div>
                    <textarea value={proj.description} onChange={e => updateArray('projects', i, 'description', e.target.value)}
                      placeholder="Built a full-stack internship platform with AI-powered matching..."
                      rows={2} className="input-field resize-none text-sm" />
                    {i > 0 && <button onClick={() => removeItem('projects', i)} className="text-xs text-red-500 mt-2 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>}
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">7</span>
                    Certifications
                  </h2>
                  <button onClick={() => addItem('certifications', { name: '', issuer: '', year: '' })}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                {resume.certifications.map((cert, i) => (
                  <div key={i} className="grid md:grid-cols-3 gap-3 mb-3">
                    <input value={cert.name} onChange={e => updateArray('certifications', i, 'name', e.target.value)} placeholder="Certificate Name" className="input-field text-sm" />
                    <input value={cert.issuer} onChange={e => updateArray('certifications', i, 'issuer', e.target.value)} placeholder="Issued By" className="input-field text-sm" />
                    <div className="flex gap-2">
                      <input value={cert.year} onChange={e => updateArray('certifications', i, 'year', e.target.value)} placeholder="Year" className="input-field text-sm flex-1" />
                      {i > 0 && <button onClick={() => removeItem('certifications', i)} className="text-red-500 hover:text-red-600 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* ATS Sidebar */}
            <div>
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-600" /> ATS Analysis
                </h3>
                {atsResult && (
                  <>
                    <div className="text-center mb-5">
                      <div className={`text-6xl font-extrabold ${scoreColor} mb-1`}>{atsResult.score}</div>
                      <div className={`text-sm font-bold ${scoreColor}`}>{atsResult.level}</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                        <div className={`h-2 rounded-full transition-all duration-700 ${atsResult.score >= 80 ? 'bg-green-500' : atsResult.score >= 60 ? 'bg-blue-500' : atsResult.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${atsResult.score}%` }} />
                      </div>
                    </div>
                    {atsResult.issues.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Issues</p>
                        <div className="space-y-2">
                          {atsResult.issues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 dark:text-gray-300">{issue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {atsResult.suggestions.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Suggestions</p>
                        <div className="space-y-2">
                          {atsResult.suggestions.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <Zap className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 dark:text-gray-300">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {atsResult.score >= 80 && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">Great score! Ready to apply.</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Preview */
          <div className="flex justify-center">
            <div ref={resumeRef} className="bg-white w-full max-w-3xl p-10 shadow-2xl rounded-2xl text-gray-900" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', lineHeight: '1.6' }}>
              <div className="text-center border-b-2 border-blue-600 pb-4 mb-5">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{resume.name || 'Your Name'}</h1>
                <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
                  {resume.email && <span>{resume.email}</span>}
                  {resume.phone && <span>• {resume.phone}</span>}
                  {resume.location && <span>• {resume.location}</span>}
                </div>
                <div className="flex flex-wrap justify-center gap-3 text-sm text-blue-600 mt-1">
                  {resume.linkedin && <span>{resume.linkedin}</span>}
                  {resume.github && <span>• {resume.github}</span>}
                </div>
              </div>
              {resume.summary && <div className="mb-4"><h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Professional Summary</h2><p className="text-gray-700 text-sm">{resume.summary}</p></div>}
              {resume.skills && <div className="mb-4"><h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Technical Skills</h2><p className="text-gray-700 text-sm">{resume.skills}</p></div>}
              {resume.education.some(e => e.college) && <div className="mb-4"><h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Education</h2>{resume.education.filter(e => e.college).map((edu, i) => <div key={i} className="mb-2"><div className="flex justify-between"><strong>{edu.college}</strong><span className="text-gray-500 text-xs">{edu.year}</span></div><div className="text-gray-600 text-sm">{edu.degree}{edu.cgpa ? ` — CGPA: ${edu.cgpa}` : ''}</div></div>)}</div>}
              {resume.experience.some(e => e.company) && <div className="mb-4"><h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Experience</h2>{resume.experience.filter(e => e.company).map((exp, i) => <div key={i} className="mb-3"><div className="flex justify-between"><strong>{exp.role}</strong><span className="text-gray-500 text-xs">{exp.duration}</span></div><div className="text-gray-600 text-sm italic">{exp.company}</div>{exp.description && <div className="text-gray-700 text-sm mt-1 whitespace-pre-line">{exp.description}</div>}</div>)}</div>}
              {resume.projects.some(p => p.name) && <div className="mb-4"><h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Projects</h2>{resume.projects.filter(p => p.name).map((proj, i) => <div key={i} className="mb-3"><div className="flex justify-between"><strong>{proj.name}</strong>{proj.link && <span className="text-blue-600 text-xs">{proj.link}</span>}</div>{proj.tech && <div className="text-gray-500 text-xs">Tech: {proj.tech}</div>}{proj.description && <div className="text-gray-700 text-sm mt-0.5">{proj.description}</div>}</div>)}</div>}
              {resume.certifications.some(c => c.name) && <div className="mb-4"><h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-gray-200 pb-1 mb-2">Certifications</h2>{resume.certifications.filter(c => c.name).map((cert, i) => <div key={i} className="flex justify-between mb-1 text-sm"><span><strong>{cert.name}</strong>{cert.issuer ? ` — ${cert.issuer}` : ''}</span><span className="text-gray-500">{cert.year}</span></div>)}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
