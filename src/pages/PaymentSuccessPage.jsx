import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { generateReceipt } from '../components/ReceiptGenerator';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { clearCart } = useCart();
  
  const [order, setOrder] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('order_id');
    const paymentIntentId = searchParams.get('payment_intent');
    const receiptId = searchParams.get('receipt_id');
    
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('Order information not found.');
        setLoading(false);
        return;
      }
      
      try {
        // Get order details from Firestore
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        
        if (!orderDoc.exists()) {
          setError('Order not found.');
          setLoading(false);
          return;
        }
        
        const orderData = {
          id: orderDoc.id,
          ...orderDoc.data()
        };
        
        // If payment was successful and order status is still pending, update it
        if (paymentIntentId && orderData.status === 'pending') {
          await updateDoc(doc(db, 'orders', orderId), {
            status: 'paid',
            paymentIntentId,
            updatedAt: new Date()
          });
          
          // Update the order data after the status change
          orderData.status = 'paid';
          orderData.paymentIntentId = paymentIntentId;
        }
        
        setOrder(orderData);
        
        // Get receipt if available
        if (receiptId) {
          const receiptDoc = await getDoc(doc(db, 'receipts', receiptId));
          if (receiptDoc.exists()) {
            setReceipt({
              id: receiptDoc.id,
              ...receiptDoc.data()
            });
          }
        } else {
          // Try to find receipt by order ID
          const receiptsRef = collection(db, 'receipts');
          const q = query(receiptsRef, where('orderId', '==', orderId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const receiptData = querySnapshot.docs[0].data();
            setReceipt({
              id: querySnapshot.docs[0].id,
              ...receiptData
            });
          }
        }
        
        // Clear the cart since payment is successful
        clearCart();
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to fetch order details. Please contact customer support.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [location.search, clearCart]);
  
  // Handle receipt download
  const handleDownloadReceipt = () => {
    if (order) {
      generateReceipt(order);
    }
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date 
      ? timestamp 
      : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Processing your order...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="max-w-md w-full text-center">
            <div className="bg-red-100 p-6 rounded-lg mb-6">
              <svg className="h-16 w-16 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                to="/"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="max-w-md w-full text-center">
            <div className="bg-yellow-100 p-6 rounded-lg mb-6">
              <svg className="h-16 w-16 text-yellow-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
              <p className="text-gray-600 mb-6">We couldn't find the order information.</p>
              <Link
                to="/"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
              >
                Return to Home
              </Link>
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
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-green-100 p-4 rounded-full mb-6">
              <svg className="h-16 w-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-lg text-gray-600">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex flex-wrap justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Order #{order.id}</h2>
                  <p className="text-sm text-gray-500">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Payment Completed
                  </span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4">
              {/* Order Items */}
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">Order Items</h3>
              <ul className="divide-y divide-gray-200 mb-6">
                {order.items.map((item) => (
                  <li key={item.id} className="py-4 flex">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.imageUrl || 'https://placehold.co/100'}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h4>
                            <Link to={`/product/${item.id}`} className="hover:text-purple-600">
                              {item.name}
                            </Link>
                          </h4>
                          <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm">
                        <p className="text-gray-500">Qty {item.quantity}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              {/* Shipping Address */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Shipping Address</h3>
                <address className="not-italic text-gray-700">
                  <p>{order.shipping.fullName}</p>
                  <p>{order.shipping.address}</p>
                  <p>{order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}</p>
                  <p>{order.shipping.country}</p>
                  {order.shipping.phoneNumber && <p>Phone: {order.shipping.phoneNumber}</p>}
                </address>
              </div>
              
              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Order Summary</h3>
                <div className="flex justify-between mb-2">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="text-gray-900">${(order.total / 1.1).toFixed(2)}</p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="text-gray-600">Tax (10%)</p>
                  <p className="text-gray-900">${(order.total - (order.total / 1.1)).toFixed(2)}</p>
                </div>
                <div className="flex justify-between mb-6">
                  <p className="text-gray-600">Shipping</p>
                  <p className="text-gray-900">Free</p>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <p className="text-lg font-bold text-gray-900">Total</p>
                  <p className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Receipt Download Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleDownloadReceipt}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link
              to="/"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors text-center"
            >
              Continue Shopping
            </Link>
            
            <Link
              to="/orders"
              className="inline-block bg-white border border-purple-600 text-purple-600 px-6 py-3 rounded-md hover:bg-purple-50 transition-colors text-center"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;