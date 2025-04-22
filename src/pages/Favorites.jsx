// src/pages/Favorites.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { HeartIcon, ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const Favorites = () => {
  const { favoriteItems, loading, getFavorites, removeFromFavorites, addToCart } = useCart();

  useEffect(() => {
    getFavorites();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Your Favorites
      </h1>

      {favoriteItems.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">
            Your favorites list is empty
          </h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Save items you like for future reference.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Discover Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
            >
              <div className="relative">
                <img
                  src={item.productImageURL}
                  alt={item.productName}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => removeFromFavorites(item)}
                  className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow"
                >
                  <XMarkIcon className="h-5 w-5 text-red-500" />
                </button>
              </div>
              
              <div className="p-4">
                <Link
                  to={`/product/${item.productId}`}
                  className="block text-lg font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                >
                  {item.productName}
                </Link>
                
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  ${item.price}
                </p>
                
                <div className="mt-4">
                  <button
                    onClick={() => addToCart({
                      id: item.productId,
                      name: item.productName,
                      image: item.productImageURL,
                      price: item.price,
                      stock: 1 // Assuming in stock, could be enhanced with actual stock info
                    })}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;