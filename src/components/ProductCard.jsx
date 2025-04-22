// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as SolidHeartIcon } from '@heroicons/react/24/solid';

const ProductCard = ({ product, isFavorite = false }) => {
  const { addToCart, addToFavorites } = useCart();
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };
  
  const handleToggleFavorite = (e) => {
    e.preventDefault();
    addToFavorites(product);
  };
  
  return (
    <div className="group relative rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 group-hover:opacity-75">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-48 object-cover object-center"
          />
        </div>
        
        <div className="p-4">
          <div className="flex justify-between">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {product.category}
            </span>
            
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              product.stock > 0 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white truncate">
            {product.name}
          </h3>
          
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
            ${product.price}
          </p>
        </div>
      </Link>
      
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button
          onClick={handleToggleFavorite}
          className="p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:bg-pink-100 dark:hover:bg-pink-900 transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? (
            <SolidHeartIcon className="h-5 w-5 text-pink-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
        
        <button
          disabled={product.stock <= 0}
          onClick={handleAddToCart}
          className={`p-2 rounded-full shadow-md transition-colors ${
            product.stock > 0
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
          }`}
          aria-label="Add to cart"
        >
          <ShoppingCartIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;