"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Auth service URL
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:8000";

// --- SCHEMAS ---
const SignupSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["radiologist", "admin"]),
  termsAccepted: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// --- HELPER FUNCTIONS ---

/**
 * Stores the JWT token in an HTTP-only cookie
 */
async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 30, // 30 minutes to match auth-service token expiry
    path: "/",
    sameSite: "lax",
  });
}

// --- ACTIONS ---

/**
 * Registers a new user via the auth-service API.
 */
export async function registerUser(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  const validated = SignupSchema.safeParse({
    firstName: rawData.firstName,
    lastName: rawData.lastName,
    email: rawData.email,
    password: rawData.password,
    role: rawData.role,
    termsAccepted: rawData.termsAccepted,
  });

  if (!validated.success) {
    return {
      message: validated.error.issues[0].message,
    };
  }

  const { email, password, firstName, lastName, role, termsAccepted } = validated.data;

  // Validation Logic
  if (termsAccepted !== "on") {
    return { message: "You must accept the terms and conditions." };
  }

  try {
    // Call auth-service register endpoint
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        name: `${firstName} ${lastName}`,
        global_role: role === "admin" ? "ADMIN" : "RADIOLOGIST",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        message: errorData.detail || "Registration failed. Please try again.",
      };
    }

    // Registration successful
  } catch (error) {
    console.error("Registration Error:", error);
    return { message: "Network error. Please try again." };
  }

  redirect("/login?success=true");
}

/**
 * Authenticates a user via the auth-service API.
 */
export async function loginUser(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  const validated = LoginSchema.safeParse(rawData);
  if (!validated.success) {
    return { message: "Invalid email or password format." };
  }

  const { email, password } = validated.data;

  let token: string | null = null;

  try {
    // Call auth-service login endpoint (OAuth2 form format)
    console.log(`[Auth] Attempting login for: ${email}`);
    const response = await fetch(`${AUTH_SERVICE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: email, // OAuth2PasswordRequestForm expects 'username'
        password: password,
      }),
    });

    if (!response.ok) {
      console.error(`[Auth] Login failed. Status: ${response.status}`);
      const text = await response.text();
      console.error(`[Auth] Error details: ${text}`);
      const errorData = JSON.parse(text || "{}");
      return {
        message: errorData.detail || "Invalid email or password.",
      };
    }

    const data = await response.json();
    console.log(`[Auth] Login successful. Token received.`);
    token = data.access_token;

    // Store token in HTTP-only cookie
    await setAuthCookie(token!);
  } catch (error) {
    console.error("Login Error:", error);
    return { message: "Network error. Please try again." };
  }

  // Determine redirect path - execute outside try/catch to avoid trapping NEXT_REDIRECT
  let redirectPath = "/doctor";

  if (token) {
    try {
      const [, payloadBase64] = token.split(".");
      const payloadString = Buffer.from(payloadBase64, "base64").toString();
      const payload = JSON.parse(payloadString);
      const role = payload.global_role;
      console.log(`[Auth] Extracted Global Role: ${role}`);

      if (role === "ADMIN") {
        console.log(`[Auth] User is ADMIN`);
        redirectPath = "/admin";
      }
    } catch (e) {
      console.error("Error decoding token for redirect", e);
    }
  }

  console.log(`[Auth] Redirecting to ${redirectPath}`);
  redirect(redirectPath);
}

/**
 * Logs out the current user.
 */
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}

/**
 * Retrieves the currently logged in user based on the session cookie.
 * Decodes the JWT to get user info without calling the backend.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    // Decode JWT payload (without verification - verification should happen on API calls)
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString());

    // Keep original global_role for RBAC checks, map for UI display
    const globalRoleRaw = payload.global_role || "";
    const roleRaw = globalRoleRaw.toLowerCase();
    const role = roleRaw === "radiologist" ? "doctor" : (roleRaw || "doctor");

    console.log(`[Auth] getCurrentUser: User ${payload.email}, GlobalRole: ${globalRoleRaw}, MappedRole: ${role}`);

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.email?.split("@")[0] || "User", // Fallback name from email
      role: role,
      globalRole: globalRoleRaw, // Keep original uppercase for RBAC checks
      avatar: payload.email?.charAt(0).toUpperCase() || "U",
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

/**
 * Gets the auth token for API calls to auth-service
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("session")?.value || null;
}

/**
 * Retrieves the current user's workspaces from the auth-service.
 */
export async function getUserWorkspaces() {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/workspaces`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Ensure fresh data
    });

    if (!response.ok) {
      console.error("Failed to fetch workspaces:", response.status, await response.text());
      return [];
    }

    const memberships = await response.json();

    // Map to expected format if needed, or return as is
    // The UI expects: { id, name, ... } or similar for workspace?
    // The API returns MembershipResponse: { id, workspace_id, role, joined_at, workspace_name }

    // Let's interpret what the UI likely needs.
    // DoctorDashboardUI likely uses workspaces to show a switcher or list.
    // It's safer to return a structure similar to what Prisma used to return if possible,
    // OR update the UI. But since I can't easily see UI usage deep in components without lookups,
    // I'll return a mapped object that covers bases.

    return memberships.map((m: any) => ({
      id: m.workspace_id,
      name: m.workspace_name,
      role: m.role,
      membershipId: m.id,
      joinedAt: m.joined_at
    }));

  } catch (error) {
    console.error("Get Workspaces Error:", error);
    return [];
  }
}

/**
 * Retrieves the current user's invitations.
 * Placeholder: Returns empty list until backend endpoint is available.
 */
export async function getMyInvitations() {
  // const token = await getAuthToken();
  // Call API...
  return [];
}

/**
 * Switches the active workspace for the current user.
 * Stores the active workspace ID in a cookie.
 */
export async function switchWorkspace(workspaceId: string): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.set("active_workspace", workspaceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    });
    return { success: true };
  } catch (error) {
    console.error("Switch Workspace Error:", error);
    return { success: false };
  }
}

/**
 * Retrieves join requests for the current workspace.
 * Placeholder: Returns empty list until backend endpoint is available.
 */
export async function getJoinRequests() {
  // const token = await getAuthToken();
  // Call API...
  return [];
}

/**
 * Resolves a join request (approve or reject).
 * Placeholder: Returns success until backend endpoint is available.
 */
export async function resolveJoinRequest(requestId: string, action: "approve" | "reject"): Promise<{ success: boolean }> {
  // const token = await getAuthToken();
  // Call API...
  console.log(`Resolving join request ${requestId} with action: ${action}`);
  return { success: true };
}

/**
 * Face login placeholder - to be implemented when face service is integrated
 */
export async function loginUserWithFace(prevState: any, formData: FormData) {
  return { message: "Face login is not yet available." };
}

/**
 * PIN verification placeholder - to be implemented when face service is integrated
 */
export async function verifyPinAndLogin(prevState: any, formData: FormData) {
  return { message: "PIN verification is not yet available." };
}