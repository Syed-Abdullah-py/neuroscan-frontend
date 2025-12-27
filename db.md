# Database Operations Overview (NeuroScan Frontend)

## Prisma Client
- The Prisma client is instantiated once in `lib/prisma.ts` and exported as `prisma`. All database interactions use this singleton.

## CRUD Operations for **User**
| Operation | File & Function | Prisma Call | Description |
|-----------|----------------|------------|-------------|
| **Create** (Sign‑up) | `actions/auth-actions.ts` – `registerUser` | `prisma.user.create({ data: { … } })` | After validation and password hashing, a new `User` row is inserted with fields `email`, `password`, `name`, `role`, `medicalLicenseId`.
| **Read** (Login / verification) | `actions/auth-actions.ts` – `loginUser` | `prisma.user.findUnique({ where: { email } })` | Retrieves a user by email to verify credentials.
| **Update** | *Not implemented yet* | – | Placeholder for future profile updates.
| **Delete** | *Not implemented yet* | – | Placeholder for future account deletion.

## Session Handling (JWT)
- **Create JWT** – In `loginUser` after password verification, a JWT is signed with `jose` and stored in an HTTP‑only cookie (`cookies().set("session", jwt, …)`).
- **Verify JWT** – Middleware (`middleware.ts`) extracts the `session` cookie, verifies it with `jwtVerify(secret, token)`, and allows the request to continue if valid.
- **Logout** – `logoutUser` deletes the `session` cookie (`cookies().delete("session")`). No DB write.

## Other Entities
- **Case / Patient** models exist in `prisma/schema.prisma`, but the current codebase does not contain CRUD actions for them. Files `actions/case-actions.ts` and `actions/user-actions.ts` are empty placeholders.

## Summary
- All user‑related database reads/writes are centralized in `actions/auth-actions.ts`.
- The Prisma client is shared via `lib/prisma.ts`.
- Authentication flow: sign‑up → `prisma.user.create`; login → `prisma.user.findUnique` + password check → JWT creation; middleware validates JWT on protected routes.

*Generated on 2025‑12‑26.*
