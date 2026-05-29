# Project Context — TrustLayer - Selective Disclosure & Verification Module

## What This Project Is
A full-stack application where a Credential Holder can selectively share
specific fields of a digital credential while a Verifier can
cryptographically confirm the shared data is authentic and untampered.

## Problem Statement (Source of Truth)
- Holder logs in → issues a credential → selects fields to share
- Backend creates a Verifiable Presentation with Merkle proof
- Verifier opens public link → sees only disclosed fields → verified cryptographically
- This is NOT just JSON filtering — real Merkle tree + EdDSA signatures required

## Tech Stack (DO NOT CHANGE)
- Backend:  Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM (Docker on port 5433)
- Crypto:   jose + jsonwebtoken + Node.js crypto (EdDSA, SHA-256, Merkle tree)
- Frontend: Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Auth:     JWT (7 day expiry, stored in localStorage)

## Project Structure
selective-disclosure/
├── backend/
│   ├── src/
│   │   ├── config/        → env.ts, database.ts
│   │   ├── controllers/   → authController.ts, credentialController.ts
│   │   ├── middleware/    → authMiddleware.ts, errorHandler.ts, rateLimiter.ts
│   │   ├── routes/        → authRoutes.ts, credentialRoutes.ts
│   │   ├── services/      → cryptoService.ts, merkleTree.ts, credentialService.ts
│   │   ├── utils/         → validators.ts
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── .env
└── frontend/
    ├── app/
    │   ├── (auth)/login/page.tsx
    │   ├── (auth)/register/page.tsx
    │   ├── dashboard/page.tsx          ← Step 7
    │   ├── credentials/page.tsx        ← Step 7
    │   ├── credentials/issue/page.tsx  ← Step 7
    │   ├── share/[token]/page.tsx      ← Step 8
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── layout/AppLayout.tsx        ← Step 7
    │   ├── credentials/
    │   │   ├── CredentialCard.tsx      ← Step 7
    │   │   ├── SelectiveShareModal.tsx ← Step 7
    │   │   └── QRCodeDisplay.tsx       ← Step 7
    │   └── ProtectedRoute.tsx
    ├── context/AuthContext.tsx
    └── lib/api.ts, auth.ts

## Build Steps
- [x] Step 1 — Project scaffold + Express server + health check
- [x] Step 2 — PostgreSQL schema + Prisma models + Docker DB
- [x] Step 3 — Auth system (register, login, JWT middleware)
- [x] Step 4 — Crypto service (Merkle tree, EdDSA, selective disclosure)
- [x] Step 5 — Credential APIs (issue, list, share, verify)
- [x] Step 6 — Frontend setup + auth pages (login, register)
- [x] Step 7 — Holder interface (dashboard, issue, share modal, QR)
- [ ] Step 8 — Verifier page + Docker + README

## Current Completed Steps
Step 1 ✓ — Project scaffold + Express server (port 5000)
Step 2 ✓ — PostgreSQL schema + Prisma + Docker (port 5433)
Step 3 ✓ — Auth system (register, login, JWT middleware)
Step 4 ✓ — Crypto service (Merkle tree + EdDSA + selective disclosure)
Step 5 ✓ — Credential APIs (issue, list, share, verify)
Step 6 ✓ — Frontend setup + auth pages (Next.js 16 + shadcn)
Next: Step 7 — Holder interface (dashboard, issue, share modal, QR)
Next: Step 8 — Verifier page + Docker + README

## Backend API Endpoints (All Tested and Working)
POST /api/auth/register           → public
POST /api/auth/login              → public
POST /api/credentials/issue       → AUTH required
GET  /api/credentials             → AUTH required
POST /api/credentials/share       → AUTH required
GET  /api/credentials/share/:token → public
POST /api/credentials/verify      → public, rate limited (20/min)

## API Response Shape (ALWAYS follow this)
Success: { "success": true, "data": { ... } }
Error:   { "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }

## Important Notes
- Docker PostgreSQL runs on port 5433 (not 5432)
- Windows PostgreSQL 17 is on port 5432 (don't touch it)
- Always run backend commands from inside backend/ folder
- Use Invoke-RestMethod for PowerShell API testing (not curl)
- Frontend runs on port 3000, backend on port 5000
- qrcode.react installed in frontend for Step 7

## Coding Rules (NEVER break these)
1. No `any` types in TypeScript — ever
2. Every API input validated with Zod before processing
3. Passwords hashed with bcrypt (rounds: 12)
4. Never return raw credential fields in list APIs
5. Never expose passwordHash, private keys, or salts in responses
6. Rate limit POST /api/credentials/verify (20 req/min per IP)
7. All errors go through the global errorHandler
8. No console.log in production (check NODE_ENV)
9. Every function has a clear single responsibility
10. Clean code — no commented-out code, no TODOs

## Frontend Rules
1. Mobile-first — works on 375px minimum width
2. lucide-react for ALL icons
3. shadcn/ui for ALL UI components
4. Tailwind CSS only — no custom CSS
5. Loading states: skeleton components (not spinners)
6. Empty states: always show message + action button
7. Error states: always show what went wrong + retry
8. Color scheme:
   Primary:    indigo-600
   Success:    green-600
   Muted text: gray-500
   Borders:    gray-200
   Background: gray-50

## Database Rules
- ORM: Prisma only — no raw SQL
- UUIDs for all primary keys
- Timestamps: createdAt, updatedAt on every table
- Sensitive crypto data stored as JSONB in PostgreSQL

## Environment Variables
backend/.env:
  PORT=5000
  NODE_ENV=development
  DATABASE_URL=postgresql://postgres:password@127.0.0.1:5433/selective_disclosure
  JWT_SECRET=myjwtsecretkey1234567890abcdefghijklmnop
  JWT_EXPIRES_IN=7d
  ENCRYPTION_KEY=12345678901234567890123456789012
  FRONTEND_URL=http://localhost:3000

frontend/.env.local:
  NEXT_PUBLIC_API_URL=http://localhost:5000/api
  NEXT_PUBLIC_APP_URL=http://localhost:3000

## What NOT To Do
- Do not add extra dependencies not listed in the step prompt
- Do not create files not asked for in the current step
- Do not modify files from previous steps unless told to
- Do not add features not in the problem statement
- Do not touch frontend during backend steps and vice versa
- Do not use any icon library other than lucide-react
- Do not use any UI library other than shadcn/ui