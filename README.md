# 🌙 GRIMOIRE

Grimoire is a simple, browser-based worldbuilding tool for creators. Build and link lore in a **library → book → chapter** structure, create interactive maps with pins, and design timelines to visualize events in your fictional worlds—all in one place.

## 🚀 Features (Planned for MVP)

* 📚 Create and edit library entries (books, chapters, characters, places, objects, etc.)
* 🔑 User authentication and account management
* 🗺️ Upload maps, place pins, and link them to entries
* 🕰️ Build timelines of events and link them to entries and maps
* 💾 **PostgreSQL database persistence** (MVP includes export functionality)

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
* **Backend**: Node.js, Express, TypeScript
* **Database**: PostgreSQL with **Prisma** ORM
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

## 🏗️ Project Structure

```
grimoire/
├── frontend/          # React frontend application
│   └── src/…          # components, pages, hooks, services, types, utils
├── backend/           # Node.js/Express backend API
│   ├── prisma/        # Prisma schema and migrations
│   └── src/…          # controllers, middleware, routes, services, types, utils, config
├── shared/            # Shared types and utilities
└── docs/              # Project documentation (e.g., schema.md)
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

## 🌱 Roadmap (MVP + Future)

* **MVP**: Authentication, library/book/chapter entries, maps with pins, timelines, **export (PDF/HTML)**, PostgreSQL persistence
* Future: AI assistant, page-turn “book” interface, version history, real-time collaboration, advanced search/filters, custom themes

## 🌌 License

This project is licensed under the **GRIMOIRE License (Non-Commercial)**.

* Personal, non-commercial use only (hobby and educational).
* Commercial use is prohibited without explicit written permission.
* No creation of competing products/services.
* Modifications must be marked and retain copyright notice.

See the full license text in `LICENSE`. For commercial licensing inquiries, contact **[gabemceachran@gmail.com](mailto:gabemceachran@gmail.com)**.
