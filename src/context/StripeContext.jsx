import { createContext, useContext, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Create context
const StripeContext = createContext();

// Get the Stripe publishable key from environment variables
// In Vite, we use import.meta.env instead of process.env
const stripePublishableKey = import.meta.env.STRIPE_PUBLISHABLE_KEY;
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
      
      // Improved error handling
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || 'Unknown error occurred';
        } catch {
          // If not JSON, use text response
          errorMessage = errorText || `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
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
    clientSecret
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