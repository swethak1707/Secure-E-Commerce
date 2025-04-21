const createPaymentIntent = async (amount, metadata = {}) => {
  setProcessing(true);
  setError(null);
  
  try {
    console.log(`Creating payment intent for amount: $${amount}`);
    
    // Use a relative URL that works in any environment
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
    
    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Payment service error: ${response.status} ${errorText}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    console.log('Payment intent created successfully');
    
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