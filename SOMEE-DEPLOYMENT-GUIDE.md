# Somee.com Deployment Guide - Smart Inventory System

## ✅ What You Get (FREE Forever)

- **ASP.NET Core** hosting
- **1.5 GB** disk space
- **SQL Server** database (free)
- **MySQL** database (limited)
- Custom domain support (optional)
- ⚠️ Small ads on free tier

**Your Live URL**: `http://yourappname.somee.com`

---

## 📋 Step-by-Step Deployment

### **Step 1: Create Somee.com Account** (5 minutes)

1. Go to: **https://somee.com/**
2. Click **"Sign Up"** (top right)
3. Fill in:
   - Username
   - Email
   - Password
4. Verify your email
5. Login to control panel

### **Step 2: Create Hosting Account** (2 minutes)

1. After login, click **"Create New Account"**
2. Choose:
   - **Hosting Type**: ASP.NET
   - **Domain**: Choose subdomain (e.g., `smartinventory.somee.com`)
3. Click **"Create"**
4. Wait for account creation (1-2 minutes)

### **Step 3: Prepare Your Application for Deployment**

#### A. Build Your Application Locally

Open terminal/command prompt in your project folder:

```bash
cd "C:\Users\Lenovo\Desktop\Smart Inventory & Billing Management System\Backend\SmartInventory.API"

# Build in Release mode
dotnet publish -c Release -o ./publish
```

This creates a `publish` folder with all files needed.

#### B. Files You'll Upload:
After build, you'll have a `publish` folder containing:
- `SmartInventory.API.dll`
- `appsettings.json`
- `web.config`
- All dependencies

### **Step 4: Setup Database on Somee**

1. In Somee control panel, go to **"Databases"**
2. Click **"Create Database"**
3. Choose **SQL Server** (recommended for .NET)
4. Note down:
   - **Server**: `serverName.somee.com`
   - **Database Name**: `yourDB`
   - **Username**: `yourUser`
   - **Password**: `yourPassword`

#### Update Connection String:

Your connection string will be:
```
Server=serverName.somee.com;Database=yourDB;User Id=yourUser;Password=yourPassword;Encrypt=False;
```

### **Step 5: Update appsettings.json for Production**

Before uploading, you need to update your connection string.

**IMPORTANT**: Don't commit database passwords to GitHub!

Create a production `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SOMEE_SERVER.somee.com;Database=YOUR_DB_NAME;User Id=YOUR_USER;Password=YOUR_PASSWORD;Encrypt=False;"
  },
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "SmartInventoryAPI",
    "Audience": "SmartInventoryClient",
    "ExpiryMinutes": 1440
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### **Step 6: Upload Files via FTP**

#### Option A: Using FileZilla (Recommended)

1. **Download FileZilla**: https://filezilla-project.org/
2. **Get FTP Credentials** from Somee Control Panel:
   - Host: `ftp.somee.com`
   - Username: Your somee username
   - Password: Your somee password
   - Port: `21`

3. **Connect via FileZilla**:
   - File → Site Manager → New Site
   - Enter FTP details
   - Click Connect

4. **Upload Files**:
   - Navigate to `/wwwroot` folder on the server (right side)
   - Upload ALL files from your `publish` folder
   - This may take 5-10 minutes

#### Option B: Using Somee File Manager

1. In Somee control panel → **File Manager**
2. Navigate to `wwwroot` folder
3. Upload files (slower than FTP)

### **Step 7: Configure Application Settings**

1. In Somee control panel, go to **"Control Panel"**
2. Find **"ASP.NET Version"** setting
3. Select **".NET Core 8.0"** (or latest available)
4. Save changes

### **Step 8: Setup Database Tables**

You need to run your SQL schema on Somee database.

#### Option A: Using Somee's phpMyAdmin/SQL Manager

1. In control panel → **"Databases"** → **"Manage"**
2. Open SQL query window
3. Copy your database schema from `database-schema.sql`
4. Run the queries

#### Option B: Using SQL Server Management Studio (SSMS)

1. Download SSMS (free)
2. Connect to: `YOUR_SERVER.somee.com`
3. Use credentials from Step 4
4. Run your SQL schema

### **Step 9: Test Your Application**

1. Visit: `http://yourappname.somee.com`
2. You should see your API or Swagger UI
3. Test endpoints: `http://yourappname.somee.com/swagger`

### **Step 10: Update CORS Settings** (Important!)

Since your frontend will call the API, update `Program.cs` CORS settings:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",  // Local development
                "http://yourappname.somee.com",  // Production API
                "https://your-frontend.vercel.app"  // If you deploy frontend
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

Then rebuild and re-upload.

---

## 🎯 Add to Your CV

Once deployed:

```
Smart Inventory & Billing Management System
Live API: http://smartinventory.somee.com
API Docs: http://smartinventory.somee.com/swagger
Source Code: https://github.com/shuvammondal41/Smart-Inventory-System
Tech Stack: ASP.NET Core 8, MySQL, Entity Framework, JWT Authentication
```

---

## 🔧 Troubleshooting

### Issue: "Site not loading"
- Check if files uploaded to `/wwwroot` folder
- Verify .NET version selected in control panel
- Check error logs in Somee control panel

### Issue: "Database connection failed"
- Verify connection string is correct
- Ensure database created in Somee control panel
- Check username/password
- Add `Encrypt=False;` to connection string

### Issue: "404 errors"
- Ensure `web.config` is in root folder
- Check all DLL files uploaded
- Verify routing in your controllers

### Issue: "Ads showing"
- This is normal for free tier
- Upgrade to paid plan ($2-5/month) to remove ads

---

## 💡 Tips

1. **Keep Local Copy**: Always keep local published files as backup
2. **Test Locally First**: Build and test locally before uploading
3. **Use FTP**: FileZilla is much faster than web upload
4. **Check Logs**: Somee provides error logs in control panel
5. **Update Regularly**: Re-upload when you make code changes

---

## 🚀 Alternative: Deploy Frontend Separately

Many developers do:
- **Backend (API)**: Somee.com → `http://api.somee.com`
- **Frontend (React)**: Vercel/Netlify → `https://app.vercel.app`

This way:
- Frontend loads fast (no ads)
- Backend API on Somee (free .NET hosting)

---

## 📞 Need Help?

- **Somee Support**: https://somee.com/support
- **Somee Forums**: Active community
- **Video Tutorial**: Search YouTube for "Deploy ASP.NET Core to Somee"

---

## Next Steps

1. ✅ Create Somee account
2. ✅ Build your application (`dotnet publish`)
3. ✅ Setup database on Somee
4. ✅ Upload files via FTP
5. ✅ Test your API
6. ✅ Add URL to your CV!

Good luck! 🚀
