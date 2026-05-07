import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { loginAPI } from '../api/auth';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await loginAPI({ email: form.email.trim().toLowerCase(), password: form.password });
      const { token, role, userId, name, email } = res.data.data;
      login({ userId, name, email, role }, token);
      toast.success(`Welcome back, ${name}!`);
      navigate(`/${role}`);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.toLowerCase().includes('password')) {
        toast.error('Incorrect password. Please try again.');
      } else if (msg?.toLowerCase().includes('email') || msg?.toLowerCase().includes('user')) {
        toast.error('No account found with this email.');
      } else {
        toast.error(msg || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'student') setForm({ email: 'test@test.com', password: '123456' });
    if (role === 'company') setForm({ email: 'company1@test.com', password: '1234561' });
    if (role === 'admin') setForm({ email: 'admin2@internsprint.com', password: 'password' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">

      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-cyan-500 flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          InternSprint
        </Link>
        <div>
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Welcome back to your career journey
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Track your applications, discover new opportunities, and land your dream internship.
          </p>
          <div className="space-y-4">
            {['AI-powered internship matching', 'Real-time application tracking', '500+ verified companies'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-3 h-3" />
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-100 text-sm">© 2026 InternSprint</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          <Link to="/" className="lg:hidden flex items-center gap-2 font-bold text-xl mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="gradient-text">InternSprint</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Sign in</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                Sign up free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" className="input" required autoComplete="email" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••" className="input pr-12" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Demo accounts - clickable */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-3">Quick demo login:</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { role: 'student', label: 'Student', color: 'bg-blue-600' },
                { role: 'company', label: 'Company', color: 'bg-purple-600' },
                { role: 'admin', label: 'Admin', color: 'bg-red-600' },
              ].map(({ role, label, color }) => (
                <button key={role} type="button" onClick={() => fillDemo(role)}
                  className={`${color} text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity`}>
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Click a role to auto-fill credentials</p>
          </div>
        </div>
      </div>
    </div>
  );
}
