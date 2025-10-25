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

// User Pages
import UserAttendance from './pages/user/UserAttendance';

// Login Component
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    console.log('Login attempt:', { username, password, role });
    
    // Simple credential check
    if (role === 'admin' && username === 'admin' && password === 'admin123') {
      console.log('Admin login successful');
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('authToken', 'mock-token');
      onLogin();
    } else if (role === 'user' && username === 'student' && password === 'student123') {
      console.log('Student login successful');
      localStorage.setItem('isAdmin', 'false');
      localStorage.setItem('authToken', 'mock-token');
      onLogin();
    } else {
      console.log('Login failed:', { username, password, role });
      setError('Invalid credentials. Please check your username and password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Face Attendance System</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
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
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials:</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Admin:</strong> username: <code className="bg-blue-100 px-1 rounded">admin</code> | password: <code className="bg-blue-100 px-1 rounded">admin123</code></p>
                <p><strong>Student:</strong> username: <code className="bg-blue-100 px-1 rounded">student</code> | password: <code className="bg-blue-100 px-1 rounded">student123</code></p>
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
        
        <div className="lg:pl-64 flex flex-col flex-1">
          <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} />
          
          <main className="flex-1 p-6">
            <Routes>
              {/* Admin Routes */}
              {isAdmin ? (
                <>
                  <Route path="/admin" element={<Dashboard />} />
                  <Route path="/admin/attendance" element={<AttendanceLog />} />
                  <Route path="/admin/students" element={<AddStudent />} />
                  <Route path="/admin/cameras" element={<AddCamera />} />
                  <Route path="/admin/cameras-list" element={<CamerasList />} />
                  <Route path="/" element={<Navigate to="/admin" replace />} />
                </>
              ) : (
                <>
                  <Route path="/user" element={<UserAttendance />} />
                  <Route path="/" element={<Navigate to="/user" replace />} />
                </>
              )}
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
