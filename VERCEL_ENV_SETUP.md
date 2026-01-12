# Set Firebase Environment Variables in Vercel

## The Problem

Your deployment is failing because Firebase environment variables are not set in Vercel. The `.env` file only works for local development - Vercel needs them set in the dashboard.

## Quick Fix: Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **jiome**

### Step 2: Navigate to Environment Variables

1. Click on **"Settings"** (in the top navigation)
2. Click on **"Environment Variables"** (in the left sidebar)

### Step 3: Add Each Firebase Variable

Add these variables one by one:

#### Variable 1: VITE_FIREBASE_API_KEY
- **Key**: `VITE_FIREBASE_API_KEY`
- **Value**: `AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **"Save"**

#### Variable 2: VITE_FIREBASE_AUTH_DOMAIN
- **Key**: `VITE_FIREBASE_AUTH_DOMAIN`
- **Value**: `jiome-f9f77.firebaseapp.com`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **"Save"**

#### Variable 3: VITE_FIREBASE_PROJECT_ID
- **Key**: `VITE_FIREBASE_PROJECT_ID`
- **Value**: `jiome-f9f77`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **"Save"**

#### Variable 4: VITE_FIREBASE_STORAGE_BUCKET
- **Key**: `VITE_FIREBASE_STORAGE_BUCKET`
- **Value**: `jiome-f9f77.firebasestorage.app`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **"Save"**

#### Variable 5: VITE_FIREBASE_MESSAGING_SENDER_ID
- **Key**: `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Value**: `21306379382`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **"Save"**

#### Variable 6: VITE_FIREBASE_APP_ID
- **Key**: `VITE_FIREBASE_APP_ID`
- **Value**: `1:21306379382:web:d074f1131a73eb85122357`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **"Save"**

#### Variable 7: VITE_FIREBASE_MEASUREMENT_ID
- **Key**: `VITE_FIREBASE_MEASUREMENT_ID`
- **Value**: `G-5116RR4J5Z`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **"Save"**

#### Variable 8: VITE_API_BASE_URL
- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://jiomeapp.com`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click **"Save"**

### Step 4: Redeploy

After adding all variables:

1. Go to **"Deployments"** tab
2. Find the latest deployment (the one that failed)
3. Click the **"⋯"** (three dots) menu
4. Click **"Redeploy"**
5. Wait for deployment to complete (1-3 minutes)

## Quick Copy-Paste Values

Here are all the values you need:

```
VITE_FIREBASE_API_KEY=AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw
VITE_FIREBASE_AUTH_DOMAIN=jiome-f9f77.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jiome-f9f77
VITE_FIREBASE_STORAGE_BUCKET=jiome-f9f77.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=21306379382
VITE_FIREBASE_APP_ID=1:21306379382:web:d074f1131a73eb85122357
VITE_FIREBASE_MEASUREMENT_ID=G-5116RR4J5Z
VITE_API_BASE_URL=https://jiomeapp.com
```

## Important Notes

1. **Select All Environments**: Make sure to check ✅ Production, ✅ Preview, ✅ Development for each variable
2. **Redeploy Required**: After setting variables, you MUST redeploy for them to take effect
3. **Variable Names**: Must start with `VITE_` prefix (Vite requirement)
4. **No Spaces**: Don't add spaces around the `=` sign when entering values

## After Setting Variables

1. ✅ All 8 variables added
2. ✅ All environments selected for each
3. ✅ Redeploy triggered
4. ✅ Wait for deployment to complete
5. ✅ Test the deployed site

## Verification

After redeploying, the error should be gone and your app should load correctly! 🎯

