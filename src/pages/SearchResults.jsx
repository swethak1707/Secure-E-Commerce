// src/pages/SearchResults.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const SearchResults = () => {
  const { searchResults, loading } = useShop();
  const { favoriteItems } = useCart();

  // Check if product is in favorites
  const isProductFavorite = (productId) => {
    return favoriteItems.some(item => item.productId === productId);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Search Results
      </h1>
      
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
      </p>
      
      {searchResults.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
            No products found matching your search
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Try using different keywords or browse our categories.
          </p>
          <div className="mt-6">
            <Link
              to="/categories"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {searchResults.map(product => (
            <ProductCard 
              key={product.id} 
              product={product}
              isFavorite={isProductFavorite(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;