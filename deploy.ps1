# Production Deployment Script for Windows
# This script deploys code to production while excluding image files

Write-Host "🚀 Starting production deployment..." -ForegroundColor Green

# Build the project
Write-Host "📦 Building project..." -ForegroundColor Yellow
& npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Deployment aborted." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully" -ForegroundColor Green

# Create deployment package excluding images
Write-Host "📁 Creating deployment package..." -ForegroundColor Yellow

# Remove existing deployment package if it exists
if (Test-Path "./deployment-package") {
    Remove-Item -Recurse -Force "./deployment-package"
}

# Create deployment package directory
New-Item -ItemType Directory -Path "./deployment-package" -Force | Out-Null

# Use robocopy to copy files excluding certain patterns
Write-Host "📂 Copying files (excluding images)..." -ForegroundColor Yellow

# Create exclusion file for robocopy
$excludeFile = "./exclude.txt"
@(
    "products"
    "categories" 
    ".git"
    "node_modules"
    "*.log"
    ".env"
    "deployment-package"
    "exclude.txt"
    # Sensitive SQL and setup files
    "*.sql"
    "*rls*.js"
    "*rls*.sql"
    "test-*.js"
    "diagnose*.js"
    "analyze*.js"
    "fix-*.js"
    "debug-*.html"
    "*-diagnostics.js"
    "security-*.js"
    "*-settings-manager.js"
    "add-webhook-secret.js"
    "*_SETUP.md"
    "GITHUB_API_SETUP.md"
    "STORAGE_BUCKET_SETUP.md"
    "RLS_*.md"
    "SCHEMA_*.sql"
    "scripts\*.sql"
    "scripts\*rls*.js"
    "scripts\test-*.js"
) | Out-File -FilePath $excludeFile -Encoding ASCII

# Use robocopy to copy files
& robocopy . "./deployment-package" /MIR /XD public\images\products public\images\categories .git node_modules deployment-package /XF *.log .env* exclude.txt /NP /NDL /NFL > $null

# Clean up exclusion file
Remove-Item $excludeFile -Force -ErrorAction SilentlyContinue

# Clean package.json for production
Write-Host "🧹 Cleaning package.json for production..." -ForegroundColor Yellow
& node clean-package.js

Write-Host "✅ Deployment package created in ./deployment-package/" -ForegroundColor Green
Write-Host "🎉 Ready to deploy to production!" -ForegroundColor Green

# Instructions
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the deployment-package/ folder" -ForegroundColor White
Write-Host "2. Upload deployment-package/ contents to your production server" -ForegroundColor White
Write-Host "3. Or use your preferred deployment method with the package" -ForegroundColor White

# Show excluded files count
$productImages = Get-ChildItem "public\images\products" -ErrorAction SilentlyContinue
$categoryImages = Get-ChildItem "public\images\categories" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "📊 Exclusion Summary:" -ForegroundColor Cyan
Write-Host "   Product images excluded: $($productImages.Count)" -ForegroundColor White
Write-Host "   Category images excluded: $($categoryImages.Count)" -ForegroundColor White

Write-Host ""
Write-Host "💡 Tip: You can also manually copy ./deployment-package/ contents to your server" -ForegroundColor Yellow
