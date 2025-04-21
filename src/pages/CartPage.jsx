import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CartPage = () => {
  const { cartItems, cartTotal, loading, removeFromCart, updateCartItemQuantity, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [stockInfo, setStockInfo] = useState({});
  const [errors, setErrors] = useState({});
  const [loadingStock, setLoadingStock] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Fetch current stock information for all items in cart
  useEffect(() => {
    const fetchStockInfo = async () => {
      if (cartItems.length === 0) return;
      
      setLoadingStock(true);
      const stockData = {};
      const errorData = {};
      
      try {
        for (const item of cartItems) {
          // Fixed: Get current product stock using getDoc() instead of .get()
          const productDocRef = doc(db, 'products', item.id);
          const productSnap = await getDoc(productDocRef);
          
          if (productSnap.exists()) {
            const currentStock = productSnap.data().stock;
            stockData[item.id] = currentStock;
            
            // Check if cart quantity exceeds current stock
            if (item.quantity > currentStock) {
              errorData[item.id] = `Only ${currentStock} items available in stock.`;
            }
          } else {
            errorData[item.id] = 'Product no longer exists.';
          }
        }
      } catch (error) {
        console.error('Error fetching stock info:', error);
      } finally {
        setStockInfo(stockData);
        setErrors(errorData);
        setLoadingStock(false);
      }
    };

    fetchStockInfo();
  }, [cartItems]);

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
    // Clear error for this item if it exists
    if (errors[productId]) {
      const newErrors = { ...errors };
      delete newErrors[productId];
      setErrors(newErrors);
    }
  };

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;
    
    // Get the current stock for validation
    const currentStock = stockInfo[productId];
    
    if (currentStock === undefined) {
      // If we don't have stock info yet, don't update
      return;
    }
    
    if (quantity > currentStock) {
      // Show error but don't update quantity
      setErrors({ ...errors, [productId]: `Cannot add more than ${currentStock} items due to stock limitations.` });
      return;
    }
    
    try {
      await updateCartItemQuantity(productId, quantity, currentStock);
      
      // Clear error for this item if it exists
      if (errors[productId]) {
        const newErrors = { ...errors };
        delete newErrors[productId];
        setErrors(newErrors);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setErrors({ ...errors, [productId]: error.message });
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
      setErrors({});
    }
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      // Redirect to login if not logged in
      if (window.confirm('You need to be logged in to checkout. Go to login page?')) {
        navigate('/login');
      }
      return;
    }

    // Check if any items have errors
    if (Object.keys(errors).length > 0) {
      setCheckoutError('Please fix the errors in your cart before checking out.');
      return;
    }

    // Check if any items are out of stock
    for (const item of cartItems) {
      const currentStock = stockInfo[item.id];
      if (currentStock === undefined || currentStock < item.quantity) {
        setCheckoutError('Some items in your cart are out of stock or have insufficient quantity. Please update your cart.');
        return;
      }
    }

    // Navigate to checkout page
    navigate('/checkout');
  };

  if (loading || loadingStock) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-300 rounded w-1/4"></div>
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
                  <span className="ml-1 text-gray-600 md:ml-2 font-medium">Shopping Cart</span>
                </div>
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="flex flex-col items-center">
                <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
                <Link
                  to="/products"
                  className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-medium text-gray-900">Cart Items ({cartItems.length})</h2>
                  </div>
                  
                  {/* Display checkout error if any */}
                  {checkoutError && (
                    <div className="px-6 py-4 bg-red-50 border-b border-red-100">
                      <p className="text-red-600">{checkoutError}</p>
                    </div>
                  )}
                  
                  <ul>
                    {cartItems.map((item) => {
                      const currentStock = stockInfo[item.id];
                      const isStockAvailable = currentStock !== undefined && currentStock > 0;
                      const hasError = errors[item.id] !== undefined;
                      
                      return (
                        <li key={item.id} className={`border-b border-gray-200 last:border-b-0 ${hasError ? 'bg-red-50' : ''}`}>
                          <div className="flex items-center p-6">
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <img
                                src={item.imageUrl || 'https://picsum.photos/200/200'}
                                alt={item.name}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>

                            <div className="ml-4 flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>
                                    <Link to={`/product/${item.id}`}>{item.name}</Link>
                                  </h3>
                                  <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                                
                                {/* Stock information */}
                                {currentStock !== undefined && (
                                  <p className={`mt-1 text-sm ${
                                    currentStock >= item.quantity ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {currentStock === 0 ? 'Out of stock' : 
                                     currentStock < item.quantity ? `Only ${currentStock} available` : 
                                     currentStock <= 5 ? `Only ${currentStock} left in stock` : 'In stock'}
                                  </p>
                                )}
                                
                                {/* Error message */}
                                {hasError && (
                                  <p className="mt-1 text-sm text-red-600">{errors[item.id]}</p>
                                )}
                              </div>
                              <div className="flex flex-1 items-end justify-between text-sm">
                                <div className="flex items-center">
                                  <span className="mr-3 text-gray-500">Qty</span>
                                  <button
                                    type="button"
                                    className="rounded-md border border-gray-300 px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                                    disabled={!isStockAvailable}
                                  >
                                    -
                                  </button>
                                  <span className="mx-2 text-gray-700">{item.quantity}</span>
                                  <button
                                    type="button"
                                    className="rounded-md border border-gray-300 px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    disabled={!isStockAvailable || (currentStock !== undefined && item.quantity >= currentStock)}
                                  >
                                    +
                                  </button>
                                </div>

                                <div className="flex">
                                  <button
                                    type="button"
                                    className="font-medium text-purple-600 hover:text-purple-800"
                                    onClick={() => handleRemoveItem(item.id)}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="px-6 py-4 bg-gray-50">
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:text-red-800"
                      onClick={handleClearCart}
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
                  <div className="px-6 py-4">
                    <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                  </div>
                  
                  <div className="px-6 py-4">
                    <div className="flex justify-between mb-3">
                      <p className="text-gray-600">Subtotal</p>
                      <p className="text-gray-900 font-medium">${cartTotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between mb-3">
                      <p className="text-gray-600">Shipping</p>
                      <p className="text-gray-900 font-medium">Free</p>
                    </div>
                    <div className="flex justify-between mb-3">
                      <p className="text-gray-600">Tax</p>
                      <p className="text-gray-900 font-medium">${(cartTotal * 0.1).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4">
                    <div className="flex justify-between mb-6">
                      <p className="text-lg font-medium text-gray-900">Total</p>
                      <p className="text-lg font-bold text-gray-900">${(cartTotal + (cartTotal * 0.1)).toFixed(2)}</p>
                    </div>
                    
                    <Link
                      to="/checkout"
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium ${
                        isCheckingOut || Object.keys(errors).length > 0
                          ? 'bg-purple-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700'
                      } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                      onClick={(e) => {
                        if (Object.keys(errors).length > 0) {
                          e.preventDefault();
                          setCheckoutError('Please fix the errors in your cart before checking out.');
                        }
                        if (!currentUser) {
                          e.preventDefault();
                          if (window.confirm('You need to be logged in to checkout. Go to login page?')) {
                            navigate('/login');
                          }
                        }
                      }}
                    >
                      Proceed to Checkout
                    </Link>
                    
                    {Object.keys(errors).length > 0 && (
                      <p className="mt-2 text-sm text-red-600 text-center">
                        Please fix the errors in your cart before checkout
                      </p>
                    )}
                    
                    {!currentUser && (
                      <p className="mt-3 text-sm text-gray-500 text-center">
                        You need to be <Link to="/login" className="text-purple-600 hover:text-purple-800">logged in</Link> to checkout
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Continue Shopping */}
                <div className="mt-6">
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
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;