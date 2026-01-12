# Firebase Approved Domains - What to Add

## Important Note About Port Numbers

Firebase's "Approved domain" field **does NOT accept port numbers** (like `:5173`).

- ❌ **Don't add**: `localhost:5173`
- ✅ **Add**: `localhost` (without port)

Firebase automatically handles all ports for `localhost`, so `localhost` covers `localhost:5173`, `localhost:3000`, etc.

## Domains to Add to Firebase

Based on your project configuration, here are the domains you should add:

### 1. Production Domain (Required)
```
jiomeapp.com
```
- This is your main production domain
- Add this one first

### 2. Localhost (Already Added ✅)
```
localhost
```
- Already in your list ✅
- Covers all local development ports (5173, 3000, etc.)
- **Don't try to add `localhost:5173`** - it will be rejected

### 3. Vercel Preview Domains (Optional but Recommended)
If you want to test on Vercel preview deployments, you'll need to add your specific Vercel app domain. However, Firebase doesn't support wildcards like `*.vercel.app` in the Approved domains list.

**To find your Vercel domain:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Domains**
4. You'll see your Vercel deployment domain (e.g., `jiome.vercel.app` or `your-project-name.vercel.app`)
5. Add that specific domain

**Example:**
```
jiome.vercel.app
```
(Replace with your actual Vercel domain)

## Step-by-Step: Adding Domains

### Add Production Domain

1. In Firebase Console → **Authentication** → **Settings** → **Approved domains**
2. Click **"Add domain"** button
3. Enter: `jiomeapp.com`
4. Click **"addition"** (or "Add")
5. ✅ Should be added successfully

### Add Vercel Domain (if needed)

1. Find your Vercel domain from Vercel Dashboard
2. In Firebase, click **"Add domain"** again
3. Enter your Vercel domain (e.g., `jiome.vercel.app`)
4. Click **"addition"**

## Current Status

Based on the image you showed, you already have:
- ✅ `localhost` (Default)
- ✅ `jiome-f9f77.firebaseapp.com` (Default - Firebase hosting)
- ✅ `jiome-f9f77.web.app` (Default - Firebase hosting)

**You need to add:**
- ⚠️ `jiomeapp.com` (your production domain)

## Why `localhost:5173` Was Rejected

Firebase's "Approved domain" field expects:
- Domain names only (e.g., `myapp.com`)
- No port numbers
- No protocols (no `http://` or `https://`)
- No paths (no `/` or paths)

So:
- ✅ `localhost` → Accepted
- ✅ `jiomeapp.com` → Accepted
- ❌ `localhost:5173` → Rejected (port number not allowed)
- ❌ `http://localhost:5173` → Rejected (protocol and port)
- ❌ `localhost:5173/register` → Rejected (port and path)

## Summary

**Add these domains:**
1. `jiomeapp.com` ← **Add this one!**
2. `your-vercel-domain.vercel.app` (if you want Vercel previews to work)

**Already have:**
- `localhost` ✅ (covers all ports including 5173)
- `jiome-f9f77.firebaseapp.com` ✅
- `jiome-f9f77.web.app` ✅

