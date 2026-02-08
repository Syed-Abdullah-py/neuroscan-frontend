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

        // 5. Strict Role-Based Access Control (RBAC) based on GLOBAL ROLE only
        const path = request.nextUrl.pathname;
        const globalRole = (payload.global_role as string || "").toUpperCase();

        console.log(`[Middleware] Path: ${path}, GlobalRole: ${globalRole}`);

        // If no global role, redirect to login
        if (!globalRole) {
            console.log("[Middleware] No global role found, redirecting to login");
            return NextResponse.redirect(loginUrl);
        }

        // STRICT ENFORCEMENT:
        // ADMIN users can ONLY access /admin routes
        // RADIOLOGIST users can ONLY access /doctor routes

        if (path.startsWith("/admin")) {
            // Only ADMIN can access /admin routes
            if (globalRole !== "ADMIN") {
                console.log(`[Middleware] Non-admin (${globalRole}) trying to access /admin, redirecting to /doctor`);
                return NextResponse.redirect(new URL("/doctor", request.url));
            }
        }

        if (path.startsWith("/doctor")) {
            // Only RADIOLOGIST can access /doctor routes
            if (globalRole !== "RADIOLOGIST") {
                console.log(`[Middleware] Non-radiologist (${globalRole}) trying to access /doctor, redirecting to /admin`);
                return NextResponse.redirect(new URL("/admin", request.url));
            }
        }

        // 6. Allow access if all checks pass
        return NextResponse.next();

    } catch (error) {
        // JWT is expired or invalid -> Redirect to Login
        console.log("Session expired or invalid");
        console.error("JWT Verification Error Details:", error);
        console.log("SECRET being used:", process.env.AUTH_SECRET?.substring(0, 10) + "...");
        return NextResponse.redirect(loginUrl);
    }
}

// 7. Matcher: Apply this middleware ONLY to these paths
export const config = {
    matcher: ["/admin/:path*", "/doctor/:path*"],
};