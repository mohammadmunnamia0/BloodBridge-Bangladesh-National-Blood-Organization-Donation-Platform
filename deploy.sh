#!/bin/bash

# BloodBridge Foundation - Quick Deployment Script

echo "🚀 BloodBridge Foundation - Vercel Deployment"
echo "=============================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📦 Building client..."
cd client
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Client build failed!"
    exit 1
fi

echo "✅ Client build successful!"
echo ""

cd ..

echo "🔐 Make sure you've set up environment variables in Vercel dashboard:"
echo "   - JWT_SECRET"
echo "   - MONGODB_URI"
echo "   - NODE_ENV=production"
echo ""

read -p "Have you set up environment variables in Vercel? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  Please set up environment variables first:"
    echo "   1. Go to https://vercel.com/dashboard"
    echo "   2. Select your project > Settings > Environment Variables"
    echo "   3. Add the required variables"
    echo ""
    exit 1
fi

echo ""
echo "🚀 Deploying to Vercel..."
echo "   Choose deployment type:"
echo "   - Press ENTER for preview deployment"
echo "   - Type 'prod' for production deployment"
read -p "Deployment type: " deployment_type

if [ "$deployment_type" = "prod" ]; then
    vercel --prod
else
    vercel
fi

echo ""
echo "✅ Deployment complete!"
echo "📝 Don't forget to:"
echo "   1. Note your deployment URL"
echo "   2. Update VITE_API_URL in .env.production if needed"
echo "   3. Rebuild and redeploy if API URL changed"
