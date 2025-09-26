# System Architecture

## Overview

Grimoire follows a layered architecture pattern with clear separation of concerns between the presentation layer (frontend), business logic layer (services), and data layer (database).

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Components  │  │   Hooks     │  │   Utils     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Routes    │  │ Middleware  │  │ Controllers │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                              │                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ AuthService │  │SessionService│  │EmailService │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Prisma ORM
                              │
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE (PostgreSQL)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Users    │  │  Sessions   │  │Verification │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Service Layer Architecture

### Authentication Service (`AuthService`)

**Purpose**: Core authentication logic and user management

**Responsibilities**:
- User registration and validation
- User login and credential verification
- Email verification flow
- Password reset flow
- Email normalization and validation

**Key Methods**:
```typescript
// User Management
register(email, password, displayName): Promise<User>
login(email, password, userAgent?, ipAddress?): Promise<{user, sessionToken}>
getCurrentUser(sessionToken): Promise<User>

// Email Verification
requestEmailVerification(email): Promise<void>
verifyEmail(token): Promise<void>

// Password Reset
requestPasswordReset(email): Promise<void>
resetPassword(token, newPassword): Promise<void>

// Utilities
normalizeEmail(email): string
isValidEmail(email): boolean
```

**Dependencies**:
- `PasswordService` - Password hashing and validation
- `EmailService` - Email sending functionality
- `SessionService` - Session management
- `PrismaClient` - Database operations

---

### Session Service (`SessionService`)

**Purpose**: Secure session management and token handling

**Responsibilities**:
- Generate cryptographically secure session tokens
- Store and validate session tokens
- Track session metadata (user agent, IP, device)
- Handle session expiration and revocation

**Key Methods**:
```typescript
// Session Management
generateToken(): Promise<string>
createSession(userId, userAgent?, ipAddress?, deviceLabel?): Promise<Session>
validateSession(token): Promise<SessionInfo | null>
revokeSession(sessionId): Promise<void>
revokeAllUserSessions(userId): Promise<void>

// Security
hashToken(token): Promise<string>
```

**Security Features**:
- Tokens hashed with SHA-256 before storage
- Automatic expiration (configurable, default 7 days)
- Session tracking with metadata
- Bulk revocation capabilities

---

### Email Service (`EmailService`)

**Purpose**: Email delivery and template management

**Responsibilities**:
- Configure SMTP connections (development vs production)
- Send HTML email templates
- Handle email delivery errors
- Support for multiple email providers

**Key Methods**:
```typescript
// Core Email
sendMail(to, subject, html): Promise<void>

// Template Methods
sendVerificationEmail(to, token, displayName?): Promise<void>
sendPasswordResetEmail(to, token, displayName?): Promise<void>
```

**Configuration**:
- **Development**: Ethereal Email (fake SMTP for testing)
- **Production**: Real SMTP (Gmail, SendGrid, etc.)

**Email Templates**:
- Email verification with secure token links
- Password reset with expiration handling
- Professional HTML formatting

---

### Password Service (`PasswordService`)

**Purpose**: Secure password handling and validation

**Responsibilities**:
- Hash passwords using Argon2id algorithm
- Verify password against stored hashes
- Validate password strength requirements
- Handle password security best practices

**Key Methods**:
```typescript
// Password Security
hashPassword(password): Promise<string>
verifyPassword(hashedPassword, plainPassword): Promise<boolean>
validatePassword(password): {isValid: boolean, error?: string}
```

**Security Configuration**:
- **Algorithm**: Argon2id (industry standard)
- **Memory Cost**: 64 MB (2^16)
- **Time Cost**: 3 iterations
- **Parallelism**: 1 thread

**Password Requirements**:
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- Server-side validation with detailed error messages

---

## Middleware Stack

### Security Middleware

**Rate Limiting**:
```typescript
// Configuration
windowMs: 900000,    // 15 minutes
max: 100,           // 100 requests per window
message: "Too many requests"
```

**CORS Protection**:
```typescript
// Configuration
origin: process.env.FRONTEND_URL,
credentials: true,
methods: ['GET', 'POST', 'PUT', 'DELETE']
```

**Helmet Security Headers**:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security headers

### Request Processing Middleware

**Cookie Parser**:
- Parse HTTP-only session cookies
- Secure cookie configuration
- Same-site protection

**JSON Body Parser**:
- Parse JSON request bodies
- Size limits and error handling

**Request Logging**:
- Morgan HTTP request logger
- Development vs production formatting

### Authentication Middleware

**requireAuth Middleware**:
- Validates session tokens from cookies
- Extracts user information and adds to request object
- Blocks unauthorized access to protected routes
- Returns 401 for invalid/expired sessions

**optionalAuth Middleware**:
- Same validation as requireAuth but doesn't block requests
- Adds user info to request if session exists
- Useful for routes that work with or without authentication

**Rate Limiting Middleware**:
- **authRateLimit**: 5 attempts per 15 minutes for login/register/reset
- **emailRateLimit**: 10 attempts per 15 minutes for email verification
- **generalRateLimit**: 100 requests per 15 minutes for general API
- Prevents brute force attacks and API abuse

---

## Data Flow

### User Registration Flow

```
1. Client → POST /auth/register
2. Route → Validate input (Zod schema)
3. AuthService → Normalize email, validate password
4. AuthService → Check for existing user
5. PasswordService → Hash password (Argon2id)
6. Database → Create user record
7. Response → Return user data
```

### User Login Flow

```
1. Client → POST /auth/login
2. authRateLimit → Check rate limiting (5 attempts/15min)
3. Route → Validate input (Zod schema)
4. AuthService → Normalize email, find user
5. AuthService → Check user status
6. PasswordService → Verify password
7. SessionService → Generate session token
8. Database → Store session with metadata
9. Response → Set secure HTTP-only cookie, return user data
```

### Email Verification Flow

```
1. Client → POST /auth/verify/request
2. emailRateLimit → Check rate limiting (10 attempts/15min)
3. AuthService → Find user, generate token
4. Database → Store verification token
5. EmailService → Send verification email
6. User → Clicks email link
7. Client → POST /auth/verify/confirm
8. AuthService → Validate token, update user
9. Database → Mark token as consumed
```

### Protected Route Access Flow

```
1. Client → GET /auth/me (with session cookie)
2. requireAuth → Validate session token
3. requireAuth → Extract user info from session
4. requireAuth → Add user to request object
5. Route Handler → Access req.user directly
6. Response → Return user data
```

### Failed Authentication Flow

```
1. Client → GET /auth/me (no session cookie)
2. requireAuth → No session token found
3. requireAuth → Return 401 "No active session"
4. Client → Receives authentication error
```

---

## Security Architecture

### Authentication Security

**Password Security**:
- Argon2id hashing (memory-hard, time-hard)
- Salted hashes (unique per password)
- No plaintext password storage

**Session Security**:
- Cryptographically secure random tokens (32 bytes)
- Tokens hashed before database storage
- HTTP-only cookies (prevents XSS)
- Secure and SameSite cookie flags
- Automatic expiration and cleanup

**Email Security**:
- Cryptographically secure random tokens (32 bytes)
- Token expiration (1 hour)
- One-time use tokens
- Email normalization and validation

### Middleware Security

**Authentication Guard**:
- Validates session tokens on every protected route request
- Blocks unauthorized access with 401 responses
- Adds user context to request object for route handlers
- Handles session expiration and validation errors

**Rate Limiting Protection**:
- **Authentication endpoints**: 5 attempts per 15 minutes (login, register, password reset)
- **Email endpoints**: 10 attempts per 15 minutes (verification requests)
- **General API**: 100 requests per 15 minutes
- Prevents brute force attacks and API abuse
- Returns 429 status with retry-after headers

**Secure Cookie Configuration**:
- **HttpOnly**: Prevents JavaScript access (XSS protection)
- **SameSite=Strict**: Prevents cross-site request forgery (CSRF protection)
- **Secure flag**: HTTPS-only in production environments
- **Proper expiration**: Aligned with session lifetime (7 days)

### Input Validation

**Zod Schemas**:
- Type-safe validation at runtime
- Detailed error messages
- Consistent validation across endpoints
- Automatic TypeScript type generation

**Validation Layers**:
1. **Client-side**: Immediate feedback
2. **Route-level**: Zod schema validation
3. **Service-level**: Business logic validation
4. **Database-level**: Constraint validation

### Error Handling

**Error Types**:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Conflict errors (409)
- Server errors (500)

**Error Response Format**:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [{"field": "email", "message": "Invalid format"}]
}
```

---

## Environment Configuration

### Development Environment
- **Database**: Local PostgreSQL instance
- **Email**: Ethereal Email (fake SMTP)
- **Logging**: Verbose request logging
- **Security**: Relaxed CORS for localhost

### Production Environment
- **Database**: Managed PostgreSQL service
- **Email**: Real SMTP provider (Gmail, SendGrid)
- **Logging**: Structured JSON logging
- **Security**: Strict CORS, enhanced headers

### Environment Variables

**Required Variables**:
```env
# Server
PORT=8000
NODE_ENV=development|production
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Security
JWT_SECRET=super-secret-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@domain.com
SMTP_PASS=app-password
SMTP_FROM=noreply@domain.com
```

---

## Scalability Considerations

### Current Architecture Benefits
- **Stateless**: Sessions stored in database
- **Service-oriented**: Clear separation of concerns
- **Database-agnostic**: Prisma ORM abstraction
- **Environment-flexible**: Easy dev/prod switching

### Future Scaling Options
- **Horizontal scaling**: Multiple backend instances
- **Session storage**: Redis for session management
- **Email queues**: Background job processing
- **Database optimization**: Connection pooling, read replicas
- **Caching**: Redis for frequently accessed data

### Performance Optimizations
- **Database indexes**: On frequently queried fields
- **Connection pooling**: Prisma connection management
- **Password hashing**: Configurable cost parameters
- **Rate limiting**: Per-endpoint configuration
