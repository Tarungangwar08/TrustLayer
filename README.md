# TrustLayer — Selective Disclosure & Verification

A full-stack application enabling cryptographic selective disclosure of digital credentials.
Holders issue credentials, choose which fields to share, and verifiers confirm authenticity
without seeing hidden data — using real Merkle trees and EdDSA signatures, not just JSON filtering.

## Overview

**Problem:** You need to prove your CGPA to an employer without revealing your full name or
graduation year — and the employer needs to cryptographically verify the data hasn't been tampered with.

**Solution:** TrustLayer uses a Merkle tree over individually hashed credential fields, signed
with an EdDSA (Ed25519) keypair. When sharing, the holder selects fields and the system produces
Merkle proofs for those fields. Verifiers independently reconstruct the proof path to confirm
authenticity without seeing hidden fields.

## Architecture

```
Browser
  │
  ▼
Next.js Frontend (port 3000)
  │  Auth: JWT in localStorage
  │  Public: /share/[token] (no auth)
  │
  ▼
Express Backend (port 5000)
  │  REST API with Zod validation
  │  Rate limiting on verify endpoint
  │
  ▼
PostgreSQL (port 5433)
  Credential + SharePresentation tables
  Sensitive data: AES-256-GCM encrypted JSONB

──────────────────────────────────────────
Crypto Flow
──────────────────────────────────────────

ISSUE:
  Fields ──► Hash each (SHA-256 + salt)
         ──► Build Merkle tree
         ──► Sign root (EdDSA / Ed25519)
         ──► Encrypt raw fields (AES-256-GCM)
         ──► Store in PostgreSQL

SHARE:
  Select fields ──► Merkle proof for each selected field
               ──► Bundle: disclosed values + proofs + signature
               ──► Store SharePresentation with expiry
               ──► Return shareUrl / shareToken / QR code

VERIFY:
  shareToken ──► Load presentation
             ──► Check expiry (notExpired)
             ──► Verify EdDSA signature on merkleRoot (signatureValid)
             ──► Recompute field hashes (fieldsIntact)
             ──► Walk Merkle proofs to root (merkleValid)
             ──► Return per-check result
```

## Tech Stack

| Technology | Purpose | Version |
|---|---|---|
| Node.js + Express | REST API server | 20 / 4.x |
| TypeScript | Type-safe backend | 5.x |
| Prisma ORM | Database access | 5.x |
| PostgreSQL | Persistent storage | 16 |
| `jose` | EdDSA key generation & JWT signing | 5.x |
| `jsonwebtoken` | Auth JWTs | 9.x |
| `bcryptjs` | Password hashing | 2.x |
| Node.js `crypto` | SHA-256, AES-256-GCM | built-in |
| Next.js (App Router) | React frontend | 16.x |
| Tailwind CSS | Styling | 4.x |
| shadcn/ui | Component library | 4.x |
| `qrcode.react` | QR code generation | latest |
| Docker Compose | Multi-service orchestration | — |

## Quick Start (Docker — Recommended)

```bash
git clone <repo-url>
cd selective-disclosure
docker-compose up --build
```

Open [http://localhost:3000](http://localhost:3000)

> **Note:** The first build takes ~3 minutes. Prisma migrations run automatically on backend startup.

## Local Development Setup

**Prerequisites:** Node.js 20+, Docker Desktop

**1. Start the database**

```bash
docker-compose up -d postgres
```

**2. Backend setup**

```bash
cd backend
cp .env.example .env      # edit values as needed
npm install
npx prisma migrate dev
npm run dev               # http://localhost:5000
```

**3. Frontend setup**

```bash
cd frontend
npm install
npm run dev               # http://localhost:3000
```

**4. Verify the backend is healthy**

```
GET http://localhost:5000/api/health
→ { "status": "ok" }
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Express server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@127.0.0.1:5433/selective_disclosure` |
| `JWT_SECRET` | Secret for signing auth JWTs | min 32 random chars |
| `JWT_EXPIRES_IN` | Auth token expiry | `7d` |
| `ENCRYPTION_KEY` | AES-256-GCM key for field encryption | exactly 32 chars |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_APP_URL` | Frontend base URL (used in share links) | `http://localhost:3000` |

## API Documentation

All responses follow the shape:
- **Success:** `{ "success": true, "data": { ... } }`
- **Error:** `{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }`

### Authentication

**POST /api/auth/register**
```json
Request:  { "name": "Rahul Kumar", "email": "rahul@example.com", "password": "Secret123" }
Response: { "success": true, "data": { "token": "<jwt>", "user": { "id", "name", "email", "createdAt" } } }
```

**POST /api/auth/login**
```json
Request:  { "email": "rahul@example.com", "password": "Secret123" }
Response: { "success": true, "data": { "token": "<jwt>", "user": { ... } } }
```

### Credentials  *(Bearer token required)*

**POST /api/credentials/issue**
```json
Request: {
  "name": "Rahul Kumar",
  "degree": "B.Tech CS",
  "graduationYear": "2024",
  "cgpa": "8.5",
  "marks": "850/1000",
  "issuerName": "IIT Delhi",
  "issueDate": "2024-05-15"
}
Response: { "success": true, "data": { "credentialId": "<uuid>", "metadata": { ... } } }
```

**GET /api/credentials**
```json
Response: { "success": true, "data": { "credentials": [...], "count": 3 } }
```

**POST /api/credentials/share**
```json
Request:  { "credentialId": "<uuid>", "selectedFields": ["name", "degree", "cgpa"], "expiryHours": 24 }
Response: { "success": true, "data": { "shareToken": "<uuid>", "shareUrl": "http://localhost:3000/share/<uuid>", "expiresAt": "<iso>" } }
```

### Verification  *(Public)*

**GET /api/credentials/share/:token**
```json
Response: { "success": true, "data": { "presentation": { ... } } }
```

**POST /api/credentials/verify**  *(Rate limited: 20 req/min per IP)*
```json
Request: { "shareToken": "<uuid>" }
Response: {
  "success": true,
  "data": {
    "valid": true,
    "checks": {
      "signatureValid": true,
      "fieldsIntact": true,
      "merkleValid": true,
      "notExpired": true
    },
    "disclosedFields": {
      "name": { "value": "Rahul Kumar", "verified": true },
      "degree": { "value": "B.Tech CS", "verified": true }
    },
    "issuerName": "IIT Delhi",
    "issuedAt": "2024-05-15",
    "expiresAt": "<iso>",
    "hiddenFieldCount": 4,
    "presentationId": "<uuid>"
  }
}
```

## How Selective Disclosure Works

**1. Issuing a credential**

Each field is individually hashed with a random salt:
```
hash("name:Rahul Kumar:<salt>")        → leaf₀
hash("degree:B.Tech CS:<salt>")        → leaf₁
hash("graduationYear:2024:<salt>")     → leaf₂
...
```
The 7 hashes become leaves of a binary Merkle tree. The root is signed with an EdDSA private key (Ed25519). The raw fields are AES-256-GCM encrypted and stored in PostgreSQL alongside the signed credential.

**2. Creating a selective presentation**

The holder selects which fields to disclose (e.g., `name` and `degree`). The system:
- Reveals the original values for those fields
- Computes Merkle proofs (sibling paths from each leaf to the root)
- Bundles: `{ disclosedFields, fieldHashes, merkleProofs, merkleRoot, signature, publicKey, expiry }`

**3. Verifying**

The verifier:
1. Checks expiry — `notExpired`
2. Imports the public key and verifies the EdDSA signature on the Merkle root — `signatureValid`
3. Recomputes each disclosed field's hash and compares to the stored hash — `fieldsIntact`
4. Walks each field's Merkle proof path from leaf to root — `merkleValid`

If all 4 checks pass: `valid: true`. Hidden fields cannot be inferred from the proof alone.

## Security Considerations

- **EdDSA (Ed25519):** Deterministic, constant-time signatures resistant to side-channel attacks
- **SHA-256 field hashing:** Each field hashed with a 32-byte random salt; prevents pre-image attacks
- **AES-256-GCM encryption:** Raw credential fields stored encrypted at rest; DB admin cannot read them
- **JWT expiry:** Auth tokens expire after 7 days; no server-side session state
- **Rate limiting:** Verify endpoint limited to 20 requests/min per IP to prevent brute-force
- **No raw field exposure:** List APIs return only `metadata` — never encrypted data, private keys, or salts
- **Zod validation:** All API inputs validated before processing; protects against injection

## AWS Deployment Guide

For production, the recommended architecture uses managed services:

| Component | AWS Service | Notes |
|---|---|---|
| Backend container | ECS Fargate | Auto-scaling, no EC2 management |
| Frontend | CloudFront + S3 or Amplify | CDN-backed, global |
| Database | RDS PostgreSQL | Multi-AZ for high availability |
| Docker images | ECR | Private container registry |
| Secrets | Secrets Manager | Rotate `JWT_SECRET`, `ENCRYPTION_KEY` |
| Load balancer | ALB | HTTPS termination, health checks |

**Estimated cost:** ~$28/month for minimal setup (1 Fargate task, db.t3.micro RDS, 10 GB S3)

**Deployment steps:**
```bash
# 1. Push images to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker build -t trustlayer-backend ./backend
docker tag trustlayer-backend:latest <ecr-uri>/trustlayer-backend:latest
docker push <ecr-uri>/trustlayer-backend:latest

# 2. Run database migrations via ECS task override
# 3. Deploy ECS service with Fargate launch type
# 4. Set environment variables in Secrets Manager
# 5. Point CloudFront to ALB origin for the backend
```

## License

MIT — see [LICENSE](LICENSE)
