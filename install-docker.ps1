# Automated Docker Desktop Installation for Windows
# Run as Administrator
# Right-click PowerShell → Run as Administrator → then run this script

Write-Host "🚀 Docker Desktop Installation Script" -ForegroundColor Green
Write-Host ""

# Check if running as Administrator
$isAdmin = [bool]([System.Security.Principal.WindowsIdentity]::GetCurrent().Groups -match "S-1-5-32-544")
if (-not $isAdmin) {
    Write-Host "❌ This script must run as Administrator" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Check Windows version
$winVersion = [System.Environment]::OSVersion.Version
if ($winVersion.Major -lt 10) {
    Write-Host "❌ Windows 10 or later required" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Windows Version: $winVersion" -ForegroundColor Green
Write-Host ""

# Option 1: Use Chocolatey (if installed)
$hasChoco = $null -ne (Get-Command choco -ErrorAction SilentlyContinue)

if ($hasChoco) {
    Write-Host "📦 Chocolatey detected. Installing Docker via Chocolatey..." -ForegroundColor Cyan
    choco install docker-desktop -y --force

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker installed successfully via Chocolatey" -ForegroundColor Green
        Write-Host "Restarting computer in 30 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        Restart-Computer -Force
        exit 0
    }
}

# Option 2: Use Winget (Windows 11+)
$hasWinget = $null -ne (Get-Command winget -ErrorAction SilentlyContinue)

if ($hasWinget) {
    Write-Host "📦 Winget detected. Installing Docker via Winget..." -ForegroundColor Cyan
    winget install Docker.DockerDesktop -e

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker installed successfully via Winget" -ForegroundColor Green
        Write-Host "Restarting computer in 30 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        Restart-Computer -Force
        exit 0
    }
}

# Option 3: Manual download
Write-Host "📥 Downloading Docker Desktop installer..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Unable to find Chocolatey or Winget. Please follow these steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open browser and go to:" -ForegroundColor White
Write-Host "   https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Click 'Download for Windows'" -ForegroundColor White
Write-Host ""
Write-Host "3. Run the installer (Docker Desktop Installer.exe)" -ForegroundColor White
Write-Host ""
Write-Host "4. During installation, make sure to check:" -ForegroundColor White
Write-Host "   ✓ Install required Windows components for WSL 2" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Complete the installation" -ForegroundColor White
Write-Host ""
Write-Host "6. Restart your computer when prompted" -ForegroundColor White
Write-Host ""
Write-Host "7. After restart, verify installation:" -ForegroundColor White
Write-Host "   docker --version" -ForegroundColor Cyan
Write-Host "   docker-compose --version" -ForegroundColor Cyan
Write-Host ""
Write-Host "Once Docker is installed, run:" -ForegroundColor Yellow
Write-Host "cd C:\Users\Hp\asset-management" -ForegroundColor Cyan
Write-Host ".\setup-db.ps1" -ForegroundColor Cyan
