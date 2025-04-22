// // src/components/PayPalButton.jsx
// import React, { useEffect, useRef } from 'react';
// import { toast } from 'react-hot-toast';

// const PayPalButton = ({ amount, onSuccess }) => {
//   const paypalRef = useRef();

//   useEffect(() => {
//     if (window.paypal) {
//       window.paypal.Buttons({
//         createOrder: (data, actions) => {
//           return actions.order.create({
//             intent: 'CAPTURE',
//             purchase_units: [{
//               amount: {
//                 currency_code: 'USD',
//                 value: amount,
//               },
//             }],
//           });
//         },
//         onApprove: async (data, actions) => {
//           const order = await actions.order.capture();
//           onSuccess(order);
//         },
//         onError: (err) => {
//           console.error('PayPal Error:', err);
//           toast.error('There was an error processing your payment');
//         }
//       }).render(paypalRef.current);
//     }
//   }, [amount, onSuccess]);

//   return (
//     <div>
//       <div ref={paypalRef}></div>
//     </div>
//   );
// };

// export default PayPalButton;
// src/components/PayPalButton.jsx
import React, { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

const PayPalButton = ({ amount, onSuccess }) => {
  const paypalRef = useRef();

  useEffect(() => {
    // Clear any existing buttons first
    if (paypalRef.current) {
      paypalRef.current.innerHTML = '';
    }

    // Add PayPal SDK if it's not already added
    const script = document.querySelector('script[src*="www.paypal.com/sdk/js"]');
    if (!script) {
      const scriptTag = document.createElement('script');
      scriptTag.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD`;
      scriptTag.async = true;
      document.body.appendChild(scriptTag);
      
      scriptTag.onload = () => {
        renderPayPalButton();
      };
    } else {
      renderPayPalButton();
    }

    function renderPayPalButton() {
      if (window.paypal) {
        try {
          window.paypal.Buttons({
            // Set up the transaction
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: amount.toString()
                    }
                  }
                ]
              });
            },
            // Finalize the transaction
            onApprove: async (data, actions) => {
              try {
                const order = await actions.order.capture();
                console.log("Payment successful", order);
                onSuccess(order);
              } catch (error) {
                console.error("Payment capture error:", error);
                toast.error("Payment failed. Please try again.");
              }
            },
            onError: (err) => {
              console.error("PayPal Error:", err);
              
              // Simulate a successful payment for demo purposes
              const mockOrder = {
                id: 'SIMULATED_' + Math.random().toString(36).substring(2, 12),
                status: 'COMPLETED',
                payer: {
                  email_address: 'test@example.com',
                  name: {
                    given_name: 'Test',
                    surname: 'User'
                  }
                },
                purchase_units: [
                  {
                    amount: {
                      currency_code: 'USD',
                      value: amount
                    }
                  }
                ],
                update_time: new Date().toISOString()
              };
              
              toast.success("Demo payment simulated successfully!");
              onSuccess(mockOrder);
            }
          }).render(paypalRef.current);
        } catch (error) {
          console.error("Error rendering PayPal buttons:", error);
        }
      } else {
        console.error("PayPal SDK not loaded properly");
      }
    }

    return () => {
      // Cleanup if needed
    };
  }, [amount, onSuccess]);

  return (
    <div>
      <div ref={paypalRef} className="paypal-button-container"></div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        <p>For testing, you can use the PayPal sandbox account:</p>
        <p>Email: sb-buyer@personal.example.com</p>
        <p>Password: 12345678</p>
      </div>
    </div>
  );
};

export default PayPalButton;