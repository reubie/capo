# Fix: CAPTCHA_CHECK_FAILED - Hostname match not found

## The Problem

The error `CAPTCHA_CHECK_FAILED : Hostname match not found` means your **Vercel deployment domain** is not authorized in Firebase's reCAPTCHA configuration.

## Solution: Add Your Vercel Domain to Firebase

### Step 1: Find Your Vercel Deployment Domain

Your Vercel deployment URL should be something like:
- `https://your-project-name.vercel.app` (default)
- Or your custom domain if you have one

**To find it:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project: **jiome**
3. Go to **"Deployments"** tab
4. Click on the latest deployment
5. Copy the **URL** (e.g., `https://jiome.vercel.app` or `https://jiomeapp.com`)

### Step 2: Add Domain to Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **jiome** (or **jiome-f9f77**)
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Enter your Vercel domain:
   - If using default Vercel domain: `your-project-name.vercel.app` (without `https://`)
   - If using custom domain: `yourdomain.com` (without `https://`)
   - **Important**: Also add `*.vercel.app` to allow all Vercel preview deployments
6. Click **"Add"**

### Step 3: Add Domain to reCAPTCHA Enterprise (if using Enterprise)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **jiome-f9f77**
3. Go to **Security** → **reCAPTCHA Enterprise**
4. Find your reCAPTCHA key (or create one if you don't have one)
5. Click **Edit** (pencil icon)
6. In **"Domains"** section, add:
   ```
   localhost
   127.0.0.1
   *.vercel.app
   your-project-name.vercel.app
   yourdomain.com
   ```
   (Replace with your actual domains)
7. Click **"Save"**

### Step 4: Verify API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your API key: `AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw`
4. Click **Edit**
5. Under **"Application restrictions"** → **"HTTP referrers (web sites)"**:
   - Add: `https://*.vercel.app/*`
   - Add: `https://your-project-name.vercel.app/*`
   - Add: `https://yourdomain.com/*` (if you have custom domain)
   - Add: `http://localhost:*` (for local development)
6. Under **"API restrictions"**:
   - Make sure **"reCAPTCHA Enterprise API"** is checked ✅
   - Make sure **"Identity Toolkit API"** is checked ✅
   - Make sure **"Firebase Authentication API"** is checked ✅
7. Click **"Save"**

### Step 5: Redeploy

After making these changes:

1. Go back to [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **"Deployments"** tab
3. Click **"⋯"** (three dots) on the latest deployment
4. Click **"Redeploy"**
5. Wait for deployment to complete

## Quick Checklist

- [ ] Added Vercel domain to Firebase **Authorized domains**
- [ ] Added `*.vercel.app` to Firebase **Authorized domains** (for preview deployments)
- [ ] Added domain to reCAPTCHA Enterprise key (if using Enterprise)
- [ ] Added `https://*.vercel.app/*` to API key **HTTP referrers**
- [ ] Verified **reCAPTCHA Enterprise API** is in API key restrictions
- [ ] Redeployed the application

## Common Domains to Add

Based on your setup, you should add:

**Firebase Authorized Domains:**
- `localhost` (already there)
- `your-project-name.vercel.app`
- `*.vercel.app` (for all preview deployments)
- `yourdomain.com` (if you have a custom domain)

**API Key HTTP Referrers:**
- `http://localhost:*`
- `https://*.vercel.app/*`
- `https://your-project-name.vercel.app/*`
- `https://yourdomain.com/*`

## After Fixing

The error should be resolved and OTP should work on your deployed site! 🎯

