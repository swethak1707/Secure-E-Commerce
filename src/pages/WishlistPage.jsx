import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const [isProcessing, setIsProcessing] = useState({});
  const [stockInfo, setStockInfo] = useState({});
  const [loadingStock, setLoadingStock] = useState(false);

  // Fetch current stock information for all items in wishlist
  useEffect(() => {
    const fetchStockInfo = async () => {
      if (wishlistItems.length === 0) return;
      
      setLoadingStock(true);
      const stockData = {};
      
      try {
        for (const item of wishlistItems) {
          // Get current product stock
          const productSnap = await getDoc(doc(db, 'products', item.id));
          
          if (productSnap.exists()) {
            const currentStock = productSnap.data().stock;
            stockData[item.id] = currentStock;
          }
        }
      } catch (error) {
        console.error('Error fetching stock info:', error);
      } finally {
        setStockInfo(stockData);
        setLoadingStock(false);
      }
    };

    fetchStockInfo();
  }, [wishlistItems]);

  const handleRemoveItem = async (productId) => {
    setIsProcessing(prev => ({ ...prev, [productId]: 'removing' }));
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setIsProcessing(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    }
  };

  const handleAddToCart = async (product) => {
    setIsProcessing(prev => ({ ...prev, [product.id]: 'adding' }));
    try {
      // Get current stock
      const currentStock = stockInfo[product.id];
      if (currentStock === undefined || currentStock === 0) {
        alert('This product is currently out of stock');
        return;
      }

      // Add to cart with current stock validation
      await addToCart(product, 1, currentStock);
      
      // Show success message
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
      notification.innerHTML = `<strong>Success!</strong> ${product.name} added to cart.`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
      
      // Optionally remove from wishlist after adding to cart
      // await removeFromWishlist(product.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Show error message
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
      notification.innerHTML = `<strong>Error!</strong> ${error.message || 'Failed to add to cart'}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } finally {
      setIsProcessing(prev => {
        const updated = { ...prev };
        delete updated[product.id];
        return updated;
      });
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      await clearWishlist();
    }
  };

  // Format date from ISO string
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || loadingStock) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
              <div className="h-64 bg-gray-300 rounded mb-6"></div>
              <div className="h-12 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-12 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link to="/" className="text-gray-500 hover:text-purple-600">Home</Link>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-gray-600 md:ml-2 font-medium">My Wishlist</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            {wishlistItems.length > 0 && (
              <button
                onClick={handleClearWishlist}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear Wishlist
              </button>
            )}
          </div>

          {wishlistItems.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="flex flex-col items-center">
                <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h2 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
                <p className="text-gray-600 mb-6">Explore our products and add items to your wishlist!</p>
                <Link
                  to="/products"
                  className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {wishlistItems.map((item) => {
                  const currentStock = stockInfo[item.id];
                  const isInStock = currentStock !== undefined && currentStock > 0;
                  const isProcessingItem = isProcessing[item.id];
                  
                  return (
                    <li key={item.id} className="flex flex-col sm:flex-row p-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-full sm:w-36 h-36 mb-4 sm:mb-0">
                        <Link to={`/product/${item.id}`}>
                          <img
                            src={item.imageUrl || 'https://picsum.photos/200/200'}
                            alt={item.name}
                            className="w-full h-full object-cover object-center rounded-md"
                          />
                        </Link>
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 sm:ml-6 flex flex-col justify-between">
                        <div>
                          <Link to={`/product/${item.id}`} className="text-lg font-medium text-gray-900 hover:text-purple-600">
                            {item.name}
                          </Link>
                          
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {item.category && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {item.category}
                              </span>
                            )}
                            
                            <span className="text-sm text-gray-500">
                              Added on {formatDate(item.addedAt)}
                            </span>
                          </div>
                          
                          <div className="mt-2 flex items-center">
                            <span className="text-xl font-medium text-gray-900">
                              ${item.price?.toFixed(2)}
                            </span>
                            
                            {currentStock !== undefined && (
                              <span className={`ml-3 text-sm ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
                                {currentStock === 0 ? 'Out of stock' : 
                                 currentStock <= 5 ? `Only ${currentStock} left in stock` : 'In stock'}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={isProcessingItem || !isInStock}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                              isProcessingItem === 'adding'
                                ? 'bg-purple-400 text-white cursor-not-allowed'
                                : isInStock
                                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            } transition-colors`}
                          >
                            {isProcessingItem === 'adding' ? 'Adding...' : 'Add to Cart'}
                          </button>
                          
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isProcessingItem}
                            className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                              isProcessingItem === 'removing'
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-50'
                            } transition-colors`}
                          >
                            {isProcessingItem === 'removing' ? 'Removing...' : 'Remove'}
                          </button>
                          
                          <Link
                            to={`/product/${item.id}`}
                            className="px-4 py-2 border border-purple-600 rounded-md text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          
          {/* Continue Shopping */}
          <div className="mt-8">
            <Link
              to="/products"
              className="flex items-center justify-center text-purple-600 hover:text-purple-800"
            >
              <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WishlistPage;