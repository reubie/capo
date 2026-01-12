# Vercel Deployment Guide

## Setting Environment Variables in Vercel

Your application requires environment variables to be set in Vercel for deployment to work correctly.

### Method 1: Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (jiome)
3. Click on **Settings** → **Environment Variables**
4. Add each of the following variables:

#### Firebase Configuration (Blaze Account)
```
VITE_FIREBASE_API_KEY = AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw
VITE_FIREBASE_AUTH_DOMAIN = jiome-f9f77.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = jiome-f9f77
VITE_FIREBASE_STORAGE_BUCKET = jiome-f9f77.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 21306379382
VITE_FIREBASE_APP_ID = 1:21306379382:web:d074f1131a73eb85122357
VITE_FIREBASE_MEASUREMENT_ID = G-5116RR4J5Z
```

#### API Configuration
```
VITE_API_BASE_URL = https://jiomeapp.com
```

5. For each variable, select all environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

6. Click **Save** for each variable

7. **Redeploy** your project:
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Click **Redeploy**

### Method 2: Vercel CLI

If you have Vercel CLI installed, you can set environment variables via command line:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables (you'll be prompted to enter values)
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
vercel env add VITE_FIREBASE_MEASUREMENT_ID
vercel env add VITE_API_BASE_URL

# Redeploy
vercel --prod
```

### Important Notes

- Environment variables must be set in Vercel for the deployment to work
- The `.env` file is only used for local development
- After setting environment variables, you **must redeploy** for changes to take effect
- Vite requires the `VITE_` prefix for environment variables to be exposed to the client

### Troubleshooting

If you still see the error after setting environment variables:

1. **Verify variables are set**: Check Vercel Dashboard → Settings → Environment Variables
2. **Redeploy**: Make sure you've redeployed after setting variables
3. **Check variable names**: Ensure they start with `VITE_` prefix
4. **Check environments**: Make sure variables are enabled for Production environment

