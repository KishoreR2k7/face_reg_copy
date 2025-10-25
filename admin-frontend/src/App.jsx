import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AttendanceLog from './pages/admin/AttendanceLog';
import AddStudent from './pages/admin/AddStudent';
import AddCamera from './pages/admin/AddCamera';
import CamerasList from './pages/admin/CamerasList';
import TrainingCenter from './pages/admin/TrainingCenter';

// Login Component - Admin Only
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    console.log('Admin login attempt:', { username, password });
    
    // Admin credential check only
    if (username === 'admin' && password === 'admin123') {
      console.log('Admin login successful');
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('authToken', 'mock-token');
      onLogin();
    } else {
      console.log('Login failed:', { username, password });
      setError('Invalid admin credentials. Please check your username and password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-600">
            Face Attendance System - Admin Access
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter password"
                />
              </div>
            </div>


            <div>
              <button
                type="submit"
                className="w-full btn-primary"
              >
                Sign in
              </button>
            </div>
            
            {/* Debug section - remove this in production */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">Debug Info:</h4>
              <div className="text-xs text-yellow-700 space-y-1">
                <p>Username: "{username}"</p>
                <p>Password: "{password}"</p>
                <p>Role: "{role}"</p>
                <p>Error: {error || 'No error'}</p>
              </div>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Admin Credentials:</h4>
              <div className="text-sm text-blue-800">
                <p><strong>Username:</strong> <code className="bg-blue-100 px-1 rounded">admin</code></p>
                <p><strong>Password:</strong> <code className="bg-blue-100 px-1 rounded">admin123</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    
    if (authToken) {
      setIsAuthenticated(true);
      setIsAdmin(adminStatus);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="lg:pl-64">
          <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="p-6">
            <Routes>
              {/* Admin Routes Only */}
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/training" element={<TrainingCenter />} />
              <Route path="/admin/attendance" element={<AttendanceLog />} />
              <Route path="/admin/students" element={<AddStudent />} />
              <Route path="/admin/cameras" element={<AddCamera />} />
              <Route path="/admin/cameras-list" element={<CamerasList />} />
              <Route path="/" element={<Navigate to="/admin" replace />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
