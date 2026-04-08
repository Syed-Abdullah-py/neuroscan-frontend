import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

async function getSessionPayload(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    if (!session) return null;

    try {
        const { payload } = await jwtVerify(session, secret, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch {
        return null;
    }
}

function redirectAndClearSession(request: NextRequest, destination: string) {
    const response = NextResponse.redirect(new URL(destination, request.url));
    response.cookies.delete("session");
    response.cookies.delete("active_workspace");
    return response;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = request.cookies.get("session")?.value;
    const payload = await getSessionPayload(request);

    // ── Paths that require NO session ──────────────────────────────────────────
    // /login and /signup: if already logged in, go to dashboard
    if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
        if (payload) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
    }

    // /about-product: public page, but redirect logged-in users to dashboard
    if (pathname.startsWith("/about-product")) {
        if (payload) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
    }

    // / (root): redirect based on session state
    if (pathname === "/") {
        if (payload) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/about-product", request.url));
    }

    // ── Paths that require a valid session ─────────────────────────────────────
    if (pathname.startsWith("/dashboard")) {
        // No cookie at all → about-product (new visitor)
        if (!session) {
            return NextResponse.redirect(new URL("/about-product", request.url));
        }

        // Cookie exists but JWT is invalid/expired → login (returning user, session died)
        if (!payload) {
            return redirectAndClearSession(request, "/login");
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/dashboard/:path*",
        "/about-product/:path*",
        "/login",
        "/signup",
    ],
};