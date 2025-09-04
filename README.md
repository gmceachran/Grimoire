# 🌙 GRIMOIRE

Grimoire is a simple, browser-based worldbuilding tool for creators. Build and link lore entries, create interactive maps with pins, and design timelines to visualize events in your fictional worlds—all in one place.

## 🚀 Features (Planned for MVP)

- 📚 Create and edit encyclopedia entries (characters, places, objects, etc.)
- 🗺️ Upload maps, place pins, and link them to entries
- 🕰️ Build timelines of events and link them to entries and maps
- 💾 Save and load data via localStorage (future: export/import)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Development**: Hot reload, TypeScript compilation, ESLint
- **Architecture**: Full-stack monorepo with workspaces

## 📦 Installation & Usage

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm

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
   - Copy `backend/env.example` to `backend/.env`
   - Configure your database connection

4. Start the development servers:
   ```bash
   npm run dev
   ```

This will start both the frontend (http://localhost:5173) and backend (http://localhost:8000) concurrently.

## 🏗️ Project Structure

```
grimoire/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── backend/           # Node.js/Express backend API
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   └── dist/              # Compiled JavaScript
├── shared/            # Shared types and utilities
└── docs/              # Project documentation
```

## 🚀 Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend
- `npm run dev:backend` - Start only the backend
- `npm run build` - Build both frontend and backend for production
- `npm run install:all` - Install dependencies for all workspaces
- `npm run clean` - Clean all node_modules and build directories

## 🌱 Roadmap (Future Features)

- AI assistant for generating entries and highlighting inconsistencies
- Book-like interface with page-turn animations
- Version control for entries (commit history and revert system)
- PDF/HTML export functionality
- Real-time collaboration
- Advanced search and filtering
- Custom themes and layouts

## 🌌 License

This project is licensed under the MIT License.
