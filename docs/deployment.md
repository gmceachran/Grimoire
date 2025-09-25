# Deployment & Environment Setup

## Development Environment Setup

### Prerequisites

**Required Software**:
- **Node.js**: v18 or higher
- **PostgreSQL**: v13 or higher
- **npm**: v8 or higher
- **Git**: For version control

**Development Tools** (Recommended):
- **VS Code** or **Cursor**: IDE with TypeScript support
- **PostgreSQL Client**: pgAdmin, DBeaver, or psql command line
- **Git**: For version control

### Step-by-Step Setup

#### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/grimoire.git
cd grimoire

# Install all dependencies
npm run install:all
```

#### 2. Database Setup

**Create PostgreSQL Database**:
```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database user
CREATE USER grimoire_user WITH PASSWORD 'secure_password';

# Create databases
CREATE DATABASE grimoire_dev OWNER grimoire_user;
CREATE DATABASE grimoire_test OWNER grimoire_user;

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE grimoire_dev TO grimoire_user;
GRANT ALL PRIVILEGES ON DATABASE grimoire_test TO grimoire_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO grimoire_user;

# Exit PostgreSQL
\q
```

#### 3. Environment Configuration

**Copy Environment Template**:
```bash
cd backend
cp env.example .env
```

**Configure Development Environment** (`.env`):
```env
# Server Configuration
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
DATABASE_URL="postgresql://grimoire_user:secure_password@localhost:5432/grimoire_dev"

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Development - Ethereal)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=ethereal_user@ethereal.email
SMTP_PASS=ethereal_password
SMTP_FROM=noreply@grimoire.app
```

#### 4. Database Migration

```bash
cd backend

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# (Optional) Seed database with test data
npx prisma db seed
```

#### 5. Start Development Servers

```bash
# From project root - starts both frontend and backend
npm run dev

# Or start individually:
npm run dev:frontend  # Frontend on http://localhost:5173
npm run dev:backend   # Backend on http://localhost:8000
```

#### 6. Verify Installation

**Test Backend**:
```bash
curl http://localhost:8000/health
curl http://localhost:8000/api
```

**Test Authentication**:
```bash
# Register a test user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!","displayName":"Test User"}'

# Test email verification request
curl -X POST http://localhost:8000/auth/verify/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## Production Environment Setup

### Prerequisites

**Production Requirements**:
- **Node.js**: v18+ LTS
- **PostgreSQL**: v13+ (managed service recommended)
- **SMTP Service**: Gmail, SendGrid, or similar
- **Reverse Proxy**: Nginx (recommended)
- **SSL Certificate**: Let's Encrypt or commercial
- **Domain Name**: For production deployment

### Production Configuration

#### 1. Environment Variables

**Production Environment** (`.env`):
```env
# Server Configuration
PORT=8000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Database Configuration
DATABASE_URL="postgresql://user:password@host:5432/grimoire_prod"

# JWT Configuration
JWT_SECRET=super_secure_jwt_secret_for_production_use_a_long_random_string
JWT_EXPIRES_IN=7d

# Rate Limiting (More restrictive for production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Email Configuration (Production SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_production_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com
```

#### 2. Database Setup

**Managed PostgreSQL** (Recommended):
- **AWS RDS**: Fully managed PostgreSQL
- **Google Cloud SQL**: Managed database service
- **DigitalOcean Managed Databases**: Simple setup
- **Railway**: Modern database hosting

**Manual PostgreSQL Setup**:
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Configure PostgreSQL
sudo -u postgres createuser --interactive
sudo -u postgres createdb grimoire_prod

# Configure authentication
sudo nano /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql
```

#### 3. Email Service Setup

**Gmail App Password Setup**:
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password: Google Account → Security → App passwords
3. Use App Password in `SMTP_PASS` (not your regular password)

**Alternative SMTP Providers**:
- **SendGrid**: Professional email service
- **Mailgun**: Developer-friendly email API
- **AWS SES**: Scalable email service
- **Postmark**: Transactional email service

#### 4. Build and Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
```

#### 5. Reverse Proxy (Nginx)

**Nginx Configuration** (`/etc/nginx/sites-available/grimoire`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Auth endpoints
    location /auth/ {
        proxy_pass http://localhost:8000/auth/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Docker Deployment

### Dockerfile

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 8000

# Start application
CMD ["npm", "start"]
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: grimoire
      POSTGRES_USER: grimoire_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://grimoire_user:secure_password@postgres:5432/grimoire
      NODE_ENV: production
      JWT_SECRET: your_jwt_secret
      SMTP_HOST: smtp.gmail.com
      SMTP_PORT: 587
      SMTP_USER: your_email@gmail.com
      SMTP_PASS: your_app_password
      SMTP_FROM: noreply@yourdomain.com
    depends_on:
      - postgres
    ports:
      - "8000:8000"
    command: >
      sh -c "npx prisma migrate deploy && npm start"

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:8000

volumes:
  postgres_data:
```

### Docker Deployment Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

---

## Monitoring and Maintenance

### Health Checks

**Application Health**:
```bash
# Check application status
curl http://localhost:8000/health

# Check database connection
curl http://localhost:8000/api
```

**Database Health**:
```bash
# Connect to database
psql $DATABASE_URL

# Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

# Check active connections
SELECT count(*) FROM pg_stat_activity;
```

### Logging

**Application Logs**:
- **Development**: Console output with Morgan HTTP logger
- **Production**: Structured JSON logs
- **Error Tracking**: Consider Sentry or similar service

**Database Logs**:
- **PostgreSQL**: Configure logging in `postgresql.conf`
- **Queries**: Enable query logging for debugging
- **Performance**: Monitor slow queries

### Backup Strategy

**Database Backups**:
```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql $DATABASE_URL < backup_file.sql

# Automated backups (cron job)
0 2 * * * pg_dump $DATABASE_URL | gzip > /backups/grimoire_$(date +\%Y\%m\%d).sql.gz
```

### Security Considerations

**Production Security**:
- **Environment Variables**: Never commit `.env` files
- **JWT Secret**: Use cryptographically secure random string
- **Database**: Use strong passwords and limit network access
- **HTTPS**: Always use SSL/TLS in production
- **Rate Limiting**: Configure appropriate limits
- **CORS**: Restrict to your domain only
- **Headers**: Use security headers (Helmet)

**Regular Maintenance**:
- **Updates**: Keep dependencies updated
- **Security Patches**: Apply security updates promptly
- **Monitoring**: Monitor for unusual activity
- **Backups**: Test backup restoration regularly

---

## Troubleshooting

### Common Issues

**Database Connection Issues**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
sudo -u postgres psql -l

# Check user permissions
sudo -u postgres psql -c "\du"
```

**Email Issues**:
- **Gmail**: Verify App Password is correct
- **Rate Limits**: Check SMTP provider limits
- **Firewall**: Ensure port 587 is open

**Build Issues**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npx tsc --noEmit
```

### Performance Optimization

**Database Optimization**:
- **Indexes**: Add indexes on frequently queried columns
- **Connection Pooling**: Configure Prisma connection pool
- **Query Optimization**: Use Prisma query optimization

**Application Optimization**:
- **Caching**: Implement Redis for session storage
- **Compression**: Enable gzip compression
- **CDN**: Use CDN for static assets

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT signing secret | Long random string |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Email Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | `your_email@gmail.com` |
| `SMTP_PASS` | SMTP password/app password | `your_app_password` |
| `SMTP_FROM` | From email address | `noreply@yourdomain.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
