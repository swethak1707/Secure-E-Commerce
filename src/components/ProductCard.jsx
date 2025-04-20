import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [error, setError] = useState('');
  
  // Check if product is in wishlist
  const productInWishlist = isInWishlist(product.id);

  const handleAddToCart = async () => {
    if (isAdding || !product.stock) return;
    
    setIsAdding(true);
    setError('');
    
    try {
      // Pass the current stock value for validation
      await addToCart(product, 1, product.stock);
      
      // Show success message
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
      notification.innerHTML = `<strong>Success!</strong> ${product.name} added to cart.`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error.message || 'Failed to add to cart');
      
      // Show error message
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
      notification.innerHTML = `<strong>Error!</strong> ${error.message || 'Failed to add to cart'}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async (e) => {
    // Prevent event propagation to avoid navigating to product detail
    e.preventDefault();
    e.stopPropagation();
    
    if (isTogglingWishlist) return;
    
    setIsTogglingWishlist(true);
    
    try {
      const isAdded = await toggleWishlist(product);
      
      // Show success message
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
      notification.innerHTML = `<strong>Success!</strong> ${product.name} ${isAdded ? 'added to' : 'removed from'} wishlist.`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } catch (error) {
      console.error('Error updating wishlist:', error);
      
      // Show error message
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
      notification.innerHTML = `<strong>Error!</strong> Failed to update wishlist.`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Discount badge */}
      {product.discount && (
        <span className="absolute top-0 right-0 bg-purple-600 text-white px-2 py-1 text-xs font-bold rounded-bl-lg z-10">
          {product.discount}% OFF
        </span>
      )}
      
      {/* Wishlist button */}
      <button
        className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-all duration-200"
        onClick={handleToggleWishlist}
        disabled={isTogglingWishlist}
      >
        {isTogglingWishlist ? (
          <svg className="h-5 w-5 text-gray-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        ) : productInWishlist ? (
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )}
      </button>
      
      {/* Product Image */}
      <div className="relative w-full h-60 overflow-hidden">
        <img
          src={product.imageUrl || "https://picsum.photos/200/300.jpg"}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <div>
          <h3 className="text-sm text-gray-500">{product.category}</h3>
          <p className="text-lg font-medium text-gray-900 truncate">{product.name}</p>
        </div>
        
        {/* Ratings */}
        <div className="mt-1 flex items-center">
          {[...Array(5)].map((_, i) => (
            <svg 
              key={i} 
              className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="ml-1 text-xs text-gray-500">({product.reviewCount || 0})</span>
        </div>
        
        {/* Price */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center">
            {product.originalPrice ? (
              <>
                <p className="text-lg font-medium text-gray-900">${product.price?.toFixed(2)}</p>
                <p className="ml-2 text-sm text-gray-500 line-through">${product.originalPrice?.toFixed(2)}</p>
              </>
            ) : (
              <p className="text-lg font-medium text-gray-900">${product.price?.toFixed(2)}</p>
            )}
          </div>
          
          {/* Stock status */}
          {product.stock > 0 ? (
            <span className="text-xs font-medium text-green-600">
              {product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
            </span>
          ) : (
            <span className="text-xs font-medium text-red-600">Out of Stock</span>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mt-2 text-xs text-red-600">
            {error}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link 
            to={`/product/${product.id}`}
            className="text-center py-2 px-3 border border-purple-600 rounded-md text-purple-600 text-sm font-medium hover:bg-purple-50 transition-colors duration-200"
          >
            View Details
          </Link>
          
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !product.stock}
            className={`py-2 px-3 rounded-md text-sm font-medium ${
              isAdding
                ? 'bg-purple-400 text-white cursor-not-allowed'
                : product.stock > 0
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } transition-colors duration-200`}
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;