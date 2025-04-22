// src/components/MobileMenu.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  HomeIcon,
  ShoppingBagIcon,
  HeartIcon,
  TagIcon,
  UserIcon,
  XMarkIcon,
  Bars3Icon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { ClockIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { cartItems } = useCart();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Categories', href: '/categories', icon: TagIcon },
    { name: 'Favorites', href: '/favorites', icon: HeartIcon },
    { name: 'Cart', href: '/checkout', icon: ShoppingBagIcon, count: cartItems.length },
    { name: 'Account', href: '/account', icon: UserIcon, requireAuth: true },
  ];

  if (isAdmin()) {
    navigation.push({ name: 'Admin', href: '/admin', icon: ShieldCheckIcon });
  }

  return (
    <>
      {/* Mobile menu button fixed to bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-up border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-around">
          {navigation.slice(0, 4).map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex flex-col items-center p-3 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              onClick={() => setIsOpen(false)}
            >
              <div className="relative">
                <item.icon className="h-6 w-6" />
                {item.count > 0 && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="mt-1 text-xs">{item.name}</span>
            </Link>
          ))}
          <button
            onClick={toggleMenu}
            className="flex flex-col items-center p-3 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <Bars3Icon className="h-6 w-6" />
            <span className="mt-1 text-xs">More</span>
          </button>
        </div>
      </div>

      {/* Full screen mobile menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-800 overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu</h2>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {navigation.map((item) => {
              if (item.requireAuth && !user) return null;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center px-3 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  onClick={toggleMenu}
                >
                  <item.icon className="h-6 w-6 mr-3 text-gray-500 dark:text-gray-400" />
                  <span>{item.name}</span>
                  {item.count > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full text-xs font-medium">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
            
            {user && (
              <Link
                to="/orders"
                className="flex items-center px-3 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                onClick={toggleMenu}
              >
                <ClockIcon className="h-6 w-6 mr-3 text-gray-500 dark:text-gray-400" />
                <span>My Orders</span>
              </Link>
            )}
            
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              {user ? (
                <>
                  <div className="flex items-center mb-4">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="h-10 w-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
                        <UserIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email || (user.isAnonymous ? 'Guest User' : '')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      toggleMenu();
                    }}
                    className="w-full flex items-center px-3 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                  >
                    <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  onClick={toggleMenu}
                >
                  Sign in / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;