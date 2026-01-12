# Firebase Phone Authentication Setup Checklist

## ✅ DONE (Completed Steps)

### 1. ✅ Firebase Credentials Configuration
- [x] Firebase config values match between `.env` and Firebase Console
- [x] API Key: `AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw` ✅
- [x] Auth Domain: `jiome-f9f77.firebaseapp.com` ✅
- [x] Project ID: `jiome-f9f77` ✅
- [x] All other config values match ✅

### 2. ✅ Code Implementation
- [x] Using `RecaptchaVerifier` correctly ✅
- [x] Using `signInWithPhoneNumber` correctly ✅
- [x] Phone number format (E.164) is correct ✅
- [x] reCAPTCHA initialization is correct ✅
- [x] Error handling is implemented ✅

### 3. ✅ Approved Domains (Firebase Console)
- [x] `localhost` added ✅
- [x] `127.0.0.1` added ✅
- [x] `jiome-f9f77.firebaseapp.com` (default) ✅
- [x] `jiome-f9f77.web.app` (default) ✅

---

## ⚠️ NEEDS TO BE CHECKED (Action Required)

### 1. ⚠️ API Key Application Restrictions (CRITICAL)
**Location:** Google Cloud Console → APIs & Services → Credentials → Edit API Key

**Current Status:** ❓ Unknown - **NEEDS CHECK**

**Action Required:**
- [ ] Go to Google Cloud Console
- [ ] Navigate to: **APIs & Services** → **Credentials**
- [ ] Find API key: `AIzaSyABjdz71juFISYWWwEFhjyWkV1jVa63psw`
- [ ] Click **Edit**
- [ ] Check **"Application Restrictions"** section:
  - [ ] If set to **"HTTP referrers (web sites)"**: 
    - [ ] Verify these domains are added:
      - `http://localhost:*`
      - `https://localhost:*`
      - `http://127.0.0.1:*`
      - `https://*.vercel.app/*`
      - `https://jiomeapp.com/*`
  - [ ] **OR** for testing: Set to **"doesn't exist"** (no restrictions)
- [ ] Click **Save**
- [ ] Wait 2-3 minutes

**Expected Result:** Application restrictions should allow your domain OR be set to "doesn't exist" for testing

---

### 2. ⚠️ API Key API Restrictions (CRITICAL)
**Location:** Google Cloud Console → APIs & Services → Credentials → Edit API Key

**Current Status:** ❓ Unknown - **NEEDS CHECK**

**Action Required:**
- [ ] In the same API key edit page
- [ ] Check **"API limitations"** section:
  - [ ] Should be set to **"Key restrictions"** (not "No height restrictions")
  - [ ] Click the dropdown showing number of APIs (e.g., "24 APIs")
  - [ ] **CRITICAL**: Verify these APIs are **checked**:
    - [ ] ✅ **Identity Toolkit API** (REQUIRED for phone auth)
    - [ ] ✅ **Firebase Authentication API** (REQUIRED)
    - [ ] ✅ **Firebase Installations API** (if available)
- [ ] If any are missing, check them
- [ ] Click **OK** or **Save**

**Expected Result:** Identity Toolkit API and Firebase Authentication API must be in the allowed APIs list

---

### 3. ⚠️ Required APIs Enabled (CRITICAL)
**Location:** Google Cloud Console → APIs & Services → Library

**Current Status:** ❓ Unknown - **NEEDS CHECK**

**Action Required:**
- [ ] Go to **APIs & Services** → **Library**
- [ ] Search for **"Identity Toolkit API"**:
  - [ ] If it shows **"Enable"** button → Click it
  - [ ] If it shows **"Manage"** → Already enabled ✅
- [ ] Search for **"Firebase Authentication API"**:
  - [ ] If it shows **"Enable"** button → Click it
  - [ ] If it shows **"Manage"** → Already enabled ✅
- [ ] Wait 1-2 minutes for APIs to enable

**Expected Result:** Both APIs should show "Manage" (meaning they're enabled)

---

### 4. ⚠️ Phone Authentication Enabled (CRITICAL)
**Location:** Firebase Console → Authentication → Sign-in method

**Current Status:** ❓ Unknown - **NEEDS CHECK**

**Action Required:**
- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Select project: **jiome**
- [ ] Navigate to: **Authentication** → **Sign-in method**
- [ ] Find **Phone** in the list
- [ ] Check if it shows:
  - [ ] **Enabled** (green toggle) → ✅ Good
  - [ ] **Disabled** (grey toggle) → ⚠️ Need to enable
- [ ] If disabled:
  - [ ] Click on **Phone**
  - [ ] Toggle **"Enable"** to ON
  - [ ] Click **"Save"**

**Expected Result:** Phone Authentication should be **Enabled** (green toggle)

---

### 5. ⚠️ reCAPTCHA Enterprise Configuration (For Blaze Plan)
**Location:** Google Cloud Console → Security → reCAPTCHA Enterprise

**Current Status:** ❓ Unknown - **NEEDS CHECK**

**Action Required:**
- [ ] Go to Google Cloud Console
- [ ] Navigate to: **Security** → **reCAPTCHA Enterprise**
- [ ] Check if you have any reCAPTCHA keys:
  - [ ] If you see keys listed → ✅ Good (check domains)
  - [ ] If empty or no keys → ⚠️ Need to create
- [ ] If creating a new key:
  - [ ] Click **"Create Key"**
  - [ ] Choose **"Web"** platform
  - [ ] Add domains:
    - [ ] `localhost`
    - [ ] `127.0.0.1`
    - [ ] `*.vercel.app` (or your specific Vercel domain)
    - [ ] `jiomeapp.com`
  - [ ] Click **"Create"** or **"Save"**

**Expected Result:** At least one reCAPTCHA Enterprise key should exist with your domains

---

### 6. ⚠️ Production Domain in Approved Domains
**Location:** Firebase Console → Authentication → Settings → Approved domains

**Current Status:** ⚠️ Missing - **NEEDS CHECK**

**Action Required:**
- [ ] Go to Firebase Console → **Authentication** → **Settings** → **Approved domains**
- [ ] Check if `jiomeapp.com` is in the list:
  - [ ] If YES → ✅ Good
  - [ ] If NO → ⚠️ Need to add
- [ ] If missing:
  - [ ] Click **"Add domain"**
  - [ ] Enter: `jiomeapp.com`
  - [ ] Click **"addition"** or **"Add"**

**Expected Result:** `jiomeapp.com` should be in the approved domains list

---

## 🎯 Quick Test After Fixes

After checking/fixing the above items:

1. [ ] Wait 2-3 minutes for changes to propagate
2. [ ] Clear browser cache
3. [ ] Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. [ ] Test sending OTP again
5. [ ] Check browser console for any new errors

---

## 📋 Summary

**✅ Completed (3 items):**
1. Firebase credentials configuration
2. Code implementation
3. Approved domains (localhost, 127.0.0.1)

**⚠️ Needs Check (6 items):**
1. API Key Application Restrictions
2. API Key API Restrictions (Identity Toolkit API)
3. Required APIs Enabled
4. Phone Authentication Enabled
5. reCAPTCHA Enterprise Configuration
6. Production Domain in Approved Domains

**Priority Order:**
1. **First**: Check #1 and #2 (API Key Restrictions) - Most likely cause
2. **Second**: Check #3 (APIs Enabled)
3. **Third**: Check #4 (Phone Auth Enabled)
4. **Fourth**: Check #5 and #6 (reCAPTCHA and Production Domain)

---

## 🔍 How to Check Each Item

### For API Key Restrictions:
1. Google Cloud Console → APIs & Services → Credentials
2. Click on your API key
3. Look at "Application restrictions" and "API limitations" sections

### For APIs Enabled:
1. Google Cloud Console → APIs & Services → Library
2. Search for each API name
3. Check if it shows "Enable" or "Manage"

### For Phone Auth:
1. Firebase Console → Authentication → Sign-in method
2. Look for "Phone" in the list
3. Check if toggle is green (enabled) or grey (disabled)

### For reCAPTCHA:
1. Google Cloud Console → Security → reCAPTCHA Enterprise
2. Check if any keys exist
3. If creating new, add your domains

---

**Start with checking items #1 and #2 - these are the most likely causes of INVALID_APP_CREDENTIAL!** 🎯

