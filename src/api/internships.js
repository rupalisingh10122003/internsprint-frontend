import axios from 'axios';
import api from './axios';

export const searchInternships = (params) => api.get('/api/internships/search', { params });
export const getInternshipById = (id) => api.get(`/api/internships/${id}`);

// Student
export const applyToInternship = (internshipId, data) => api.post(`/api/student/apply/${internshipId}`, data);
export const getMyApplications = () => api.get('/api/student/applications');
export const getStudentProfile = () => api.get('/api/student/profile');
export const updateStudentProfile = (data) => api.put('/api/student/profile', data);
export const getNotifications = () => api.get('/api/student/notifications');
export const markNotificationsRead = () => api.put('/api/student/notifications/read');
export const saveInternship = (id) => api.post(`/api/student/save/${id}`);
export const unsaveInternship = (id) => api.delete(`/api/student/save/${id}`);
export const getSavedInternships = () => api.get('/api/student/saved');
export const withdrawApplication = (id) => api.delete(`/api/student/applications/${id}/withdraw`);

// Company
export const postInternship = (data) => api.post('/api/company/internships', data);
export const getCompanyInternships = () => api.get('/api/company/internships');
export const closeInternship = (id) => api.put(`/api/company/internships/${id}/close`);
export const getInternshipApplications = (id) => api.get(`/api/company/internships/${id}/applications`);
export const updateApplicationStatus = (id, status) =>
  api.put(`/api/company/applications/${id}/status`, null, { params: { status } });

// Fix: properly saves interview date to backend
export const scheduleInterview = (id, interviewDateTime) =>
  api.put(`/api/company/applications/${id}/schedule`, null, {
    params: { interviewDate: interviewDateTime }
  });

// Admin
export const getAllUsers = () => api.get('/api/admin/users');
export const getAllCompanies = () => api.get('/api/admin/companies');
export const getAllInternshipsAdmin = () => api.get('/api/admin/internships');
export const verifyCompany = (id) => api.put(`/api/admin/companies/${id}/verify`);
export const unverifyCompany = (id) => api.put(`/api/admin/companies/${id}/unverify`);
export const deleteInternshipAdmin = (id) => api.delete(`/api/admin/internships/${id}`);
export const deactivateUser = (id) => api.put(`/api/admin/users/${id}/deactivate`);

// AI Module — 60s timeout for Render free tier cold start
const aiClient = axios.create({
  baseURL: 'https://internsprint-ai.onrender.com',
  timeout: 60000,
});

export const getAIMatches = (skills) => aiClient.post('/api/match', { skills });
export const getSkillGap = (studentSkills, requiredSkills) =>
  aiClient.post('/api/skillgap', { studentSkills, requiredSkills });
export const findMatchingStudents = (requiredSkills) =>
  aiClient.post('/api/match/students', { requiredSkills });
