// src/pages/ProductDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';
import { useCart } from '../contexts/CartContext';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as SolidHeartIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/LoadingSpinner';
import SimilarProducts from '../components/SimilarProducts';

const ProductDetails = () => {
  const { id } = useParams();
  const { getProduct, product, getSimilarProducts } = useShop();
  const { addToCart, addToFavorites, favoriteItems } = useCart();
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      await getProduct(id);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      getSimilarProducts(product.category);
    }
  }, [product]);

  useEffect(() => {
    if (product && favoriteItems.length > 0) {
      const favorite = favoriteItems.some(item => item.productId === product.id);
      setIsFavorite(favorite);
    }
  }, [product, favoriteItems]);

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product);
    }
  };

  const handleToggleFavorite = () => {
    if (product) {
      addToFavorites(product);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Product not found
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          The product you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Product Image */}
          <div className="md:w-1/2">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 object-cover object-center"
            />
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 p-8">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-3 py-1 text-sm font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                  {product.category}
                </span>
                <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
                  {product.name}
                </h1>
              </div>
              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                product.stock > 0 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="mt-6">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${product.price}
              </p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Description
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex items-center justify-center px-6 py-3 rounded-md font-medium text-white ${
                  product.stock > 0
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Add to Cart
              </button>

              <button
                onClick={handleToggleFavorite}
                className="flex items-center justify-center px-6 py-3 border rounded-md font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isFavorite ? (
                  <SolidHeartIcon className="h-5 w-5 mr-2 text-pink-500" />
                ) : (
                  <HeartIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
                )}
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      <div className="mt-12">
        <SimilarProducts />
      </div>
    </div>
  );
};

export default ProductDetails;