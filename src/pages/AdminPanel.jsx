// src/pages/AdminPanel.jsx
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ChartBarIcon, 
  ClipboardDocumentListIcon, 
  Cog6ToothIcon, 
  PlusIcon, 
  TagIcon 
} from '@heroicons/react/24/outline';

// Admin Components
import AdminDashboard from '../components/admin/AdminDashboard';
import ProductManagement from '../components/admin/ProductManagement';
import AddProduct from '../components/admin/AddProduct';
import CategoryManagement from '../components/admin/CategoryManagement';
import AdminSettings from '../components/admin/AdminSettings';

const AdminPanel = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
    { name: 'Products', href: '/admin/products', icon: ClipboardDocumentListIcon },
    { name: 'Add Product', href: '/admin/add-product', icon: PlusIcon },
    { name: 'Categories', href: '/admin/categories', icon: TagIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Admin Panel
      </h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <nav className="space-y-1 p-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden p-6">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;