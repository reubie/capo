# CRITICAL FIX: captchaResponse: "NO_RECAPTCHA"

## The Problem

Your payload shows:
```javascript
captchaResponse: "NO_RECAPTCHA"  // ❌ THIS IS WRONG
recaptchaToken: "0cAFcWeA7U8Qb..."  // ✅ Token exists
recaptchaVersion: "RECAPTCHA_ENTERPRISE"  // ✅ Version is correct
```

**This means:**
- Firebase is generating a reCAPTCHA token ✅
- But Google's API sees it as "NO_RECAPTCHA" ❌
- This causes `INVALID_APP_CREDENTIAL` error

## Root Cause

The `captchaResponse: "NO_RECAPTCHA"` indicates:
1. **reCAPTCHA Enterprise API is not enabled** OR
2. **reCAPTCHA Enterprise API is not in API key restrictions** OR
3. **reCAPTCHA Enterprise key is not properly linked to Firebase**

## Exact Fix Steps

### Step 1: Enable reCAPTCHA Enterprise API (CRITICAL)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure project: **jiome-f9f77**
3. Navigate to: **APIs & Services** → **Library**
4. Search for: **"reCAPTCHA Enterprise API"**
5. If it shows **"Enable"**, click it
6. Wait 1-2 minutes for it to enable
7. Verify it shows **"Manage"** (meaning enabled)

### Step 2: Add reCAPTCHA Enterprise API to API Key Restrictions

1. Go to **APIs & Services** → **Credentials**
2. Find API key: `AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw`
3. Click **Edit**
4. Under **"API limitations"**:
   - Make sure **"Key restrictions"** is selected
   - Click the dropdown (shows number of APIs)
   - **CRITICAL**: Check **"reCAPTCHA Enterprise API"** ✅
   - Also check:
     - ✅ **Identity Toolkit API**
     - ✅ **Firebase Authentication API**
     - ✅ **reCAPTCHA Enterprise API** ← **THIS ONE IS MISSING!**
5. Click **Save**
6. Wait 2-3 minutes

### Step 3: Verify reCAPTCHA Enterprise Key Exists

1. Go to **Security** → **reCAPTCHA Enterprise**
2. Check if you have a key created
3. If not, create one:
   - Click **"Create Key"**
   - Platform: **Web**
   - Domains: `localhost`, `127.0.0.1`, `*.vercel.app`, `jiomeapp.com`
   - Save

### Step 4: Temporarily Remove Application Restrictions (For Testing)

1. In the same API key edit page
2. Under **"Application Restrictions"**:
   - Set to **"doesn't exist"** (temporarily)
3. Click **Save**
4. Wait 2-3 minutes
5. Test again
6. If it works, add restrictions back gradually

### Step 5: Test and Verify

1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Try sending OTP
4. Check Network tab → Request payload
5. **Expected**: `captchaResponse` should NOT be "NO_RECAPTCHA"
6. **Expected**: Should see `200 OK` instead of `400 Bad Request`

## Why This Happens

When `captchaResponse: "NO_RECAPTCHA"` appears:
- Firebase generates a token
- But can't validate it with Google's reCAPTCHA Enterprise API
- Because the API key doesn't have permission to use reCAPTCHA Enterprise API
- Google's API rejects it as invalid

## Checklist

- [ ] reCAPTCHA Enterprise API enabled in Library
- [ ] reCAPTCHA Enterprise API added to API key restrictions
- [ ] Identity Toolkit API in API key restrictions
- [ ] Firebase Authentication API in API key restrictions
- [ ] Application Restrictions set to "doesn't exist" (for testing)
- [ ] reCAPTCHA Enterprise key created
- [ ] Waited 2-3 minutes after changes
- [ ] Cleared browser cache
- [ ] Tested - `captchaResponse` should NOT be "NO_RECAPTCHA"

## Most Likely Issue

**You've enabled Identity Toolkit API and Firebase Authentication API, but forgot to add reCAPTCHA Enterprise API to the API key restrictions!**

This is why:
- ✅ Token is generated
- ✅ Version is correct
- ❌ But `captchaResponse: "NO_RECAPTCHA"` (can't validate)

## Quick Fix

1. **APIs & Services** → **Credentials** → Edit API Key
2. **API Restrictions** → Open dropdown
3. **Check "reCAPTCHA Enterprise API"** ✅
4. Save
5. Wait 2-3 minutes
6. Test

This should fix it! 🎯

