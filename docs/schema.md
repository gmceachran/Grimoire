# Database Schema Conventions

## Naming Conventions
- **Tables**: `snake_case`, plural (e.g., `users`, `world_entries`, `map_pins`)
- **Columns**: `snake_case` (e.g., `created_at`, `user_id`, `email_verified_at`)
- **Identifiers**: Unquoted (let PostgreSQL handle case sensitivity)

## ID Strategy
- **Primary Keys**: UUID v4 using `@default(uuid())` in Prisma schema
- **Foreign Keys**: UUID references to maintain consistency
- **Benefits**: Globally unique, no sequence gaps, better for distributed systems

## Timestamps
- **Standard Fields**: `created_at`, `updated_at` on all tables
- **Database Defaults**: `@default(now())` for creation, `@updatedAt` for updates
- **Timezone**: All timestamps stored as UTC

## Environment Strategy
- **Separate Databases**: `grimoire_dev`, `grimoire_test`, `grimoire_prod`
- **Connection Strings**: Environment-specific `DATABASE_URL_*` variables
- **Isolation**: Prevents dev changes from affecting production data

## Migration Strategy
- **Tool**: Prisma migrations (`prisma migrate dev`)
- **Naming**: Descriptive migration names (e.g., `add_user_email_verification`)
- **Rollback**: Documented procedure for reverting changes

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│      USER       │
│ ─────────────── │
│ id (PK)         │
│ email (unique)  │
│ password_hash   │
│ display_name    │
│ status          │
│ email_verified_at│
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│    SESSION      │
│ ─────────────── │
│ id (PK)         │
│ user_id (FK)    │
│ token_hash      │
│ expires_at      │
│ created_at      │
│ last_used_at    │
│ revoked_at      │
│ user_agent      │
│ ip_address      │
│ device_label    │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│VERIFICATION_TOKEN│
│ ─────────────── │
│ id (PK)         │
│ user_id (FK)    │
│ token (unique)  │
│ purpose         │
│ expires_at      │
│ consumed_at     │
│ created_at      │
└─────────────────┘

USER ──M:N──► ROLE (via USER_ROLE junction)
USER ──1:N──► LIBRARY
USER ──1:N──► MAP
USER ──1:N──► TIMELINE

┌─────────────────┐
│    LIBRARY      │
│ ─────────────── │
│ id (PK)         │
│ name            │
│ description     │
│ user_id (FK)    │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│      BOOK       │
│ ─────────────── │
│ id (PK)         │
│ title           │
│ description     │
│ library_id (FK) │
│ user_id (FK)    │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│    CHAPTER      │
│ ─────────────── │
│ id (PK)         │
│ title           │
│ content         │
│ book_id (FK)    │
│ user_id (FK)    │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│  WORLD_ENTRY    │
│ ─────────────── │
│ id (PK)         │
│ title           │
│ content         │
│ type            │
│ chapter_id (FK) │
│ user_id (FK)    │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│      MAP        │
│ ─────────────── │
│ id (PK)         │
│ title           │
│ description     │
│ image_url       │
│ library_id (FK) │ (optional)
│ book_id (FK)    │ (optional)
│ chapter_id (FK) │ (optional)
│ user_id (FK)    │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│    MAP_PIN      │
│ ─────────────── │
│ id (PK)         │
│ title           │
│ description     │
│ x_coordinate    │
│ y_coordinate    │
│ map_id (FK)     │
│ user_id (FK)    │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│    TIMELINE     │
│ ─────────────── │
│ id (PK)         │
│ title           │
│ description     │
│ library_id (FK) │ (optional)
│ book_id (FK)    │ (optional)
│ chapter_id (FK) │ (optional)
│ user_id (FK)    │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│ TIMELINE_EVENT  │
│ ─────────────── │
│ id (PK)         │
│ title           │
│ description     │
│ event_date      │
│ timeline_id (FK)│
│ user_id (FK)    │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│      ROLE       │
│ ─────────────── │
│ id (PK)         │
│ name (unique)   │
│ description     │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│   USER_ROLE     │
│ ─────────────── │
│ id (PK)         │
│ user_id (FK)    │
│ role_id (FK)    │
│ unique(user_id, │
│  role_id)       │
└─────────────────┘

┌─────────────────┐
│VERIFICATION_TOKEN│
│ ─────────────── │
│ id (PK)         │
│ user_id (FK)    │
│ token (unique)  │
│ purpose         │
│ expires_at      │
│ consumed_at     │
│ created_at      │
└─────────────────┘
```

## Authentication Schema Details

### User Status Enum
- **PENDING**: User registered but email not verified
- **VERIFIED**: User has verified their email address
- **SUSPENDED**: User account temporarily disabled
- **DELETED**: User account permanently disabled

### Token Purpose Enum
- **EMAIL_VERIFICATION**: Token for email address verification
- **PASSWORD_RESET**: Token for password reset requests

### Session Management
- **Token Hashing**: Session tokens are hashed (SHA-256) before storage
- **Expiration**: Configurable session expiration (default: 7 days)
- **Metadata Tracking**: User agent, IP address, and device labeling
- **Revocation**: Sessions can be individually or bulk revoked

### Security Features
- **Password Hashing**: Argon2id with configurable parameters
- **Email Normalization**: All emails stored in lowercase, trimmed
- **Token Security**: Cryptographically secure random tokens (32 bytes)
- **One-time Use**: Verification and reset tokens are consumed after use

## Key Relationships

### Required Hierarchy
- **User** → **Library** → **Book** → **Chapter** → **WorldEntry**
- Each user must have at least one Library
- Each Book must belong to a Library
- Each Chapter must belong to a Book

### Flexible Linking
- **Maps** and **Timelines** can link to Library, Book, or Chapter (optional)
- **MapPins** belong to Maps
- **TimelineEvents** belong to Timelines

### Authentication
- **Sessions** track user logins with metadata (user agent, IP, device)
- **Roles** define user permissions (USER, ADMIN) via many-to-many relationship
- **VerificationTokens** handle email verification and password resets with expiration
- **Users** have status tracking (PENDING, VERIFIED, SUSPENDED, DELETED)
