// src/context/StripeContext.jsx
import { createContext, useContext, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Create context
const StripeContext = createContext();

// Get the Stripe publishable key from environment variables
const stripePromise = loadStripe("pk_test_51RDwLDC6kaN0ZQg6iWWQPinikk7fgBMj28EWSQEHjpm1B9BsRfklIEZ7dcD4UluCnmq0ZF2ycxtotvx5T9GLQsyw001GQxMSQl");

export const StripeProvider = ({ children }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);

  // Reset payment state
  const resetPayment = () => {
    setClientSecret('');
    setPaymentIntentId('');
    setProcessing(false);
    setError(null);
    setSucceeded(false);
  };

  // Create a payment intent with the API
  const createPaymentIntent = async (amount, metadata = {}) => {
    setProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount, 
          currency: 'usd',
          metadata 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setError(error.message);
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = () => {
    setSucceeded(true);
    setProcessing(false);
  };

  // Set up Stripe elements options
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#7e22ce',
        colorBackground: '#ffffff',
        colorText: '#30313d',
      },
    },
  };

  // Value to be provided by the context
  const value = {
    createPaymentIntent,
    resetPayment,
    handlePaymentSuccess,
    processing,
    error,
    succeeded,
    paymentIntentId,
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