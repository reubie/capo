# Testing Backend Integration

## Quick Test: Signup Endpoint

### 1. Start Backend
```bash
cd <backend-repo>
./mvnw spring-boot:run
```
Verify backend is running at `http://localhost:8080`

### 2. Start Frontend
```bash
cd /Users/bangmunja/Personal
npm start
```
Frontend should start at `http://localhost:5173`

### 3. Test Signup Flow

1. Navigate to `http://localhost:5173/register`
2. Fill in the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Sign Up"
4. Check browser console (F12) for:
   - Network requests to `http://localhost:8080/user/signup`
   - Response data
   - Any errors

### 4. Expected Behavior

**Success Response:**
- API call to `POST http://localhost:8080/user/signup`
- Request body: `{ "name": "Test User", "email": "test@example.com", "password": "password123" }`
- Response format: `{ "code": "200", "message": "Success", "data": null }`
- If token is provided in `data`, it will be saved to localStorage
- Redirect to `/gifticon` page

**Error Responses:**
- **400001 (Required Fields Error):**
  - Response: `{ "code": "400001", "message": "required fields error", "data": null }`
  - UI shows: "Please fill in all required fields correctly."
  
- **400003 (User Already Exists):**
  - Response: `{ "code": "400003", "message": "already exist user", "data": null }`
  - UI shows: "An account with this email already exists. Please login instead."

**Common Issues:**

1. **CORS Error:**
   ```
   Access to XMLHttpRequest at 'http://localhost:8080/user/signup' from origin 'http://localhost:5173' has been blocked by CORS policy
   ```
   **Fix:** Add CORS configuration to Spring Boot backend (see INTEGRATION_GUIDE.md)

2. **404 Not Found:**
   ```
   POST http://localhost:8080/user/signup 404 (Not Found)
   ```
   **Fix:** Check if backend endpoint path matches exactly. Verify in Swagger UI.

3. **Connection Refused:**
   ```
   Network Error: Failed to fetch
   ```
   **Fix:** Ensure backend is running and accessible at `http://localhost:8080`

4. **401/403 Unauthorized:**
   - Check if endpoint requires authentication
   - Verify request headers are correct

### 5. Debug Tips

**Browser DevTools:**
- Open Network tab to see all API calls
- Check Request/Response headers and body
- Look for error messages in Console tab

**Backend Logs:**
- Check Spring Boot console for incoming requests
- Verify request body is received correctly
- Check for any validation errors

**Frontend Console:**
- Check for JavaScript errors
- Verify API calls are being made
- Check localStorage for saved tokens

## Testing Login Flow

### 1. Test Login Endpoint

1. Navigate to `http://localhost:5173/login`
2. Fill in the form:
   - Email: `test@example.com` (use an email from a registered account)
   - Password: `password123`
3. Click "Login"
4. Check browser console (F12) for:
   - Network requests to `http://localhost:8080/user/login`
   - Response data with `accessToken`

### 2. Expected Login Behavior

**Success Response:**
- API call to `POST http://localhost:8080/user/login`
- Request body: `{ "email": "test@example.com", "password": "password123" }`
- Response format: `{ "code": "200", "message": "Success", "data": { "accessToken": "eyJhbGc..." } }`
- `accessToken` will be saved to localStorage
- Redirect to `/gifticon` page

**Error Responses:**
- **400001 (Required Fields Error):**
  - Response: `{ "code": "400001", "message": "required fields error", "data": null }`
  - UI shows: "Please fill in all required fields correctly."
  
- **400004 (Incorrect Credentials):**
  - Response: `{ "code": "400004", "message": "ID or password is incorrect", "data": null }`
  - UI shows: "Email or password is incorrect. Please try again."

## Next Steps After Login Works

1. ✅ Test signup endpoint
2. ✅ Test login endpoint
3. ⏳ Test product fetching from Gifticon page
4. ⏳ Test business card upload (when available)
5. ⏳ Test purchase flow
6. ⏳ Test network card management

