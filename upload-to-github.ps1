# GitHub Upload Script for Ace the Interview Project
# Run this script AFTER installing Git and creating a GitHub repository

Write-Host "=== GitHub Repository Upload ===" -ForegroundColor Green
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version 2>&1
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "2. Run the installer with default options" -ForegroundColor Yellow
    Write-Host "3. Restart your terminal/PowerShell" -ForegroundColor Yellow
    Write-Host "4. Run this script again" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if already a git repository
if (Test-Path .git) {
    Write-Host "⚠ Git repository already initialized" -ForegroundColor Yellow
    $status = git status --porcelain
    if ($status) {
        Write-Host "You have uncommitted changes. Continuing..." -ForegroundColor Cyan
    }
} else {
    # Initialize git repository
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init -b main
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to initialize Git repository" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Repository initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "Adding files to Git (respecting .gitignore)..." -ForegroundColor Cyan
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to add files" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Checking if there are files to commit..." -ForegroundColor Cyan
$status = git status --porcelain
if (-not $status) {
    Write-Host "⚠ No changes to commit. Files may already be committed." -ForegroundColor Yellow
    $hasCommits = git log --oneline -n 1 2>&1
    if ($hasCommits) {
        Write-Host "Repository already has commits." -ForegroundColor Cyan
    } else {
        Write-Host "Creating empty initial commit..." -ForegroundColor Cyan
        git commit --allow-empty -m "Initial commit: Ace the Interview project"
    }
} else {
    Write-Host "Creating initial commit..." -ForegroundColor Cyan
    git commit -m "Initial commit: Ace the Interview project"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to create commit" -ForegroundColor Red
        Write-Host "Note: You may need to configure Git user name and email first:" -ForegroundColor Yellow
        Write-Host "  git config --global user.name 'Your Name'" -ForegroundColor White
        Write-Host "  git config --global user.email 'your.email@example.com'" -ForegroundColor White
        exit 1
    }
}

Write-Host ""
Write-Host "✓ Files committed successfully!" -ForegroundColor Green
Write-Host ""

# Check if remote already exists
$remoteExists = git remote get-url origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Remote 'origin' already exists: $remoteExists" -ForegroundColor Cyan
    $update = Read-Host "Do you want to update it? (y/n)"
    if ($update -eq "y") {
        $repoUrl = Read-Host "Enter your GitHub repository URL"
        if ($repoUrl) {
            git remote set-url origin $repoUrl
            Write-Host "✓ Remote updated" -ForegroundColor Green
        }
    }
} else {
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Create a new repository on GitHub.com (don't add README, .gitignore, or license)" -ForegroundColor White
    Write-Host "2. Copy the repository URL (e.g., https://github.com/username/repo-name.git)" -ForegroundColor White
    Write-Host ""
    Write-Host "Enter your GitHub repository URL to connect and push:" -ForegroundColor Cyan
    $repoUrl = Read-Host "GitHub repository URL (or press Enter to skip)"
    
    if ($repoUrl) {
        Write-Host ""
        Write-Host "Adding remote repository..." -ForegroundColor Cyan
        git remote add origin $repoUrl
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Failed to add remote" -ForegroundColor Red
            exit 1
        }
        
        Write-Host ""
        Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
        git push -u origin main
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Failed to push to GitHub" -ForegroundColor Red
            Write-Host "You may need to authenticate. Try:" -ForegroundColor Yellow
            Write-Host "  git push -u origin main" -ForegroundColor White
            exit 1
        }
        
        Write-Host ""
        Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "Your repository is now available at: $repoUrl" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "To push manually later, run:" -ForegroundColor Yellow
        Write-Host "  git remote add origin <YOUR_REPOSITORY_URL>" -ForegroundColor White
        Write-Host "  git push -u origin main" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green

