<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# KrishnaOS Architecture

KrishnaOS is organized into three independent areas:

```
├── frontend/    # React 19 + Vite web application
├── backend/     # Express + Node.js API server & AI Core
└── android/     # Native / Cross-platform Android application placeholder
```

## Directory Structure & Responsibilities

### 1. Frontend (`frontend/`)
- **Framework**: React 19, Vite, TypeScript, TailwindCSS v4
- **State & Routing**: Zustand (`store/system.ts`), React Router v7
- **Authentication**: Firebase Authentication (`src/lib/firebase.ts`, `AuthContext.tsx`)
- **Development**: `cd frontend && npm install && npm run dev` (runs on http://localhost:5173)

### 2. Backend (`backend/`)
- **Framework**: Express, Node.js, TypeScript
- **Features**: API routes, Gemini AI / DALL-E integration, SMTP Mailer (`server/authMailer.ts`), IoT diagnostics
- **Development**: `cd backend && npm install && npm run dev` (runs on http://localhost:3000)

### 3. Android (`android/`)
- Mobile application workspace placeholder for future mobile builds.

---

## Running Locally

1. **Backend Server**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend App**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The frontend Vite dev server automatically proxies `/api/*` calls to the backend on `http://localhost:3000`.

