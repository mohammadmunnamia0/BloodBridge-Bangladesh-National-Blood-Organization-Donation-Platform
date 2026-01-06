# Pre-Deployment Checklist

## ✅ Completed
- [x] Client builds successfully (`npm run build` in client folder)
- [x] vercel.json configured for monorepo deployment
- [x] .env.production configured with API URL
- [x] Server has vercel.json configuration
- [x] CORS configured in server

## ⚠️ Required Before Deployment

### 1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### 2. MongoDB Atlas Configuration
- [ ] Go to MongoDB Atlas Dashboard
- [ ] Navigate to Network Access
- [ ] Click "Add IP Address"
- [ ] Select "Allow Access from Anywhere" (0.0.0.0/0)
- [ ] Save changes

**Why?** Vercel serverless functions use dynamic IPs, so you need to allow all IPs.

### 3. Prepare Environment Variables
You'll need to add these to Vercel dashboard:

```
JWT_SECRET=5750410de0a78b7610db038ba39c8d117076f0c79a60ac0ecdda1dd7103d71eacc25566767e21890a09613729f279a5ab396d7ce5e8e12225a5b7dcc78caf742
MONGODB_URI=mongodb+srv://mdmunnamiaglobal:mongodb1321@cluster0.lfmxp.mongodb.net/bloodservice?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=production
```

### 4. Security Recommendations (Optional but Recommended)
- [ ] Generate a new JWT_SECRET for production (use: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- [ ] Create a separate MongoDB database for production
- [ ] Consider restricting CORS to your actual domain

## 🚀 Deployment Steps

### Quick Deploy (Using Script)
```bash
# On Windows
deploy.bat

# On Mac/Linux
chmod +x deploy.sh
./deploy.sh
```

### Manual Deploy

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy (First Time - Preview)**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Setup and deploy? **Y**
   - Which scope? **Select your account**
   - Link to existing project? **N**
   - Project name? **bloodbridge-foundation**
   - In which directory? **./  (press Enter)**
   - Override settings? **N**

3. **Add Environment Variables**
   - Go to Vercel Dashboard: https://vercel.com/dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add each variable:
     - JWT_SECRET
     - MONGODB_URI
     - NODE_ENV (set to "production")

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## 📝 Post-Deployment Steps

### 1. Note Your Deployment URL
After deployment, Vercel will give you a URL like:
```
https://bloodbridge-foundation-xyz123.vercel.app
```

### 2. Update API URL (If Different)
If your deployment URL is different from `https://bloodbridge-five.vercel.app`:

1. Edit `.env.production`:
   ```
   VITE_API_URL=https://YOUR-ACTUAL-URL.vercel.app/api
   ```

2. Rebuild client:
   ```bash
   cd client
   npm run build
   cd ..
   ```

3. Redeploy:
   ```bash
   vercel --prod
   ```

### 3. Test Your Deployment

Visit your deployment URL and test:
- [ ] Homepage loads correctly
- [ ] Can navigate between pages
- [ ] Login/Register works
- [ ] Blood request functionality works
- [ ] Blood purchase functionality works
- [ ] Admin panel works
- [ ] Check browser console for errors

### 4. Monitor Logs
```bash
vercel logs
```

Or view in dashboard: Deployments > Click deployment > Logs

## 🔧 Troubleshooting

### Issue: "API calls are failing"
**Solution**: 
- Check VITE_API_URL in .env.production matches your Vercel URL
- Verify environment variables in Vercel dashboard
- Check browser console for actual error messages

### Issue: "MongoDB connection failed"
**Solution**:
- Verify MONGODB_URI in Vercel environment variables
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Check MongoDB connection string is correct

### Issue: "Module not found errors"
**Solution**:
- Make sure all dependencies are in `dependencies`, not `devDependencies`
- Run `npm install` in both client and server folders
- Clear Vercel build cache: Deployments > Settings > Clear Build Cache

### Issue: "Build failed"
**Solution**:
- Check build logs in Vercel dashboard
- Ensure Node.js version compatibility
- Try building locally first: `npm run build:client`

## 📞 Need Help?

- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- MongoDB Atlas Support: https://www.mongodb.com/docs/atlas/

## 🎉 You're Ready!

Your BloodBridge Foundation app is ready for deployment. Follow the steps above and you'll be live in minutes!
