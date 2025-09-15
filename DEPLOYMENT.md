# 🚀 Deployment Guide - Civic Issue Tracker

## Overview
This guide will help you deploy your Civic Issue Tracker to the internet for free using:
- **Frontend**: Vercel (React app)
- **Backend**: Railway (Node.js API)
- **Database**: MongoDB Atlas (Cloud database)

## Prerequisites
- GitHub account
- Vercel account
- Railway account
- MongoDB Atlas account

## Step 1: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/atlas
2. Click "Try Free" and create an account
3. Create a new cluster:
   - Choose "Shared" (free tier)
   - Select a region close to you
   - Name your cluster (e.g., "civic-issues")
4. Create database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
5. Whitelist IP addresses:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
6. Get connection string:
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## Step 2: Prepare Your Code

1. Initialize Git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create GitHub repository:
   - Go to GitHub.com
   - Click "New repository"
   - Name it "civic-issue-tracker"
   - Make it public
   - Don't initialize with README

3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/civic-issue-tracker.git
   git branch -M main
   git push -u origin main
   ```

## Step 3: Deploy Backend to Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Select your repository
6. Railway will auto-detect it's a Node.js app
7. Add environment variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a strong random string
   - `CLIENT_URL` = will be updated after frontend deployment
8. Railway will automatically deploy your backend
9. Copy the generated URL (e.g., https://your-app.railway.app)

## Step 4: Deploy Frontend to Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - Framework Preset: Create React App
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`
6. Add environment variables:
   - `REACT_APP_API_URL` = your Railway backend URL
7. Click "Deploy"
8. Vercel will build and deploy your frontend
9. Copy the generated URL (e.g., https://your-app.vercel.app)

## Step 5: Update Configuration

1. Update Railway environment variables:
   - `CLIENT_URL` = your Vercel frontend URL
2. Update Vercel environment variables:
   - `REACT_APP_API_URL` = your Railway backend URL
3. Redeploy both services

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Test user registration
3. Test issue creation
4. Verify all features work

## Troubleshooting

### Common Issues:
1. **CORS errors**: Make sure CLIENT_URL in Railway matches your Vercel URL
2. **Database connection**: Verify MongoDB Atlas connection string
3. **Build failures**: Check build logs in Vercel/Railway

### Environment Variables Checklist:
- [ ] NODE_ENV=production
- [ ] MONGODB_URI (MongoDB Atlas connection string)
- [ ] JWT_SECRET (strong random string)
- [ ] CLIENT_URL (Vercel frontend URL)
- [ ] REACT_APP_API_URL (Railway backend URL)

## Cost
- **MongoDB Atlas**: Free (512MB storage)
- **Vercel**: Free (unlimited personal projects)
- **Railway**: Free ($5 credit monthly)

## Support
If you encounter issues, check the logs in:
- Railway dashboard for backend errors
- Vercel dashboard for frontend errors
- MongoDB Atlas for database issues

Your app will be live at: `https://your-app-name.vercel.app`

