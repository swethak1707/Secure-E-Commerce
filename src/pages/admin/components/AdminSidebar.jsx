import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminSidebar = ({ activeTab, setActiveTab, handleLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'chat', label: 'Customer Support', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div className={`h-screen bg-gradient-to-b from-purple-900 to-purple-700 transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}>
      {/* Logo Area */}
      <div className="flex items-center justify-between px-5 py-6">
        <Link to="/" className="flex items-center">
          <div className="bg-white rounded-lg p-2 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          {!collapsed && (
            <span className="ml-3 text-xl font-bold text-white">ShopSquare</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full bg-purple-800 hover:bg-purple-600 text-white hover:scale-110 transition-all duration-200 focus:outline-none shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* Admin Info */}
      {!collapsed && (
        <div className="px-5 py-4">
          <div className="bg-purple-800 rounded-lg p-3 flex items-center">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-purple-800 font-bold text-lg shadow-md">
              A
            </div>
            <div className="ml-3">
              <p className="text-white font-medium">Admin User</p>
              <p className="text-purple-200 text-xs">Super Admin</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="px-4 py-4 flex flex-col h-[calc(100vh-180px)]">
        <div className={`text-purple-200 text-xs uppercase font-semibold mb-4 ${collapsed ? 'text-center' : 'px-2'}`}>
          {!collapsed ? 'Main Navigation' : '•••'}
        </div>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <Link
                to={`/admin/${item.id}`}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-white text-purple-800 shadow-md transform scale-105 font-semibold'
                    : 'text-white hover:bg-purple-600 hover:scale-105'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <div className={`flex items-center justify-center ${activeTab === item.id ? 'text-purple-800' : 'text-purple-200'}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Bottom Section */}
        <div className="mt-auto">
          <div className={`text-purple-200 text-xs uppercase font-semibold mb-3 ${collapsed ? 'text-center' : 'px-2'}`}>
            {!collapsed ? 'Account' : '•••'}
          </div>
          
          {/* Help */}
          {!collapsed && (
            <div className="mb-4 bg-purple-800 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="ml-2 text-white font-medium">Need Help?</span>
              </div>
              <p className="text-purple-200 text-xs">Check our documentation for more information</p>
            </div>
          )}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-md hover:shadow-lg ${collapsed ? 'justify-center' : ''}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;