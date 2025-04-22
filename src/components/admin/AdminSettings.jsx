// src/components/admin/AdminSettings.jsx
import React from 'react';

const AdminSettings = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Admin Settings
      </h2>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <p className="text-gray-500 dark:text-gray-400">
            Admin settings functionality will be implemented in future updates. This could include:
          </p>
          
          <ul className="mt-4 space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
            <li>Site configuration</li>
            <li>Payment gateway settings</li>
            <li>Shipping options</li>
            <li>User management</li>
            <li>Discount codes</li>
            <li>Tax settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;