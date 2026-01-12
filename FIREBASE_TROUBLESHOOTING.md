# Firebase Phone Authentication Troubleshooting

## Error: `auth/invalid-app-credential`

This error typically occurs when:
1. Phone Authentication is not enabled in Firebase Console
2. reCAPTCHA Enterprise is not configured (required for Blaze plan)
3. API key restrictions are blocking the request
4. Firebase configuration values don't match the Blaze account

## Step-by-Step Fix

### 1. Enable Phone Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **jiome-f9f77**
3. Navigate to **Authentication** → **Sign-in method**
4. Find **Phone** in the list
5. Click **Phone** → **Enable**
6. Click **Save**

### 2. Configure reCAPTCHA for Blaze Plan

Since you're on Blaze plan, you need to set up reCAPTCHA Enterprise:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **jiome-f9f77**
3. Navigate to **Security** → **reCAPTCHA Enterprise**
4. Create a new reCAPTCHA key if you don't have one:
   - Click **Create Key**
   - Choose **Web** platform
   - Add your domains:
     - `localhost` (for development)
     - `your-vercel-app.vercel.app` (for production)
     - `yourdomain.com` (if you have a custom domain)
   - Save the key

### 3. Verify API Key Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your API key: `AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw`
4. Click **Edit**
5. Check **Application restrictions**:
   - Should be set to **HTTP referrers (web sites)**
   - Add your domains:
     - `http://localhost:*` (for development)
     - `https://*.vercel.app/*` (for Vercel deployments)
     - `https://yourdomain.com/*` (if you have a custom domain)
6. Check **API restrictions**:
   - Should allow **Identity Toolkit API** (for phone auth)
   - Should allow **Firebase Authentication API**
7. Click **Save**

### 4. Verify Firebase Configuration

Double-check that all environment variables in Vercel match your Blaze account:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **jiome-f9f77**
3. Click **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. Click on your web app (or create one if it doesn't exist)
6. Copy the configuration values
7. Verify they match what's in Vercel environment variables

### 5. Test Configuration

After making changes:

1. **Redeploy** your Vercel app (to pick up any config changes)
2. **Clear browser cache** and reload
3. Try sending OTP again
4. Check browser console for any new errors

## Common Issues

### Issue: "Failed to initialize reCAPTCHA Enterprise config"

**Solution:**
- Make sure reCAPTCHA Enterprise is enabled in Google Cloud Console
- For Blaze plan, reCAPTCHA Enterprise is recommended
- The code will fall back to reCAPTCHA v2, but Enterprise is preferred

### Issue: "API key restrictions blocking request"

**Solution:**
- Check API key restrictions in Google Cloud Console
- Make sure your deployment domain is in the allowed referrers
- Temporarily remove restrictions to test, then add them back

### Issue: "Phone Authentication not enabled"

**Solution:**
- Enable Phone Authentication in Firebase Console
- Authentication → Sign-in method → Phone → Enable

### Issue: "Billing not enabled"

**Solution:**
- Blaze plan requires billing to be enabled
- Go to Firebase Console → Usage and billing
- Add a payment method if not already added

## Verification Checklist

- [ ] Phone Authentication enabled in Firebase Console
- [ ] reCAPTCHA Enterprise configured (or reCAPTCHA v2 working)
- [ ] API key restrictions allow your domain
- [ ] All Firebase config values match Blaze account
- [ ] Environment variables set in Vercel
- [ ] App redeployed after setting variables
- [ ] Browser cache cleared

## Still Not Working?

If the issue persists:

1. **Check Firebase Console logs:**
   - Firebase Console → Authentication → Users
   - Look for any error messages

2. **Check Google Cloud Console logs:**
   - Cloud Console → Logs Explorer
   - Filter by "Identity Toolkit API"
   - Look for 400/403 errors

3. **Verify phone number format:**
   - Must be in E.164 format: `+254720637771`
   - Must include country code

4. **Test with a different phone number:**
   - Some phone numbers might be blocked
   - Try with a different number to isolate the issue

