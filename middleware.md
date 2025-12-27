# Middleware & Session Management Overview

## 1. Middleware Configuration (`middleware.ts`)

```ts
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Encode the secret – taken from the environment variable `AUTH_SECRET`
const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

/**
 * Next.js Edge Middleware
 *
 * - Extracts the `session` cookie from the incoming request.
 * - Verifies the JWT using the secret.
 * - If verification succeeds, the request proceeds to the protected route.
 * - If the token is missing or invalid, the user is redirected to `/login`.
 */
export async function middleware(request: NextRequest) {
  // 1️⃣ Check for the session cookie
  const session = request.cookies.get("session")?.value;

  // No cookie → redirect to login page
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // 2️⃣ Verify the JWT – throws if the token is malformed/expired
    const { payload } = await jwtVerify(session, secret);
    // `payload` contains `{ sub: userId, role: userRole }`
    // The request is allowed to continue to the next handler
    return NextResponse.next();
  } catch (error) {
    // 3️⃣ Invalid token → redirect to login
    console.warn("Invalid session token", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

### Key Points
- **Location**: The file lives at `frontend/neuroscan-frontend/middleware.ts` and is automatically applied to **all** routes because Next.js treats any exported `middleware` function as a global edge middleware.
- **Secret**: The secret is read from `process.env.AUTH_SECRET` and encoded with `TextEncoder`. This same secret is used when signing JWTs in `auth-actions.ts`.
- **Redirect Logic**: Unauthenticated users are sent to the login page, ensuring protected pages cannot be accessed without a valid session.

---

## 2. Session Management (JWT + Cookies)

### a) Login – Creating a Session (`loginUser` in `actions/auth-actions.ts`)
```ts
// After password validation …
const alg = "HS256";
const jwt = await new SignJWT({ sub: user.id, role: user.role })
  .setProtectedHeader({ alg })
  .setIssuedAt()
  .setExpirationTime("15m") // 15‑minute session
  .sign(secret);

// Store the JWT in an HTTP‑only cookie
const cookieStore = await cookies();
cookieStore.set("session", jwt, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 15, // 15 minutes
  path: "/",
  sameSite: "lax",
});
```
- **JWT Payload**: Contains the user ID (`sub`) and role, allowing the middleware to identify the caller.
- **Cookie Flags**:
  - `httpOnly` – prevents JavaScript access, mitigating XSS.
  - `secure` – only sent over HTTPS in production.
  - `sameSite: "lax"` – protects against CSRF while still allowing normal navigation.
  - `maxAge` matches the JWT expiration (15 min).

### b) Logout – Removing a Session (`logoutUser`)
```ts
export async function logoutUser() {
  const cookieStore = await cookies();
  // Delete the session cookie – browser discards it immediately
  cookieStore.delete("session");
  redirect("/login");
}
```
- No database write is required; the server simply clears the client‑side cookie.

### c) Middleware Verification (see section 1)
- Every request passes through the middleware, which reads the `session` cookie and validates the JWT using the same secret.
- If the token is valid, the request proceeds; otherwise, the user is redirected to `/login`.

---

## 3. Flow Diagram (textual)
```
[Client] --POST /login--> [auth-actions.ts] --creates JWT--> Set-Cookie: session
   |
   v
[Browser] stores `session` cookie (httpOnly)
   |
   v
[Every request] --> Middleware (middleware.ts)
   |
   |-- Cookie present? --> Yes --> Verify JWT (jwtVerify)
   |                                 |
   |                                 +-- Valid? --> Continue to route handler
   |                                 |
   |                                 +-- Invalid? --> Redirect /login
   |
   +-- No cookie? --> Redirect /login
```

---

## 4. Where to Extend
- **Long‑lived sessions**: Increase `maxAge` and JWT expiration, or implement refresh tokens.
- **Role‑based access**: Middleware can read `payload.role` and conditionally allow/deny routes.
- **Logout from all devices**: Store a token version in the DB and invalidate old JWTs by checking the version in the middleware.

---

*Generated on 2025‑12‑26.*
