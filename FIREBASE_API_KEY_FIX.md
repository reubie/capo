# Fix for auth/invalid-app-credential Error

## Current Status ✅
- Phone Authentication is **ENABLED** in Firebase Console
- Blaze plan is active
- App is registered

## The Problem
The `auth/invalid-app-credential` error means the API key can't authenticate your app. This is usually due to API key restrictions.

## Solution: Fix API Key Restrictions

### Step 1: Go to Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in project: **jiome-f9f77**
3. If you see a different project, click the project dropdown at the top and select **jiome-f9f77**

### Step 2: Find Your API Key
1. In the left sidebar, click **APIs & Services** → **Credentials**
2. Look for your API key: `AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw`
3. Click on the API key name to edit it

### Step 3: Configure Application Restrictions
1. Under **Application restrictions**, select **HTTP referrers (web sites)**
2. Click **Add an item**
3. Add these referrers (one per line):
   ```
   http://localhost:*
   https://localhost:*
   http://127.0.0.1:*
   https://*.vercel.app/*
   https://jiomeapp.com/*
   ```
4. Click **Save** after adding each one

### Step 4: Configure API Restrictions
1. Under **API restrictions**, select **Restrict key**
2. Make sure these APIs are checked:
   - ✅ **Identity Toolkit API** (REQUIRED for phone auth)
   - ✅ **Firebase Authentication API** (REQUIRED)
   - ✅ **Firebase Installations API** (if available)
3. Click **Save**

### Step 5: Verify APIs are Enabled
1. Go to **APIs & Services** → **Library**
2. Search for "Identity Toolkit API"
3. If it's not enabled, click **Enable**
4. Search for "Firebase Authentication API"
5. If it's not enabled, click **Enable**

### Step 6: Test
1. Wait 1-2 minutes for changes to propagate
2. Refresh your app
3. Try sending OTP again

## Alternative: Temporarily Remove Restrictions (For Testing)

If you want to test quickly:

1. Edit your API key
2. Under **Application restrictions**, select **None**
3. Under **API restrictions**, select **Don't restrict key**
4. Click **Save**
5. Test OTP sending
6. **IMPORTANT**: After testing, add restrictions back for security

## Common Issues

### Issue: "API key not valid"
- Make sure you're editing the correct API key
- Verify the key matches what's in your `.env` file

### Issue: "This API key is restricted"
- Check that your domain is in the HTTP referrers list
- Make sure Identity Toolkit API is enabled

### Issue: Still getting errors after fixing
- Wait a few minutes for changes to propagate
- Clear browser cache
- Try in incognito mode

