import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import ProductManagement from './components/ProductManagement';
import UserManagement from './components/UserManagement';
import AdminChatPage from './components/AdminChatPage';
import Dashboard from './components/Dashboard';

const AdminDashboard = ({ activeTab: initialActiveTab = 'dashboard' }) => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Update active tab when prop changes
  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect will happen automatically due to the AdminRoute component
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  // Handle toggle sidebar for mobile views
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Render the active component based on the selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManagement />;
      case 'users':
        return <UserManagement />;
      case 'chat':
        return <AdminChatPage />;
      case 'settings':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h2>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-600">Admin settings will be implemented here.</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - with responsive behavior */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:relative z-30 md:z-auto`}>
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          handleLogout={handleLogout} 
        />
      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader 
          username={currentUser?.displayName || currentUser?.email} 
          toggleSidebar={toggleSidebar}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {renderActiveComponent()}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-3 px-6">
          <div className="text-center md:flex md:justify-between">
            <p className="text-sm text-gray-600">© 2025 ShopSquare. All rights reserved.</p>
            <div className="mt-2 md:mt-0">
              <a href="#privacy" className="text-sm text-purple-600 hover:text-purple-800 mr-4">Privacy Policy</a>
              <a href="#terms" className="text-sm text-purple-600 hover:text-purple-800">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;