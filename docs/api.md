# API Documentation

## Authentication Endpoints

All authentication endpoints are prefixed with `/auth`.

### User Registration

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "USER",
    "emailVerifiedAt": null
  }
}
```

**Validation Rules:**
- Email: Must be valid email format, unique
- Password: Minimum 8 characters, must contain uppercase, lowercase, number, and special character
- Display Name: 1-100 characters

---

### User Login

**POST** `/auth/login`

Authenticate user and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "USER",
    "emailVerifiedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Session Cookie:** Sets secure HTTP-only `session_token` cookie.

---

### Get Current User

**GET** `/auth/me`

Get current authenticated user information.

**Headers:** Requires valid session cookie.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "USER",
    "emailVerifiedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "No active session"
}
```

---

### User Logout

**POST** `/auth/logout`

Logout user and invalidate session.

**Headers:** Requires valid session cookie.

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Email Verification

### Request Email Verification

**POST** `/auth/verify/request`

Send email verification link to user's email address.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a verification link has been sent"
}
```

**Email Template:** Sends HTML email with verification link to `${FRONTEND_URL}/verify-email?token={token}`

---

### Confirm Email Verification

**POST** `/auth/verify/confirm`

Verify user's email address using token from email.

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Invalid or expired verification token"
}
```

```json
{
  "success": false,
  "message": "Email is already verified"
}
```

---

## Password Reset

### Request Password Reset

**POST** `/auth/password/reset/request`

Send password reset link to user's email address.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

**Email Template:** Sends HTML email with reset link to `${FRONTEND_URL}/reset-password?token={token}`

**Security:** Token expires in 1 hour, invalidates all user sessions after successful reset.

---

### Confirm Password Reset

**POST** `/auth/password/reset/confirm`

Reset user's password using token from email.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

---

## Error Handling

### Common Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "message": "No active session"
}
```

**Forbidden (403):**
```json
{
  "success": false,
  "message": "Email verification required"
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

**Conflict (409):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**Internal Server Error (500):**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Security Features

### Password Security
- **Hashing:** Argon2id (industry standard)
- **Requirements:** Minimum 8 characters, uppercase, lowercase, number, special character
- **Validation:** Server-side validation with Zod schemas

### Session Management
- **Storage:** Secure HTTP-only cookies
- **Expiration:** Configurable (default: 7 days)
- **Security:** CSRF protection, same-site cookies
- **Tracking:** User agent and IP address logging

### Rate Limiting
- **Window:** 15 minutes (900,000ms)
- **Limit:** 100 requests per window
- **Scope:** Per IP address

### Email Security
- **Tokens:** Cryptographically secure random tokens
- **Expiration:** 1 hour for verification/reset tokens
- **One-time use:** Tokens are consumed after use
- **Normalization:** Email addresses are normalized (lowercase, trimmed)

---

## Environment Configuration

### Required Environment Variables

```env
# Server
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/grimoire_dev"

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Email (Development - Ethereal)
# Production: Configure real SMTP settings
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=ethereal_user@ethereal.email
SMTP_PASS=ethereal_password
SMTP_FROM=noreply@grimoire.app
```

---

## Testing

### Development Email Testing
- Uses Ethereal Email service (no real credentials needed)
- Emails are captured and can be viewed at: https://ethereal.email
- Login with the Ethereal credentials generated by the system

### Production Email Setup
For production, replace Ethereal settings with real SMTP credentials:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com
```

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password (not regular password)
3. Use App Password in `SMTP_PASS`
