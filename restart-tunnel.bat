@echo off
echo Restart Cloudflare Tunnel with CORS Fix
echo ======================================
echo.

echo 1. Stopping any existing processes...
taskkill /f /im php.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im cloudflared.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo 2. Starting Laravel server...
start "Laravel" cmd /c "php artisan serve --host=127.0.0.1 --port=8000"
timeout /t 3 /nobreak >nul

echo 3. Starting Vite dev server with CORS fix...
start "Vite" cmd /c "npm run dev -- --host 0.0.0.0 --port 5173"
timeout /t 5 /nobreak >nul

echo.
echo 4. Creating Cloudflare tunnel...
echo Your app will be available at a random *.trycloudflare.com link
echo.
echo Press Ctrl+C to stop the tunnel
echo.

cloudflared tunnel --url http://localhost:5173

pause
