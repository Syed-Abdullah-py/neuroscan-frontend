"use server";

import { cookies } from "next/headers";

/** Sets the active_workspace cookie. Called by WorkspaceProvider on switch. */
export async function setActiveWorkspaceCookie(workspaceId: string) {
    const cookieStore = await cookies();
    cookieStore.set("active_workspace", workspaceId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        sameSite: "lax",
    });
}