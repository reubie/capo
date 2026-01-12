# How to Add reCAPTCHA Enterprise API to API Key Restrictions

## Step-by-Step Instructions

### Step 1: Go to Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in project: **jiome-f9f77**
   - Check the project dropdown at the top
   - If it shows a different project, click it and select **jiome-f9f77**

### Step 2: Navigate to Credentials

1. In the left sidebar, find **"APIs & Services"**
2. Click on **"APIs & Services"**
3. Click on **"Credentials"** (in the submenu or main content area)

### Step 3: Find Your API Key

1. You'll see a list of API keys
2. Look for: **"Browser key (auto created by Firebase)"**
   - Or search for: `AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw`
3. Click on the API key name (or the edit icon) to edit it

### Step 4: Open API Restrictions

1. In the API key edit page, scroll down to **"API limitations"** section
2. Make sure **"Key restrictions"** is selected (radio button)
   - If "No height restrictions" is selected, change it to **"Key restrictions"**
3. You'll see a dropdown that shows something like:
   - **"24 APIs"** or
   - **"Restrict key"** with a number
4. **Click on this dropdown** to open the list of APIs

### Step 5: Add reCAPTCHA Enterprise API

1. The dropdown will show a list of APIs with checkboxes
2. **Scroll through the list** and look for:
   - **"reCAPTCHA Enterprise API"** ← **THIS IS WHAT YOU NEED**
   - It might be listed as:
     - "reCAPTCHA Enterprise API"
     - "Cloud reCAPTCHA Enterprise API"
     - "reCAPTCHA Enterprise"
3. **Check the checkbox** next to "reCAPTCHA Enterprise API" ✅
4. While you're there, also verify these are checked:
   - ✅ **Identity Toolkit API**
   - ✅ **Firebase Authentication API**
   - ✅ **reCAPTCHA Enterprise API** ← **ADD THIS ONE**
5. Click **"OK"** or **"Save"** to close the dropdown

### Step 6: Save Changes

1. Scroll to the bottom of the page
2. Click **"Save"** button
3. Wait for confirmation message
4. **Wait 2-3 minutes** for changes to propagate

### Step 7: Verify It's Added

1. Go back to the API key edit page
2. Click the API restrictions dropdown again
3. Verify **"reCAPTCHA Enterprise API"** is checked ✅
4. You should see it in the list with a checkmark

## Visual Guide

```
Google Cloud Console
  └─ APIs & Services
      └─ Credentials
          └─ [Click on your API key]
              └─ API limitations section
                  └─ "Key restrictions" (selected)
                      └─ [Click dropdown showing "24 APIs"]
                          └─ [Scroll and find "reCAPTCHA Enterprise API"]
                              └─ [Check the checkbox] ✅
                                  └─ [Click OK/Save]
                                      └─ [Save the API key]
```

## If You Can't Find "reCAPTCHA Enterprise API" in the List

### Option 1: Enable the API First

1. Go to **APIs & Services** → **Library**
2. Search for **"reCAPTCHA Enterprise API"**
3. If it shows **"Enable"**, click it
4. Wait 1-2 minutes
5. Go back to API key restrictions
6. It should now appear in the list

### Option 2: Search in the Dropdown

1. When the API restrictions dropdown is open
2. Use **Ctrl+F** (or Cmd+F on Mac) to search
3. Type: **"reCAPTCHA"**
4. It should highlight "reCAPTCHA Enterprise API"
5. Check the checkbox

## Common Issues

### Issue: Dropdown is Empty or Shows "No APIs"

**Solution:**
- Make sure **"Key restrictions"** is selected (not "No height restrictions")
- If still empty, enable some APIs first in **APIs & Services** → **Library**

### Issue: Can't Find "reCAPTCHA Enterprise API"

**Solution:**
1. Enable it first: **APIs & Services** → **Library** → Search "reCAPTCHA Enterprise API" → Enable
2. Wait 1-2 minutes
3. Go back to API key restrictions
4. It should appear now

### Issue: API is in the List But Can't Check It

**Solution:**
- Make sure the API is enabled in Library first
- Refresh the page and try again

## Quick Checklist

- [ ] In Google Cloud Console
- [ ] Project: **jiome-f9f77**
- [ ] APIs & Services → Credentials
- [ ] Found API key: `AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw`
- [ ] Clicked Edit
- [ ] API limitations → "Key restrictions" selected
- [ ] Opened the dropdown
- [ ] Found "reCAPTCHA Enterprise API" in the list
- [ ] Checked the checkbox ✅
- [ ] Clicked OK/Save
- [ ] Saved the API key
- [ ] Waited 2-3 minutes

## After Adding

1. **Wait 2-3 minutes** for changes to propagate
2. **Clear browser cache**
3. **Hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)
4. **Try sending OTP again**
5. **Check Network tab** → Request payload
6. **Expected**: `captchaResponse` should NOT be "NO_RECAPTCHA"
7. **Expected**: Should see `200 OK` instead of `400 Bad Request`

## Summary

**The key step is:**
1. Open API key restrictions dropdown
2. Find "reCAPTCHA Enterprise API" in the list
3. Check the checkbox ✅
4. Save

This should fix the `captchaResponse: "NO_RECAPTCHA"` issue! 🎯

