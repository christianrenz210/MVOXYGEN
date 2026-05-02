@echo off
echo Simple Cloudflare Tunnel Setup
echo ==============================
echo.

REM Step 1: Check authentication
echo Step 1: Checking Cloudflare authentication...
cloudflared tunnel list >nul 2>&1
if %errorlevel% neq 0 (
    echo Not authenticated! Please run:
    echo cloudflared tunnel login
    echo.
    pause
    exit /b 1
)
echo Authentication OK!

REM Step 2: Create tunnels manually
echo.
echo Step 2: Creating tunnels...
echo Creating backend tunnel...
cloudflared tunnel create mv-oxygen-backend
echo Creating frontend tunnel...
cloudflared tunnel create mv-oxygen-frontend

REM Step 3: Get tunnel IDs
echo.
echo Step 3: Getting tunnel IDs...
for /f "tokens=2" %%i in ('cloudflared tunnel info mv-oxygen-backend ^| findstr "id:"') do set backend_id=%%i
for /f "tokens=2" %%i in ('cloudflared tunnels info mv-oxygen-frontend ^| findstr "id:"') do set frontend_id=%%i

echo Backend ID: %backend_id%
echo Frontend ID: %frontend_id%

REM Step 4: Create simple config files
echo.
echo Step 4: Creating configuration files...

REM Backend config
echo tunnel: %backend_id% > backend-tunnel.yml
echo credentials-file: %USERPROFILE%\.cloudflared\mv-oxygen-backend.json >> backend-tunnel.yml
echo ingress: >> backend-tunnel.yml
echo   - hostname: api.yourdomain.com >> backend-tunnel.yml
echo     service: http://localhost:8000 >> backend-tunnel.yml
echo   - service: http_status:404 >> backend-tunnel.yml

REM Frontend config
echo tunnel: %frontend_id% > frontend-tunnel.yml
echo credentials-file: %USERPROFILE%\.cloudflared\mv-oxygen-frontend.json >> frontend-tunnel.yml
echo ingress: >> frontend-tunnel.yml
echo   - hostname: app.yourdomain.com >> frontend-tunnel.yml
echo     service: http://localhost:5173 >> frontend-tunnel.yml
echo   - service: http_status:404 >> frontend-tunnel.yml

echo Configuration files created!

REM Step 5: Setup DNS (you need to do this manually)
echo.
echo Step 5: DNS Setup Required
echo Please run these commands manually:
echo.
echo cloudflared tunnel route dns mv-oxygen-backend api.yourdomain.com
echo cloudflared tunnel route dns mv-oxygen-frontend app.yourdomain.com
echo.
echo Replace "yourdomain.com" with your actual domain!
echo.

echo Setup complete! Now run:
echo 1. Start Laravel: php artisan serve --host=127.0.0.1 --port=8000
echo 2. Start Vite: npm run dev
echo 3. Start tunnels: 
echo    - Backend: cloudflared tunnel --config backend-tunnel.yml run mv-oxygen-backend
echo    - Frontend: cloudflared tunnel --config frontend-tunnel.yml run mv-oxygen-frontend
echo.
pause
