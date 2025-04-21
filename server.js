const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'dist' directory
app.use(express.static('dist'));

// Add middleware to handle API requests
app.use('/api/create-payment-intent', async (req, res) => {
  try {
    // Import the API handler
    const handler = require('./api/create-payment-intent.js').default;
    
    // Call the handler with the request and response
    await handler(req, res);
  } catch (error) {
    console.error('API handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// For any other requests, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: './dist' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});