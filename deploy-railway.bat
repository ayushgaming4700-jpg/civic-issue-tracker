@echo off
echo ========================================
echo Deploying to Railway...
echo ========================================

echo Adding all changes...
git add .

echo Committing changes...
git commit -m "Fix Railway deployment configuration"

echo Pushing to GitHub...
git push origin master

echo ========================================
echo Deployment triggered!
echo Check Railway dashboard for progress.
echo ========================================
pause
