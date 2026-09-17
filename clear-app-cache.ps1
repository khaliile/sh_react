# Clear Electron App Cache Script
# Close the desktop app first, then run this script

Write-Host "Clearing Electron app cache..." -ForegroundColor Yellow

# Common Electron app data locations
$appDataPaths = @(
    "$env:APPDATA\study-hub-rpg",
    "$env:LOCALAPPDATA\study-hub-rpg",
    "$env:APPDATA\Electron",
    "$env:LOCALAPPDATA\Electron"
)

foreach ($path in $appDataPaths) {
    if (Test-Path $path) {
        Write-Host "Removing: $path" -ForegroundColor Cyan
        Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
    }
}

# Also clear service worker cache in dist
$swPath = ".\dist\sw.js"
if (Test-Path $swPath) {
    Write-Host "Service worker found, it may cache content" -ForegroundColor Yellow
}

Write-Host "`nCache cleared! Now run: npm run desktop" -ForegroundColor Green
