import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth-actions";

/**
 * Root page - Handles automatic redirection based on user session.
 * - Logged-in admins → /admin
 * - Logged-in doctors → /doctor
 * - Everyone else → /about-product
 */
export default async function RootPage() {
  const user = await getCurrentUser();

  // If user is logged in, redirect based on role
  if (user) {
    // Check if user has workspace membership with OWNER or ADMIN role
    if (user.workspaceId) {
      if (user.role === "owner" || user.role === "admin") {
        redirect("/admin");
      } else {
        redirect("/doctor");
      }
    } else {
      // No workspace: Redirect based on GLOBAL role
      // Global ADMINs go to /admin to create workspaces
      if (user.globalRole === "ADMIN") {
        redirect("/admin");
      } else {
        redirect("/doctor");
      }
    }
  }

  // Not logged in - redirect to about-product page
  redirect("/about-product");
}