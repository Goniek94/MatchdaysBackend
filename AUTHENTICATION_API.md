# 🔐 Matchdays Authentication API Documentation

## 📋 Overview

Professional authentication system based on Marketplace best practices, adapted for Matchdays with NestJS, Prisma, and PostgreSQL.

## 🎯 Key Features

- ✅ HTTP-Only Cookies for JWT tokens
- ✅ Rate limiting per endpoint
- ✅ Login history tracking
- ✅ Account locking after failed attempts
- ✅ Ban system (temporary & permanent)
- ✅ Warning system
- ✅ IP tracking
- ✅ User agent logging
- ✅ Comprehensive error handling

## 🔌 API Endpoints

### 1. **POST /auth/register**

Register a new user account.

**Rate Limit:** 10 requests per hour

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "birthDate": "1994-01-01",
  "country": "PL",
  "phone": "+48123456789"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Rejestracja zakończona pomyślnie! Witamy w Matchdays!",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "username": "johndoe",
    "name": "John",
    "lastName": "Doe",
    "role": "user",
    "isVerified": true
  }
}
```

**Cookies Set:**

- `token` (HTTP-Only, 15 minutes)
- `refreshToken` (HTTP-Only, 7 days)

---

### 2. **POST /auth/login**

Login with email/username and password.

**Rate Limit:** 20 requests per 15 minutes

**Request Body:**

```json
{
  "emailOrUsername": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logowanie przebiegło pomyślnie",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "username": "johndoe",
    "name": "John",
    "role": "user",
    "lastLogin": "2025-12-30T22:00:00.000Z"
  }
}
```

**Error Responses:**

**401 Unauthorized - Wrong Password:**

```json
{
  "success": false,
  "message": "Błędny login lub hasło. Pozostało 3 próby.",
  "attemptsLeft": 3,
  "failedAttempts": 1,
  "maxAttempts": 4
}
```

**423 Locked - Account Locked:**

```json
{
  "success": false,
  "message": "Konto jest zablokowane. Spróbuj ponownie za 15 minut."
}
```

**401 Unauthorized - Account Banned:**

```json
{
  "success": false,
  "message": "Twoje konto zostało permanentnie zablokowane. Powód: Naruszenie regulaminu"
}
```

**Cookies Set:**

- `token` (HTTP-Only, 15 minutes)
- `refreshToken` (HTTP-Only, 7 days)

---

### 3. **POST /auth/logout**

Logout current user.

**Rate Limit:** None (authenticated users only)

**Headers Required:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Wylogowano pomyślnie"
}
```

**Cookies Cleared:**

- `token`
- `refreshToken`

---

### 4. **POST /auth/refresh**

Refresh access token using refresh token.

**Rate Limit:** 30 requests per hour

**Cookies Required:**

- `refreshToken`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

**New Cookies Set:**

- `token` (HTTP-Only, 15 minutes)
- `refreshToken` (HTTP-Only, 7 days)

---

### 5. **GET /auth/check-auth**

Check if user is authenticated (compatible with Marketplace pattern).

**Rate Limit:** None

**Headers Required:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "isAuthenticated": true,
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "username": "johndoe",
    "role": "user"
  }
}
```

---

### 6. **GET /auth/me**

Get current user profile.

**Rate Limit:** None

**Headers Required:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "username": "johndoe",
    "name": "John",
    "lastName": "Doe",
    "role": "user",
    "rating": 0,
    "sales": 0,
    "isVerified": true,
    "lastLogin": "2025-12-30T22:00:00.000Z"
  }
}
```

---

## 🔒 Security Features

### Account Locking

- **Trigger:** 4 failed login attempts
- **Duration:** 15 minutes
- **Auto-unlock:** Yes, after lock period expires

### Login History

All login attempts are logged with:

- Success/failure status
- IP address
- User agent (browser/device)
- Timestamp
- Failure reason (if failed)

### Ban System

- **Temporary bans:** With start and end date
- **Permanent bans:** No end date
- **Auto-check:** Expired bans are automatically deactivated

### Warning System

- Multiple severity levels: low, medium, high, critical
- Active/inactive status
- Can be revoked by admin

---

## 🍪 Cookie Configuration

### Production (HTTPS)

```typescript
{
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/'
}
```

### Development (HTTP)

```typescript
{
  httpOnly: true,
  secure: false,
  sameSite: 'strict',
  path: '/'
}
```

---

## 📊 Database Models

### User

- Basic info (name, email, username, password)
- Profile data (birthDate, country, phone)
- Security (lastLogin, lastIP, failedLoginAttempts, accountLocked)
- Status (active, suspended, banned)
- Role (user, admin)

### LoginHistory

- userId
- success (boolean)
- ipAddress
- userAgent
- location
- failureReason
- createdAt

### Warning

- userId
- reason
- description
- severity
- issuedBy (admin)
- active
- createdAt

### Ban

- userId
- type (temporary, permanent)
- reason
- startDate
- endDate
- issuedBy (admin)
- active
- createdAt

### ModerationLog

- userId
- action
- category
- reason
- details
- performedBy (admin)
- createdAt

---

## 🚀 Frontend Integration

### Login Example (React/Next.js)

```typescript
const login = async (email: string, password: string) => {
  try {
    const response = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important for cookies
      body: JSON.stringify({
        emailOrUsername: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // User logged in successfully
      console.log("User:", data.user);
      return data.user;
    } else {
      // Handle error
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
```

### Check Auth Example

```typescript
const checkAuth = async () => {
  try {
    const response = await fetch("http://localhost:5000/auth/check-auth", {
      method: "GET",
      credentials: "include", // Important for cookies
    });

    const data = await response.json();
    return data.isAuthenticated;
  } catch (error) {
    return false;
  }
};
```

---

## 🔧 Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-jwt-secret-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:PASSWORD@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres?sslmode=require"
```

---

## ✅ Testing

### Test Admin Account

```
Email: mateusz.goszczycki1994@gmail.com
Password: Neluchu321.
Role: admin
```

### Test Login

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "mateusz.goszczycki1994@gmail.com",
    "password": "Neluchu321."
  }' \
  -c cookies.txt
```

### Test Check Auth

```bash
curl -X GET http://localhost:5000/auth/check-auth \
  -b cookies.txt
```

---

## 📝 Best Practices Implemented

1. ✅ **HTTP-Only Cookies** - Tokens nie są dostępne dla JavaScript
2. ✅ **Rate Limiting** - Ochrona przed brute force
3. ✅ **Account Locking** - Automatyczna blokada po nieudanych próbach
4. ✅ **Login History** - Pełny audit trail
5. ✅ **Ban System** - Moderacja użytkowników
6. ✅ **Consistent Response Format** - `{ success, message, data }`
7. ✅ **Detailed Error Messages** - Pomocne dla użytkownika
8. ✅ **IP Tracking** - Bezpieczeństwo i analityka
9. ✅ **Password Hashing** - Bcrypt z salt rounds 10
10. ✅ **Age Validation** - Minimum 16 lat

---

## 🎨 Response Format Standard

All endpoints follow this format:

**Success:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Optional validation errors
}
```

---

**Created:** 2025-12-30  
**Version:** 1.0.0  
**Based on:** Marketplace best practices + NestJS + Prisma
