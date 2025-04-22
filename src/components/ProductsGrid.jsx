// src/components/ProductsGrid.jsx
import React from 'react';
import { useShop } from '../contexts/ShopContext';
import { useCart } from '../contexts/CartContext';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';

const ProductsGrid = () => {
  const { displayProducts, loading, nextPage, prevPage, pageNumber } = useShop();
  const { favoriteItems } = useCart();
  const productsPerPage = 12; // Define the constant here
  
  // Check if product is in favorites
  const isProductFavorite = (productId) => {
    return favoriteItems.some(item => item.productId === productId);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product}
            isFavorite={isProductFavorite(product.id)}
          />
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex justify-center mt-8 space-x-4">
        <button
          onClick={prevPage}
          disabled={pageNumber === 0}
          className={`px-4 py-2 rounded-md ${
            pageNumber === 0
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Previous
        </button>
        
        <span className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">
          Page {pageNumber + 1}
        </span>
        
        <button
          onClick={nextPage}
          disabled={displayProducts.length < productsPerPage}
          className={`px-4 py-2 rounded-md ${
            displayProducts.length < productsPerPage
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductsGrid;