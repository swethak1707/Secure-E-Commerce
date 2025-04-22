// src/components/HeroBanner.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HeroBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-blue-500">
      <div className="relative px-6 py-16 sm:px-12 sm:py-24">
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Summer Collection 2025
          </h1>
          <p className="mt-4 text-xl text-white">
            Discover the latest trends and exclusive deals on our premium products.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/categories/Skin care"
              className="px-8 py-3 text-base font-medium text-purple-700 bg-white border border-transparent rounded-md hover:bg-gray-100"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none"></div>
    </div>
  );
};

export default HeroBanner;