import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Camera, 
  Calendar, 
  UserPlus, 
  Settings,
  LogOut,
  Menu,
  X,
  Brain
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const adminMenuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/training', icon: Brain, label: 'Training Center' },
    { path: '/admin/attendance', icon: Calendar, label: 'Attendance Log' },
    { path: '/admin/cameras', icon: Camera, label: 'Add Camera' },
    { path: '/admin/cameras-list', icon: Settings, label: 'Cameras List' },
  ];

  const userMenuItems = [
    { path: '/user', icon: Users, label: 'My Attendance' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center justify-between p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">
            Face Attendance
          </h1>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6">
          <div className="px-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {isAdmin ? 'Admin Panel' : 'User Panel'}
            </p>
          </div>
          
          <div className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
