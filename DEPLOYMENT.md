# Production Deployment Guide - Azure + Cloudflare

This guide covers deploying the multi-framework authentication system to Azure App Service with Cloudflare as CDN/Proxy.

## Architecture Overview

```
User Browser
    ↓
Cloudflare (SSL Termination, CDN, DDoS Protection)
    ↓ HTTPS
Azure App Service (Nginx + All Apps)
    ↓ Internal HTTP
Backend API (.NET) + Frontend Apps (Next.js, Angular)
```

## Prerequisites

- Azure subscription
- Cloudflare account with domain
- Azure CLI installed
- Docker (for container deployment)

## Step 1: Azure Container Registry Setup

### 1.1 Create Azure Container Registry

```bash
# Login to Azure
az login

# Create resource group
az group create --name takehome-rg --location eastus

# Create container registry
az acr create --resource-group takehome-rg \
  --name takehomeregistry --sku Basic

# Login to ACR
az acr login --name takehomeregistry
```

### 1.2 Build and Push Images

```bash
# Tag and push backend
docker build -t takehomeregistry.azurecr.io/backend:latest ./backend-dotnet
docker push takehomeregistry.azurecr.io/backend:latest

# Tag and push Next.js
docker build -t takehomeregistry.azurecr.io/nextjs:latest ./frontend-nextjs
docker push takehomeregistry.azurecr.io/nextjs:latest

# Tag and push Angular User App
docker build -t takehomeregistry.azurecr.io/angular-user:latest ./frontend-angular1
docker push takehomeregistry.azurecr.io/angular-user:latest

# Tag and push Angular Admin App
docker build -t takehomeregistry.azurecr.io/angular-admin:latest ./frontend-angular2
docker push takehomeregistry.azurecr.io/angular-admin:latest
```

## Step 2: Azure App Service Configuration

### 2.1 Create App Service Plan

```bash
# Create Linux App Service Plan (Premium for multiple containers)
az appservice plan create --name takehome-plan \
  --resource-group takehome-rg \
  --is-linux \
  --sku P1V2
```

### 2.2 Create Web App with Multi-Container

Create `docker-compose.azure.yml`:

```yaml
version: '3.8'

services:
  nginx:
    image: takehomeregistry.azurecr.io/nginx:latest
    ports:
      - "80:80"
    depends_on:
      - backend
      - nextjs
      - angular-user
      - angular-admin

  backend:
    image: takehomeregistry.azurecr.io/backend:latest
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - CookieSettings__Domain=.yourdomain.com

  nextjs:
    image: takehomeregistry.azurecr.io/nextjs:latest
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://yourdomain.com/api

  angular-user:
    image: takehomeregistry.azurecr.io/angular-user:latest

  angular-admin:
    image: takehomeregistry.azurecr.io/angular-admin:latest
```

### 2.3 Deploy Multi-Container App

```bash
# Create web app
az webapp create --resource-group takehome-rg \
  --plan takehome-plan \
  --name takehome-app \
  --multicontainer-config-type compose \
  --multicontainer-config-file docker-compose.azure.yml

# Configure container registry credentials
az webapp config container set --name takehome-app \
  --resource-group takehome-rg \
  --docker-registry-server-url https://takehomeregistry.azurecr.io \
  --docker-registry-server-user takehomeregistry \
  --docker-registry-server-password <ACR_PASSWORD>
```

### 2.4 Configure App Settings

```bash
# Set environment variables
az webapp config appsettings set --name takehome-app \
  --resource-group takehome-rg \
  --settings \
    ASPNETCORE_ENVIRONMENT=Production \
    CookieSettings__Domain=.yourdomain.com \
    CorsSettings__AllowedOrigins__0=https://yourdomain.com \
    CorsSettings__AllowedOrigins__1=https://www.yourdomain.com \
    NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

## Step 3: Cloudflare Configuration

### 3.1 Add Domain to Cloudflare

1. Login to Cloudflare Dashboard
2. Add your domain (yourdomain.com)
3. Update nameservers at your domain registrar
4. Wait for DNS propagation

### 3.2 DNS Configuration

Create DNS records pointing to Azure App Service:

```
Type: CNAME
Name: @
Content: takehome-app.azurewebsites.net
Proxy status: Proxied (orange cloud)

Type: CNAME
Name: www
Content: takehome-app.azurewebsites.net
Proxy status: Proxied (orange cloud)
```

### 3.3 SSL/TLS Configuration

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode to **Full** (recommended) or **Full (Strict)**
   - **Full**: Cloudflare ↔ Azure uses encryption (self-signed cert OK)
   - **Full (Strict)**: Requires valid cert on Azure (use Azure's managed cert)

### 3.4 Enable Always Use HTTPS

1. Go to **SSL/TLS** → **Edge Certificates**
2. Enable "Always Use HTTPS"
3. Enable "Automatic HTTPS Rewrites"

### 3.5 Cookie Security Settings

**Critical for Same-Site Cookies**

1. Go to **Network**
2. Enable **WebSockets** (for real-time features if needed)
3. Go to **Rules** → **Transform Rules** → **Modify Response Header**
4. Add rule to preserve cookies:
   - When: `All incoming requests`
   - Then: Preserve all `Set-Cookie` headers

### 3.6 Disable Cloudflare Email Obfuscation

1. Go to **Scrape Shield**
2. Disable **Email Address Obfuscation** (can break SPA routing)

### 3.7 Page Rules for Caching

Create page rules to optimize caching:

```
Rule 1: Bypass cache for API
URL: yourdomain.com/api/*
Settings: Cache Level = Bypass

Rule 2: Cache static assets
URL: yourdomain.com/*.{js,css,png,jpg,jpeg,gif,svg,woff,woff2}
Settings: Cache Level = Cache Everything, Edge TTL = 1 month
```

## Step 4: Production Configuration Updates

### 4.1 Update Backend Configuration

In `appsettings.Production.json`:

```json
{
  "CookieSettings": {
    "Domain": ".yourdomain.com"
  },
  "CorsSettings": {
    "AllowedOrigins": [
      "https://yourdomain.com",
      "https://www.yourdomain.com"
    ]
  }
}
```

### 4.2 Update Frontend Environment Variables

**Next.js** (`frontend-nextjs/.env.production`):
```bash
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

**Angular User** (`frontend-angular1/src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://yourdomain.com/api'
};
```

**Angular Admin** (`frontend-angular2/src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://yourdomain.com/api'
};
```

## Step 5: Cookie Configuration for Production

### Critical Settings for Same-Site Cookies with Cloudflare

The backend now uses:

```csharp
options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // HTTPS only
options.Cookie.SameSite = SameSiteMode.None; // Required for Cloudflare proxy
options.Cookie.Domain = ".yourdomain.com"; // Shared across subdomains
