// api/create-payment-intent.js
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Stripe with the secret key
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Get data from the request body
    const { amount, currency = 'usd', metadata = {} } = req.body;
    
    // Validate the amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents for Stripe
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    // Return the client secret so the frontend can use it
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Send a more detailed error message
    res.status(500).json({ 
      error: error.message || 'Payment service error', 
      code: error.code,
      type: error.type
    });
  }
}