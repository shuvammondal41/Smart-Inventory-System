@echo off
echo ========================================
echo Building Smart Inventory API for Somee
echo ========================================
echo.

cd Backend\SmartInventory.API

echo Cleaning previous builds...
if exist publish rmdir /s /q publish

echo.
echo Building in Release mode...
dotnet publish -c Release -o ./publish

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Files ready in: Backend\SmartInventory.API\publish
echo.
echo Next Steps:
echo 1. Update appsettings.Production.json with your Somee database credentials
echo 2. Copy appsettings.Production.json to the publish folder and rename to appsettings.json
echo 3. Upload all files from the publish folder to Somee via FTP
echo.
echo See SOMEE-DEPLOYMENT-GUIDE.md for detailed instructions
echo.
pause
