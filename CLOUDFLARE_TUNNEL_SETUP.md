# Cloudflare Tunnel Setup for MV Oxygen Trading

This guide will help you set up Cloudflare tunnels for both your Laravel backend and React frontend.

## Prerequisites

1. **Cloudflare Account**: You need a Cloudflare account with a domain added
2. **cloudflared installed**: Install the Cloudflare tunnel client
3. **Local servers running**: Laravel on port 8000, Vite dev server on port 5173

## Quick Setup (Windows)

### 1. Install cloudflared
```bash
winget install --id Cloudflare.cloudflared
```

### 2. Run the setup script
```bash
setup-cloudflare-tunnels.bat
```

### 3. Start the tunnels
```bash
start-tunnels.bat
```

## Manual Setup

### Step 1: Install cloudflared
```bash
# Windows (winget)
winget install --id Cloudflare.cloudflared

# Or download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

### Step 2: Authenticate with Cloudflare
```bash
cloudflared tunnel login
```

### Step 3: Create Tunnels
```bash
# Backend tunnel
cloudflared tunnel create mv-oxygen-backend

# Frontend tunnel
cloudflared tunnel create mv-oxygen-frontend
```

### Step 4: Set Up DNS Records
```bash
# Backend DNS
cloudflared tunnel route dns mv-oxygen-backend api.yourdomain.com

# Frontend DNS
cloudflared tunnel route dns mv-oxygen-frontend app.yourdomain.com
```

### Step 5: Create Configuration Files

**Backend Configuration** (`backend-tunnel.yml`):
```yaml
tunnel: YOUR_BACKEND_TUNNEL_ID
credentials-file: %USERPROFILE%\.cloudflared\mv-oxygen-backend.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:8000
  - service: http_status:404
```

**Frontend Configuration** (`frontend-tunnel.yml`):
```yaml
tunnel: YOUR_FRONTEND_TUNNEL_ID
credentials-file: %USERPROFILE%\.cloudflared\mv-oxygen-frontend.json

ingress:
  - hostname: app.yourdomain.com
    service: http://localhost:5173
  - service: http_status:404
```

### Step 6: Start Local Servers

**Laravel Backend**:
```bash
php artisan serve --host=127.0.0.1 --port=8000
```

**Vite Frontend**:
```bash
npm run dev
```

### Step 7: Start Tunnels

In separate terminal windows:

**Backend Tunnel**:
```bash
cloudflared tunnel --config backend-tunnel.yml run mv-oxygen-backend
```

**Frontend Tunnel**:
```bash
cloudflared tunnel --config frontend-tunnel.yml run mv-oxygen-frontend
```

## Access Your Application

Once running, your application will be accessible at:
- **Backend API**: `https://api.yourdomain.com`
- **Frontend App**: `https://app.yourdomain.com`

## Environment Configuration

Update your `.env` file for production:

```env
APP_URL=https://app.yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 8000 and 5173 are available
2. **DNS propagation**: DNS changes may take a few minutes to propagate
3. **Tunnel not starting**: Check your Cloudflare authentication and tunnel IDs

### Debug Commands

```bash
# Check tunnel status
cloudflared tunnel info mv-oxygen-backend
cloudflared tunnel info mv-oxygen-frontend

# Test tunnel connection
cloudflared tunnel --config backend-tunnel.yml run mv-oxygen-backend --logfile tunnel.log
```

## Security Notes

- Tunnels provide secure HTTPS connections automatically
- No need to open ports on your local network
- Cloudflare handles SSL certificates
- Your local IP address remains private

## Advanced Configuration

### Custom Subdomains
Replace `api.yourdomain.com` and `app.yourdomain.com` with your preferred subdomains.

### Single Tunnel Configuration
You can also use a single tunnel with multiple ingress rules:

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /path/to/credentials.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:8000
  - hostname: app.yourdomain.com
    service: http://localhost:5173
  - service: http_status:404
```

### Wildcard Subdomains
For multiple environments:
```yaml
ingress:
  - hostname: api-*.yourdomain.com
    service: http://localhost:8000
  - hostname: *.yourdomain.com
    service: http://localhost:5173
  - service: http_status:404
```
