# Backend Integration Guide

## Quick Start

### 1. Run Backend Locally

```bash
# Navigate to backend repo
cd <path-to-backend-repo>

# Run Spring Boot (adjust command based on your build tool)
./mvnw spring-boot:run
# OR
./gradlew bootRun

# Backend should start on http://localhost:8080 (or check console for actual port)
```

### 2. Configure Frontend

Create a `.env` file in the frontend root (`/Users/bangmunja/Personal/.env`):

```bash
# For local development (Spring Boot default port)
VITE_API_BASE_URL=http://localhost:8080

# Note: The frontend will append the endpoint path (e.g., /user/signup)
# If your backend uses /api prefix, use: http://localhost:8080/api
```

**Important**: The signup endpoint is `/user/signup` (no `/api` prefix based on your Swagger UI). If your backend uses a different base path, adjust accordingly.

### 3. Update Backend Port (if different)

If your Spring Boot backend runs on a different port (e.g., 8081, 3000), update:

1. `.env` file: `VITE_API_BASE_URL=http://localhost:YOUR_PORT/api`
2. Or update `src/utils/api.js` default fallback

### 4. Handle CORS (Important!)

Your Spring Boot backend needs to allow requests from your frontend. Add this to your Spring Boot config:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

Or in `application.properties`:
```properties
spring.web.cors.allowed-origins=http://localhost:5173,http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

## Expected API Endpoints

Your frontend is configured to call these endpoints:

### Authentication
- `POST /user/signup` - **✅ INTEGRATED** - User signup with email, password, name
  - Request body: `{ "email": "user@gmail.com", "password": "password123", "name": "mike" }`
  - Success response: `{ "code": "200", "message": "Success", "data": null }`
  - Error responses:
    - `400001`: `{ "code": "400001", "message": "required fields error", "data": null }`
    - `400003`: `{ "code": "400003", "message": "already exist user", "data": null }`
  - Token (if provided) will be saved to localStorage and user redirected to `/gifticon`
- `POST /user/login` - **✅ INTEGRATED** - User login with email and password
  - Request body: `{ "email": "user@gmail.com", "password": "password123" }`
  - Success response: `{ "code": "200", "message": "Success", "data": { "accessToken": "..." } }`
  - Error responses:
    - `400001`: `{ "code": "400001", "message": "required fields error", "data": null }`
    - `400004`: `{ "code": "400004", "message": "ID or password is incorrect", "data": null }`
  - `accessToken` will be saved to localStorage as 'token' and user redirected to `/gifticon`
- `POST /api/auth/register` - Register (legacy, may not be used)
- `POST /api/auth/register-with-card` - Register with business card image (to be integrated)

### Gifticon
- `GET /api/gifticon/products` - Get all products
- `POST /api/gifticon/purchase` - Purchase a product
- `GET /api/gifticon/history` - Get purchase history

### Network
- `GET /api/network/cards` - Get business cards (with query params for search/filter)
- `POST /api/network/cards` - Add new business card
- `DELETE /api/network/cards/:id` - Delete business card

## Testing the Connection

1. **Start backend**: Make sure Spring Boot is running
2. **Start frontend**: `npm start` or `npm run dev`
3. **Check browser console**: Look for any CORS errors or connection issues
4. **Test an endpoint**: Try logging in or fetching products

## Development Workflow

1. **Backend running**: Keep Spring Boot running in one terminal
2. **Frontend running**: Keep `npm run dev` running in another terminal
3. **Hot reload**: Both should support hot reload during development

## Production Deployment

When deploying to production:

1. **Deploy backend** to your server (e.g., AWS, Heroku, Railway)
2. **Update `.env.production`** or Vercel environment variables:
   ```
   VITE_API_BASE_URL=https://your-production-backend.com/api
   ```
3. **Update CORS** in backend to allow your Vercel domain:
   ```java
   .allowedOrigins("https://your-vercel-app.vercel.app")
   ```

## Troubleshooting

### CORS Errors
- Check backend CORS configuration
- Verify frontend URL is in allowed origins
- Check browser console for specific error

### Connection Refused
- Verify backend is running
- Check backend port matches frontend config
- Check firewall/network settings

### 404 Errors
- Verify API endpoint paths match exactly
- Check if backend has `/api` prefix or not
- Review Spring Boot controller mappings

## Next Steps

1. ✅ Run backend locally
2. ✅ Create `.env` file with backend URL
3. ✅ Configure CORS in backend
4. ✅ Test one endpoint (e.g., login)
5. ✅ Replace mock data in frontend with real API calls
6. ✅ Test all flows end-to-end


