# reCAPTCHA Enterprise Setup Guide - CRITICAL FIX

## ⚠️ Critical Issue

Your logs show:
```
Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.
```

**This is likely the root cause of `INVALID_APP_CREDENTIAL`!**

For Blaze plan, reCAPTCHA Enterprise is **REQUIRED** for phone authentication. If it's not properly configured, Firebase will reject the request.

## Step-by-Step: Configure reCAPTCHA Enterprise

### Step 1: Go to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure project is: **jiome-f9f77**
3. If not, click project dropdown and select **jiome-f9f77**

### Step 2: Navigate to reCAPTCHA Enterprise

1. In the left sidebar, look for **"Security"** section
2. Click **"reCAPTCHA Enterprise"**
3. If you don't see it, search for "reCAPTCHA" in the search bar

### Step 3: Create reCAPTCHA Enterprise Key

1. Click **"Create Key"** button (top of the page)
2. **Key name**: Enter something like "Firebase Phone Auth" or "jiome-web-app"
3. **Platform**: Select **"Web"**
4. **Domains**: Add these domains (one per line):
   ```
   localhost
   127.0.0.1
   *.vercel.app
   jiomeapp.com
   ```
5. **reCAPTCHA type**: Select **"reCAPTCHA Enterprise"** (not v2 or v3)
6. Click **"Create"** or **"Save"**

### Step 4: Copy the Site Key (Optional - for reference)

After creating, you'll see a **Site Key** and **Secret Key**. You don't need to use these directly - Firebase handles it automatically, but keep them for reference.

### Step 5: Enable reCAPTCHA Enterprise API

1. Go to **APIs & Services** → **Library**
2. Search for **"reCAPTCHA Enterprise API"**
3. If it shows **"Enable"**, click it
4. Wait 1-2 minutes for it to enable

### Step 6: Link reCAPTCHA Enterprise to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **jiome**
3. Go to **Authentication** → **Settings** → **reCAPTCHA**
4. You should see reCAPTCHA Enterprise settings
5. If there's an option to link your Google Cloud reCAPTCHA Enterprise key, do it
6. Or Firebase should automatically detect it (since it's in the same project)

### Step 7: Verify Configuration

1. Go back to Google Cloud Console
2. **Security** → **reCAPTCHA Enterprise**
3. You should see your key listed
4. Click on it to verify domains are correct

### Step 8: Wait and Test

1. Wait **2-3 minutes** for changes to propagate
2. Clear browser cache
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Try sending OTP again
5. **The warning should disappear**: "Failed to initialize reCAPTCHA Enterprise config" should NOT appear

## Alternative: Check if reCAPTCHA Enterprise is Already Created

1. Go to **Security** → **reCAPTCHA Enterprise**
2. Check if you have any keys listed
3. If yes:
   - Click on the key
   - Verify domains include: `localhost`, `127.0.0.1`, `*.vercel.app`, `jiomeapp.com`
   - If missing, edit the key and add missing domains

## Troubleshooting

### Issue: "reCAPTCHA Enterprise" not visible in Google Cloud Console

**Solution:**
1. Make sure you're in the correct project: **jiome-f9f77**
2. reCAPTCHA Enterprise might be under a different name
3. Try searching for "reCAPTCHA" in the search bar
4. Or go to: **APIs & Services** → **Library** → Search "reCAPTCHA Enterprise API" → Enable it first

### Issue: Can't add domains

**Solution:**
- Make sure you're using the **Web** platform type
- Domains should be added one per line
- Wildcards like `*.vercel.app` are allowed

### Issue: Still getting the warning after setup

**Solution:**
1. Wait 5-10 minutes (can take time to propagate)
2. Clear browser cache completely
3. Try in incognito/private window
4. Check Firebase Console → Authentication → Settings → reCAPTCHA
5. Verify the key is linked to Firebase

## Expected Result

After proper setup, you should **NOT** see:
```
Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.
```

Instead, you should see:
```
✅ reCAPTCHA verified successfully
✅ Step 7 passed: signInWithPhoneNumber succeeded
```

## Why This Matters

For **Blaze plan**:
- reCAPTCHA Enterprise is **required** for phone authentication
- Without it, Firebase falls back to v2, which may not work properly
- This can cause `INVALID_APP_CREDENTIAL` errors

## Quick Checklist

- [ ] reCAPTCHA Enterprise key created in Google Cloud Console
- [ ] Key type is "Web"
- [ ] Domains added: localhost, 127.0.0.1, *.vercel.app, jiomeapp.com
- [ ] reCAPTCHA Enterprise API enabled in APIs & Services → Library
- [ ] Waited 2-3 minutes after setup
- [ ] Cleared browser cache
- [ ] Tested again - warning should be gone

## Summary

**The `INVALID_APP_CREDENTIAL` error is likely caused by missing reCAPTCHA Enterprise configuration.**

Follow the steps above to set up reCAPTCHA Enterprise, and the error should be resolved! 🎯

