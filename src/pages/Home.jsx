// src/pages/Home.jsx
import React from 'react';
import ProductsGrid from '../components/ProductsGrid';
import Categories from '../components/Categories';
import HeroBanner from '../components/HeroBanner';

const Home = () => {
  return (
    <div className="space-y-8">
      <HeroBanner />
      <Categories />
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Featured Products
        </h2>
        <ProductsGrid />
      </div>
    </div>
  );
};

export default Home;