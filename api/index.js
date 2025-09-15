// Vercel API route - Full application
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Civic Issue Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from client build (if it exists)
app.use(express.static(path.join(__dirname, '../client/build')));

// Root endpoint - serve the React app
app.get('/', (req, res) => {
  // Try to serve the React app, fallback to API info
  const indexPath = path.join(__dirname, '../client/build/index.html');
  try {
    res.sendFile(indexPath);
  } catch (error) {
    res.json({ 
      message: 'Civic Issue Tracker Backend',
      status: 'running',
      note: 'Frontend not built yet. Build the client and redeploy.',
      endpoints: [
        '/api/health',
        '/api/test'
      ]
    });
  }
});

// Catch all handler - serve React app for client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../client/build/index.html');
  try {
    res.sendFile(indexPath);
  } catch (error) {
    res.status(404).json({ 
      message: 'Route not found',
      path: req.originalUrl
    });
  }
});

module.exports = app;
