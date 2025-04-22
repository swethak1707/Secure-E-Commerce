// src/pages/CategoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CategoryPage = () => {
  const { id } = useParams();
  const { getCategoryProducts, categoryProducts, loading } = useShop();
  const { favoriteItems } = useCart();
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    if (id) {
      setCategoryName(id);
      getCategoryProducts(id);
    }
  }, [id]);

  // Check if product is in favorites
  const isProductFavorite = (productId) => {
    return favoriteItems.some(item => item.productId === productId);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {categoryName}
      </h1>
      
      {categoryProducts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">
            No products found in this category
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Try another category or check back later for new products.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoryProducts.map(product => (
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

export default CategoryPage;