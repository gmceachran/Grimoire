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
