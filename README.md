# TrustLayer — Selective Disclosure & Verification

TrustLayer lets a credential holder cryptographically prove specific facts about
a digital credential (e.g. "I hold a B.Tech degree from IIT Delhi") while keeping
every other field private. A verifier opens a public link and confirms — using a
Merkle proof and an EdDSA signature — that the disclosed fields are authentic and
untampered, without ever seeing the hidden fields.

## Overview

- **What it does:** A holder logs in, issues a digital credential, selects which
  fields to reveal, and shares a public link (with QR code). A verifier opens the
  link and gets a cryptographic pass/fail — not just filtered JSON.
- **Why selective disclosure matters:** Traditional credential sharing is
  all-or-nothing. Selective disclosure lets you prove the minimum necessary
  (data minimization) — share your degree without exposing your CGPA, marks, or
  other personal fields.
- **Key innovation — Merkle tree + EdDSA:** Each field is hashed (SHA-256 + a
  per-field random salt) into a Merkle tree. The issuer signs only the Merkle
  **root** with an EdDSA (Ed25519) key. To reveal a subset of fields, the holder
  provides those field values plus their Merkle proofs. The verifier recomputes
  the leaf hashes, walks each proof to the root, and checks the signature over
  that root — so authenticity holds even though most of the tree is hidden.

## Tech Stack

| Layer     | Technology                                   | Purpose                                           |
| --------- | -------------------------------------------- | ------------------------------------------------- |
| Backend   | Node.js + Express + TypeScript               | REST API and request handling                     |
| Database  | PostgreSQL + Prisma ORM                       | Persistent storage (UUID keys, JSONB crypto data) |
| Crypto    | jose (EdDSA/Ed25519), Node.js crypto, jsonwebtoken | Merkle tree, SHA-256 hashing, signing, JWT auth   |
| Frontend  | Next.js 16 (App Router) + TypeScript         | Holder dashboard and public verifier page         |
| Styling   | Tailwind CSS + shadcn/ui + lucide-react      | UI components and icons                            |
| Auth      | JWT (7-day expiry, localStorage)             | Stateless authentication                          |
| Container | Docker + docker-compose                      | Reproducible multi-service deployment             |

## Architecture

```
   ┌──────────┐   issue    ┌──────────────────────────┐
   │  Holder  │ ─────────▶ │  Backend (Express)        │
   │ (browser)│            │  • hash fields (SHA-256)  │
   └──────────┘            │  • build Merkle tree      │
        │                  │  • EdDSA-sign the root    │
        │  select fields   │  • AES-256-GCM store       │
        │  + share         └──────────────────────────┘
        ▼                              │
   ┌──────────┐   share link/QR        │ Verifiable Presentation
   │  Holder  │ ───────────────────────┘ (disclosed fields + Merkle proofs
   └──────────┘                            + signature + public key)
        │
        │  public link
        ▼
   ┌──────────┐   verify   ┌──────────────────────────┐
   │ Verifier │ ─────────▶ │  Backend (public route)   │
   │ (browser)│            │  • verify EdDSA signature │
   └──────────┘            │  • recompute leaf hashes  │
        ▲                  │  • check Merkle proofs    │
        │  verified ✓      └──────────────────────────┘
        └─── only disclosed fields shown, hidden fields stay private
```

## Quick Start (Docker)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd selective-disclosure

# 2. Build and start all services (postgres + backend + frontend)
docker-compose up --build

# 3. Open the app
#    Frontend: http://localhost:3000
#    Backend:  http://localhost:5000/api/health
```

Migrations run automatically inside the backend container on startup.

## Local Development Setup

### Prerequisites

- Node.js 20+
- Docker Desktop (for the PostgreSQL database)

### Database setup

```bash
# Start only the database (exposed on host port 5433)
docker-compose up -d postgres
```

### Backend setup

```bash
cd backend
cp .env.example .env          # then edit values as needed
npm install
npx prisma migrate deploy     # apply migrations
npx prisma generate           # generate Prisma client
npm run dev                   # starts on http://localhost:5000
```

### Frontend setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev                   # starts on http://localhost:3000
```

## Environment Variables

### Backend (`backend/.env`)

| Variable         | Description                                          | Example                                                        |
| ---------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| `PORT`           | Port the Express server listens on                   | `5000`                                                         |
| `NODE_ENV`       | Runtime environment                                  | `development`                                                  |
| `DATABASE_URL`   | PostgreSQL connection string                         | `postgresql://user:password@localhost:5433/selective_disclosure` |
| `JWT_SECRET`     | Secret for signing JWTs (min 32 chars)               | `replace-with-strong-random-string-min-32-chars`              |
| `JWT_EXPIRES_IN` | JWT lifetime                                         | `7d`                                                          |
| `ENCRYPTION_KEY` | AES-256-GCM key — must be exactly 32 characters      | `replace-with-32-char-string-exact-length`                   |
| `FRONTEND_URL`   | Allowed CORS origin                                  | `http://localhost:3000`                                       |

### Frontend (`frontend/.env.local`)

| Variable               | Description                                                | Example                       |
| ---------------------- | ---------------------------------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_API_URL`  | API base URL used by the browser in local dev             | `http://localhost:5000/api`   |
| `NEXT_PUBLIC_APP_URL`  | Public app URL (used for building share links)            | `http://localhost:3000`       |
| `BACKEND_INTERNAL_URL` | Backend URL the Next.js server proxies `/api/*` to        | `http://localhost:5000`       |

## API Documentation

All responses follow:
`{ "success": true, "data": { ... } }` or
`{ "success": false, "error": { "code": "...", "message": "..." } }`

### POST `/api/auth/register` — public

- **Body:** `{ "name": string, "email": string, "password": string }`
- **Response:** `{ success, data: { token, user: { id, name, email, createdAt } } }`

### POST `/api/auth/login` — public

- **Body:** `{ "email": string, "password": string }`
- **Response:** `{ success, data: { token, user: { id, name, email, createdAt } } }`

### POST `/api/credentials/issue` — auth required (Bearer token)

- **Body:** `{ name, degree, graduationYear, cgpa, marks, issuerName, issueDate }`
- **Response:** `{ success, data: { credentialId, metadata, message } }`

### GET `/api/credentials` — auth required (Bearer token)

- **Response:** `{ success, data: { credentials: [{ id, metadata, createdAt, updatedAt }], count } }`
  (raw field values are never returned in the list)

### POST `/api/credentials/share` — auth required (Bearer token)

- **Body:** `{ "credentialId": uuid, "selectedFields": string[], "expiryHours": number }`
- **Response:** `{ success, data: { shareToken, shareUrl, expiresAt, message } }`

### GET `/api/credentials/share/:token` — public

- **Response:** `{ success, data: { presentation } }` (404 if missing/expired)

### POST `/api/credentials/verify` — public, rate limited (20/min per IP)

- **Body:** `{ "shareToken": uuid }`
- **Response:** `{ success, data: { valid, checks: { signatureValid, fieldsIntact, merkleValid, notExpired }, disclosedFields, issuerName, issuedAt, expiresAt, hiddenFieldCount, presentationId } }`

## How Selective Disclosure Works

1. **Hash each field.** When a credential is issued, every field is combined with
   a random per-field salt and hashed with **SHA-256** (`key:value:salt`). The
   salt prevents dictionary/guessing attacks on short field values.
2. **Build a Merkle tree.** The field hashes become the leaves of a Merkle tree;
   parent nodes are SHA-256 hashes of their children, up to a single **root**.
3. **Sign the root.** The issuer generates an **EdDSA (Ed25519)** key pair and
   signs only the Merkle root. The signature commits to the entire credential
   without revealing any field.
4. **Selectively reveal.** To share, the holder picks fields to disclose. For
   each disclosed field the backend includes its value, salt, and a **Merkle
   proof** (the sibling hashes needed to recompute the root). Hidden fields are
   never sent.
5. **Verify.** The verifier recomputes each disclosed leaf hash, walks its Merkle
   proof up to a candidate root, confirms that root equals the signed root, and
   verifies the EdDSA signature over it. If every check passes, the disclosed
   fields are provably authentic and untampered — while hidden fields remain
   private.

## Security Considerations

- **EdDSA (Ed25519) signatures** over the Merkle root via `jose`.
- **SHA-256 hashing** of every field with a **random salt per field**.
- **AES-256-GCM encryption** of stored credential data at rest.
- **JWT authentication** with a 7-day expiry.
- **Rate limiting** on `POST /api/credentials/verify` (20 requests/min per IP).
- **bcrypt password hashing** (12 rounds) — passwords are never stored in plain text.
- **Zod input validation** on every endpoint before processing.
- **Helmet** secure HTTP headers.
- **CORS** restricted to the configured frontend origin.
- **No sensitive data leakage:** password hashes, private keys, and salts are
  never returned in API responses; list APIs omit raw field values.

## Project Structure

```
selective-disclosure/
├── backend/
│   ├── src/
│   │   ├── config/        # env.ts, database.ts
│   │   ├── controllers/   # authController.ts, credentialController.ts
│   │   ├── middleware/    # authMiddleware.ts, errorHandler.ts, rateLimiter.ts
│   │   ├── routes/        # authRoutes.ts, credentialRoutes.ts
│   │   ├── services/      # cryptoService.ts, merkleTree.ts, credentialService.ts
│   │   ├── utils/         # validators.ts
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── .env.example
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/               # routes: (auth)/login, (auth)/register, dashboard,
│   │                      #         credentials, credentials/issue, share/[token]
│   ├── components/        # layout/, credentials/, ProtectedRoute.tsx, ui/
│   ├── context/           # AuthContext.tsx
│   ├── lib/               # api.ts, auth.ts, utils.ts
│   ├── .env.local.example
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
├── CLAUDE.md
├── docker-compose.yml
└── README.md
```

## What I Would Improve With More Time

### Features

- BBS+ signatures for unlinkable, multi-show presentations
- Multi-credential wallet
- Issuer trust registry
- Mock Aadhaar face authentication
- Browser extension

### Testing

- Jest unit tests for the crypto service
- Supertest integration tests for the API
- Playwright end-to-end tests
- 80%+ code coverage

### Performance

- Redis caching for verification results
- Database query optimization
- CDN for static assets

### Production

- Refresh token rotation
- Audit logging
- WebAuthn passwordless login
- Connection pool tuning

## License

MIT
