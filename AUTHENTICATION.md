# Authentication System Documentation

## Overview

This application uses a JWT-based authentication system with file-based user storage. Users are stored in `data/users.json` and passwords are hashed using bcrypt.

## How Authentication Works

### 1. User Registration Flow

1. **Client** sends POST request to `/api/auth/register` with:
   - `email`: User's email address
   - `name`: User's full name
   - `password`: Plain text password (minimum 6 characters)

2. **Server** (`app/api/auth/register/route.ts`):
   - Validates input (email format, password length, name length)
   - Checks if user already exists
   - Hashes password using `bcrypt.hash()` (10 rounds)
   - Creates user record in `data/users.json`
   - Generates JWT token using `JWT_SECRET`
   - Sets httpOnly cookie with token
   - Returns user data (without password) and token

3. **Client** (`lib/auth-context.tsx`):
   - Receives user data and token
   - Stores token in `sessionStorage` (for API calls)
   - Updates auth context with user data
   - Cookie is automatically set by browser

### 2. User Login Flow

1. **Client** sends POST request to `/api/auth/login` with:
   - `email`: User's email address
   - `password`: Plain text password

2. **Server** (`app/api/auth/login/route.ts`):
   - Validates input
   - Normalizes email (lowercase, trim)
   - Finds user by email in `data/users.json`
   - Verifies password using `bcrypt.compare()`
   - Generates JWT token
   - Sets httpOnly cookie with token
   - Returns user data and token

3. **Client**:
   - Receives user data and token
   - Stores token in `sessionStorage`
   - Updates auth context

### 3. Session Management

- **JWT Token**: Contains `userId` and `email`, expires in 7 days
- **Cookie**: httpOnly cookie named `auth-token`, available across all routes
- **SessionStorage**: Token also stored in `sessionStorage` for API calls
- **Token Verification**: `/api/auth/me` endpoint verifies token and returns user data

### 4. Authentication Check

- On app load, `AuthProvider` calls `/api/auth/me`
- Server reads token from cookie or Authorization header
- Verifies token using `JWT_SECRET`
- Returns user data if valid, 401 if invalid

## File Structure

```
data/
  ├── users.json          # User accounts (email, hashed password, etc.)
  └── prospects/
      └── {userId}.json   # User's saved prospects
```

## Environment Variables

### Required for Production:
- `JWT_SECRET`: Strong random string (generate with `openssl rand -base64 32`)
- `OPENROUTER_API_KEY`: Your OpenRouter API key

### Development:
- If `JWT_SECRET` is not set, uses default dev secret
- Warning logged if using default in production

## Security Features

1. **Password Hashing**: bcrypt with 10 rounds
2. **JWT Tokens**: Signed with secret, 7-day expiration
3. **HttpOnly Cookies**: Prevents XSS attacks
4. **Email Normalization**: Prevents duplicate accounts with different cases
5. **Atomic File Writes**: Prevents data corruption

## Troubleshooting

### "Invalid email or password" on login:
- Check if user exists in `data/users.json`
- Verify password is correct
- Check server logs for detailed error messages

### "Server configuration error" on registration:
- `JWT_SECRET` is not set in environment variables
- Set `JWT_SECRET` in `.env` file (development) or Amplify Console (production)

### Users not persisting:
- Check `data/` directory exists and is writable
- Check file permissions
- Check server logs for file system errors

## Testing Authentication

1. **Register a new user**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User","password":"test123"}'
   ```

2. **Login**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}' \
     -c cookies.txt
   ```

3. **Check auth status**:
   ```bash
   curl http://localhost:3000/api/auth/me -b cookies.txt
   ```

