// src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, MinusIcon, XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentOptions from '../components/PaymentOptions';

const Checkout = () => {
  const { cartItems, cartTotal, loading, removeFromCart, increaseQuantity, decreaseQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      // Redirect to home if cart is empty
      navigate('/');
    }
  }, [cartItems, loading]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Your Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">
            Your cart is empty
          </h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Start shopping to add items to your cart.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {cartItems.map((item) => (
                  <li key={item.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-20 w-20 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={item.productImageURL}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">
                            {item.productName}
                          </h3>
                          <p className="text-base font-medium text-gray-900 dark:text-white">
                            ${item.price}
                          </p>
                        </div>
                        
                        <div className="mt-2 flex justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => decreaseQuantity(item.id, item.quantity)}
                              className="p-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            
                            <span className="text-gray-600 dark:text-gray-400">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => increaseQuantity(item.id)}
                              className="p-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4">
              <button
                onClick={() => navigate('/')}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                ← Continue Shopping
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Order Summary
              </h2>
              
              <div className="mt-6 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between">
                  <p className="text-gray-600 dark:text-gray-400">Subtotal</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${cartTotal.toFixed(2)}
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-gray-600 dark:text-gray-400">Shipping</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    $0.00
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-gray-600 dark:text-gray-400">Tax</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${(cartTotal * 0.08).toFixed(2)}
                  </p>
                </div>
                
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    Total
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    ${(cartTotal + (cartTotal * 0.08)).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentOptions 
          total={(cartTotal + (cartTotal * 0.08)).toFixed(2)}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default Checkout;