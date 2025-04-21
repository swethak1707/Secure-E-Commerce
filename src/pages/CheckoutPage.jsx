import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStripe } from '../context/StripeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PaymentForm from '../components/PaymentForm';

const CheckoutPage = () => {
  const { currentUser } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { createPaymentIntent, resetPayment, clientSecret, succeeded } = useStripe();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phoneNumber: ''
  });
  
  const [formStep, setFormStep] = useState(1);
  
  // Initialize form with user data if available
  useEffect(() => {
    if (currentUser) {
      setFormData(prevData => ({
        ...prevData,
        fullName: currentUser.displayName || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);
  
  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Submit shipping details and move to payment step
  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate form data
      const requiredFields = ['fullName', 'email', 'address', 'city', 'state', 'zipCode', 'country'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error('Please fill in all required fields');
      }
      
      // Calculate total with tax
      const totalWithTax = cartTotal + (cartTotal * 0.1);
      
      // Create order document in Firestore
      const orderData = {
        userId: currentUser?.uid,
        userEmail: formData.email,
        items: cartItems,
        total: totalWithTax,
        shipping: formData,
        status: 'pending',
        createdAt: serverTimestamp()
      };
      
      // Create new order document
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderId(orderRef.id);
      
      // Create payment intent with Stripe
      const paymentIntentResponse = await createPaymentIntent(
        totalWithTax, // Total with tax
        { 
          orderId: orderRef.id,
          userId: currentUser?.uid || 'guest'
        }
      );
      
      // Check if we have a valid response with clientSecret before proceeding
      if (paymentIntentResponse && paymentIntentResponse.clientSecret) {
        // Move to payment step
        setFormStep(2);
      } else {
        throw new Error('Failed to create payment intent. Please try again.');
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      setError(err.message || 'An error occurred during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate total with tax
  const totalWithTax = cartTotal + (cartTotal * 0.1);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <a href="/" className="text-gray-500 hover:text-purple-600">Home</a>
              </li>
              <li>
                <span className="text-gray-400 mx-2">/</span>
              </li>
              <li>
                <a href="/cart" className="text-gray-500 hover:text-purple-600">Cart</a>
              </li>
              <li>
                <span className="text-gray-400 mx-2">/</span>
              </li>
              <li>
                <span className="text-purple-600 font-medium">Checkout</span>
              </li>
            </ol>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          {/* Checkout Steps */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${formStep === 1 ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'} mr-2`}>
                1
              </div>
              <div className="h-1 w-16 bg-gray-200 mr-2"></div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${formStep === 2 ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'}`}>
                2
              </div>
              <div className="ml-4">
                <span className="text-sm font-medium text-gray-700">
                  {formStep === 1 ? 'Shipping Information' : 'Payment Details'}
                </span>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {/* Step 1: Shipping Information Form */}
          {formStep === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Shipping Information</h2>
              
              <form onSubmit={handleShippingSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name*
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address*
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City*
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province*
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP/Postal Code*
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country*
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="USA">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="India">India</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Japan">Japan</option>
                      <option value="China">China</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-8">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`py-3 px-8 rounded-md font-medium text-white ${
                      loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                    } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                  >
                    {loading ? 'Processing...' : 'Continue to Payment'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Step 2: Payment Form */}
          {formStep === 2 && clientSecret && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Information</h2>
              
              <PaymentForm orderId={orderId} total={totalWithTax} />
              
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => {
                    resetPayment();
                    setFormStep(1);
                  }}
                  className="text-purple-600 hover:text-purple-800"
                >
                  Back to Shipping
                </button>
              </div>
            </div>
          )}
          
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
            
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item.id} className="py-4 flex">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.imageUrl || 'https://picsum.photos/200/200'}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.name}</h3>
                        <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Qty {item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Subtotal</p>
                <p className="text-gray-900 font-medium">${cartTotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Tax (10%)</p>
                <p className="text-gray-900 font-medium">${(cartTotal * 0.1).toFixed(2)}</p>
              </div>
              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Shipping</p>
                <p className="text-gray-900 font-medium">Free</p>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-200 mt-4">
                <p className="text-lg font-bold text-gray-900">Total</p>
                <p className="text-lg font-bold text-gray-900">${totalWithTax.toFixed(2)}</p>
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