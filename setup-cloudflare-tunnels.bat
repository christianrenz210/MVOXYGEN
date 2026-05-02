@echo off
echo Setting up Cloudflare Tunnels for MV Oxygen Trading
echo.

REM Check if cloudflared is installed
cloudflared --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing cloudflared...
    winget install --id Cloudflare.cloudflared
    if %errorlevel% neq 0 (
        echo Failed to install cloudflared. Please install manually from:
        echo https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
        pause
        exit /b 1
    )
)

echo.
echo Creating tunnels...

REM Create backend tunnel
echo Creating backend API tunnel...
cloudflared tunnel create mv-oxygen-backend

REM Create frontend tunnel  
echo Creating frontend app tunnel...
cloudflared tunnel create mv-oxygen-frontend

echo.
echo Setting up DNS records...

REM Get tunnel IDs and create DNS records
for /f "tokens=*" %%i in ('cloudflared tunnel route dns mv-oxygen-backend api.yourdomain.com') do set backend_result=%%i
for /f "tokens=*" %%i in ('cloudflared tunnel route dns mv-oxygen-frontend app.yourdomain.com') do set frontend_result=%%i

echo DNS records created:
echo - api.yourdomain.com -> backend tunnel
echo - app.yourdomain.com -> frontend tunnel

echo.
echo Creating tunnel configuration files...

REM Backend config
echo tunnel: > backend-tunnel.yml
for /f "tokens=2" %%i in ('cloudflared tunnel info mv-oxygen-backend ^| findstr "id:"') do echo tunnel: %%i >> backend-tunnel.yml
echo credentials-file: %USERPROFILE%\.cloudflared\mv-oxygen-backend.json >> backend-tunnel.yml
echo. >> backend-tunnel.yml
echo ingress: >> backend-tunnel.yml
echo   - hostname: api.yourdomain.com >> backend-tunnel.yml
echo     service: http://localhost:8000 >> backend-tunnel.yml
echo   - service: http_status:404 >> backend-tunnel.yml

REM Frontend config
echo tunnel: > frontend-tunnel.yml
for /f "tokens=2" %%i in ('cloudflared tunnel info mv-oxygen-frontend ^| findstr "id:"') do echo tunnel: %%i >> frontend-tunnel.yml
echo credentials-file: %USERPROFILE%\.cloudflared\mv-oxygen-frontend.json >> frontend-tunnel.yml
echo. >> frontend-tunnel.yml
echo ingress: >> frontend-tunnel.yml
echo   - hostname: app.yourdomain.com >> frontend-tunnel.yml
echo     service: http://localhost:5173 >> frontend-tunnel.yml
echo   - service: http_status:404 >> frontend-tunnel.yml

echo.
echo Configuration files created:
echo - backend-tunnel.yml
echo - frontend-tunnel.yml

echo.
echo To run the tunnels, use these commands in separate terminals:
echo Backend: cloudflared tunnel --config backend-tunnel.yml run mv-oxygen-backend
echo Frontend: cloudflared tunnel --config frontend-tunnel.yml run mv-oxygen-frontend

echo.
echo Make sure your Laravel server is running on port 8000
echo and your Vite dev server is running on port 5173
echo.
pause
