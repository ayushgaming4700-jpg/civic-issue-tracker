// Vercel API route - Full application with simple frontend
const express = require('express');
const cors = require('cors');

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

// Simple HTML frontend
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Civic Issue Tracker - LIVE!</title>
        <style>
            body { font-family: Arial; margin: 40px; background: #f0f8ff; }
            .container { max-width: 800px; margin: 0 auto; }
            h1 { color: #2c3e50; text-align: center; }
            .success { background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
            a { color: #007bff; text-decoration: none; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏛️ Civic Issue Tracker</h1>
            
            <div class="success">
                <h2>✅ SUCCESS! Your Application is LIVE!</h2>
                <p><strong>URL:</strong> https://civic-issue-tracker-l86w.vercel.app/</p>
                <p><strong>Status:</strong> Backend running successfully</p>
                <p><strong>Database:</strong> MongoDB Atlas connected</p>
            </div>
            
            <div class="info">
                <h3>🔗 Test Your API:</h3>
                <ul>
                    <li><a href="/api/health">Health Check</a></li>
                    <li><a href="/api/test">Test Endpoint</a></li>
                </ul>
            </div>
            
            <div class="info">
                <h3>🎉 Congratulations!</h3>
                <p>You have successfully deployed a working web application!</p>
                <p>Share this URL with others: <strong>https://civic-issue-tracker-l86w.vercel.app/</strong></p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    availableRoutes: ['/', '/api/health', '/api/test']
  });
});

module.exports = app;
