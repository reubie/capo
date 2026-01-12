# Enable reCAPTCHA Enterprise API First

## Why It's Not in the List

If "reCAPTCHA Enterprise API" is not in your API restrictions list, it means the API is **not enabled** in your project yet. You need to enable it first.

## Step-by-Step: Enable reCAPTCHA Enterprise API

### Step 1: Go to APIs & Services Library

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure project: **jiome-f9f77**
3. In the left sidebar, click **"APIs & Services"**
4. Click **"Library"** (in the submenu or main content area)

### Step 2: Search for reCAPTCHA Enterprise API

1. In the search bar at the top, type: **"reCAPTCHA Enterprise API"**
2. Or search for: **"reCAPTCHA Enterprise"**
3. Look for the result that says:
   - **"reCAPTCHA Enterprise API"** or
   - **"Cloud reCAPTCHA Enterprise API"**

### Step 3: Enable the API

1. Click on **"reCAPTCHA Enterprise API"** from the search results
2. You'll see a page with API details
3. Look for a button that says:
   - **"Enable"** (if not enabled)
   - **"Manage"** (if already enabled)
4. If it says **"Enable"**, click it
5. Wait 1-2 minutes for it to enable
6. You should see a confirmation message

### Step 4: Verify It's Enabled

1. Go back to **APIs & Services** → **Library**
2. Search for "reCAPTCHA Enterprise API" again
3. It should now show **"Manage"** instead of "Enable"
4. This means it's enabled ✅

### Step 5: Now Add It to API Key Restrictions

1. Go to **APIs & Services** → **Credentials**
2. Edit your API key: `AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw`
3. Under **"API limitations"**:
   - Make sure **"Key restrictions"** is selected
   - Click the dropdown
   - **Now "reCAPTCHA Enterprise API" should appear in the list!**
   - Check the checkbox ✅
4. Save

## Alternative Names to Search For

If you can't find "reCAPTCHA Enterprise API", try searching for:
- **"reCAPTCHA Enterprise"**
- **"Cloud reCAPTCHA Enterprise"**
- **"reCAPTCHA"** (and look for Enterprise version)

## If You Still Can't Find It

### Option 1: Check if It's Already Enabled

1. Go to **APIs & Services** → **Enabled APIs**
2. Look for any reCAPTCHA-related APIs
3. If you see "reCAPTCHA Enterprise API" there, it's already enabled
4. Go back to API key restrictions and it should appear

### Option 2: Enable via Direct Link

1. Try this direct link (replace PROJECT_ID with your project ID):
   ```
   https://console.cloud.google.com/apis/library/recaptchaenterprise.googleapis.com?project=jiome-f9f77
   ```
2. Or go to: **APIs & Services** → **Library** → Search "recaptchaenterprise"
3. Click on the result and enable it

### Option 3: Check API Name Variations

The API might be listed as:
- "reCAPTCHA Enterprise API"
- "Cloud reCAPTCHA Enterprise API"
- "reCAPTCHA Enterprise"
- "Google reCAPTCHA Enterprise API"

Try searching for each variation.

## Quick Checklist

- [ ] Go to APIs & Services → Library
- [ ] Search "reCAPTCHA Enterprise API"
- [ ] Click on the result
- [ ] Click "Enable" button
- [ ] Wait 1-2 minutes
- [ ] Verify it shows "Manage" (enabled)
- [ ] Go to Credentials → Edit API Key
- [ ] Open API restrictions dropdown
- [ ] "reCAPTCHA Enterprise API" should now be in the list
- [ ] Check the checkbox ✅
- [ ] Save

## After Enabling

1. **Wait 1-2 minutes** for the API to fully enable
2. **Go back to API key restrictions**
3. **Refresh the dropdown** (close and reopen it)
4. **"reCAPTCHA Enterprise API" should now appear**
5. **Check it** ✅
6. **Save the API key**
7. **Wait 2-3 minutes** for changes to propagate
8. **Test again**

## Summary

**The API needs to be enabled first before it appears in the restrictions list.**

1. Enable: **APIs & Services** → **Library** → Search "reCAPTCHA Enterprise API" → Enable
2. Add to restrictions: **Credentials** → Edit API Key → API Restrictions → Check "reCAPTCHA Enterprise API"

This should make it appear in your API restrictions list! 🎯

