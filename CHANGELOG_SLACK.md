# 🚀 Recent Updates & Changes

## ✅ Authentication & User Flow Improvements

### Landing Page
- **Conditional Auth Buttons**: Register/Login buttons now automatically hide when user has a valid token
- **Real-time Auth State Updates**: Buttons update immediately when user logs in/out (works across tabs)
- **Smart Navigation**: Clicking Gifticon/Network automatically handles:
  - ✅ Valid token → Auto-login and redirect
  - ✅ Expired token → Redirect to login
  - ✅ Just logged out → Redirect to login (not register)
  - ✅ New user → Redirect to register
- **Token Expiration Handling**: Periodic checks every 30 seconds to detect expired tokens

### Login & Register Pages
- **Matching Backgrounds**: Register page now uses same background as Login (image + dark overlay)
- **Click-Outside-to-Close**: Clicking outside the popup returns to landing page (both pages)
- **Back to Home Button**: Added to Register page (Login already had it)
- **Auto-Login After Registration**: If registration API returns a token, user is automatically logged in and redirected to intended page
- **Preserved Navigation**: Intended destination (Network/Gifticon) is preserved throughout auth flow

### Route Security
- **ProtectedRoute**: Now uses `hasValidToken()` instead of `isAuthenticated()` (checks expiration)
- **PublicRoute**: Updated to use `hasValidToken()` (allows expired token users to re-authenticate)

---

## 📱 Phone Number Normalization (Universal)

### Implementation
- **Removes Dots**: All dots (`.`) are removed from phone numbers
- **Normalizes Spacing**: Multiple spaces converted to single spaces
- **Fixes Malformed Country Codes**: Handles cases like "+8 2" → "+82"
- **Works Globally**: Supports all countries, not just Korea and Singapore

### Applied Everywhere
- ✅ OCR extraction (when extracting from images)
- ✅ Manual entry (as user types)
- ✅ Backend data loading (when receiving from API)
- ✅ List view display (Network page)
- ✅ Preview modal display (Network page)
- ✅ Profile page display
- ✅ Card preview component
- ✅ Before sending to backend

### Examples
- `+82 10.3652.8758` → `+82 10 3652 8758`
- `+82 2.2046.6889` → `+82 2 2046 6889`
- `+65 8520 0282` → `+65 8520 0282` (already correct)

---

## 📇 Business Card Display Updates

### Fields Displayed
- ✅ **Name** (cardOwnerName)
- ✅ **Company** (companyName)
- ✅ **Position** (position)
- ✅ **Phone** (phone or mobile - mobile prioritized in list view)
- ✅ **Email** (email)

### Removed Fields
- ❌ Department (removed from display)
- ❌ Address (removed from display)
- ❌ Date Added (removed from display)
- ❌ LinkedIn (removed from display)
- ❌ Card Image (removed from list view, still shown in preview modal)

### Display Locations Updated
- ✅ Network page list view
- ✅ Network page preview modal
- ✅ Profile page (My Business Card section)
- ✅ CardPreview component

### List View Changes
- Mobile number prioritized over phone number
- Both phone and mobile shown separately in preview modal
- Card image removed from list view (cleaner table)

---

## 🎨 UI/UX Improvements

### Login & Register Pages
- Matching background styling (image + overlay)
- Click-outside-to-close functionality
- Consistent input field styling
- Improved focus states and hover effects

### Landing Page
- Dynamic auth button visibility
- Real-time state synchronization
- Improved user experience for logged-in users

---

## 🔒 Security Enhancements

- Token expiration validation in route guards
- Proper handling of expired tokens
- Session-based logout tracking
- Improved authentication state management

---

## 🧪 Testing Status

### ✅ Tested Scenarios
- [x] New user registration flow
- [x] Auto-login after registration
- [x] Click-outside-to-close on auth pages
- [x] Phone number normalization (various formats)
- [x] Business card display (all locations)
- [x] Auth button visibility (logged in/out states)
- [x] Token expiration handling
- [x] Smart navigation from landing page
- [x] Preserved destination throughout auth flow

---

## 📦 Files Modified

- `src/pages/Landing.jsx` - Conditional auth buttons, smart navigation
- `src/pages/Login.jsx` - Background, click-outside-to-close
- `src/pages/Register.jsx` - Background, auto-login, click-outside-to-close
- `src/pages/Network.jsx` - Phone normalization, display updates
- `src/pages/Profile.jsx` - Phone normalization, display updates
- `src/components/CardPreview.jsx` - Phone normalization, field updates
- `src/components/ProtectedRoute.jsx` - Token validation
- `src/components/PublicRoute.jsx` - Token validation
- `src/utils/auth.js` - Token validation, logout tracking
- `src/utils/helpers.js` - Phone normalization function
- `src/utils/ocr.js` - Phone normalization in extraction
- `src/components/AddCardModal.jsx` - Phone normalization on input

---

## 🎯 Key Benefits

1. **Better UX**: Users can easily cancel auth flows by clicking outside
2. **Consistent Data**: Phone numbers displayed uniformly across entire app
3. **Cleaner Display**: Business cards show only essential information
4. **Smart Auth**: Automatic login when appropriate, clear paths when not
5. **Security**: Proper token validation prevents unauthorized access

---

**Commit**: `2ec607e`  
**Branch**: `main`  
**Status**: ✅ Committed & Pushed

