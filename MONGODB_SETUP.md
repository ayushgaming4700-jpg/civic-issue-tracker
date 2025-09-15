# MongoDB Setup Guide

## Quick Setup for Windows

### Option 1: MongoDB Community Server (Recommended)

1. **Download MongoDB Community Server**:
   - Go to https://www.mongodb.com/try/download/community
   - Select "Windows" and download the MSI installer

2. **Install MongoDB**:
   - Run the downloaded MSI file
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service (recommended)
   - Install MongoDB Compass (optional GUI tool)

3. **Start MongoDB Service**:
   - MongoDB should start automatically as a Windows service
   - You can also start it manually from Services (services.msc)

### Option 2: MongoDB Atlas (Cloud Database)

1. **Create Free Account**:
   - Go to https://www.mongodb.com/atlas
   - Sign up for a free account

2. **Create Cluster**:
   - Create a new cluster (free tier available)
   - Choose a region close to you
   - Wait for cluster to be created

3. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

4. **Update Environment**:
   - Replace the MONGODB_URI in your .env file with the Atlas connection string

### Option 3: Docker (If you have Docker installed)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Verify Installation

After installation, you can verify MongoDB is running:

1. **Check if MongoDB is running**:
   ```bash
   # In Command Prompt or PowerShell
   mongo --version
   ```

2. **Connect to MongoDB**:
   ```bash
   mongo
   ```

3. **Test the application**:
   - The application will automatically connect to MongoDB when it starts
   - Check the console for "Connected to MongoDB" message

## Troubleshooting

### MongoDB Not Starting
- Check if the MongoDB service is running in Windows Services
- Try starting it manually: `net start MongoDB`

### Connection Refused
- Make sure MongoDB is running on port 27017
- Check if Windows Firewall is blocking the connection
- Verify the connection string in your .env file

### Permission Issues
- Run Command Prompt as Administrator
- Make sure MongoDB has proper permissions

## Default Connection
The application uses `mongodb://localhost:27017/civic-issues` by default.

If you're using MongoDB Atlas, update the MONGODB_URI in your .env file:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civic-issues
```












