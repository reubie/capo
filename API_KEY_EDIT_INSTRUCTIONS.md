# API Key Edit Instructions

## Current Status (What You're Seeing)

✅ **Found the API key**: `AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw`
✅ **On the edit page**

## Current Settings (What Needs to Change)

### 1. Application Restrictions
- **Current**: "doesn't exist" (no restrictions)
- **Needs to be**: "website" with HTTP referrers

### 2. API Restrictions
- **Current**: "Key restrictions" with "24 APIs" selected
- **Needs to include**: Identity Toolkit API and Firebase Authentication API

## Step-by-Step Fix

### Step 1: Set Application Restrictions

1. In the **"Application Restrictions"** section
2. Click the radio button for **"website"** (not "doesn't exist")
3. A new section will appear: **"Website restrictions"**
4. Click **"Add an item"** or **"Add item"**
5. Add these HTTP referrers (one per line):
   ```
   http://localhost:*
   https://localhost:*
   http://127.0.0.1:*
   https://*.vercel.app/*
   https://jiomeapp.com/*
   ```
6. Click **"Add"** after each one

### Step 2: Verify API Restrictions

1. In the **"API limitations"** section
2. Make sure **"Key restrictions"** is selected (it already is ✅)
3. Click on the dropdown that shows **"24 APIs"**
4. A list of APIs will appear
5. **Make sure these are checked**:
   - ✅ **Identity Toolkit API** (REQUIRED for phone auth)
   - ✅ **Firebase Authentication API** (REQUIRED)
   - ✅ **Firebase Installations API** (if available)
6. If any are missing, check them
7. Click **"OK"** or **"Save"** to close the API list

### Step 3: Save Changes

1. Scroll to the bottom of the page
2. Click **"Save"** button
3. Wait for confirmation message

### Step 4: Wait and Test

1. **Wait 1-2 minutes** for changes to propagate
2. Refresh your app
3. Try sending OTP again

## Important Notes

- **Application Restrictions**: Setting to "website" is more secure and required for production
- **API Restrictions**: Must include Identity Toolkit API for phone authentication to work
- **Changes take effect**: Usually within 1-2 minutes, but can take up to 5 minutes

## If You Can't Find the APIs

If "Identity Toolkit API" or "Firebase Authentication API" are not in the list:

1. Go to **APIs & Services** → **Library** (in the left sidebar)
2. Search for **"Identity Toolkit API"**
3. If it's not enabled, click **"Enable"**
4. Search for **"Firebase Authentication API"**
5. If it's not enabled, click **"Enable"**
6. Go back to your API key edit page
7. The APIs should now appear in the dropdown

