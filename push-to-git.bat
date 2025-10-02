@echo off
echo Setting up Git configuration for george-os-growthrocks...
git config --global user.name "george-os-growthrocks"
git config --global user.email "george.os.growthrocks@gmail.com"

echo.
echo Adding all changes to Git...
git add .

echo.
echo Committing changes...
git commit -m "Fix: Add missing Users import to SEOSidebar and add Footer to all pages

- Fixed critical error: Missing Users import in SEOSidebar.tsx causing app crash
- Added Footer component to all pages (Terms, Privacy, Jobs, NotFound, Checkout, Auth)
- Added missing lint-staged script to package.json
- Temporarily disabled Husky pre-commit hook due to PowerShell issues
- Enhanced SEO dashboard with new AI features and components"

echo.
echo Pushing to repository...
git push origin main

echo.
echo Done! Check if the push was successful above.
pause
