// src/layouts/MainLayout.jsx
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileMenu from '../components/MobileMenu';

const MainLayout = () => {
  // Set up dark mode based on user preference
  useEffect(() => {
    // Check if user preference is stored in localStorage
    const userPreference = localStorage.getItem('theme');
    
    // Check if system prefers dark mode
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply dark mode if user prefers it or if system prefers it and no user preference is stored
    if (userPreference === 'dark' || (!userPreference && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="md:ml-64 flex flex-col flex-1">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Menu (fixed at bottom) */}
      <MobileMenu />
    </div>
  );
};

export default MainLayout;