@echo off
echo Clean Restart All Services
echo =========================
echo.

echo 1. Killing all existing processes...
taskkill /f /im php.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im cloudflared.exe >nul 2>&1

echo 2. Killing processes on port 5173...
for /f "tokens=5" %%i in ('netstat -ano ^| findstr :5173') do taskkill /f /pid %%i >nul 2>&1

echo 3. Waiting for ports to free up...
timeout /t 3 /nobreak >nul

echo 4. Starting Laravel server...
start "Laravel" cmd /c "php artisan serve --host=127.0.0.1 --port=8000"
timeout /t 3 /nobreak >nul

echo 5. Starting Vite dev server...
start "Vite" cmd /c "npm run dev -- --host 0.0.0.0 --port 5173"
timeout /t 5 /nobreak >nul

echo 6. Starting Cloudflare tunnel...
echo Your app will be available at a random *.trycloudflare.com link
echo.
echo Press Ctrl+C to stop the tunnel
echo.

cloudflared tunnel --url http://localhost:5173

pause
