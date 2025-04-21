// codespaces-api.js
import http from 'http';
import Stripe from 'stripe';
import { readFileSync } from 'fs';
import { parse } from 'url';

// Load environment variables from .env.local
const envFile = readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

// Initialize Stripe
const stripe = new Stripe(envVars.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

// Create a simple HTTP server
const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // Parse URL
  const parsedUrl = parse(req.url);
  
  // Only handle our specific API endpoint
  if (parsedUrl.pathname === '/api/create-payment-intent' && req.method === 'POST') {
    // Read request body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        // Parse JSON body
        const { amount, currency = 'usd', metadata = {} } = JSON.parse(body);
        
        console.log(`Creating payment intent for amount: $${amount}`);
        
        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency,
          metadata,
          payment_method_types: ['card'],
        });
        
        // Send response
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        }));
      } catch (error) {
        console.error('Error creating payment intent:', error);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 500;
        res.end(JSON.stringify({ 
          error: error.message || 'Payment service error'
        }));
      }
    });
  } else {
    // Handle 404 for other routes
    res.statusCode = 404;
    res.end('Not Found');
  }
});

// Start the server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});