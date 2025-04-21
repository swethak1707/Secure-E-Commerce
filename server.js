// server.js - Updated with ES module syntax
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 3000;

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the 'dist' directory
app.use(express.static('dist'));

// Middleware to parse JSON
app.use(express.json());

// Add middleware to handle API requests
app.use('/api/create-payment-intent', async (req, res) => {
  try {
    // Dynamically import the API handler
    const apiModule = await import('./api/create-payment-intent.js');
    const handler = apiModule.default;
    
    // Call the handler with the request and response
    await handler(req, res);
  } catch (error) {
    console.error('API handler error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// For any other requests, serve the index.html file
app.get('*', (req, res) => {
  const indexPath = join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not found - index.html does not exist');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});