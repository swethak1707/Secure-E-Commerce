// src/pages/OrderHistory.jsx
import React, { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderHistory = () => {
  const { transactionHistory, loading, getTransactionHistory } = useCart();

  useEffect(() => {
    getTransactionHistory();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Your Orders
      </h1>

      {transactionHistory.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-xl font-medium text-gray-900 dark:text-white">
            No orders yet
          </h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Once you make a purchase, your order history will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {transactionHistory.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg"
            >
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Order #{order.id.substring(0, 8)}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                    Placed on {formatDate(order.createdAt.toDate())}
                  </p>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-green-500">
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Amount
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {order.purchase_units[0].amount.currency_code} {order.purchase_units[0].amount.value}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Payment Method
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {order.payment_source || 'PayPal'}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {order.purchase_units[0].description || 'Not available'}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {order.payer?.name
                        ? `${order.payer.name.given_name} ${order.payer.name.surname}`
                        : 'Not available'}
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {order.payer?.email_address || 'Not available'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;