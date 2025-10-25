import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Skip error handling in mock mode
    if (localStorage.getItem('authToken') === 'mock-token') {
      return Promise.reject(error);
    }
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          toast.error('Unauthorized access. Please login again.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('isAdmin');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('Access forbidden. You do not have permission.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Dashboard
  getDashboardSummary: () => api.get('/api/dashboard/summary'),
  
  // Attendance
  getAttendance: (params = {}) => api.get('/api/attendance', { params }),
  markAttendanceManual: (data) => api.post('/api/attendance/manual', data),
  
  // Students
  getStudents: () => api.get('/students'),
  addStudent: (formData) => api.post('/dataset/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteStudent: (id) => api.delete(`/api/students/${id}`),
  
  // Training
  trainModel: () => api.post('/api/train'),
  getTrainingStatus: (jobId) => api.get(`/api/train/status/${jobId}`),
  
  // Cameras
  getCameras: () => api.get('/cameras'),
  addCamera: (data) => api.post('/cameras', data),
  deleteCamera: (id) => api.delete(`/cameras/${id}`),
  toggleCamera: (id) => api.post(`/cameras/${id}/toggle`),
  getCameraStatus: () => api.get('/api/cameras/status'),
  
  // User attendance
  getUserAttendance: (studentId) => api.get(`/api/me/attendance?student_id=${studentId}`),
};

export default api;
