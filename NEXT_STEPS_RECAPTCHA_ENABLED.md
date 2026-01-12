# Next Steps: reCAPTCHA Enterprise API is Enabled ✅

## Good News!

I can see from your screenshot that:
- ✅ **reCAPTCHA Enterprise API is ENABLED** (situation: `Enabled`)
- ✅ Service name: `recaptchaenterprise.googleapis.com`
- ✅ It's in your "Enabled APIs and Services" list

## What You Need to Do Next

Now that the API is enabled, you need to **add it to your API key restrictions**.

### Step 1: Go to Credentials

1. In the left sidebar, click **"User authentication information"** (the key icon)
   - OR
2. Click **"library"** → Then click **"User authentication information"** (Credentials)
   - OR
3. Use the breadcrumb at the top: Click **"APIs and Services"** → **"User authentication information"**

### Step 2: Find Your API Key

1. You'll see a list of API keys
2. Look for: **"Browser key (auto created by Firebase)"**
   - Or search for: `AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw`
3. Click on the API key name to edit it

### Step 3: Add reCAPTCHA Enterprise API to Restrictions

1. In the API key edit page, scroll to **"API limitations"** section
2. Make sure **"Key restrictions"** is selected (radio button)
3. Click the dropdown that shows the number of APIs (e.g., "24 APIs")
4. **Now "reCAPTCHA Enterprise API" should appear in the list!** ✅
   - Since you just enabled it, it should be there now
5. **Check the checkbox** next to "reCAPTCHA Enterprise API" ✅
6. Also verify these are checked:
   - ✅ **Identity Toolkit API**
   - ✅ **Firebase Authentication API**
   - ✅ **reCAPTCHA Enterprise API** ← **ADD THIS ONE**
7. Click **"OK"** or **"Save"** to close the dropdown

### Step 4: Save Changes

1. Scroll to the bottom of the page
2. Click **"Save"** button
3. Wait 2-3 minutes for changes to propagate

### Step 5: Test

1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Try sending OTP again
4. Check Network tab → Request payload
5. **Expected**: `captchaResponse` should NOT be "NO_RECAPTCHA"
6. **Expected**: Should see `200 OK` instead of `400 Bad Request`

## Quick Navigation from Where You Are

From the reCAPTCHA Enterprise API page:
1. Click **"APIs and Services"** in the top breadcrumb
2. Click **"User authentication information"** (Credentials)
3. Find and edit your API key
4. Add "reCAPTCHA Enterprise API" to restrictions

## If It's Still Not in the List

If "reCAPTCHA Enterprise API" still doesn't appear in the restrictions dropdown:

1. **Refresh the page** (the API was just enabled)
2. **Close and reopen** the API restrictions dropdown
3. **Search in the dropdown** using Ctrl+F (Cmd+F on Mac) and type "reCAPTCHA"
4. **Wait 1-2 more minutes** - sometimes it takes a moment to appear

## Summary

✅ **API is enabled** - Good!
⚠️ **Now add it to API key restrictions** - This is the missing step!

Go to: **Credentials** → **Edit API Key** → **API Restrictions** → **Check "reCAPTCHA Enterprise API"** ✅

This should fix the `INVALID_APP_CREDENTIAL` error! 🎯

