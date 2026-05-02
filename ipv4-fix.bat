@echo off
echo IPv4 Fix for Vite Server
echo =======================
echo.

echo 1. Killing all processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im php.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo 2. Starting Laravel server...
start "Laravel" cmd /c "php artisan serve --host=127.0.0.1 --port=8000"
timeout /t 3 /nobreak >nul

echo 3. Starting Vite dev server (IPv4 only)...
start "Vite" cmd /c "npm run dev -- --host 127.0.0.1 --port 5173"
timeout /t 5 /nobreak >nul

echo.
echo 4. Testing localhost access...
echo Your app should be available at:
echo - Frontend: http://localhost:5173
echo - Backend: http://localhost:8000
echo.
echo IPv6 issue should be fixed now!
echo.

pause
