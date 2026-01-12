# Fix: INVALID_APP_CREDENTIAL Error

## Error Message
```json
{
  "error": {
    "code": 400,
    "message": "INVALID_APP_CREDENTIAL",
    "errors": [
      {
        "message": "INVALID_APP_CREDENTIAL",
        "domain": "global",
        "reason": "invalid"
      }
    ]
  }
}
```

## ✅ Completed Steps

### Approved Domains (DONE ✅)
You've already added the following approved domains:
- ✅ `localhost` (Default)
- ✅ `127.0.0.1` (Custom) - **Just added!**
- ✅ `jiome-f9f77.firebaseapp.com` (Default)
- ✅ `jiome-f9f77.web.app` (Default)

**Note:** Approved domains help with OAuth redirects, but INVALID_APP_CREDENTIAL is usually caused by API key restrictions or missing APIs. Continue checking the items below.

## Quick Fix: Temporarily Remove Restrictions

### Step 1: Remove Application Restrictions (Temporary Test)

1. In the API key edit page
2. Under **"Application Restrictions"**
3. Select **"doesn't exist"** (no restrictions)
4. Click **"Save"**
5. Wait 1-2 minutes
6. Test your app again

### Step 2: If It Works, Add Restrictions Back Gradually

If removing restrictions fixes it, then restrictions were the issue. Add them back one by one:

1. Set to **"website"**
2. Add only `http://localhost:*` first
3. Test
4. If works, add `https://*.vercel.app/*`
5. Test
6. Continue adding domains one by one

## Other Common Causes (Check These Too)

### Cause 1: API Restrictions Missing Required APIs

Even with no application restrictions, API restrictions might be blocking it.

**Check:**
1. In **"API limitations"** section
2. Click the dropdown showing "24 APIs"
3. Make sure these are **checked**:
   - ✅ **Identity Toolkit API** (CRITICAL for phone auth)
   - ✅ **Firebase Authentication API** (CRITICAL)
   - ✅ **Firebase Installations API** (if available)

**If missing:**
1. Go to **APIs & Services** → **Library**
2. Search for "Identity Toolkit API"
3. Click **"Enable"** if not enabled
4. Search for "Firebase Authentication API"
5. Click **"Enable"** if not enabled
6. Go back to API key edit page
7. These APIs should now appear in the dropdown

### Cause 2: Phone Authentication Not Enabled

**Check:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **jiome**
3. Go to **Authentication** → **Sign-in method**
4. Find **Phone** in the list
5. Make sure it's **Enabled** (should show a green toggle)

**If not enabled:**
1. Click on **Phone**
2. Toggle **"Enable"** to ON
3. Click **"Save"**

### Cause 3: Firebase Configuration Mismatch

**Check your `.env` file:**
```bash
VITE_FIREBASE_API_KEY=AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw
VITE_FIREBASE_AUTH_DOMAIN=jiome-f9f77.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jiome-f9f77
VITE_FIREBASE_STORAGE_BUCKET=jiome-f9f77.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=21306379382
VITE_FIREBASE_APP_ID=1:21306379382:web:d074f1131a73eb85122357
```

**Verify in Firebase Console:**
1. Firebase Console → Project Settings (gear icon)
2. Scroll to **"Your apps"** section
3. Click on your web app
4. Compare the values with your `.env` file
5. They must match exactly

### Cause 4: reCAPTCHA Issues (Blaze Plan)

Since you're on Blaze plan, reCAPTCHA Enterprise might be required.

**Check:**
1. Go to Google Cloud Console
2. Navigate to **Security** → **reCAPTCHA Enterprise**
3. Make sure you have a reCAPTCHA key configured
4. If not, create one:
   - Click **"Create Key"**
   - Choose **"Web"** platform
   - Add domains: `localhost`, `*.vercel.app`, `jiomeapp.com`
   - Save

## Recommended Troubleshooting Order

1. ✅ **Approved Domains**: Already added (`localhost`, `127.0.0.1`, etc.) ✅
2. ⚠️ **First**: Remove application restrictions (temporary test) - **CHECK THIS**
3. ⚠️ **Second**: Verify API restrictions include Identity Toolkit API - **CHECK THIS**
4. ⚠️ **Third**: Verify Phone Authentication is enabled - **CHECK THIS**
5. ⚠️ **Fourth**: Verify Firebase config matches exactly - **CHECK THIS**
6. ⚠️ **Fifth**: Check reCAPTCHA Enterprise (if on Blaze) - **CHECK THIS**

## After Fixing

Once it works:
1. **Add restrictions back** (for security)
2. **Test each domain** one by one
3. **Keep the working configuration**

## Still Not Working?

**Important:** Adding approved domains (`127.0.0.1`, `localhost`) helps with OAuth redirects, but **INVALID_APP_CREDENTIAL is usually NOT caused by approved domains**. 

The most common causes are:
1. ⚠️ **API key restrictions** blocking the request (Application restrictions or API restrictions)
2. ⚠️ **Missing Identity Toolkit API** in API restrictions (CRITICAL - check this!)
3. ⚠️ **Phone Authentication not enabled** in Firebase Console
4. ⚠️ **Firebase config mismatch** (values in `.env` don't match Firebase Console)
5. ⚠️ **reCAPTCHA Enterprise** not configured (for Blaze plan)

**Next Steps:**
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit your API key: `AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw`
3. **Temporarily remove Application Restrictions** (set to "doesn't exist")
4. **Verify API Restrictions** include Identity Toolkit API
5. Test your app
6. If it works, add restrictions back gradually

