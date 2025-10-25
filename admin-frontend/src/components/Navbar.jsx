import React from 'react';
import { Bell, User, Menu } from 'lucide-react';

const Navbar = ({ onMenuToggle }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const currentTime = new Date().toLocaleString();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {isAdmin ? 'Admin Dashboard' : 'Student Portal'}
            </h2>
            <p className="text-sm text-gray-500">{currentTime}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {isAdmin ? 'Admin' : 'Student'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
