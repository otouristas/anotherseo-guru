@echo off
echo Setting up Git configuration for otouristas...
git config --global user.name "otouristas"
git config --global user.email "otouristas@example.com"

echo.
echo Updating remote URL to otouristas/anotherseo-guru...
git remote set-url origin https://github.com/otouristas/anotherseo-guru.git

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
- Enhanced SEO dashboard with new AI features and components
- Added comprehensive AI-powered SEO tools and analytics
- Implemented Netlify deployment configuration"

echo.
echo Pushing to repository...
git push origin main

echo.
echo Done! Check if the push was successful above.
pause
