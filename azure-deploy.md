# Azure Deployment Guide - Smart Inventory System

## Project Information
- **GitHub Repository**: https://github.com/shuvammondal41/Smart-Inventory-System
- **Framework**: .NET 8.0
- **Database**: MySQL (Pomelo.EntityFrameworkCore.MySql)

## Deployment Steps

### Step 1: Create Azure Account
1. Visit: https://azure.microsoft.com/free/
2. Sign up for free account
3. Get $200 credit (30 days) + 12 months free services

### Step 2: Create Azure App Service (FREE)

1. Go to **Azure Portal**: https://portal.azure.com
2. Click **"Create a resource"**
3. Search for **"Web App"** and click **Create**

#### Configuration:
- **Subscription**: Your Azure subscription
- **Resource Group**: Create new → `SmartInventory-RG`
- **Name**: `smartinventory-yourname` (must be unique globally)
  - This becomes: `https://smartinventory-yourname.azurewebsites.net`
- **Publish**: `Code`
- **Runtime stack**: `.NET 8 (LTS)`
- **Operating System**: `Windows` or `Linux`
- **Region**: Choose closest to you (e.g., East US, West Europe)
- **Pricing Plan**:
  - Click **"Change size"**
  - Select **"Dev/Test"** tab
  - Choose **F1 (Free)** ⭐
  - Click **Apply**

4. Click **"Review + create"**
5. Click **"Create"**
6. Wait for deployment (2-3 minutes)

### Step 3: Configure Deployment from GitHub

1. In Azure Portal, go to your newly created **Web App**
2. In left menu, click **"Deployment Center"**
3. Under **Source**, select **"GitHub"**
4. Click **"Authorize"** and sign in to GitHub
5. Select:
   - **Organization**: `shuvammondal41`
   - **Repository**: `Smart-Inventory-System`
   - **Branch**: `main`
6. **Build provider**: Select **"GitHub Actions"**
7. Click **"Save"**

Azure will automatically:
- Create a GitHub Actions workflow file
- Build your .NET application
- Deploy to Azure App Service

### Step 4: Configure Application Settings

1. In your Web App, go to **"Configuration"** (left menu)
2. Under **"Application settings"**, add:

```
ASPNETCORE_ENVIRONMENT = Production
```

3. Click **"Save"**

### Step 5: Setup Database (MySQL on Azure)

#### Option A: Azure Database for MySQL (Paid after free trial)
1. Create **"Azure Database for MySQL"**
2. Choose **Flexible Server**
3. Get connection string

#### Option B: Free External MySQL (Recommended)
Use free MySQL hosting:
- **FreeSQLDatabase.com** (Free, no credit card)
- **db4free.net** (Free MySQL hosting)
- **Clever Cloud** (Free tier available)

#### Update Connection String:
1. In Web App → **Configuration** → **Connection strings**
2. Add new connection string:
   - **Name**: `DefaultConnection`
   - **Value**: Your MySQL connection string
   - **Type**: `MySQL`
3. Click **Save**

### Step 6: Monitor Deployment

1. Go to **"Deployment Center"**
2. Check **"Logs"** tab to see deployment progress
3. Wait for build and deployment to complete (5-10 minutes first time)

### Step 7: Access Your Application

Once deployed:
- **URL**: `https://smartinventory-yourname.azurewebsites.net`
- Add this link to your CV!

## Troubleshooting

### Check Logs
1. In Azure Portal → Your Web App
2. Go to **"Log stream"** (left menu)
3. View real-time logs

### Common Issues

**Issue**: Application not starting
- Check **"Configuration"** → Ensure .NET 8 runtime selected
- Check **"Log stream"** for errors

**Issue**: Database connection failed
- Verify connection string in **"Configuration"**
- Ensure MySQL server allows Azure connections

**Issue**: 404 errors
- Check `.deployment` file points to correct project
- Verify deployment logs completed successfully

## Cost Breakdown (FREE Tier)

✅ **App Service F1**: FREE forever
- 1 GB RAM
- 1 GB Storage
- 60 CPU minutes/day
- 10 apps maximum

✅ **GitHub Actions**: FREE for public repos

⚠️ **Database**: Need external free MySQL or paid Azure MySQL

## Add to Your CV

```
Smart Inventory & Billing Management System
Live Demo: https://smartinventory-yourname.azurewebsites.net
Source Code: https://github.com/shuvammondal41/Smart-Inventory-System
```

## Next Steps

1. ✅ Code already on GitHub
2. ⏳ Create Azure account
3. ⏳ Create App Service (F1 Free)
4. ⏳ Connect GitHub for auto-deployment
5. ⏳ Setup database
6. ✅ Add link to CV!

## Support

- **Azure Documentation**: https://docs.microsoft.com/azure/app-service/
- **.NET on Azure**: https://docs.microsoft.com/aspnet/core/host-and-deploy/azure-apps/
