# 🚀 Quick Deploy to Vercel - 5 Minutes

## Prerequisites
✅ Client is already built (you ran `npm run build` successfully!)

## Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

## Step 2: Setup MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to: **Network Access** → **Add IP Address**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **Confirm**

⚠️ **This is crucial** - Vercel needs to connect to your database!

## Step 3: Deploy to Vercel
```bash
vercel login
```

Then from your project root:
```bash
vercel
```

Follow the prompts:
- Setup and deploy? → **Y**
- Which scope? → **Select your account**
- Link to existing project? → **N**
- Project name? → **bloodbridge-foundation** (or press Enter)
- In which directory? → **. /** (just press Enter)
- Override settings? → **N**

## Step 4: Add Environment Variables

After deployment, go to [Vercel Dashboard](https://vercel.com/dashboard):

1. Click on your project
2. Go to **Settings** → **Environment Variables**
3. Add these three variables:

| Name | Value |
|------|-------|
| `JWT_SECRET` | `5750410de0a78b7610db038ba39c8d117076f0c79a60ac0ecdda1dd7103d71eacc25566767e21890a09613729f279a5ab396d7ce5e8e12225a5b7dcc78caf742` |
| `MONGODB_URI` | `mongodb+srv://mdmunnamiaglobal:mongodb1321@cluster0.lfmxp.mongodb.net/bloodservice?retryWrites=true&w=majority&appName=Cluster0` |
| `NODE_ENV` | `production` |

For each variable:
- Click **Add New**
- Enter the Name
- Enter the Value
- Select **Production**, **Preview**, and **Development**
- Click **Save**

## Step 5: Deploy to Production
```bash
vercel --prod
```

## Step 6: Test Your Site! 🎉

Vercel will give you a URL like:
```
https://bloodbridge-foundation-abc123.vercel.app
```

Visit it and test everything!

---

## If API URL is Different

If your deployment URL doesn't match `https://bloodbridge-five.vercel.app`:

1. Edit `client/.env.production`:
   ```
   VITE_API_URL=https://YOUR-ACTUAL-URL.vercel.app/api
   ```

2. Rebuild:
   ```bash
   cd client
   npm run build
   cd ..
   ```

3. Redeploy:
   ```bash
   vercel --prod
   ```

---

## Alternative: Use the Script

**Windows:**
```bash
deploy.bat
```

**Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Need Help?

- Check [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for detailed troubleshooting
- Check [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) for comprehensive guide
- View Vercel logs: `vercel logs`

---

**That's it! Your BloodBridge Foundation is now live! 🎉**
