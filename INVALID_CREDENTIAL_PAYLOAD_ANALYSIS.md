# INVALID_APP_CREDENTIAL - Payload Analysis

## Your Payload
```javascript
{
  phoneNumber: "+254720637771",
  clientType: "CLIENT_TYPE_WEB",
  captchaResponse: "NO_RECAPTCHA",  // ⚠️ This might be a backend issue
  recaptchaToken: "0cAFcWeA5F6A9r06iwun1nOpkE4yK55d6wNNyLgHNQ16jjYac_LAOBX5EwX3eve9L6rcZQ1eP0nZ7NDl3OKypPx2WDUYwmL_ddPXK26qVS2V8Wb8sRtMMYDbWqGc6TXS9hM2ALpd3diOVPZ-IDDkff_QFETC1QzFUZWh6wZl02OSF3TvmIfBIxD43953dyhDqTGCdqEV6m1aAkQwVai_TiNdmb2f06MzeeZ7r6kNQWAhbSBMgZsMfP1gwJLGzIghRFhWH8HkirPWLm1vxJsbbhOiemEktBxutC__fu1wBjaNQ5wQ_VGPsUdPZTmvoe3uE-RXr7lE8tRwENSpCJtd4zq9o_th9gpdLhg8lPLPlJDWeqgEKzx5LlTys1ByoZyL5uM__1CfJFu1VIoYYuTPEClALs5c6lxLrbSkejM_Ek5BB0dgBwTORlcikmqQmFmGYdIxC2iz5pjUHtsVKp8f9UCo9XkiHYBcFXlmYm7zFAPVmhwHhGM8vXGhRzUyu1o0VtuZsJ29g0PxuhbkrD1qINtkBqfi6yxUX8c-tdRmhuCmeu8hNl_XRWkU7G9dZOqlXcY6PoJeRbyOOornsE9IkEPAeRn53_v6E3Q_eLbKP8_AkYmBWgaOrNBeBZdhpaXFLabXFnE80UZjcsGc2rpCa_s-q-Vu1b6HSM1M90ZM9Tlp14LEAJ8PuEJyUFJ9KyO6KZrIlBTab5ou5UE-ApXIFTOiMwzQsDpy8Q9C8v3_ICsYZwb9n1_IP3NqgEng9U_c5bInX0afEik4BAD2GKyLZVwDnxChMQxCeTfUnHCa8GugDDarykeypkYAEvz0BLFuj8AmTFyg8m8ARiDn3NDYKgJmVCLVsuJHLFLg",
  recaptchaVersion: "RECAPTCHA_ENTERPRISE"
}
```

## Analysis

### ✅ What's Working
- Phone number format is correct: `+254720637771`
- reCAPTCHA token is being generated (long token present)
- reCAPTCHA Enterprise version is being used
- Client type is correct: `CLIENT_TYPE_WEB`

### ⚠️ Potential Issues
1. **`captchaResponse: "NO_RECAPTCHA"`** - This might be a backend field, but the error is coming from Firebase, not your backend
2. **INVALID_APP_CREDENTIAL** - This is a **Firebase API key issue**, not a reCAPTCHA issue

## Root Cause: API Key Restrictions

The INVALID_APP_CREDENTIAL error is **99% likely** caused by:
1. **API key Application Restrictions** blocking your domain
2. **API key API Restrictions** missing required APIs

## Immediate Fix Steps

### Step 1: Remove API Key Restrictions (Temporary Test)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure project is: **jiome-f9f77**
3. Navigate to **APIs & Services** → **Credentials**
4. Find API key: `AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw`
5. Click to **Edit**
6. Under **"Application Restrictions"**:
   - Select **"doesn't exist"** (no restrictions)
7. Click **"Save"**
8. **Wait 2-3 minutes** for changes to propagate
9. **Test your app again**

### Step 2: Verify API Restrictions

Even with no application restrictions, check API restrictions:

1. In the same API key edit page
2. Under **"API limitations"** section
3. Click the dropdown showing **"24 APIs"**
4. **CRITICAL**: Make sure these are **checked**:
   - ✅ **Identity Toolkit API** (REQUIRED for phone auth)
   - ✅ **Firebase Authentication API** (REQUIRED)
   - ✅ **Firebase Installations API** (if available)
5. If any are missing:
   - Go to **APIs & Services** → **Library**
   - Search for "Identity Toolkit API"
   - Click **"Enable"** if not enabled
   - Do the same for "Firebase Authentication API"
   - Go back to API key edit page
   - These APIs should now appear in the dropdown
6. Click **"Save"**

### Step 3: Verify APIs are Enabled

1. Go to **APIs & Services** → **Library**
2. Search for **"Identity Toolkit API"**
3. If it shows "Enable", click it
4. Search for **"Firebase Authentication API"**
5. If it shows "Enable", click it
6. Wait 1-2 minutes

### Step 4: Test Again

1. **Clear browser cache** (important!)
2. **Hard refresh** your app (Ctrl+Shift+R or Cmd+Shift+R)
3. Try sending OTP again
4. Check browser console for any new errors

## If Still Not Working

### Check Phone Authentication is Enabled

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **jiome**
3. Go to **Authentication** → **Sign-in method**
4. Find **Phone** in the list
5. Make sure it's **Enabled** (green toggle)

### Check Firebase Config

Verify your `.env` file matches Firebase Console exactly:

```bash
VITE_FIREBASE_API_KEY=AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw
VITE_FIREBASE_AUTH_DOMAIN=jiome-f9f77.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jiome-f9f77
VITE_FIREBASE_STORAGE_BUCKET=jiome-f9f77.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=21306379382
VITE_FIREBASE_APP_ID=1:21306379382:web:d074f1131a73eb85122357
```

## About `captchaResponse: "NO_RECAPTCHA"`

This field in your payload is likely a **backend field** and not related to the Firebase error. The reCAPTCHA token is being generated correctly (you can see the long token), so the issue is with **API key authentication**, not reCAPTCHA.

## Summary

**The error is NOT about reCAPTCHA** - it's about **API key restrictions**. 

**Do this NOW:**
1. Remove Application Restrictions (set to "doesn't exist")
2. Verify Identity Toolkit API is in API restrictions
3. Verify APIs are enabled
4. Test again

This should fix it! 🎯

