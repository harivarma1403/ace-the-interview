# Script to package the entire project for download/backup
# This excludes node_modules, .env, and other unnecessary files

Write-Host "=== Packaging Ace the Interview Project ===" -ForegroundColor Green
Write-Host ""

$projectDir = Get-Location
$projectName = Split-Path -Leaf $projectDir
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zipFileName = "${projectName}_complete_${timestamp}.zip"
$zipPath = Join-Path $projectDir ".." $zipFileName

Write-Host "Project Directory: $projectDir" -ForegroundColor Cyan
Write-Host "Output File: $zipPath" -ForegroundColor Cyan
Write-Host ""

# Files and directories to exclude
$excludePatterns = @(
    "node_modules",
    ".next",
    ".genkit",
    ".env",
    ".env.local",
    ".env.*.local",
    "*.log",
    ".DS_Store",
    "Thumbs.db",
    ".vscode",
    ".idea",
    "*.suo",
    "*.swp",
    "coverage",
    "dist",
    "build",
    "out"
)

Write-Host "Packaging project files..." -ForegroundColor Yellow
Write-Host "Excluding: node_modules, .env, .next, build artifacts, and editor files" -ForegroundColor Gray
Write-Host ""

# Get all files in the project
$filesToZip = Get-ChildItem -Path $projectDir -Recurse -File | Where-Object {
    $relativePath = $_.FullName.Replace($projectDir, "").TrimStart("\")
    $shouldExclude = $false
    
    foreach ($pattern in $excludePatterns) {
        if ($relativePath -like "*\$pattern\*" -or $relativePath -like "$pattern\*" -or $_.Name -like $pattern) {
            $shouldExclude = $true
            break
        }
    }
    
    # Also check if it's in a parent directory that should be excluded
    foreach ($segment in $relativePath.Split("\")) {
        if ($excludePatterns -contains $segment) {
            $shouldExclude = $true
            break
        }
    }
    
    -not $shouldExclude
}

Write-Host "Found $($filesToZip.Count) files to package" -ForegroundColor Green
Write-Host ""

# Create the zip file
Write-Host "Creating ZIP archive..." -ForegroundColor Yellow

try {
    # Use .NET compression for better compatibility
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    
    # Create zip file
    $zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
    
    $fileCount = 0
    foreach ($file in $filesToZip) {
        $relativePath = $file.FullName.Replace($projectDir, "").TrimStart("\")
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relativePath) | Out-Null
        $fileCount++
        
        if ($fileCount % 50 -eq 0) {
            Write-Progress -Activity "Packaging files" -Status "Processed $fileCount files" -PercentComplete (($fileCount / $filesToZip.Count) * 100)
        }
    }
    
    $zip.Dispose()
    Write-Progress -Activity "Packaging files" -Completed
    
    # Get file size
    $zipSize = (Get-Item $zipPath).Length
    $zipSizeMB = [math]::Round($zipSize / 1MB, 2)
    
    Write-Host ""
    Write-Host "✓ Project packaged successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Archive Details:" -ForegroundColor Cyan
    Write-Host "  File: $zipFileName" -ForegroundColor White
    Write-Host "  Location: $zipPath" -ForegroundColor White
    Write-Host "  Size: $zipSizeMB MB" -ForegroundColor White
    Write-Host "  Files: $fileCount files" -ForegroundColor White
    Write-Host ""
    Write-Host "This archive includes:" -ForegroundColor Yellow
    Write-Host "  - All source code (src/)" -ForegroundColor Green
    Write-Host "  - Configuration files (package.json, tsconfig.json, etc.)" -ForegroundColor Green
    Write-Host "  - Public assets (public/)" -ForegroundColor Green
    Write-Host "  - Documentation (README.md, DEPLOYMENT.md)" -ForegroundColor Green
    Write-Host "  - Firebase config (firebase.json, apphosting.yaml)" -ForegroundColor Green
    Write-Host ""
    Write-Host "This archive excludes:" -ForegroundColor Yellow
    Write-Host "  - node_modules (can be reinstalled with 'npm install')" -ForegroundColor Gray
    Write-Host "  - .env file (sensitive data - needs to be recreated)" -ForegroundColor Gray
    Write-Host "  - Build artifacts (.next/, build/, dist/)" -ForegroundColor Gray
    Write-Host "  - Editor files (.vscode/, .idea/)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To restore this project:" -ForegroundColor Cyan
    Write-Host "  1. Extract the ZIP file" -ForegroundColor White
    Write-Host "  2. Run: npm install" -ForegroundColor White
    Write-Host "  3. Create .env file with your GEMINI_API_KEY" -ForegroundColor White
    Write-Host ""
    
    # Optionally open the file location
    $open = Read-Host "Open file location? (y/n)"
    if ($open -eq "y" -or $open -eq "Y") {
        Start-Process "explorer.exe" -ArgumentList "/select,`"$zipPath`""
    }
    
} catch {
    Write-Host ""
    Write-Host "✗ Error creating ZIP file: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: You can manually select all files (excluding node_modules) and create a ZIP." -ForegroundColor Yellow
    exit 1
}

