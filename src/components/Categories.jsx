// src/components/Categories.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';
import LoadingSpinner from './LoadingSpinner';

const Categories = () => {
  const { categories, loading } = useShop();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Shop by Category
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map(category => (
          <Link 
            key={category.id}
            to={`/categories/${category.name}`}
            className="group"
          >
            <div className="relative overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-w-1 aspect-h-1">
                <img 
                  src={category.thumbnailURL} 
                  alt={category.name}
                  className="object-cover w-full h-24 sm:h-32 group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              <h3 className="absolute bottom-2 left-2 text-white font-medium">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;