import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// User Pages
import UserAttendance from './pages/user/UserAttendance';
import UserProfile from './pages/user/UserProfile';

// Login Component - Student Only
const Login = ({ onLogin }) => {
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    console.log('Student login attempt:', { rollNo, password });
    
    // Student credential check only
    if (rollNo === 'CS001' && password === 'student123') {
      console.log('Student login successful');
      localStorage.setItem('isAdmin', 'false');
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('studentRollNo', rollNo);
      onLogin();
    } else {
      console.log('Login failed:', { rollNo, password });
      setError('Invalid student credentials. Please check your roll number and password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Student Portal</h2>
          <p className="mt-2 text-sm text-gray-600">
            Face Attendance System - Student Access
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
              <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700">
                Roll Number
              </label>
              <div className="mt-1">
                <input
                  id="rollNo"
                  name="rollNo"
                  type="text"
                  required
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="input-field"
                  placeholder="Enter roll number"
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
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setError(''); // Clear error when role changes
                  }}
                  className="input-field"
                >
                  <option value="admin">Admin</option>
                  <option value="user">Student</option>
                </select>
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
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Student Credentials:</h4>
              <div className="text-sm text-blue-800">
                <p><strong>Roll Number:</strong> <code className="bg-blue-100 px-1 rounded">CS001</code></p>
                <p><strong>Password:</strong> <code className="bg-blue-100 px-1 rounded">student123</code></p>
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
              {/* User Routes Only */}
              <Route path="/user" element={<UserAttendance />} />
              <Route path="/user/profile" element={<UserProfile />} />
              <Route path="/" element={<Navigate to="/user" replace />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/user" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
