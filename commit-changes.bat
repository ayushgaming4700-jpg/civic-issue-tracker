@echo off
echo Adding all changes to Git...
git add .

echo Committing changes...
git commit -m "Add Railway configuration and production setup"

echo Pushing to GitHub...
git push origin master

echo Done! Check Railway dashboard for deployment.
pause

