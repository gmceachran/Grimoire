# GRIMOIRE

A large long-term React + PostgreSQL project.

## Project Structure

```
grimoire/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend API
├── shared/            # Shared types and utilities
└── docs/              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Installation

1. Install all dependencies:
   ```bash
   npm run install:all
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Configure your database connection and other environment variables

3. Start the development servers:
   ```bash
   npm run dev
   ```

This will start both the frontend (usually on http://localhost:5173) and backend (usually on http://localhost:3001) concurrently.

## Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend
- `npm run dev:backend` - Start only the backend
- `npm run build` - Build both frontend and backend for production
- `npm run install:all` - Install dependencies for all workspaces
- `npm run clean` - Clean all node_modules and build directories

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Styling**: CSS Modules or styled-components (TBD)
- **State Management**: React Context or Redux Toolkit (TBD)
