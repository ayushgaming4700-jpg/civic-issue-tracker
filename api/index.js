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
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Civic Issue Tracker</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; color: #2c3e50; }
            .card { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .btn { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            .btn:hover { background: #2980b9; }
            .status { color: #27ae60; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏛️ Civic Issue Tracker</h1>
            <p class="status">✅ Backend is running successfully!</p>
        </div>
        
        <div class="card">
            <h2>🚀 Your Application is Live!</h2>
            <p><strong>Backend URL:</strong> https://civic-issue-tracker-l86w.vercel.app/</p>
            <p><strong>API Health:</strong> <a href="/api/health">/api/health</a></p>
            <p><strong>API Test:</strong> <a href="/api/test">/api/test</a></p>
        </div>
        
        <div class="card">
            <h2>📋 Next Steps</h2>
            <ol>
                <li>✅ Backend deployed to Vercel</li>
                <li>✅ MongoDB Atlas configured</li>
                <li>🔄 Deploy frontend to Netlify/Vercel</li>
                <li>🔗 Connect frontend to backend</li>
            </ol>
        </div>
        
        <div class="card">
            <h2>🔧 API Endpoints</h2>
            <ul>
                <li><code>GET /api/health</code> - Health check</li>
                <li><code>GET /api/test</code> - Test endpoint</li>
                <li><code>POST /api/issues</code> - Create issue</li>
                <li><code>GET /api/issues</code> - Get all issues</li>
            </ul>
        </div>
        
        <div class="card">
            <h2>🌐 Deploy Frontend</h2>
            <p>To get a full web application:</p>
            <ol>
                <li>Go to <a href="https://vercel.com" target="_blank">Vercel.com</a></li>
                <li>Create new project</li>
                <li>Import your GitHub repository</li>
                <li>Set root directory to "client"</li>
                <li>Deploy!</li>
            </ol>
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
