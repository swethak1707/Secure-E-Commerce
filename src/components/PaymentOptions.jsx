// // // src/components/PaymentOptions.jsx
// // import React, { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { XMarkIcon } from '@heroicons/react/24/outline';
// // import { loadStripe } from '@stripe/stripe-js';
// // import { useCart } from '../contexts/CartContext';
// // import { useAuth } from '../contexts/AuthContext';
// // import PayPalButton from './PayPalButton';

// // const PaymentOptions = ({ total, onClose }) => {
// //   const [selectedOption, setSelectedOption] = useState('stripe');
// //   const [loading, setLoading] = useState(false);
// //   const { cartItems, recordTransaction, clearCart } = useCart();
// //   const { user } = useAuth();
// //   const navigate = useNavigate();
  
// //   // Initialize Stripe
// //   let stripePromise;
  
// //   const getStripe = () => {
// //     if (!stripePromise) {
// //       stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);
// //     }
// //     return stripePromise;
// //   };
  
// //   const handleStripeCheckout = async () => {
// //     setLoading(true);
    
// //     try {
// //       const stripe = await getStripe();
      
// //       // Create line items from cart
// //       const lineItems = cartItems.map(item => ({
// //         price_data: {
// //           currency: 'usd',
// //           product_data: {
// //             name: item.productName,
// //             images: [item.productImageURL],
// //           },
// //           unit_amount: Math.round(item.price * 100), // Stripe uses cents
// //         },
// //         quantity: item.quantity,
// //       }));
      
// //       // Redirect to Stripe Checkout
// //       const { error } = await stripe.redirectToCheckout({
// //         mode: 'payment',
// //         lineItems,
// //         successUrl: `${window.location.origin}/success`,
// //         cancelUrl: `${window.location.origin}/checkout`,
// //       });
      
// //       if (error) {
// //         console.error('Stripe Checkout Error:', error);
// //         throw new Error(error.message);
// //       }
// //     } catch (error) {
// //       console.error('Error redirecting to Stripe Checkout:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
  
// //   const handlePayPalSuccess = async (details) => {
// //     // Record the transaction
// //     await recordTransaction({
// //       id: details.id,
// //       status: details.status,
// //       payer: details.payer,
// //       purchase_units: [
// //         {
// //           description: cartItems.map(item => `${item.productName} x${item.quantity}`).join(', '),
// //           amount: {
// //             currency_code: 'USD',
// //             value: total
// //           }
// //         }
// //       ],
// //       update_time: details.update_time,
// //       intent: 'CAPTURE'
// //     });
    
// //     // Clear the cart
// //     await clearCart();
    
// //     // Redirect to success page
// //     navigate('/success');
// //   };

// //   return (
// //     <div className="fixed inset-0 z-50 overflow-y-auto">
// //       <div className="flex items-center justify-center min-h-screen px-4 text-center">
// //         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
// //         {/* Modal Content */}
// //         <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
// //           <div className="absolute top-0 right-0 pt-4 pr-4">
// //             <button
// //               type="button"
// //               className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
// //               onClick={onClose}
// //             >
// //               <XMarkIcon className="h-6 w-6" />
// //             </button>
// //           </div>
          
// //           <div className="p-6">
// //             <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
// //               Select Payment Method
// //             </h3>
            
// //             <div className="mt-4 space-y-4">
// //               {/* Payment Options */}
// //               <div className="flex flex-col space-y-2">
// //                 <div className="flex items-center">
// //                   <input
// //                     id="stripe"
// //                     name="payment-method"
// //                     type="radio"
// //                     checked={selectedOption === 'stripe'}
// //                     onChange={() => setSelectedOption('stripe')}
// //                     className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
// //                   />
// //                   <label htmlFor="stripe" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
// //                     Credit Card (Stripe)
// //                   </label>
// //                 </div>
                
// //                 <div className="flex items-center">
// //                   <input
// //                     id="paypal"
// //                     name="payment-method"
// //                     type="radio"
// //                     checked={selectedOption === 'paypal'}
// //                     onChange={() => setSelectedOption('paypal')}
// //                     className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
// //                   />
// //                   <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
// //                     PayPal
// //                   </label>
// //                 </div>
// //               </div>
              
// //               {/* Payment UI */}
// //               <div className="mt-6">
// //                 {selectedOption === 'stripe' ? (
// //                   <button
// //                     onClick={handleStripeCheckout}
// //                     disabled={loading}
// //                     className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
// //                       loading
// //                         ? 'bg-gray-400 cursor-not-allowed'
// //                         : 'bg-indigo-600 hover:bg-indigo-700'
// //                     }`}
// //                   >
// //                     {loading ? 'Processing...' : 'Pay with Card'}
// //                   </button>
// //                 ) : (
// //                   <div className="py-2">
// //                     <PayPalButton 
// //                       amount={total}
// //                       onSuccess={handlePayPalSuccess}
// //                     />
// //                   </div>
// //                 )}
// //               </div>
              
// //               <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
// //                 <p>Your order of ${total} will be processed securely.</p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default PaymentOptions;
// // src/components/PaymentOptions.jsx

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { XMarkIcon } from '@heroicons/react/24/outline';
// import { loadStripe } from '@stripe/stripe-js';
// import { useCart } from '../contexts/CartContext';
// import { useAuth } from '../contexts/AuthContext';
// import PayPalButton from './PayPalButton';

// const PaymentOptions = ({ total, onClose }) => {
//   const [selectedOption, setSelectedOption] = useState('stripe');
//   const [loading, setLoading] = useState(false);
//   const { cartItems, recordTransaction, clearCart } = useCart();
//   const { user } = useAuth();
//   const navigate = useNavigate();
  
//   // Initialize Stripe
//   let stripePromise;
  
//   const getStripe = () => {
//     if (!stripePromise) {
//       stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);
//     }
//     return stripePromise;
//   };
  
//   const handleStripeCheckout = async () => {
//     setLoading(true);
    
//     try {
//       const stripe = await getStripe();
      
//       // Create a checkout session
//       const response = await fetch('/api/create-checkout-session', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           items: cartItems.map(item => ({
//             id: item.productId,
//             name: item.productName,
//             price: item.price * 100, // Convert to cents
//             quantity: item.quantity,
//             image: item.productImageURL
//           })),
//           success_url: `${window.location.origin}/success`,
//           cancel_url: `${window.location.origin}/checkout`,
//         }),
//       });
      
//       // For development without a backend, use this approach instead:
//       // This is a simplified approach for testing purposes
//       const session = {
//         id: 'cs_test_' + Math.random().toString(36).substring(2, 15)
//       };
      
//       // Redirect to Stripe Checkout
//       const result = await stripe.redirectToCheckout({
//         sessionId: session.id,
//       });
      
//       if (result.error) {
//         throw new Error(result.error.message);
//       }
//     } catch (error) {
//       console.error('Error redirecting to Stripe Checkout:', error);
      
//       // Fallback approach for testing without a backend
//       // This simulates a successful checkout
//       toast.success('Payment processed successfully!');
      
//       // Record transaction for demo purposes
//       await recordTransaction({
//         id: 'test_' + Math.random().toString(36).substring(2, 15),
//         status: 'COMPLETED',
//         payer: {
//           email_address: user?.email || 'guest@example.com',
//           name: {
//             given_name: user?.displayName?.split(' ')[0] || 'Guest',
//             surname: user?.displayName?.split(' ')[1] || 'User'
//           }
//         },
//         purchase_units: [
//           {
//             description: cartItems.map(item => `${item.productName} x${item.quantity}`).join(', '),
//             amount: {
//               currency_code: 'USD',
//               value: total
//             }
//           }
//         ],
//         update_time: new Date().toISOString(),
//         intent: 'CAPTURE'
//       });
      
//       // Clear the cart
//       await clearCart();
      
//       // Redirect to success page
//       navigate('/success');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handlePayPalSuccess = async (details) => {
//     // Record the transaction
//     await recordTransaction({
//       id: details.id,
//       status: details.status,
//       payer: details.payer,
//       purchase_units: [
//         {
//           description: cartItems.map(item => `${item.productName} x${item.quantity}`).join(', '),
//           amount: {
//             currency_code: 'USD',
//             value: total
//           }
//         }
//       ],
//       update_time: details.update_time,
//       intent: 'CAPTURE'
//     });
    
//     // Clear the cart
//     await clearCart();
    
//     // Redirect to success page
//     navigate('/success');
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-screen px-4 text-center">
//         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
//         {/* Modal Content */}
//         <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//           <div className="absolute top-0 right-0 pt-4 pr-4">
//             <button
//               type="button"
//               className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
//               onClick={onClose}
//             >
//               <XMarkIcon className="h-6 w-6" />
//             </button>
//           </div>
          
//           <div className="p-6">
//             <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
//               Select Payment Method
//             </h3>
            
//             <div className="mt-4 space-y-4">
//               {/* Payment Options */}
//               <div className="flex flex-col space-y-2">
//                 <div className="flex items-center">
//                   <input
//                     id="stripe"
//                     name="payment-method"
//                     type="radio"
//                     checked={selectedOption === 'stripe'}
//                     onChange={() => setSelectedOption('stripe')}
//                     className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
//                   />
//                   <label htmlFor="stripe" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Credit Card (Stripe)
//                   </label>
//                 </div>
                
//                 <div className="flex items-center">
//                   <input
//                     id="paypal"
//                     name="payment-method"
//                     type="radio"
//                     checked={selectedOption === 'paypal'}
//                     onChange={() => setSelectedOption('paypal')}
//                     className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
//                   />
//                   <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     PayPal
//                   </label>
//                 </div>
//               </div>
              
//               {/* Payment UI */}
//               <div className="mt-6">
//                 {selectedOption === 'stripe' ? (
//                   <button
//                     onClick={handleStripeCheckout}
//                     disabled={loading}
//                     className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
//                       loading
//                         ? 'bg-gray-400 cursor-not-allowed'
//                         : 'bg-indigo-600 hover:bg-indigo-700'
//                     }`}
//                   >
//                     {loading ? 'Processing...' : 'Pay with Card'}
//                   </button>
//                 ) : (
//                   <div className="py-2">
//                     <PayPalButton 
//                       amount={total}
//                       onSuccess={handlePayPalSuccess}
//                     />
//                   </div>
//                 )}
//               </div>
              
//               <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
//                 <p>Your order of ${total} will be processed securely.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentOptions;
// src/components/PaymentOptions.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';
import PayPalButton from './PayPalButton';
import { toast } from 'react-hot-toast';

const PaymentOptions = ({ total, onClose }) => {
  const [selectedOption, setSelectedOption] = useState('paypal'); // Set PayPal as default
  const [loading, setLoading] = useState(false);
  const { cartItems, recordTransaction, clearCart } = useCart();
  const navigate = useNavigate();
  
  const handleStripePayment = async () => {
    setLoading(true);
    
    try {
      // For demo purposes, simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Record simulated transaction
      await recordTransaction({
        id: 'stripe_' + Math.random().toString(36).substring(2, 15),
        status: 'COMPLETED',
        payer: {
          email_address: 'demo@example.com',
          name: {
            given_name: 'Demo',
            surname: 'User'
          }
        },
        purchase_units: [
          {
            description: cartItems.map(item => `${item.productName} x${item.quantity}`).join(', '),
            amount: {
              currency_code: 'USD',
              value: total
            }
          }
        ],
        update_time: new Date().toISOString(),
        intent: 'CAPTURE'
      });
      
      // Clear the cart
      await clearCart();
      
      toast.success('Payment successful!');
      // Redirect to success page
      navigate('/success');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePayPalSuccess = async (details) => {
    try {
      // Record the transaction
      await recordTransaction({
        id: details.id,
        status: details.status,
        payer: details.payer,
        purchase_units: details.purchase_units,
        update_time: details.update_time,
        intent: 'CAPTURE'
      });
      
      // Clear the cart
      await clearCart();
      
      toast.success('Payment successful!');
      // Redirect to success page
      navigate('/success');
    } catch (error) {
      console.error('Error recording transaction:', error);
      toast.error('Error processing your order, but payment was received.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden w-full max-w-md mx-auto">
          <div className="relative p-6">
            <button
              type="button"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Complete Your Purchase
            </h3>
            
            <div className="mb-6">
              <p className="text-md text-gray-700 dark:text-gray-300 mb-2">
                Order Total: <span className="font-semibold">${parseFloat(total).toFixed(2)}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please select a payment method below
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Payment Method Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedOption('stripe')}
                  className={`p-3 border rounded-md flex justify-center items-center ${
                    selectedOption === 'stripe'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <span className="font-medium">Credit Card</span>
                </button>
                
                <button
                  onClick={() => setSelectedOption('paypal')}
                  className={`p-3 border rounded-md flex justify-center items-center ${
                    selectedOption === 'paypal'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <span className="font-medium">PayPal</span>
                </button>
              </div>
              
              {/* Payment UI based on selection */}
              <div className="mt-6">
                {selectedOption === 'stripe' ? (
                  <div className="space-y-4">
                    {/* Simple Credit Card Form for Demo */}
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
                      For demo purposes, clicking Pay Now will simulate a successful payment
                    </p>
                    
                    <button
                      onClick={handleStripePayment}
                      disabled={loading}
                      className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                        loading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <PayPalButton 
                      amount={total}
                      onSuccess={handlePayPalSuccess}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              <p>Your payment information is processed securely.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;