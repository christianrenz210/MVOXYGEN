@echo off
echo Fixed Cloudflare Tunnel for React App
echo ====================================
echo.

echo 1. Starting Laravel server...
start "Laravel" cmd /c "php artisan serve --host=127.0.0.1 --port=8000"
timeout /t 3 /nobreak >nul

echo 2. Starting Vite dev server with proper host...
start "Vite" cmd /c "npm run dev -- --host 0.0.0.0 --port 5173"
timeout /t 5 /nobreak >nul

echo.
echo 3. Creating tunnel for Vite frontend...
echo Your React app will be available at a random *.trycloudflare.com link
echo.
echo Press Ctrl+C to stop the tunnel
echo.

cloudflared tunnel --url http://localhost:5173

pause
