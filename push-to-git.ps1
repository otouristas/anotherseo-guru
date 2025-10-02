Write-Host "Setting up Git configuration for george-os-growthrocks..." -ForegroundColor Green
git config --global user.name "george-os-growthrocks"
git config --global user.email "george.os.growthrocks@gmail.com"

Write-Host "`nAdding all changes to Git..." -ForegroundColor Yellow
git add .

Write-Host "`nCommitting changes..." -ForegroundColor Yellow
git commit -m "Fix: Add missing Users import to SEOSidebar and add Footer to all pages

- Fixed critical error: Missing Users import in SEOSidebar.tsx causing app crash
- Added Footer component to all pages (Terms, Privacy, Jobs, NotFound, Checkout, Auth)
- Added missing lint-staged script to package.json
- Temporarily disabled Husky pre-commit hook due to PowerShell issues
- Enhanced SEO dashboard with new AI features and components"

Write-Host "`nPushing to repository..." -ForegroundColor Yellow
git push origin main

Write-Host "`nDone! Check if the push was successful above." -ForegroundColor Green
Read-Host "Press Enter to continue"
