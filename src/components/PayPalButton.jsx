// src/components/PayPalButton.jsx
import React, { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

const PayPalButton = ({ amount, onSuccess }) => {
  const paypalRef = useRef();

  useEffect(() => {
    if (window.paypal) {
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{
              amount: {
                currency_code: 'USD',
                value: amount,
              },
            }],
          });
        },
        onApprove: async (data, actions) => {
          const order = await actions.order.capture();
          onSuccess(order);
        },
        onError: (err) => {
          console.error('PayPal Error:', err);
          toast.error('There was an error processing your payment');
        }
      }).render(paypalRef.current);
    }
  }, [amount, onSuccess]);

  return (
    <div>
      <div ref={paypalRef}></div>
    </div>
  );
};

export default PayPalButton;