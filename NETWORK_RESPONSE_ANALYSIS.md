# Network Response Analysis - INVALID_APP_CREDENTIAL

## Your Network Response

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

## Your Payload Analysis

```javascript
{
  phoneNumber: "+254704724484",
  clientType: "CLIENT_TYPE_WEB",
  captchaResponse: "NO_RECAPTCHA",  // ⚠️ THIS IS THE PROBLEM
  recaptchaToken: "0cAFcWeA7U8QbUpJTz4i5hXU4Q59MOEHzQVzkNASKpx8DM37FNL81qHO7_Fj74_00YGeh2yqKEG2Ugh--syKgC9rRtcojPBjTEOuuN0sWheb-SXfWdw-49aTpCUg4rWlSNiQ0DBscrBH-mz1E4r2UnJLf2akNuKgGrd97LfZZ3fBeRI_-NzF8zGwfq96-yhX-maewNiHSQHSY6z0C7HIBO7Kkl1yJllkUhNhgHNVklch-Wun1I3YmIfi5_RYrVLX5w-9htED9Qgpfqzc7jiIOoF-qSu1P0Etnau06AA0OBq1dmbUvJvRbvcRCaD4gAdnVECOWKCFAvfVa68BOg9ijSxXC2ItwaYXqEsnN_HKqVR39W6_ucXHvkgIVOB0TS8Rl8F7xNwgCaZNPHrKXgB7T5Xm3AHxw6Q-NAJ9iVEKHJAwneEmePc4p5F0i1N-yVmnPjOeUBzg3kukVtXldlZ6OuOWfH7UQWy--vXx3-hj0XvCms91Rn6WyMQFEmsQLh2Wz7T9NboH3Fc5sefH-A6LhKpl-cPrEX4xyM6zl5UBD8HfN2HKi7Fm0I2ryl8rBMBwfYDnWPrXJ75CAty6fo7UUzkS6Oqh6PifZCIkI-SyXlo8pQWjj3RX9-DPwOz0IetL_LXSAq4Ll-riLe7ZrxnKQiSsQykhvFqRKNAGnIVbzFEUaYpzSgnacpW0w-WFfCnFcCfuPPp1Wbr5VnHasr0He_vUPCtZSrO2POhwfJ-5GRsG3xhPlRqh8fWbxioS1t0DwVSFYBtmIXGMn5aKBIpW3KbMMZLvWU2lfD-iWyfz0OqmOUDuT66nNNqhUXEhSsOTtoeszDvY31HgLMXvfQv4ujHgfNgy9ccKBrae8jz24-IF03TMNYJ6YImGFxeAYbDZ-8xsX2qpW81zW8",
  recaptchaVersion: "RECAPTCHA_ENTERPRISE"
}
```

## Critical Finding

**The Problem:**
- ✅ `recaptchaToken` is present (long token)
- ✅ `recaptchaVersion: "RECAPTCHA_ENTERPRISE"` is correct
- ❌ **`captchaResponse: "NO_RECAPTCHA"`** - This is wrong!

**This means:**
- Firebase is generating a reCAPTCHA token
- But it's being marked as "NO_RECAPTCHA" in the payload
- Google's API sees this and rejects it with `INVALID_APP_CREDENTIAL`

## Root Cause

The `captchaResponse: "NO_RECAPTCHA"` suggests that:
1. reCAPTCHA Enterprise is not properly linked/configured
2. Firebase can't validate the reCAPTCHA token with Google's API
3. The API key might not have permission to use reCAPTCHA Enterprise

## Solution: Verify reCAPTCHA Enterprise Configuration

### Step 1: Check reCAPTCHA Enterprise Key in Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Security** → **reCAPTCHA Enterprise**
3. Verify you have a key created
4. Click on the key to see details
5. **Important**: Check if it's linked to your Firebase project

### Step 2: Verify API Key Has reCAPTCHA Enterprise Permission

1. Go to **APIs & Services** → **Credentials**
2. Edit API key: `AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw`
3. **API Restrictions** section:
   - Make sure **"reCAPTCHA Enterprise API"** is in the allowed APIs list
   - If not, add it

### Step 3: Enable reCAPTCHA Enterprise API

1. Go to **APIs & Services** → **Library**
2. Search for **"reCAPTCHA Enterprise API"**
3. If it shows **"Enable"**, click it
4. Wait 1-2 minutes

### Step 4: Check Firebase Console reCAPTCHA Settings

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. **Authentication** → **Settings** → **reCAPTCHA**
3. Check if reCAPTCHA Enterprise is configured
4. If there's an option to link/configure, do it

### Step 5: Verify the reCAPTCHA Key is for the Correct Project

1. In Google Cloud Console → **reCAPTCHA Enterprise**
2. Check that the key is in project: **jiome-f9f77**
3. If it's in a different project, create a new one in the correct project

## Alternative: Check API Key Restrictions More Carefully

The `INVALID_APP_CREDENTIAL` with `captchaResponse: "NO_RECAPTCHA"` might also mean:

1. **API Key Application Restrictions** are too strict
   - Try setting to **"doesn't exist"** temporarily
   - Test if it works
   - If it works, then add restrictions back one by one

2. **API Key API Restrictions** missing reCAPTCHA Enterprise API
   - Add **"reCAPTCHA Enterprise API"** to allowed APIs
   - This is different from Identity Toolkit API

## Expected Fix

After proper configuration, the payload should show:
```javascript
{
  captchaResponse: "VALID_RECAPTCHA",  // ✅ Should be VALID, not NO_RECAPTCHA
  recaptchaToken: "...",
  recaptchaVersion: "RECAPTCHA_ENTERPRISE"
}
```

## Quick Test

1. Set API Key Application Restrictions to **"doesn't exist"** (temporary)
2. Add **"reCAPTCHA Enterprise API"** to API Restrictions
3. Enable **"reCAPTCHA Enterprise API"** in Library
4. Wait 2-3 minutes
5. Clear cache and test
6. Check Network tab - `captchaResponse` should change from "NO_RECAPTCHA" to something else

## Summary

**The issue is `captchaResponse: "NO_RECAPTCHA"` in the payload.**

This means reCAPTCHA Enterprise is not properly configured or the API key doesn't have permission to use it.

**Fix:**
1. Ensure reCAPTCHA Enterprise API is enabled
2. Ensure reCAPTCHA Enterprise API is in API key restrictions
3. Ensure reCAPTCHA Enterprise key is created and linked
4. Temporarily remove Application Restrictions to test

