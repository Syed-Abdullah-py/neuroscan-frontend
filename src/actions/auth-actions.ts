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

    // Add active workspaceId from cookie if present
    const cookieStore = await cookies();
    const activeWorkspaceId = cookieStore.get("active_workspace")?.value;

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.email?.split("@")[0] || "User", // Fallback name from email
      role: role,
      globalRole: globalRoleRaw, // Keep original uppercase for RBAC checks
      avatar: payload.email?.charAt(0).toUpperCase() || "U",
      workspaceId: activeWorkspaceId || undefined,
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
    const cookieStore = await cookies();
    const activeWorkspaceId = cookieStore.get("active_workspace")?.value;

    // Resolve which one is actually active: Cookie (if valid) > First available
    const activeMember = memberships.find((m: any) => m.workspace_id === activeWorkspaceId) || memberships[0];
    const resolvedActiveId = activeMember?.workspace_id;

    return memberships.map((m: any) => ({
      id: m.workspace_id,
      name: m.workspace_name,
      role: m.role,
      membershipId: m.id,
      joinedAt: m.joined_at,
      active: m.workspace_id === resolvedActiveId
    }));

  } catch (error) {
    console.error("Get Workspaces Error:", error);
    return [];
  }
}



/**
 * Switches the active workspace for the current user.
 * Stores the active workspace ID in a cookie.
 */
export async function switchWorkspace(workspaceId: string): Promise<{ success: boolean, message?: string }> {
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
    return { success: false, message: "Failed to switch workspace" };
  }
}



/**
 * Retrieves join requests for the current workspace.
 */
export async function getJoinRequests(workspaceId?: string) {
  const token = await getAuthToken();
  if (!token) return [];

  if (!workspaceId) {
    const cookieStore = await cookies();
    workspaceId = cookieStore.get("active_workspace")?.value;
  }

  if (!workspaceId) return [];

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/workspaces/${workspaceId}/join-requests`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Get Join Requests Error:", error);
    return [];
  }
}

/**
 * Resolves a join request (approve or reject).
 */
export async function resolveJoinRequest(requestId: string, action: "approve" | "reject"): Promise<{ success: boolean, message?: string }> {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Not authenticated" };

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/join-requests/${requestId}/${action}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, message: error.detail || `Failed to ${action} request` };
    }
    return { success: true };
  } catch (error) {
    console.error(`Resolve Join Request (${action}) Error:`, error);
    return { success: false, message: "Network error" };
  }
}

// --- HELPER ---
function getErrorMessage(errorData: any, defaultMsg: string) {
  if (errorData?.detail) {
    if (typeof errorData.detail === 'string') return errorData.detail;
    if (Array.isArray(errorData.detail)) {
      return errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ");
    }
    return JSON.stringify(errorData.detail);
  }
  return defaultMsg;
}

/**
 * Creates a new workspace (Global Admin only).
 */
export async function createWorkspace(name: string) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Not authenticated" };

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/workspaces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, message: getErrorMessage(errorData, "Failed to create workspace") };
    }

    const newWorkspace = await response.json();

    // Auto-switch to the new workspace
    await switchWorkspace(newWorkspace.id);

    return { success: true, message: "" };
  } catch (error) {
    console.error("Create Workspace Error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Updates a workspace name (Owner only).
 */
export async function updateWorkspace(workspaceId: string, name: string) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Not authenticated" };

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/workspaces/${workspaceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, message: getErrorMessage(errorData, "Failed to update workspace") };
    }

    return { success: true, message: "" };
  } catch (error) {
    console.error("Update Workspace Error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Deletes a workspace (Owner only).
 */
export async function deleteWorkspace(workspaceId: string) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Not authenticated" };

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/workspaces/${workspaceId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        return { success: false, message: getErrorMessage(errorData, "Failed to delete workspace") };
      } catch {
        return { success: false, message: "Failed to delete workspace" };
      }
    }

    // Clear active_workspace cookie if it matches the deleted one
    const cookieStore = await cookies();
    const activeWorkspaceId = cookieStore.get("active_workspace")?.value;
    if (activeWorkspaceId === workspaceId) {
      cookieStore.delete("active_workspace");
    }

    return { success: true, message: "" };
  } catch (error) {
    console.error("Delete Workspace Error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Adds a member to a workspace (Owner or Admin).
 */
export async function addWorkspaceMember(workspaceId: string, email: string, role: string) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Not authenticated" };

  try {
    // The backend `add_member` definition uses query parameters:
    // def add_member(workspace_id: str, email: str, role: WorkspaceRoleEnum...)
    const params = new URLSearchParams({
      email: email,
      role: role.toUpperCase()
    });

    const response = await fetch(`${AUTH_SERVICE_URL}/workspaces/${workspaceId}/members?${params.toString()}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.detail || "Failed to add member" };
    }

    return { success: true, message: "" };
  } catch (error) {
    console.error("Add Member Error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Removes a member from a workspace (Owner or Admin).
 */
export async function removeWorkspaceMember(workspaceId: string, userId: string) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Not authenticated" };

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/workspaces/${workspaceId}/members/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        return { success: false, message: errorData.detail || "Failed to remove member" };
      } catch {
        return { success: false, message: "Failed to remove member" };
      }
    }

    return { success: true, message: "" };
  } catch (error) {
    console.error("Remove Member Error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Retrieves team members for the current workspace.
 */
export async function getTeamMembers(workspaceId?: string) {
  const token = await getAuthToken();
  if (!token) return [];

  if (!workspaceId) {
    const cookieStore = await cookies();
    workspaceId = cookieStore.get("active_workspace")?.value;
  }

  if (!workspaceId) return [];

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/workspaces/${workspaceId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) return [];

    const memberships = await response.json();
    // Return in format expected by TeamManagement.tsx
    return memberships.map((m: any) => ({
      membershipId: m.id,
      userId: m.user?.id || m.user_id,
      email: m.user?.email || "Unknown",
      name: m.user?.name || "Unknown",
      role: m.role,
      joinedAt: m.joined_at
    }));
  } catch (error) {
    console.error("Get Team Members Error:", error);
    return [];
  }
}

// --- INVITATION & DISCOVERY ACTIONS ---

export async function getMyInvitations() {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/invitations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function getWorkspaceInvitations(workspaceId: string) {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/workspaces/${workspaceId}/invitations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function inviteUser(email: string, role: string, workspaceId?: string) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Not authenticated" };

  if (!workspaceId) {
    const cookieStore = await cookies();
    workspaceId = cookieStore.get("active_workspace")?.value;
  }

  if (!workspaceId) return { success: false, message: "No active workspace" };

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/workspaces/${workspaceId}/invitations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, role: role.toUpperCase() }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.detail || "Failed to invite user" };
    }

    return { success: true, message: "" };
  } catch (error) {
    return { success: false, message: "Network error" };
  }
}

export async function acceptInvitation(invitationId: string) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Not authenticated" };

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/invitations/${invitationId}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.detail || "Failed" };
    }
    return { success: true, message: "" };
  } catch {
    return { success: false, message: "Network error" };
  }
}

export async function rejectInvitation(invitationId: string) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Not authenticated" };

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/invitations/${invitationId}/reject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return { success: false, message: "Failed" };
    return { success: true, message: "" };
  } catch {
    return { success: false, message: "Network error" };
  }
}

export async function getDiscoverableWorkspaces() {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/workspaces/discover`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function requestJoinWorkspace(workspaceId: string): Promise<{ success: boolean, message?: string }> {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Not authenticated" };

  try {
    // Assuming backend endpoint /workspaces/{id}/join-requests exists or will exist
    const response = await fetch(`${AUTH_SERVICE_URL}/workspaces/${workspaceId}/join-requests`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, message: error.detail || "Failed to request join" };
    }
    return { success: true, message: "" };
  } catch {
    return { success: false, message: "Network error" };
  }
}



/**
 * Leaves a workspace.
 * Placeholder: Returns success until backend endpoint is available.
 */
export async function leaveWorkspace(workspaceId: string): Promise<{ success: boolean, message?: string }> {
  const token = await getAuthToken();
  const user = await getCurrentUser();
  if (!token || !user) return { success: false, message: "Not authenticated" };

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/workspaces/${workspaceId}/members/${user.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.detail || "Failed to leave workspace" };
    }

    // Clear active_workspace cookie if matches
    const cookieStore = await cookies();
    if (cookieStore.get("active_workspace")?.value === workspaceId) {
      cookieStore.delete("active_workspace");
    }

    return { success: true, message: "Left workspace successfully" };
  } catch (error) {
    console.error("Leave Workspace Error:", error);
    return { success: false, message: "Network error" };
  }
}

/**
 * Searches for users by email or name.
 * Placeholder: Returns empty list until backend endpoint is available.
 */
export async function searchUsers(query: string) {
  console.log(`[Auth] searchUsers called with query: ${query}`);
  return [];
}

/**
 * Creates a new workspace (Global Admin only) - Form Action variant.
 */
export async function createWorkspaceFromForm(prevState: any, formData: FormData) {
  const name = formData.get("workspaceName") as string;
  if (!name) return { success: false, message: "Workspace name is required" };
  return createWorkspace(name);
}

/**
 * Requests to join a workspace - Form Action variant.
 */
export async function requestJoinWorkspaceFromForm(prevState: any, formData: FormData) {
  const slug = formData.get("workspaceSlug") as string;
  const allDiscoverable = await getDiscoverableWorkspaces();
  const match = allDiscoverable.find((w: any) => w.slug === slug || w.name === slug);

  if (!match) {
    return { success: false, message: "Workspace not found" };
  }

  return requestJoinWorkspace(match.id);
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