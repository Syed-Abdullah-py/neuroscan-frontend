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

        // If user has no active workspace (role is undefined), force them to workspace selection
        if (!role) {
            // Check global role to decide where to send them
            // If they are a global admin, they should go to /admin to see "No Active Workspace" and manage/create one.
            // If they are a global doctor, they should go to /doctor.

            // Note: We need to trust the payload or fetch user. Payload is faster.
            // Assuming we stored globalRole in the JWT payload.
            // If not, we might need to default to /doctor or check another claim.
            // Let's assume we can fetch or infer. For now, default to /doctor unless we can verify admin.

            // However, our JWT creation logic needs to ensure `globalRole` or similar is present if `role` (workspace role) is missing.
            // Let's rely on path for now: if they are trying to access /admin*, let them go to /admin (which handles empty state).
            // If they are trying to access /doctor*, let them go to /doctor.

            // BETTER LOGIC: Just allow access to the dashboard ROOT so they can see the "No Workspace" state.
            // Taking them to /admin or /doctor root is fine.

            // If they are at /admin/workspaces or /doctor/workspaces, allow it.
            if (path.includes("/workspaces")) {
                return NextResponse.next();
            }

            // Otherwise, let them proceed to the dashboard root corresponding to the path they are trying to visit.
            // The Page component itself handles the "No Workspace" UI.
            if (path === "/admin" || path === "/doctor") {
                return NextResponse.next();
            }

            // valid redirect
            if (path.startsWith("/admin")) return NextResponse.redirect(new URL("/admin", request.url));
            return NextResponse.redirect(new URL("/doctor", request.url));
        }

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