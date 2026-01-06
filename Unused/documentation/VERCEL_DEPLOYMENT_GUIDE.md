# BloodBridge Foundation - Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed: `npm install -g vercel`
- Git repository (recommended)

## Deployment Options

### Option A: Deploy via Vercel Dashboard (Recommended for First-Time)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Prepare for Vercel deployment"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import Project on Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect the framework

3. **Configure Build Settings**
   - **Framework Preset**: Other
   - **Root Directory**: Leave as `./` (root)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables** (Important!)
   In the Vercel dashboard, go to Settings > Environment Variables and add:
   
   **For Production:**
   ```
   JWT_SECRET=5750410de0a78b7610db038ba39c8d117076f0c79a60ac0ecdda1dd7103d71eacc25566767e21890a09613729f279a5ab396d7ce5e8e12225a5b7dcc78caf742
   MONGODB_URI=mongodb+srv://mdmunnamiaglobal:mongodb1321@cluster0.lfmxp.mongodb.net/bloodservice?retryWrites=true&w=majority&appName=Cluster0
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your site will be available at: `https://your-project-name.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from root directory**
   ```bash
   cd "c:\Work Station\Practicum\BloodBridge-Foundation"
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N` (first time) or `Y` (if already created)
   - What's your project's name? `bloodbridge-foundation`
   - In which directory is your code located? `./`

5. **Add Environment Variables via CLI**
   ```bash
   vercel env add JWT_SECRET
   vercel env add MONGODB_URI
   vercel env add NODE_ENV
   ```
   
   Or add them in the Vercel dashboard: Project Settings > Environment Variables

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Important Configuration Notes

### API URL Configuration
Your `.env.production` file already has:
```
VITE_API_URL=https://bloodbridge-five.vercel.app/api
```

**After deploying, update this to your actual Vercel URL:**
```
VITE_API_URL=https://your-actual-deployment-url.vercel.app/api
```

Then rebuild and redeploy:
```bash
cd client
npm run build
cd ..
vercel --prod
```

### Server Routes
The server is configured to handle routes at `/api/*`. Make sure all your API calls in the client use:
```javascript
axios.get('/api/endpoint')
```

### CORS Configuration
The server is already configured with CORS allowing all origins (`origin: "*"`). This is fine for development but consider restricting it in production for security.

## Troubleshooting

### Issue: API calls failing
- Check that `VITE_API_URL` matches your Vercel deployment URL
- Verify environment variables are set correctly in Vercel dashboard
- Check browser console for CORS errors

### Issue: MongoDB connection errors
- Verify `MONGODB_URI` is correctly set in Vercel environment variables
- Ensure MongoDB Atlas allows connections from all IPs (0.0.0.0/0) for Vercel
- Go to MongoDB Atlas > Network Access > Add IP Address > Allow Access from Anywhere

### Issue: Build fails
- Check that all dependencies are in `package.json`, not just `devDependencies`
- Ensure Node.js version compatibility in `package.json` engines field
- Review build logs in Vercel dashboard for specific errors

## Post-Deployment Checklist

✅ Client builds successfully (already done!)
✅ Environment variables added to Vercel
✅ MongoDB Atlas allows Vercel IP addresses
✅ Update `VITE_API_URL` to actual deployment URL
✅ Test all API endpoints
✅ Test authentication flow
✅ Test blood request/purchase functionality
✅ Set up custom domain (optional)

## Monitoring and Maintenance

- **View Logs**: Vercel Dashboard > Deployments > Click on deployment > Logs
- **Environment Variables**: Settings > Environment Variables
- **Domains**: Settings > Domains
- **Analytics**: Available in Vercel dashboard

## Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Firebase configuration if using Firebase Auth

## Security Recommendations

1. **Rotate JWT Secret**: Generate a new strong secret for production
2. **Restrict CORS**: Update server CORS to specific domains
3. **Environment Variables**: Never commit `.env` files (already in `.gitignore`)
4. **MongoDB Access**: Consider IP whitelisting if possible
5. **HTTPS**: Vercel automatically provides SSL certificates

## Useful Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View environment variables
vercel env ls

# Pull environment variables locally
vercel env pull

# View deployment logs
vercel logs

# Remove a deployment
vercel remove [deployment-url]
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Environment Variables Guide](https://vercel.com/docs/environment-variables)

---

**Note**: After first deployment, note your Vercel URL and update `VITE_API_URL` in `.env.production` accordingly, then rebuild and redeploy.
