import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp , doc, getDoc, getDocs} from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStripe } from '../context/StripeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PaymentForm from '../components/PaymentForm';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { createPaymentIntent, clientSecret, resetPayment } = useStripe();
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phoneNumber: ''
  });
  
  const [orderId, setOrderId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: shipping info, 2: payment
  
  // If the user has an address saved, pre-fill the shipping form
  useEffect(() => {
    const loadUserAddress = async () => {
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists() && userDoc.data().address) {
            const { address } = userDoc.data();
            setShippingInfo(prevInfo => ({
              ...prevInfo,
              address: address.street || '',
              city: address.city || '',
              state: address.state || '',
              zipCode: address.zipCode || '',
              country: address.country || '',
              phoneNumber: address.phoneNumber || ''
            }));
            
            // Also set the full name if available
            if (currentUser.displayName) {
              setShippingInfo(prevInfo => ({
                ...prevInfo,
                fullName: currentUser.displayName
              }));
            }
          }
        } catch (error) {
          console.error('Error loading user address:', error);
          // Non-critical error, continue without pre-filling
        }
      }
    };
    
    loadUserAddress();
    
    // Reset payment state when component unmounts
    return () => resetPayment();
  }, [currentUser, resetPayment]);
  
  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0 && !orderId) {
      navigate('/cart');
    }
  }, [cartItems, navigate, orderId]);
  
  // Handle shipping form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));
  };
  
  // Handle shipping form submission
  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    for (const [key, value] of Object.entries(shippingInfo)) {
      if (!value.trim()) {
        setError(`Please fill in your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Create order in Firestore
      const orderData = {
        userId: currentUser.uid,
        items: cartItems,
        total: cartTotal,
        shipping: shippingInfo,
        status: 'pending',
        createdAt: serverTimestamp()
      };
      
      // Add order to Firestore
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      console.log('Order created with ID:', orderRef.id);
      setOrderId(orderRef.id);
      
      // Create payment intent with Stripe
      try {
        await createPaymentIntent(cartTotal, {
          orderId: orderRef.id,
          userEmail: currentUser.email
        });
        
        // Move to payment step
        setStep(2);
      } catch (paymentError) {
        console.error('Error creating payment intent:', paymentError);
        setError('Failed to initialize payment. Please try again.');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-8">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/cart')}
                className="text-purple-600 hover:text-purple-800"
              >
                Cart
              </button>
              <svg className="mx-2 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className={`${step === 1 ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                Shipping
              </span>
              <svg className="mx-2 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className={`${step === 2 ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                Payment
              </span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Order details */}
            <div className="lg:col-span-2">
              {step === 1 ? (
                /* Shipping Information Form */
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Shipping Information</h2>
                  
                  <form onSubmit={handleShippingSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="md:col-span-2">
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={shippingInfo.fullName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={shippingInfo.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                          State / Province
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={shippingInfo.state}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP / Postal Code
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={shippingInfo.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={shippingInfo.country}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={shippingInfo.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-6 py-3 bg-purple-600 text-white rounded-md font-medium ${
                          isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-purple-700'
                        } transition-colors`}
                      >
                        {isLoading ? 'Processing...' : 'Continue to Payment'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Payment Section */
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment</h2>
                  
                  {clientSecret ? (
                    <PaymentForm orderId={orderId} total={cartTotal} shippingDetails={shippingInfo} />
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Initializing payment...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Right column - Order summary */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
                
                <div className="divide-y divide-gray-200">
                  <div className="pb-4">
                    <p className="text-gray-700 font-medium">Items ({cartItems.length})</p>
                    <ul className="mt-2 space-y-2">
                      {cartItems.map((item) => (
                        <li key={item.id} className="flex justify-between text-sm">
                          <div className="flex">
                            <span className="text-gray-600">{item.quantity} x</span>
                            <span className="ml-2 text-gray-800">{item.name}</span>
                          </div>
                          <span className="text-gray-800 font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="py-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-800 font-medium">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-gray-800 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-800 font-medium">$0.00</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-800">Total</span>
                      <span className="text-lg font-bold text-gray-800">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-purple-800 mb-2">Secure Checkout</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your payment information is processed securely. We do not store credit card details.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <svg viewBox="0 0 32 32" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32 5H0v20h32V5z" fill="#2D5DA5"/>
                      <path d="M5 15h3v-4H5v4z" fill="#fff"/>
                      <path d="M9 11h2l1-6-3 6zm16-6H11v10h14V5z" fill="#fff"/>
                    </svg>
                    <svg viewBox="0 0 32 32" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 5v20h32V5H0z" fill="#EA2035"/>
                      <path d="M2 15h6v-4H2v4z" fill="#fff"/>
                      <path d="M9 11h2l2-6-4 6zm20 4h-6v-4h6v4z" fill="#fff"/>
                    </svg>
                    <svg viewBox="0 0 38 24" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
                      <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#000" opacity="0.07"/>
                      <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#006FCF"/>
                      <path d="M8.971 10.268l.774-1.906h1.556l-.762 1.906h-1.568zm-1.383 0L8.53 5.304H6.813l-1.395 4.964h2.17zm20.787-5.985c.394 0 .735.066 1.147.231v1.307c-.389-.207-.691-.294-1.069-.294-.883 0-1.365.586-1.365 1.672 0 1.044.482 1.695 1.327 1.695.417 0 .762-.124 1.107-.307v1.307c-.425.184-.793.26-1.25.26-1.569 0-2.528-1.036-2.528-2.822-.001-1.898.948-3.049 2.631-3.049z" fill="#FFF"/>
                    </svg>
                    <svg viewBox="0 0 32 32" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32 5H0v22h32V5z" fill="#6B7580"/>
                      <path d="M15 17a4 4 0 100-8 4 4 0 000 8z" fill="#fff"/>
                      <path d="M20 14a4 4 0 100-8 4 4 0 000 8z" fill="#FB0"/>
                    </svg>
                  </div>
                  <div>
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;