# Hostinger FTP Deployment Script (PowerShell)
# Deploys the built site to Hostinger via FTP

Write-Host "🚀 Starting FTP deployment to Hostinger..." -ForegroundColor Cyan

# Configuration
$HOST = "77.37.37.242"
$PORT = "21"
$USERNAME = "u289779063.paleturquoise-crow-983526.hostingersite.com"
$REMOTE_ROOT = "/public_html"

# Check if dist directory exists
if (-Not (Test-Path "dist")) {
    Write-Host "❌ Error: dist directory not found. Please run 'npm run build' first." -ForegroundColor Red
    exit 1
}

# Create temporary deployment structure
Write-Host "📦 Preparing deployment files..." -ForegroundColor Yellow
if (Test-Path ".deploy-temp") {
    Remove-Item -Recurse -Force ".deploy-temp"
}
New-Item -ItemType Directory -Force -Path ".deploy-temp" | Out-Null

# Copy main site files
Copy-Item -Path "dist\*" -Destination ".deploy-temp\" -Recurse -Force

# Check if Sanity studio is built
if (Test-Path "cosyblog\dist") {
    Write-Host "📦 Including Sanity Studio..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path ".deploy-temp\studio" | Out-Null
    Copy-Item -Path "cosyblog\dist\*" -Destination ".deploy-temp\studio\" -Recurse -Force
} else {
    Write-Host "⚠️  Warning: cosyblog\dist not found. Skipping Sanity Studio deployment." -ForegroundColor Yellow
}

# Get password
$Password = Read-Host "Enter FTP password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "🔌 Connecting to Hostinger FTP..." -ForegroundColor Cyan

try {
    # Create FTP request
    $files = Get-ChildItem -Path ".deploy-temp" -Recurse -File
    $totalFiles = $files.Count
    $currentFile = 0

    Write-Host "🔄 Uploading $totalFiles files (this may take a few minutes)..." -ForegroundColor Cyan

    foreach ($file in $files) {
        $currentFile++
        $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 15) # Remove .deploy-temp\
        $relativePath = $relativePath.Replace("\", "/")
        $remoteFile = "$REMOTE_ROOT/$relativePath"

        # Create directory structure
        $remoteDir = Split-Path $remoteFile -Parent
        $remoteDirParts = $remoteDir.Split('/') | Where-Object { $_ -ne '' }
        $currentPath = ""

        # Upload file
        $ftpUri = "ftp://${HOST}:${PORT}${remoteFile}"
        $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpUri)
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($USERNAME, $PlainPassword)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpRequest.UseBinary = $true
        $ftpRequest.KeepAlive = $false

        $fileContent = [System.IO.File]::ReadAllBytes($file.FullName)
        $ftpRequest.ContentLength = $fileContent.Length

        $requestStream = $ftpRequest.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()

        $response = $ftpRequest.GetResponse()
        $response.Close()

        Write-Progress -Activity "Uploading files" -Status "$currentFile of $totalFiles" -PercentComplete (($currentFile / $totalFiles) * 100)
    }

    Write-Host ""
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host "🌐 Your site should be live at: https://paleturquoise-crow-983526.hostingersite.com" -ForegroundColor Green
    Write-Host "🎨 Sanity Studio at: https://paleturquoise-crow-983526.hostingersite.com/studio" -ForegroundColor Green

} catch {
    Write-Host ""
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Clean up
    Write-Host "🧹 Cleaning up temporary files..." -ForegroundColor Yellow
    if (Test-Path ".deploy-temp") {
        Remove-Item -Recurse -Force ".deploy-temp"
    }
}

Write-Host "✨ Done!" -ForegroundColor Green
