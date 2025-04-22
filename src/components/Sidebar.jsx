// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  ShoppingBagIcon,
  HeartIcon,
  TagIcon,
  ClockIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  
  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Categories', href: '/categories', icon: TagIcon },
    { name: 'My Favorites', href: '/favorites', icon: HeartIcon },
    { name: 'My Cart', href: '/checkout', icon: ShoppingBagIcon },
  ];
  
  const accountNavigation = user ? [
    { name: 'My Account', href: '/account', icon: UserIcon },
    { name: 'My Orders', href: '/orders', icon: ClockIcon },
  ] : [];
  
  const adminNavigation = user && isAdmin() ? [
    { name: 'Admin Panel', href: '/admin', icon: ShieldCheckIcon },
  ] : [];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            ShopMaster
          </span>
        </Link>
      </div>
      
      <div className="flex-1 px-2 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-6 mb-2">
          Shop
        </p>
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive(item.href)
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <item.icon
              className={`mr-3 flex-shrink-0 h-6 w-6 ${
                isActive(item.href)
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        ))}
        
        {user && (
          <>
            <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-6 mb-2">
              My Account
            </p>
            {accountNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    isActive(item.href)
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </>
        )}
        
        {adminNavigation.length > 0 && (
          <>
            <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-6 mb-2">
              Admin
            </p>
            {adminNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    isActive(item.href)
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-8 w-8 rounded-full mr-2"
                />
              ) : (
                <UserIcon className="h-6 w-6 mr-2 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email || (user.isAnonymous ? 'Guest' : '')}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;