@echo off
echo Cloudflare Tunnel Troubleshooting
echo ================================
echo.

echo 1. Checking cloudflared installation...
cloudflared --version
if %errorlevel% neq 0 (
    echo ERROR: cloudflared not found or not working
    echo Please install: winget install --id Cloudflare.cloudflared
    pause
    exit /b 1
)

echo.
echo 2. Checking authentication...
cloudflared tunnel list
if %errorlevel% neq 0 (
    echo ERROR: Not authenticated with Cloudflare
    echo Please run: cloudflared tunnel login
    echo This will open your browser to authenticate
    pause
    exit /b 1
)

echo.
echo 3. Checking local servers...
echo Checking Laravel on port 8000...
curl -s http://localhost:8000 >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Laravel server not running on port 8000
    echo Start it with: php artisan serve --host=127.0.0.1 --port=8000
) else (
    echo OK: Laravel server is running
)

echo Checking Vite on port 5173...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Vite dev server not running on port 5173
    echo Start it with: npm run dev
) else (
    echo OK: Vite dev server is running
)

echo.
echo 4. Testing simple tunnel creation...
cloudflared tunnel create test-tunnel
if %errorlevel% neq 0 (
    echo ERROR: Cannot create tunnels
    echo Check your Cloudflare account and permissions
) else (
    echo OK: Can create tunnels
    cloudflared tunnel delete test-tunnel
)

echo.
echo Troubleshooting complete!
echo.
echo If all checks pass, try running:
echo setup-cloudflare-tunnels.bat
echo.
pause
