# 🌙 GRIMOIRE

Grimoire is a simple, browser-based worldbuilding tool for creators. Build and link lore in a **library → book → chapter** structure, create interactive maps with pins, and design timelines to visualize events in your fictional worlds—all in one place.

## 🚀 Features (Planned for MVP)

* 📚 Create and edit library entries (books, chapters, characters, places, objects, etc.)
* 🔑 **User authentication and account management** ✅ *Complete*
* 📧 **Email verification and password reset** ✅ *Complete*
* 🗺️ Upload maps, place pins, and link them to entries
* 🕰️ Build timelines of events and link them to entries and maps
* 💾 **PostgreSQL database persistence** (MVP includes export functionality)

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
* **Backend**: Node.js, Express, TypeScript
* **Database**: PostgreSQL with **Prisma** ORM
* **Authentication**: Argon2id password hashing, JWT sessions, email verification
* **Email**: Nodemailer with SMTP support (Ethereal for development)
* **Development**: Hot reload, TypeScript compilation, ESLint
* **Architecture**: Full-stack monorepo with workspaces

## 📦 Installation & Usage

### Prerequisites

* Node.js (v18 or higher)
* PostgreSQL (v13 or higher)
* npm

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/YOUR-USERNAME/grimoire.git
   cd grimoire
   ```
2. Install all dependencies:

   ```bash
   npm run install:all
   ```
3. Set up environment variables:

   * Copy `backend/env.example` to `backend/.env`
   * Set `DATABASE_URL` for your PostgreSQL instance
4. Set up the database schema and client:

   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```
5. Start the development servers:

   ```bash
   npm run dev
   ```

This starts the frontend ([http://localhost:5173](http://localhost:5173)) and backend ([http://localhost:8000](http://localhost:8000)) concurrently.

## 🔐 Authentication System

The authentication system is fully implemented with secure password hashing, session management, and email verification.

### Quick Reference
* **8 API endpoints** for complete auth flow
* **Argon2id** password hashing (industry standard)
* **Session-based authentication** with secure HTTP-only cookies
* **Email verification** and **password reset** via secure tokens
* **Rate limiting**, **CORS protection**, and **input validation**

### API Documentation
📖 **Detailed API docs**: See [`docs/api.md`](docs/api.md) for complete endpoint documentation, request/response examples, and error codes.

### Email Configuration
For development, the system uses Ethereal Email (no real credentials needed). For production, configure SMTP settings in your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com
```

## 🧪 Testing

### Running Tests

```bash
# Run authentication smoke tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The authentication system includes comprehensive smoke tests covering:
- User registration and validation
- User login and session management
- Email verification flow
- Password reset flow
- Error handling and edge cases

See [`backend/src/tests/auth.smoke.test.ts`](backend/src/tests/auth.smoke.test.ts) for test implementation details.

## 🏗️ Project Structure

```
grimoire/
├── frontend/          # React frontend application
│   └── src/…          # components, pages, hooks, services, types, utils
├── backend/           # Node.js/Express backend API
│   ├── prisma/        # Prisma schema and migrations
│   └── src/…          # controllers, middleware, routes, services, types, utils, config
├── shared/            # Shared types and utilities
└── docs/              # Project documentation
    ├── api.md         # Complete API documentation
    ├── architecture.md # System architecture and services
    ├── deployment.md   # Deployment and environment setup
    └── schema.md       # Database schema and relationships
```

## 🚀 Available Scripts

* `npm run dev` – Start both frontend and backend in development mode
* `npm run dev:frontend` – Start only the frontend
* `npm run dev:backend` – Start only the backend
* `npm run build` – Build both frontend and backend for production
* `npm run install:all` – Install dependencies for all workspaces
* `npm run clean` – Clean all node\_modules and build directories
* `npx prisma migrate dev` – Run database migrations
* `npx prisma studio` – Open Prisma Studio for database management
* `npm test` – Run authentication smoke tests

## 🌱 Roadmap (MVP + Future)

### ✅ Completed (MVP Phase 1)
* **Authentication System** - User registration, login, email verification, password reset
* **Database Setup** - PostgreSQL with Prisma ORM, user and session management
* **Security** - Argon2id hashing, session management, rate limiting, input validation
* **Email Integration** - SMTP support with verification and reset emails

### 🚧 In Progress (MVP Phase 2)
* **Library System** - Book/chapter entries, character/place/object management
* **Map System** - Upload maps, place pins, link to entries
* **Timeline System** - Event timelines linked to entries and maps

### 🔮 Future
* **Export System** - PDF/HTML export functionality
* **AI Assistant** - Help with worldbuilding and content generation
* **Page-turn Interface** - Book-like reading experience
* **Version History** - Track changes and revisions
* **Real-time Collaboration** - Multiple users editing simultaneously
* **Advanced Search** - Full-text search and filtering
* **Custom Themes** - Personalized UI themes

## 🌌 License

This project is licensed under the **GRIMOIRE License (Non-Commercial)**.

* Personal, non-commercial use only (hobby and educational).
* Commercial use is prohibited without explicit written permission.
* No creation of competing products/services.
* Modifications must be marked and retain copyright notice.

See the full license text in `LICENSE`. For commercial licensing inquiries, contact **[gabemceachran@gmail.com](mailto:gabemceachran@gmail.com)**.
