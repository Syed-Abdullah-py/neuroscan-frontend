import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Encode the secret
const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

// Proxy function
export async function proxy(request: NextRequest) {
    // 1. Check for the session cookie
    const session = request.cookies.get("session")?.value;

    // 2. Define login URL for redirects
    const loginUrl = new URL("/login", request.url);

    // 3. If no session exists, redirect immediately
    if (!session) {
        return NextResponse.redirect(loginUrl);
    }

    // 4. Verify the JWT
    try {
        const { payload } = await jwtVerify(session, secret, {
            algorithms: ["HS256"],
        });

        // 5. Role-Based Access Control (RBAC)
        const path = request.nextUrl.pathname;
        const role = payload.role as string;

        // Prevent Doctors from accessing Admin routes
        if (path.startsWith("/admin") && role !== "ADMIN" && role !== "OWNER") {
            return NextResponse.redirect(new URL("/doctor", request.url));
        }

        // Prevent Admins from accessing Doctor routes (Optional, depending on business logic)
        // If Admins can see everything, remove this block.
        if (path.startsWith("/doctor") && role !== "DOCTOR" && role !== "ADMIN") {
            return NextResponse.redirect(new URL("/admin", request.url));
        }

        // 6. Allow access if all checks pass
        return NextResponse.next();

    } catch (error) {
        // JWT is expired or invalid -> Redirect to Login
        console.log("Session expired or invalid");
        return NextResponse.redirect(loginUrl);
    }
}

// 7. Matcher: Apply this middleware ONLY to these paths
export const config = {
    matcher: ["/admin/:path*", "/doctor/:path*"],
};