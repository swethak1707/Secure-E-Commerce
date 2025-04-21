import { useState, useEffect } from 'react';
import { 
  PaymentElement, 
  useStripe as useStripeJs, 
  useElements 
} from '@stripe/react-stripe-js';
import { useStripe } from '../context/StripeContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';

const PaymentForm = ({ orderId, total, shippingDetails }) => {
  const stripe = useStripeJs();
  const elements = useElements();
  const { handlePaymentSuccess, error: stripeContextError, processing } = useStripe();
  
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (stripeContextError) {
      setError(stripeContextError);
    }
  }, [stripeContextError]);

  // Log when the component renders to help debug
  useEffect(() => {
    console.log("PaymentForm rendered with stripe:", !!stripe, "elements:", !!elements);
  }, [stripe, elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      console.error("Stripe or Elements not loaded yet");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm the payment
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?order_id=${orderId}`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        console.error('Payment confirmation error:', submitError);
        setError(submitError.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded without redirect - update order in Firestore
        try {
          // Get the current order data
          const orderRef = doc(db, 'orders', orderId);
          const orderSnap = await getDoc(orderRef);
          let orderData = {};
          
          if (orderSnap.exists()) {
            orderData = orderSnap.data();
          } else {
            throw new Error("Order not found");
          }
          
          // Update order with payment information
          const paymentData = {
            status: 'paid',
            paymentIntentId: paymentIntent.id,
            paymentMethod: paymentIntent.payment_method,
            paymentAmount: paymentIntent.amount / 100, // Convert from cents
            paymentCurrency: paymentIntent.currency,
            paidAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          await updateDoc(orderRef, paymentData);
          console.log("Order updated with payment information");
          
          // Create a receipt record
          const receiptData = {
            orderId: orderId,
            userId: orderData.userId,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            items: orderData.items,
            shipping: orderData.shipping,
            paymentIntentId: paymentIntent.id,
            createdAt: serverTimestamp()
          };
          
          const receiptRef = await addDoc(collection(db, 'receipts'), receiptData);
          console.log("Receipt created with ID:", receiptRef.id);
          
          // Combine order and receipt data for the success page
          const fullOrderData = {
            id: orderSnap.id,
            ...orderData,
            ...paymentData,
            receiptId: receiptRef.id
          };
          
          // Handle successful payment
          handlePaymentSuccess(fullOrderData);
          
          // Navigate to success page with receipt ID
          navigate(`/payment-success?order_id=${orderId}&payment_intent=${paymentIntent.id}&receipt_id=${receiptRef.id}`);
        } catch (dbError) {
          console.error('Error updating order status:', dbError);
          // Continue anyway as payment was successful
          handlePaymentSuccess();
          navigate(`/payment-success?order_id=${orderId}&payment_intent=${paymentIntent.id}`);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred during payment processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment element change
  const handlePaymentElementChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Card Details</h3>
        <PaymentElement onChange={handlePaymentElementChange} />
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <p className="text-gray-700 mb-2">Total Payment:</p>
        <p className="text-2xl font-bold text-gray-900">${total?.toFixed(2)}</p>
        <p className="text-sm text-gray-500 mt-1">Your card will be charged this amount</p>
      </div>
      
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
        <p className="text-sm font-medium">Test Card: 4242 4242 4242 4242</p>
        <p className="text-sm">Use any future date, any 3-digit CVC, and any postal code.</p>
      </div>
      
      <button
        type="submit"
        disabled={isProcessing || processing || !stripe || !elements || !cardComplete}
        className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium ${
          isProcessing || processing || !cardComplete
            ? 'bg-purple-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700'
        } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
      >
        {isProcessing || processing ? 'Processing...' : 'Pay Now'}
      </button>
      
      <p className="mt-4 text-center text-sm text-gray-500">
        Your payment is secured with Stripe. We do not store your card details.
      </p>
    </form>
  );
};

export default PaymentForm;