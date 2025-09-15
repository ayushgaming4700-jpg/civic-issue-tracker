#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Civic Issue Tracker - Deployment Setup');
console.log('==========================================\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('❌ .env file not found!');
  console.log('Please create a .env file with your configuration.\n');
  process.exit(1);
}

// Check if git is initialized
if (!fs.existsSync('.git')) {
  console.log('📦 Initializing Git repository...');
  console.log('Run these commands:');
  console.log('  git init');
  console.log('  git add .');
  console.log('  git commit -m "Initial commit"');
  console.log('  git remote add origin https://github.com/YOUR_USERNAME/civic-issue-tracker.git');
  console.log('  git push -u origin main\n');
} else {
  console.log('✅ Git repository already initialized\n');
}

console.log('📋 Next Steps:');
console.log('1. Set up MongoDB Atlas:');
console.log('   - Go to https://www.mongodb.com/atlas');
console.log('   - Create free account and cluster');
console.log('   - Get connection string\n');

console.log('2. Create GitHub repository:');
console.log('   - Go to https://github.com');
console.log('   - Create new repository: civic-issue-tracker');
console.log('   - Push your code\n');

console.log('3. Deploy Backend to Railway:');
console.log('   - Go to https://railway.app');
console.log('   - Connect GitHub and deploy');
console.log('   - Add environment variables\n');

console.log('4. Deploy Frontend to Vercel:');
console.log('   - Go to https://vercel.com');
console.log('   - Connect GitHub and deploy');
console.log('   - Add environment variables\n');

console.log('📖 For detailed instructions, see DEPLOYMENT.md');
console.log('🎯 Your app will be live at: https://your-app-name.vercel.app');

