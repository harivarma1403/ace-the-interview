# GitHub Setup Script for Ace the Interview Project
# Run this script after installing Git and creating a GitHub repository

Write-Host "=== GitHub Repository Setup ===" -ForegroundColor Green
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "This script will:" -ForegroundColor Cyan
Write-Host "1. Initialize a Git repository (if not already initialized)"
Write-Host "2. Add all files (respecting .gitignore)"
Write-Host "3. Create an initial commit"
Write-Host ""

# Check if already a git repository
if (Test-Path .git) {
    Write-Host "⚠ Git repository already initialized" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
} else {
    # Initialize git repository
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init -b main
    Write-Host "✓ Repository initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "Adding files to Git..." -ForegroundColor Cyan
git add .

Write-Host ""
Write-Host "Creating initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit: Ace the Interview project"

Write-Host ""
Write-Host "✓ Files committed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create a new repository on GitHub.com (don't add README, .gitignore, or license)"
Write-Host "2. Copy the repository URL (e.g., https://github.com/username/repo-name.git)"
Write-Host "3. Run these commands:"
Write-Host ""
Write-Host "   git remote add origin <YOUR_REPOSITORY_URL>" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "Or provide your repository URL now and I'll add it for you:" -ForegroundColor Cyan
$repoUrl = Read-Host "GitHub repository URL (or press Enter to skip)"

if ($repoUrl) {
    Write-Host ""
    Write-Host "Adding remote repository..." -ForegroundColor Cyan
    git remote add origin $repoUrl
    
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
    git push -u origin main
    
    Write-Host ""
    Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Your repository is now available at: $repoUrl" -ForegroundColor Green
}

