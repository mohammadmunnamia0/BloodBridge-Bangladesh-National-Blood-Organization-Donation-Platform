@echo off
REM BloodBridge Foundation - Quick Deployment Script for Windows

echo ========================================
echo BloodBridge Foundation - Vercel Deployment
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI not found. Installing...
    call npm install -g vercel
)

echo Building client...
cd client
call npm install
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Client build failed!
    exit /b 1
)

echo Client build successful!
echo.

cd ..

echo.
echo Make sure you have set up environment variables in Vercel dashboard:
echo    - JWT_SECRET
echo    - MONGODB_URI
echo    - NODE_ENV=production
echo.

set /p "confirm=Have you set up environment variables in Vercel? (y/n): "
if /i not "%confirm%"=="y" (
    echo.
    echo Please set up environment variables first:
    echo    1. Go to https://vercel.com/dashboard
    echo    2. Select your project - Settings - Environment Variables
    echo    3. Add the required variables
    echo.
    exit /b 1
)

echo.
echo Deploying to Vercel...
echo Choose deployment type:
echo    - Press ENTER for preview deployment
echo    - Type 'prod' for production deployment
set /p "deployment_type=Deployment type: "

if /i "%deployment_type%"=="prod" (
    call vercel --prod
) else (
    call vercel
)

echo.
echo Deployment complete!
echo.
echo Don't forget to:
echo    1. Note your deployment URL
echo    2. Update VITE_API_URL in .env.production if needed
echo    3. Rebuild and redeploy if API URL changed
echo.
pause
