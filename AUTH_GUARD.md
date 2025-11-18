# Authentication Guard System

## Overview

The app now has a complete authentication guard system that protects routes and manages user authentication state.

## Components

### 1. ProtectedRoute (`src/components/ProtectedRoute.jsx`)
- **Purpose**: Guards routes that require authentication
- **Behavior**: 
  - Checks if user has a valid token in localStorage
  - Redirects to `/login` if not authenticated
  - Saves the intended destination for redirect after login
- **Usage**: Wrap protected pages (Gifticon, Network)

### 2. PublicRoute (`src/components/PublicRoute.jsx`)
- **Purpose**: Guards public routes (login/register)
- **Behavior**:
  - Redirects authenticated users to `/gifticon` to prevent accessing login/register when already logged in
- **Usage**: Wrap public auth pages (Login, Register)

### 3. Auth Utilities (`src/utils/auth.js`)
- **Functions**:
  - `isAuthenticated()` - Check if user is authenticated
  - `getToken()` - Get the authentication token
  - `setToken(token)` - Save authentication token
  - `removeToken()` - Remove token (logout)
  - `logout()` - Logout and redirect to login

## Protected Routes

The following routes require authentication:
- `/gifticon` - Gift card marketplace
- `/network` - Business card network

## Public Routes

The following routes are public:
- `/` - Landing page (accessible to all)
- `/login` - Login page (redirects if already authenticated)
- `/register` - Registration page (redirects if already authenticated)

## How It Works

### Accessing Protected Routes

1. User tries to access `/gifticon` or `/network` without being logged in
2. `ProtectedRoute` checks for token in localStorage
3. If no token found, redirects to `/login` with the intended destination saved
4. After successful login, user is redirected back to the originally requested page

### Accessing Public Auth Routes

1. User tries to access `/login` or `/register` while already authenticated
2. `PublicRoute` checks for token in localStorage
3. If token exists, redirects to `/gifticon`

### API Integration

- All API requests automatically include the token via axios interceptor
- On 401 (Unauthorized) response, token is removed and user is redirected to login
- Token is stored in localStorage as `'token'`

## Example Usage

### Adding a New Protected Route

```jsx
<Route 
  path="/new-protected-page" 
  element={
    <ProtectedRoute>
      <NewProtectedPage />
    </ProtectedRoute>
  } 
/>
```

### Using Auth Utilities in Components

```jsx
import { isAuthenticated, logout } from '../utils/auth';

function MyComponent() {
  const handleLogout = () => {
    logout(); // Removes token and redirects to login
  };

  if (isAuthenticated()) {
    return <div>You are logged in!</div>;
  }

  return <div>Please log in</div>;
}
```

## Testing

1. **Test Protected Route Access**:
   - Try accessing `/gifticon` without logging in → Should redirect to `/login`
   - After login → Should redirect back to `/gifticon`

2. **Test Public Route Access**:
   - Try accessing `/login` while logged in → Should redirect to `/gifticon`

3. **Test API Authentication**:
   - Make API calls → Token should be included in headers
   - If backend returns 401 → Should logout and redirect to login

## Security Notes

- Tokens are stored in localStorage (consider httpOnly cookies for production)
- Token validation happens client-side (backend should always validate tokens)
- 401 responses automatically trigger logout
- Protected routes check authentication on every render

