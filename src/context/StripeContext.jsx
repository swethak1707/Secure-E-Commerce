import { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Create context
const StripeContext = createContext();

// Get the Stripe publishable key from environment variables
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  console.error('Missing Stripe publishable key. Please check your environment variables.');
}

// Initialize Stripe
const stripePromise = loadStripe(stripePublishableKey);

export const StripeProvider = ({ children }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Reset payment state
  const resetPayment = () => {
    setClientSecret('');
    setPaymentIntentId('');
    setProcessing(false);
    setError(null);
    setSucceeded(false);
    setOrderDetails(null);
  };

  // Create a payment intent with the API
  const createPaymentIntent = async (amount, metadata = {}) => {
    setProcessing(true);
    setError(null);
    
    try {
      console.log(`Creating payment intent for amount: $${amount}`);
      
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount, 
          currency: 'usd',
          metadata,
          payment_method_types: ['card'] // Explicitly specify card only
        }),
      });
      
      // Handle response errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Payment service error: ${response.status} ${errorText}`);
      }
      
      // Parse JSON response
      const data = await response.json();
      console.log('Payment intent created successfully', data);
      
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setError(error.message || 'An error occurred while creating your payment.');
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = (orderData = null) => {
    setSucceeded(true);
    setProcessing(false);
    if (orderData) {
      setOrderDetails(orderData);
    }
  };

  // Set up Stripe elements options
  const options = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#7e22ce',
        colorBackground: '#ffffff',
        colorText: '#30313d',
      },
    },
  } : null;

  // Value to be provided by the context
  const value = {
    createPaymentIntent,
    resetPayment,
    handlePaymentSuccess,
    processing,
    error,
    succeeded,
    paymentIntentId,
    clientSecret,
    orderDetails,
    setOrderDetails
  };

  return (
    <StripeContext.Provider value={value}>
      {clientSecret ? (
        <Elements stripe={stripePromise} options={options}>
          {children}
        </Elements>
      ) : (
        children
      )}
    </StripeContext.Provider>
  );
};

// Custom hook to use the context
export const useStripe = () => {
  return useContext(StripeContext);
};

export default StripeContext;