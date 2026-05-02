@echo off
echo Starting Cloudflare Tunnels for MV Oxygen Trading
echo.

REM Check if Laravel server is running
echo Checking Laravel server...
curl -s http://localhost:8000 >nul 2>&1
if %errorlevel% neq 0 (
    echo Laravel server is not running on port 8000
    echo Starting Laravel server...
    start "Laravel Server" cmd /c "php artisan serve --host=127.0.0.1 --port=8000"
    timeout /t 5 /nobreak >nul
)

REM Check if Vite dev server is running
echo Checking Vite dev server...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% neq 0 (
    echo Vite dev server is not running on port 5173
    echo Starting Vite dev server...
    start "Vite Dev Server" cmd /c "npm run dev"
    timeout /t 5 /nobreak >nul
)

echo.
echo Starting Cloudflare tunnels...

REM Start backend tunnel in new window
start "Backend Tunnel" cmd /c "cloudflared tunnel --config backend-tunnel.yml run mv-oxygen-backend"

REM Start frontend tunnel in new window
start "Frontend Tunnel" cmd /c "cloudflared tunnel --config frontend-tunnel.yml run mv-oxygen-frontend"

echo.
echo Tunnels started! Check the new windows for tunnel URLs.
echo Your application should be accessible at:
echo - Backend API: https://api.yourdomain.com
echo - Frontend App: https://app.yourdomain.com
echo.
pause
