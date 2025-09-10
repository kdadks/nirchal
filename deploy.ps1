# Production Deployment Script for Windows
# This script deploys code to production while excluding image files

Write-Host "🚀 Starting production deployment..." -ForegroundColor Green

# Build the project
Write-Host "📦 Building project..." -ForegroundColor Yellow
npm run build

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

# Copy files excluding images and other unwanted files
$excludePatterns = @(
    "public\images\products\*",
    "public\images\categories\*", 
    "public\images\README.md",
    ".git\*",
    "node_modules\*",
    "*.log",
    ".env*",
    "deployment-package\*"
)

# Get all files and folders, excluding the patterns
Get-ChildItem -Path "." -Recurse | Where-Object {
    $item = $_
    $shouldExclude = $false
    
    foreach ($pattern in $excludePatterns) {
        if ($item.FullName -like "*$pattern*") {
            $shouldExclude = $true
            break
        }
    }
    
    return !$shouldExclude
} | ForEach-Object {
    $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
    $destinationPath = Join-Path "./deployment-package" $relativePath
    $destinationDir = Split-Path $destinationPath -Parent
    
    if (!(Test-Path $destinationDir)) {
        New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
    }
    
    if ($_.PSIsContainer -eq $false) {
        Copy-Item $_.FullName $destinationPath -Force
    }
}

Write-Host "✅ Deployment package created in ./deployment-package/" -ForegroundColor Green
Write-Host "🎉 Ready to deploy to production!" -ForegroundColor Green

# Instructions
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the deployment-package/ folder" -ForegroundColor White
Write-Host "2. Upload deployment-package/ contents to your production server" -ForegroundColor White
Write-Host "3. Or use your preferred deployment method with the package" -ForegroundColor White

# Show excluded files count
$productImages = Get-ChildItem "public\images\products" -ErrorAction SilentlyContinue | Measure-Object
$categoryImages = Get-ChildItem "public\images\categories" -ErrorAction SilentlyContinue | Measure-Object

Write-Host ""
Write-Host "📊 Exclusion Summary:" -ForegroundColor Cyan
Write-Host "   Product images excluded: $($productImages.Count)" -ForegroundColor White
Write-Host "   Category images excluded: $($categoryImages.Count)" -ForegroundColor White
