import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Users, Building2, Brain, Shield, Star, ChevronRight, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const stats = [
  { value: '500+', label: 'Verified Companies' },
  { value: '10K+', label: 'Students Placed' },
  { value: '95%', label: 'Satisfaction Rate' },
  { value: 'AI', label: 'Powered Matching' },
];

const features = [
  {
    icon: Brain,
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    title: 'AI-Powered Matching',
    desc: 'Our TF-IDF engine scores your skills against hundreds of roles and surfaces only the most relevant opportunities — ranked by fit.',
  },
  {
    icon: Shield,
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    title: 'Verified Companies Only',
    desc: 'Every company goes through an admin verification process. No fake postings, no spam — just real internship opportunities.',
  },
  {
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    title: 'Real-Time Tracking',
    desc: 'Know exactly where you stand — Applied, Under Review, Shortlisted, Interview Scheduled, or Accepted — with live notifications.',
  },
  {
    icon: Star,
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
    title: 'ATS Resume Builder',
    desc: 'Generate an ATS-optimized resume in seconds. Beat the bots and get your profile in front of real hiring managers.',
  },
];

const steps = [
  { step: '01', title: 'Build Your Profile', desc: 'Add your skills, education, projects, and upload your resume once.' },
  { step: '02', title: 'Get AI Matches', desc: 'Our AI ranks internships by how well they match your skillset.' },
  { step: '03', title: 'Apply in 1 Click', desc: 'Apply to multiple internships and track every application in real time.' },
  { step: '04', title: 'Land the Role', desc: 'Get notified at every stage — from shortlisting to final acceptance.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0F1E]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-96 h-64 bg-violet-400/8 dark:bg-violet-500/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center relative">
          <motion.div initial="hidden" animate="show" variants={stagger}>

            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-semibold px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-4 h-4" />
              The Smarter Way to Find Internships
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.05] mb-6">
              Land Your Dream<br />
              <span className="gradient-text">Internship Faster</span>
            </motion.h1>

            {/* Sub */}
            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              InternSprint connects students with verified companies through AI-powered skill matching, real-time application tracking, and automated notifications.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/register" className="btn-primary text-base px-8 py-3.5 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/student/browse" className="btn-secondary text-base px-8 py-3.5">
                Browse Internships
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {stats.map((s) => (
                <div key={s.label} className="bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl p-5">
                  <div className="text-3xl font-extrabold gradient-text mb-1">{s.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50 dark:bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">Why InternSprint</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              Everything you need to<br />land your internship
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Built for students. Trusted by companies. Powered by AI.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp}
                className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`w-6 h-6 bg-gradient-to-br ${f.color} rounded-lg flex items-center justify-center`}>
                    <f.icon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white dark:bg-[#0A0F1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">How It Works</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              From signup to<br />offer in 4 steps
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((s, i) => (
              <motion.div key={s.step} variants={fadeUp} className="relative">
                <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 h-full">
                  <div className="text-5xl font-extrabold gradient-text mb-4 leading-none">{s.step}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 z-10 w-6 h-6 bg-blue-600 rounded-full items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* For companies */}
      <section className="py-24 bg-gray-50 dark:bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              <motion.p variants={fadeUp} className="text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-widest mb-3">For Companies</motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
                Find the right<br />intern instantly
              </motion.h2>
              <motion.div variants={fadeUp} className="space-y-4 mb-8">
                {[
                  'Post internships and reach thousands of students instantly',
                  'AI candidate matching — find top talent by skill relevance',
                  'Manage the entire hiring pipeline in one dashboard',
                  'Verified company badge builds trust with candidates',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </motion.div>
              <motion.div variants={fadeUp}>
                <Link to="/register" className="btn-primary">
                  Post Internship Free <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: 'Active Students', value: '10,000+', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { icon: Building2, label: 'Companies', value: '500+', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                { icon: Brain, label: 'AI Matches Daily', value: '1,200+', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                { icon: Shield, label: 'Verified Partners', value: '100%', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              ].map((item) => (
                <div key={item.label} className="bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 text-center">
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className={`text-2xl font-extrabold ${item.color} mb-1`}>{item.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Ready to sprint ahead?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of students who found their dream internship through InternSprint. It's free to get started.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-blue-600 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all shadow-lg inline-flex items-center gap-2">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all border border-white/20 inline-flex items-center gap-2">
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#0d1117] border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            InternSprint
          </div>
          <p className="text-sm text-gray-400">© 2026 InternSprint. Built with ❤️ for students.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link to="/login" className="hover:text-gray-600 dark:hover:text-gray-200">Login</Link>
            <Link to="/register" className="hover:text-gray-600 dark:hover:text-gray-200">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
