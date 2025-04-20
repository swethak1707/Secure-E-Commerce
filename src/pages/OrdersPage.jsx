import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrdersPage = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample order data for demonstration
  const sampleOrders = [
    {
      id: 'ORD12345678',
      date: new Date('2023-04-01T10:30:00'),
      total: 149.98,
      status: 'delivered',
      estimatedDelivery: new Date('2023-04-05'),
      deliveredDate: new Date('2023-04-04'),
      dispatchedDate: new Date('2023-04-02'),
      trackingNumber: 'TRK987654321',
      items: [
        {
          id: 'PROD001',
          name: 'Premium Leather Wallet',
          price: 79.99,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1627123437186-8e4d52372fca?q=80&w=2574&auto=format&fit=crop'
        },
        {
          id: 'PROD002',
          name: 'Designer Sunglasses',
          price: 69.99,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=2670&auto=format&fit=crop'
        }
      ],
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      },
      paymentMethod: 'Credit Card (ending in 4242)'
    },
    {
      id: 'ORD87654321',
      date: new Date('2023-04-08T14:15:00'),
      total: 129.99,
      status: 'dispatched',
      estimatedDelivery: new Date('2023-04-14'),
      dispatchedDate: new Date('2023-04-10'),
      trackingNumber: 'TRK123456789',
      items: [
        {
          id: 'PROD003',
          name: 'Wireless Headphones',
          price: 129.99,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format&fit=crop'
        }
      ],
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      },
      paymentMethod: 'PayPal'
    },
    {
      id: 'ORD54321678',
      date: new Date('2023-04-12T09:45:00'),
      total: 249.97,
      status: 'initiated',
      estimatedDelivery: new Date('2023-04-18'),
      items: [
        {
          id: 'PROD004',
          name: 'Smart Watch',
          price: 199.99,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?q=80&w=2670&auto=format&fit=crop'
        },
        {
          id: 'PROD005',
          name: 'Wireless Charger',
          price: 49.98,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1625799762516-d819f36d4254?q=80&w=2670&auto=format&fit=crop'
        }
      ],
      shippingAddress: {
        name: 'John Doe',
        street: '123 Main Street',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      },
      paymentMethod: 'Credit Card (ending in 4242)'
    }
  ];

  useEffect(() => {
    // In a real implementation, we would fetch orders from Firestore
    // This is a placeholder to simulate loading from Firestore
    const fetchOrders = async () => {
      setLoading(true);
      
      try {
        if (currentUser) {
          // Simulating Firestore fetch by using the sample data
          // In a real implementation, you would use something like:
          /*
          const ordersRef = collection(db, 'orders');
          const q = query(
            ordersRef,
            where('userId', '==', currentUser.uid),
            orderBy('date', 'desc')
          );
          
          const querySnapshot = await getDocs(q);
          const ordersData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          */
          
          // Using sample data for demonstration
          setTimeout(() => {
            setOrders(sampleOrders);
            setLoading(false);
          }, 1000); // Simulate network delay
        } else {
          setOrders([]);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status text and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'initiated':
        return {
          label: 'Order Initiated',
          color: 'bg-blue-500',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-100',
          step: 1
        };
      case 'dispatched':
        return {
          label: 'Order Dispatched',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-100',
          step: 2
        };
      case 'delivered':
        return {
          label: 'Order Delivered',
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-100',
          step: 3
        };
      default:
        return {
          label: 'Processing',
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-100',
          step: 0
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white shadow rounded-lg p-6">
                  <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-6"></div>
                  <div className="flex space-x-4 mb-4">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                  <div className="h-24 bg-gray-300 rounded"></div>
                </div>
              ))}
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
                  <span className="ml-1 text-gray-600 md:ml-2 font-medium">My Orders</span>
                </div>
              </li>
            </ol>
          </nav>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="flex flex-col items-center">
                <svg className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h2 className="text-xl font-medium text-gray-900 mb-2">No orders found</h2>
                <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                <Link
                  to="/products"
                  className="bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                
                return (
                  <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
                    {/* Order Header */}
                    <div className="border-b border-gray-200 px-6 py-4">
                      <div className="flex flex-wrap justify-between items-center">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900">Order #{order.id}</h2>
                          <p className="text-sm text-gray-500">Placed on {formatDate(order.date)}</p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Progress */}
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="relative">
                        {/* Progress bar */}
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                          <div 
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${statusInfo.color}`}
                            style={{ width: `${(statusInfo.step / 3) * 100}%` }}
                          ></div>
                        </div>
                        
                        {/* Progress steps */}
                        <div className="flex justify-between">
                          <div className="text-center">
                            <div className={`w-6 h-6 mb-1 rounded-full ${statusInfo.step >= 1 ? 'bg-purple-600' : 'bg-gray-300'} mx-auto flex items-center justify-center`}>
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                {statusInfo.step >= 1 ? (
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                ) : (
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                )}
                              </svg>
                            </div>
                            <div className="text-xs font-medium text-gray-500">Ordered</div>
                            <div className="text-xs text-gray-400">{formatDate(order.date)}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className={`w-6 h-6 mb-1 rounded-full ${statusInfo.step >= 2 ? 'bg-purple-600' : 'bg-gray-300'} mx-auto flex items-center justify-center`}>
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                {statusInfo.step >= 2 ? (
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                ) : (
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                )}
                              </svg>
                            </div>
                            <div className="text-xs font-medium text-gray-500">Dispatched</div>
                            <div className="text-xs text-gray-400">{order.dispatchedDate ? formatDate(order.dispatchedDate) : '-'}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className={`w-6 h-6 mb-1 rounded-full ${statusInfo.step >= 3 ? 'bg-purple-600' : 'bg-gray-300'} mx-auto flex items-center justify-center`}>
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                {statusInfo.step >= 3 ? (
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                ) : (
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                )}
                              </svg>
                            </div>
                            <div className="text-xs font-medium text-gray-500">Delivered</div>
                            <div className="text-xs text-gray-400">{order.deliveredDate ? formatDate(order.deliveredDate) : (order.estimatedDelivery ? `Est. ${formatDate(order.estimatedDelivery)}` : '-')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Details */}
                    <div className="px-6 py-4">
                      {/* Order summary */}
                      <div className="flex flex-wrap justify-between mb-6">
                        <div className="w-full md:w-auto mb-4 md:mb-0">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">Shipping Address</h3>
                          <p className="text-sm text-gray-500">{order.shippingAddress.name}</p>
                          <p className="text-sm text-gray-500">{order.shippingAddress.street}</p>
                          <p className="text-sm text-gray-500">
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                          </p>
                          <p className="text-sm text-gray-500">{order.shippingAddress.country}</p>
                        </div>
                        
                        <div className="w-full md:w-auto mb-4 md:mb-0">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">Payment Method</h3>
                          <p className="text-sm text-gray-500">{order.paymentMethod}</p>
                        </div>
                        
                        <div className="w-full md:w-auto">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">Order Total</h3>
                          <p className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      {/* Order items */}
                      <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">Order Items</h3>
                      <ul className="divide-y divide-gray-200">
                        {order.items.map((item) => (
                          <li key={item.id} className="py-4 flex">
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <img
                                src={item.imageUrl}
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
                                
                                {/* View product button */}
                                <div className="flex">
                                  <Link
                                    to={`/product/${item.id}`}
                                    className="font-medium text-purple-600 hover:text-purple-800"
                                  >
                                    View Product
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      
                      {/* Tracking information for dispatched or delivered orders */}
                      {order.trackingNumber && (statusInfo.step >= 2) && (
                        <div className="mt-6 border-t border-gray-200 pt-4">
                          <h3 className="text-sm font-medium text-gray-900 mb-2">Tracking Information</h3>
                          <p className="text-sm text-gray-500">
                            Tracking Number: <span className="font-medium">{order.trackingNumber}</span>
                          </p>
                          {/* Typically this would link to a tracking page */}
                          <a 
                            href="#" 
                            className="mt-2 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800"
                            onClick={(e) => e.preventDefault()}
                          >
                            Track Package
                            <svg className="ml-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {/* Order Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex flex-wrap items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {statusInfo.step < 3 ? (
                            <p>Your order is on its way!</p>
                          ) : (
                            <p>Thank you for your order!</p>
                          )}
                        </div>
                        
                        <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
                          {/* Additional actions based on order status */}
                          {statusInfo.step === 3 && (
                            <button
                              className="bg-white border border-gray-300 rounded-md py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                              onClick={() => alert("This would open a review form")}
                            >
                              Leave Review
                            </button>
                          )}
                          
                          <button
                            className="bg-white border border-gray-300 rounded-md py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            onClick={() => alert("This would show order details in a modal or new page")}
                          >
                            View Details
                          </button>
                          
                          {statusInfo.step < 2 && (
                            <button
                              className="bg-red-50 border border-red-300 rounded-md py-2 px-4 text-sm font-medium text-red-700 hover:bg-red-100"
                              onClick={() => alert("This would open a cancellation confirmation dialog")}
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrdersPage;