# Multi-Framework Authentication System

A complete take-home test solution demonstrating seamless authentication and session management across multiple frameworks: .NET Backend, Next.js, and two Angular applications.

## 🏗️ Architecture

- **Backend**: .NET 10 Web API with cookie-based authentication
- **Frontend 1**: Next.js 15 (App Router) - Login and main hub
- **Frontend 2**: Angular 19 - User application form with Angular Material
- **Frontend 3**: Angular 19 - Admin dashboard with Angular Material Design
- **Proxy**: Nginx for same-domain cookie sharing
- **Production**: Azure App Service + Cloudflare CDN/Proxy

## 🔑 Key Features

- ✅ Shared session cookies across all applications
- ✅ Two authentication flows:
  - Phone + OTP (Next.js → Angular User App)
  - Email + Password (Angular Admin → Angular User App)
- ✅ Seamless navigation between apps without re-authentication
- ✅ Admin view tracking in user application
- ✅ Professional dark theme UI with Angular Material Design
- ✅ Docker Compose orchestration
- ✅ Production-ready for Azure + Cloudflare with HTTPS
- ✅ SameSite cookie configuration for cross-origin support
- ✅ Secure cookie policy with SSL termination

## 📋 Prerequisites

**Development:**
- Docker Desktop installed
- Docker Compose installed
- Ports available: 80, 3000, 4200, 4300, 5001

**Production:**
- Azure subscription
- Cloudflare account with domain
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide

## 🚀 Quick Start (Development)

### 1. Clone and Navigate

\`\`\`bash
git clone <repository-url>
cd take-home-fe-test
\`\`\`

### 2. Start All Services

\`\`\`bash
docker-compose up --build
\`\`\`

This will start:
- Backend API: http://localhost:5001
- Next.js App: http://localhost:3000
- Angular User App: http://localhost:4200
- Angular Admin App: http://localhost:4300
- Nginx Proxy: http://localhost

### 3. Access the Applications

**Option A: Direct Access (recommended for development)**
- Next.js Hub: http://localhost:3000
- Angular Admin: http://localhost:4300
- Backend API: http://localhost:5001/api

**Option B: Through Nginx Proxy (production-like)**
- Main Hub: http://localhost
- User App: http://localhost/user-app
- Admin Dashboard: http://localhost/admin
- Backend API: http://localhost/api

## 🧪 Testing the Flows

### Flow 1: Next.js → Angular User App

1. Go to http://localhost:3000
2. Login with:
   - Phone: `+1234567890`
   - OTP: `123456`
3. Click "Resume Application"
4. You'll be redirected to the Angular User App (http://localhost:4200)
5. Session persists - no re-login required
6. Click "Go Back to Home" to return to Next.js

### Flow 2: Angular Admin → Angular User App

1. Go to http://localhost:4300
2. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`
3. View the admin dashboard with application list
4. Click "View" on any application
5. You'll be redirected to the Angular User App (http://localhost:4200)
6. Notice the admin name appears in the header
7. Click "Back to Dashboard" to return to admin

## 🔐 Test Credentials

### Phone/OTP Login (Next.js)
- Phone: `+1234567890`, OTP: `123456`
- Phone: `+9876543210`, OTP: `654321`

### Admin Login (Angular)
- Email: `admin@example.com`, Password: `admin123`
- Email: `supervisor@example.com`, Password: `super456`

## 🚢 Production Deployment

This solution is **production-ready** for Azure App Service with Cloudflare.

### Key Production Features:

1. **Secure Cookies with HTTPS**
   - `Secure=true` enforced in production
   - `SameSite=None` for Cloudflare proxy compatibility
   - `HttpOnly=true` for XSS protection

2. **Cloudflare Integration**
   - SSL/TLS termination at Cloudflare
   - Forwarded headers support (`X-Forwarded-Proto`)
   - DDoS protection and CDN caching

3. **Azure App Service**
   - Multi-container deployment with Docker Compose
   - Environment-based configuration
   - Application Insights integration

4. **Cookie Domain Configuration**
   - Development: `localhost`
   - Production: `.yourdomain.com` (configurable via environment)

### Quick Production Setup

\`\`\`bash
# Update domain configuration
export COOKIE_DOMAIN=".yourdomain.com"
export CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Deploy to Azure (see DEPLOYMENT.md for detailed steps)
az webapp up --name takehome-app --resource-group takehome-rg
\`\`\`

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete production deployment guide.

## 🏃‍♂️ Running Without Docker

### Backend (.NET)

\`\`\`bash
cd backend-dotnet
dotnet restore
dotnet run
\`\`\`

### Next.js

\`\`\`bash
cd frontend-nextjs
npm install
npm run dev
\`\`\`

### Angular User App

\`\`\`bash
cd frontend-angular1
npm install
npm start
\`\`\`

### Angular Admin App

\`\`\`bash
cd frontend-angular2
npm install
npm start
\`\`\`

## 📝 Technical Implementation

### Cookie Configuration

The backend uses environment-aware cookie configuration:

**Development:**
\`\`\`csharp
Secure = false              // HTTP allowed
SameSite = Lax             // Standard browser behavior
Domain = "localhost"       // Local domain
\`\`\`

**Production:**
\`\`\`csharp
Secure = true              // HTTPS required
SameSite = None            // Required for cross-origin support
HttpOnly = true            // Protect against XSS
Domain = ".yourdomain.com" // Set to your domain
