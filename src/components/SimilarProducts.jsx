// src/components/SimilarProducts.jsx
import React from 'react';
import { useShop } from '../contexts/ShopContext';
import { useCart } from '../contexts/CartContext';
import ProductCard from './ProductCard';

const SimilarProducts = () => {
  const { similarProducts } = useShop();
  const { favoriteItems } = useCart();

  // Check if product is in favorites
  const isProductFavorite = (productId) => {
    return favoriteItems.some(item => item.productId === productId);
  };

  if (!similarProducts || similarProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        You may also like
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {similarProducts.slice(0, 4).map(product => (
          <ProductCard 
            key={product.id}
            product={product}
            isFavorite={isProductFavorite(product.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;