# Project Context — TrustLayer - a Selective Disclosure & Verification Module

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
- Database: PostgreSQL + Prisma ORM
- Crypto:   jose + jsonwebtoken + Node.js crypto (EdDSA, SHA-256, Merkle tree)
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Auth:     JWT (7 day expiry, stored in localStorage)

## Project Structure
selective-disclosure/
├── backend/
│   ├── src/
│   │   ├── config/        → env.ts (environment variables)
│   │   ├── controllers/   → route handler logic
│   │   ├── middleware/    → auth, error, rate limiter
│   │   ├── models/        → Prisma client usage
│   │   ├── routes/        → Express routers
│   │   ├── services/      → cryptoService, credentialService
│   │   ├── utils/         → validators, helpers
│   │   └── index.ts       → app entry point
│   ├── prisma/
│   │   └── schema.prisma
│   └── .env
└── frontend/
    ├── app/               → Next.js App Router pages
    ├── components/        → Reusable UI components
    └── lib/               → api client, auth helpers

## Build Steps (We Are Here)
- [x] Step 1 — Project scaffold + Express server + health check
- [ ] Step 2 — PostgreSQL schema (Prisma models)
- [ ] Step 3 — Auth system (register, login, JWT middleware)
- [ ] Step 4 — Crypto service (Merkle tree, EdDSA, selective disclosure)
- [ ] Step 5 — Credential APIs (issue, list, share, verify)
- [ ] Step 6 — Frontend setup + auth pages
- [ ] Step 7 — Holder interface (dashboard, issue, share modal, QR)
- [ ] Step 8 — Verifier page + Docker + README

## Current Completed Step
Step 1 is done:
- Express server running on port 5000
- GET /api/health returns 200
- errorHandler middleware in place
- env.ts validates required variables on startup
- TypeScript compiles clean

## API Response Shape (ALWAYS follow this)
Success:
  { "success": true, "data": { ... } }

Error:
  { "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }

## Coding Rules (NEVER break these)
1. No `any` types in TypeScript — ever
2. Every API input validated with Zod before processing
3. Passwords hashed with bcrypt (rounds: 12)
4. Never return raw credential fields in list APIs
5. Never expose private keys or salts in API responses
6. Rate limit POST /api/credentials/verify (20 req/min per IP)
7. All errors go through the global errorHandler
8. No console.log in production (use NODE_ENV check)
9. Every function has a clear single responsibility
10. Clean code — no commented-out code, no TODOs left behind

## Database Rules
- ORM: Prisma only — no raw SQL unless absolutely necessary
- UUIDs for all primary keys
- Timestamps: createdAt, updatedAt on every table
- Sensitive crypto data stored as JSONB in PostgreSQL

## Environment Variables (backend/.env)
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/selective_disclosure
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your-32-char-hex
FRONTEND_URL=http://localhost:3000

## What NOT To Do
- Do not add extra dependencies not listed in the step prompt
- Do not create files not asked for in the current step
- Do not modify files from previous steps unless the current step says so
- Do not add features not in the problem statement
- Do not touch frontend during backend steps and vice versa
## Build Steps (We Are Here)
- [x] Step 1 — Project scaffold + Express server + health check
- [x] Step 2 — PostgreSQL schema + Prisma models + Docker DB
- [x] Step 3 — Auth system (register, login, JWT middleware)
- [x] Step 4 — Crypto service (Merkle tree, EdDSA, selective disclosure)
- [ ] Step 5 — Credential APIs (issue, list, share, verify)
- [ ] Step 6 — Frontend setup + auth pages
- [ ] Step 7 — Holder interface (dashboard, issue, share modal, QR)
- [ ] Step 8 — Verifier page + Docker + README

## Current Completed Steps
Step 1 ✓ — Project scaffold + Express server
Step 2 ✓ — PostgreSQL schema + Prisma + Docker (port 5433)
Step 3 ✓ — Auth system (register, login, JWT middleware)
Step 4 ✓ — Crypto service (Merkle tree + EdDSA + selective disclosure)
Next: Step 5 — Credential APIs

## Important Notes
- Docker PostgreSQL runs on port 5433 (not 5432)
- Windows PostgreSQL 17 is on port 5432 (don't touch)
- Always run backend commands from inside backend/ folder