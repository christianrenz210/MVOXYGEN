@echo off
echo Quick Cloudflare Tunnel - Random Link
echo =====================================
echo.

echo Starting Laravel server...
start "Laravel" cmd /c "php artisan serve --host=127.0.0.1 --port=8000"
timeout /t 3 /nobreak >nul

echo Starting Vite dev server...
start "Vite" cmd /c "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo Creating temporary tunnel with random URL...
echo Your app will be available at a random *.trycloudflare.com link
echo.
echo Press Ctrl+C to stop the tunnel
echo.

cloudflared tunnel --url http://localhost:8000

pause
