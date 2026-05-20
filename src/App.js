import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import StudentDashboard from './pages/student/StudentDashboard';
import BrowseInternships from './pages/student/BrowseInternships';
import StudentProfile from './pages/student/StudentProfile';
import MyApplications from './pages/student/MyApplications';
import SavedInternships from './pages/student/SavedInternships';
import ATSResumePage from './pages/student/ATSResumePage';

import CompanyDashboard from './pages/company/CompanyDashboard';
import PostInternship from './pages/company/PostInternship';
import ManageApplications from './pages/company/ManageApplications';
import FindCandidates from './pages/company/FindCandidates';
import CompanyProfile from './pages/company/CompanyProfile';

import AdminDashboard from './pages/admin/AdminDashboard';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Student routes */}
      <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/browse" element={<ProtectedRoute role="student"><BrowseInternships /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
      <Route path="/student/applications" element={<ProtectedRoute role="student"><MyApplications /></ProtectedRoute>} />
      <Route path="/student/saved" element={<ProtectedRoute role="student"><SavedInternships /></ProtectedRoute>} />
      <Route path="/student/resume" element={<ProtectedRoute role="student"><ATSResumePage /></ProtectedRoute>} />

      {/* Company routes */}
      <Route path="/company" element={<ProtectedRoute role="company"><CompanyDashboard /></ProtectedRoute>} />
      <Route path="/company/post" element={<ProtectedRoute role="company"><PostInternship /></ProtectedRoute>} />
      <Route path="/company/applications/:id" element={<ProtectedRoute role="company"><ManageApplications /></ProtectedRoute>} />
      <Route path="/company/candidates" element={<ProtectedRoute role="company"><FindCandidates /></ProtectedRoute>} />
      <Route path="/company/profile" element={<ProtectedRoute role="company"><CompanyProfile /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif' },
            }}
          />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
