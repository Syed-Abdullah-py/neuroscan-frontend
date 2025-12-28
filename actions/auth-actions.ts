"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
const FACE_SERVICE_URL = "http://127.0.0.1:8000";

// --- SCHEMAS ---
const SignupSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["radiologist", "admin"]),
  faceImage: z.any().optional(), // File object
});

const LoginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// --- ACTIONS ---

/**
 * Registers a new user and creates their workspace.
 */
export async function registerUser(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  const validated = SignupSchema.safeParse({
    firstName: rawData.firstName,
    lastName: rawData.lastName,
    email: rawData.email,
    password: rawData.password,
    role: rawData.role,
  });

  if (!validated.success) {
    return {
      message: validated.error.issues[0].message,
    };
  }

  const { email, password, firstName, lastName, role } = validated.data;
  const faceImage = rawData.faceImage as File;
  let faceEncodingString: string | null = null;

  if (faceImage && faceImage.size > 0) {
    try {
      const uploadData = new FormData();
      uploadData.append("file", faceImage);

      const res = await fetch(`${FACE_SERVICE_URL}/encode`, {
        method: "POST",
        body: uploadData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.encoding) {
          faceEncodingString = JSON.stringify(json.encoding);
        }
      } else {
        console.error("Face encoding failed", await res.text());
      }
    } catch (e) {
      console.error("Face service error", e);
    }
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { message: "Email already registered." };
  }

  // Slug generation removed (deferred)

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          faceEncoding: faceEncodingString,
          role: role === "admin" ? "ADMIN" : "RADIOLOGIST",
        },
      });
      // Workspace creation is deferred to the dashboard.
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return { message: "Database error. Please try again." };
  }

  redirect("/login?success=true");
}

/**
 * Authenticates a user and creates a session with Workspace context.
 */
export async function loginUser(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  const validated = LoginSchema.safeParse(rawData);
  if (!validated.success) {
    return { message: "Invalid email or password format." };
  }

  const { email, password } = validated.data;

  // Include memberships to find the default workspace
  const user = await prisma.user.findUnique({
    where: { email },
    include: { memberships: true }
  });

  if (!user) {
    return { message: "Invalid email." };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { message: "Invalid password." };
  }

  let redirectPath = "/doctor";
  let sessionPayload: { sub: string; workspaceId?: string; role?: string } = { sub: user.id };

  if (user.memberships && user.memberships.length > 0) {
    // Prioritize memberships where the user is an OWNER or ADMIN
    let defaultMembership = user.memberships.find(m => m.role === "OWNER") ||
      user.memberships.find(m => m.role === "ADMIN") ||
      user.memberships[0];

    sessionPayload.workspaceId = defaultMembership.workspaceId;
    sessionPayload.role = defaultMembership.role;

    if (defaultMembership.role === "OWNER" || defaultMembership.role === "ADMIN") {
      redirectPath = "/admin";
    } else {
      redirectPath = "/doctor";
    }
  } else {
    // User has no workspace. Check GLOBAL role to determine redirect path.
    // Global ADMIN should go to /admin to access onboarding/workspace creation.
    // Global RADIOLOGIST/DOCTOR should go to /doctor.
    if (user.role === "ADMIN") {
      redirectPath = "/admin";
      sessionPayload.role = "ADMIN"; // Set workspace role to ADMIN for consistency
    } else {
      redirectPath = "/doctor";
      sessionPayload.role = "DOCTOR";
    }
  }

  const alg = "HS256";
  const jwt = await new SignJWT(sessionPayload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set("session", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 15,
    path: "/",
    sameSite: "lax",
  });

  redirect(redirectPath);
}

/**
 * Logs out the current user.
 * 
 * Deletes the session cookie and redirects to the login page.
 */
export async function logoutUser() {
  const cookieStore = await cookies();

  // Destroy the session cookie
  cookieStore.delete("session");

  redirect("/login");
}

/**
 * Logs in a user via Face Recognition.
 */
export async function loginUserWithFace(prevState: any, formData: FormData) {
  const faceImage = formData.get("faceImage") as File;

  if (!faceImage || faceImage.size === 0) {
    return { message: "Face image is required." };
  }

  try {
    // 1. Fetch all users with face encodings
    // Optimize: In production, filter by expected email if available, or chunk.
    const usersWithFace = await prisma.user.findMany({
      where: {
        faceEncoding: { not: null }
      },
      select: {
        id: true,
        faceEncoding: true,
        email: true,
        memberships: true, // Need memberships for login logic
      }
    });

    if (usersWithFace.length === 0) {
      return { message: "No users registered with face data." };
    }

    // 2. Prepare known data for Python service
    const knownData = usersWithFace.map(u => {
      try {
        return {
          userId: u.id,
          encoding: JSON.parse(u.faceEncoding!)
        };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    // 3. Call Python Verify Endpoint
    const uploadData = new FormData();
    uploadData.append("file", faceImage);
    uploadData.append("known_data", JSON.stringify(knownData));

    const res = await fetch(`${FACE_SERVICE_URL}/recognize`, {
      method: "POST",
      body: uploadData,
    });

    if (!res.ok) {
      return { message: "Face recognition service error." };
    }

    const result = await res.json();

    if (!result.match || !result.userId) {
      return { message: "Face not recognized." };
    }

    // 4. Log the user in
    const user = usersWithFace.find(u => u.id === result.userId);
    if (!user) return { message: "User not found locally." };

    let redirectPath = "/doctor";
    let sessionPayload: { sub: string; workspaceId?: string; role?: string } = { sub: user.id };

    if (user.memberships && user.memberships.length > 0) {
      // Prioritize memberships where the user is an OWNER or ADMIN
      let defaultMembership = user.memberships.find(m => m.role === "OWNER") ||
        user.memberships.find(m => m.role === "ADMIN") ||
        user.memberships[0];

      sessionPayload.workspaceId = defaultMembership.workspaceId;
      sessionPayload.role = defaultMembership.role;

      if (defaultMembership.role === "OWNER" || defaultMembership.role === "ADMIN") {
        redirectPath = "/admin";
      } else {
        redirectPath = "/doctor";
      }
    } else {
      // User has no workspace. Check GLOBAL role to determine redirect path.
      // Global ADMIN should go to /admin to access onboarding/workspace creation.
      // Global RADIOLOGIST/DOCTOR should go to /doctor.

      // Need to fetch user's global role since we only have face data
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true }
      });

      if (fullUser?.role === "ADMIN") {
        redirectPath = "/admin";
        sessionPayload.role = "ADMIN";
      } else {
        redirectPath = "/doctor";
        sessionPayload.role = "DOCTOR";
      }
    }

    const alg = "HS256";
    const jwt = await new SignJWT(sessionPayload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set("session", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 15,
      path: "/",
      sameSite: "lax",
    });

    redirect(redirectPath);

  } catch (error) {
    if ((error as Error).message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Face Login Error:", error);
    // Since we called redirect, we might verify expected behavior. Next.js redirect throws error?
    // "NEXT_REDIRECT" error type.
    if (String(error).includes("NEXT_REDIRECT")) {
      throw error;
    }
    return { message: "System error during face login." };
  }
}

/**
 * Retrieves the currently logged in user based on the session cookie.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub as string;
    const workspaceId = payload.workspaceId as string | undefined;
    const role = payload.role as string | undefined;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, role: true }
    });

    if (!user) return null;

    return {
      id: userId,
      name: user.name,
      email: user.email,
      role: role?.toLowerCase() || "doctor", // Workspace Role (from session)
      globalRole: user.role, // Global Role (from DB)
      avatar: user.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U",
      workspaceId: workspaceId,
    };



  } catch (error) {
    return null;
  }
}

/**
 * Adds a user to the current user's workspace.
 * Only accessible by OWNER.
 */
export async function addTeamMember(formData: FormData) {
  const email = formData.get("email") as string;
  const role = formData.get("role") as "ADMIN" | "DOCTOR";

  if (!email || !role) return { message: "Email and role are required." };

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "owner" || !currentUser.workspaceId) {
      return { message: "Unauthorized. Only workspace owners can add members." };
    }

    const targetUser = await prisma.user.findUnique({
      where: { email },
      include: { memberships: true }
    });

    if (!targetUser) {
      return { message: "User not found. Please ask them to sign up first." };
    }

    // Check if already in THIS workspace
    const exists = targetUser.memberships.find(m => m.workspaceId === currentUser.workspaceId);
    if (exists) {
      return { message: "User is already a member of this workspace." };
    }

    // Check if in ANY workspace (for MVP maybe limit to 1?)
    // if (targetUser.memberships.length > 0) { ... } // strict mode?
    // Let's allow multiple for now or just add them.

    await prisma.workspaceMember.create({
      data: {
        userId: targetUser.id,
        workspaceId: currentUser.workspaceId,
        role: role
      }
    });

    return { success: true, message: "Member added successfully." };

  } catch (error) {
    console.error("Add Member Error:", error);
    return { message: "Failed to add member." };
  }
}

/**
 * Removes a user from the workspace.
 * Only accessible by OWNER.
 */
export async function removeTeamMember(userId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "owner" || !currentUser.workspaceId) {
      return { message: "Unauthorized." };
    }

    if (userId === currentUser.email) { // Wait, userId is ID not email? Passed param.
      // We need to resolve ID.
      // Let's assume userId is the ID of the user to remove.
      return { message: "Cannot remove yourself." };
    }

    // Verify target is in workspace
    const targetMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: currentUser.workspaceId
        }
      }
    });

    if (!targetMember) return { message: "Member not found in workspace." };
    if (targetMember.role === "OWNER") return { message: "Cannot remove the owner." };

    await prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: currentUser.workspaceId
        }
      }
    });

    return { success: true, message: "Member removed." };

  } catch (error) {
    console.error("Remove Member Error:", error);
    return { message: "Failed to remove member." };
  }
}

/**
 * Fetches all members of the current user's workspace.
 */
export async function getTeamMembers() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.workspaceId) return [];

    // Fetch workspace to know true owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: currentUser.workspaceId },
      select: { ownerId: true }
    });

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: currentUser.workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            medicalLicenseId: true
          }
        }
      },
      orderBy: { role: 'asc' }
    });

    return members.map(m => {
      // Enforce Single Owner Truth
      let effectiveRole = m.role;
      const isTrueOwner = workspace?.ownerId === m.userId;

      if (isTrueOwner) {
        effectiveRole = "OWNER";
      } else if (effectiveRole === "OWNER") {
        // If DB says OWNER but not the true owner, downgrade to ADMIN for display
        effectiveRole = "ADMIN";
      }

      return {
        userId: m.userId,
        role: effectiveRole,
        joinedAt: m.joinedAt,
        name: m.user.name,
        email: m.user.email,
        licenseId: m.user.medicalLicenseId
      };
    });
  } catch (error) {
    console.error("Get Team Error:", error);
    return [];
  }
}

/**
 * Creates a new workspace and makes the current user the OWNER.
 */
export async function createWorkspace(prevState: any, formData: FormData) {
  const workspaceName = formData.get("workspaceName") as string;
  if (!workspaceName || workspaceName.length < 3) {
    return { success: false, message: "Workspace name must be at least 3 characters." };
  }

  try {
    const currentUser = await getCurrentUser();

    // Check if user is logged in
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return { success: false, message: "Not authenticated." };
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub as string;
    const userRole = (payload.role as string)?.toUpperCase();

    // AUTHORIZATION CHECK
    // Only 'ADMIN' or 'OWNER' (if that even exists globally) can create workspaces.
    // Doctors/Radiologists cannot.
    if (userRole !== "ADMIN" && userRole !== "OWNER") {
      return { success: false, message: "Unauthorized. Doctors cannot create workspaces." };
    }

    // Slugify
    const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    // Check slug uniqueness
    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, message: "Workspace name taken." };
    }

    const newWorkspace = await prisma.$transaction(async (tx) => {
      const w = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug,
          ownerId: userId
        }
      });

      await tx.workspaceMember.create({
        data: {
          userId: userId,
          workspaceId: w.id,
          role: "OWNER"
        }
      });
      return w;
    });

    // Update Session to include new workspace
    // We can't update the cookie easily here without rewriting it.
    // Simplest approach: Logout and force login or just redirect to login?
    // Better: Issue new token.

    const sessionPayload = { sub: userId, workspaceId: newWorkspace.id, role: "OWNER" };
    const alg = "HS256";
    const jwt = await new SignJWT(sessionPayload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(secret);

    cookieStore.set("session", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 15,
      path: "/",
      sameSite: "lax",
    });

    // Force redirection to admin dashboard
    // This ensures the new session cookie is used
    redirect("/admin");

  } catch (error) {
    // Check if error is a redirect error (which is expected on success)
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Create Workspace Error:", error);
    return { success: false, message: "Failed to create workspace." };
  }
}

function isRedirectError(error: any) {
  return error.message === "NEXT_REDIRECT" ||
    (typeof error === 'object' && error !== null && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT'));
}

/**
 * Requests to join an existing workspace by Slug.
 */
export async function requestJoinWorkspace(prevState: any, formData: FormData) {
  const slug = formData.get("workspaceSlug") as string;
  if (!slug) return { success: false, message: "Workspace identifier required." };

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return { success: false, message: "Not authenticated." };
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub as string;

    const workspace = await prisma.workspace.findUnique({ where: { slug } });
    let targetId = workspace?.id;

    if (!workspace) {
      // Try searching by name if slug fails? simple match
      const byName = await prisma.workspace.findFirst({ where: { name: slug } });
      if (!byName) return { success: false, message: "Workspace not found." };
      // use mapped one
      targetId = byName.id;
    }

    if (!targetId) return { success: false, message: "Workspace not found." };

    // Check if already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: targetId } }
    });
    if (existingMember) return { success: false, message: "You are already a member." };

    // Check if pending request exists
    const existingReq = await prisma.joinRequest.findUnique({
      where: { userId_workspaceId: { userId, workspaceId: targetId } }
    });
    if (existingReq) return { success: false, message: "Request already pending." };

    await prisma.joinRequest.create({
      data: {
        userId,
        workspaceId: targetId,
        status: "PENDING"
      }
    });

    return { success: true, message: "Request sent successfully." };

  } catch (error) {
    console.error("Join Request Error:", error);
    return { success: false, message: "Failed to send request." };
  }
}

/**
 * Resolves a Join Request (Accept/Reject).
 * Only OWNER.
 */
export async function resolveJoinRequest(requestId: string, action: "ACCEPT" | "REJECT") {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "owner" || !currentUser.workspaceId) {
      return { message: "Unauthorized." };
    }

    const request = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: { user: true } // Need user info for new member role?
    });

    if (!request) return { message: "Request not found." };
    if (request.workspaceId !== currentUser.workspaceId) return { message: "Unauthorized." };

    if (action === "REJECT") {
      await prisma.joinRequest.delete({ where: { id: requestId } });
      return { success: true, message: "Request rejected." };
    }

    if (action === "ACCEPT") {
      await prisma.$transaction(async (tx) => {
        // Add as Doctor by default? Or Admin?
        // Let's default to DOCTOR for safety, Owner can promote later if we impl that.
        // Or maybe the request should specify? Schema doesn't have it.
        // Default to DOCTOR.
        await tx.workspaceMember.create({
          data: {
            userId: request.userId,
            workspaceId: request.workspaceId,
            role: "DOCTOR"
          }
        });
        await tx.joinRequest.delete({ where: { id: requestId } });
      });
      return { success: true, message: "Member accepted." };
    }

  } catch (error) {
    console.error("Resolve Request Error:", error);
    return { message: "Operation failed." };
  }
}

/**
 * Get Pending Join Requests for the current workspace.
 */
export async function getJoinRequests() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "owner" || !currentUser.workspaceId) return [];

    const requests = await prisma.joinRequest.findMany({
      where: { workspaceId: currentUser.workspaceId, status: "PENDING" },
      include: { user: true }
    });

    return requests.map(r => ({
      id: r.id,
      user: {
        name: r.user.name,
        email: r.user.email
      },
      createdAt: r.createdAt
    }));

  } catch (error) {
    return [];
  }
}

/**
 * Get Workspaces owned or joined by the current user for switching.
 */
export async function getUserWorkspaces() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: currentUser.id },
      include: { workspace: true }
    });

    return memberships.map(m => {
      // Enforce Single Owner Truth
      let effectiveRole = m.role;
      const isTrueOwner = m.workspace.ownerId === currentUser.id;

      if (isTrueOwner) {
        effectiveRole = "OWNER";
      } else if (effectiveRole === "OWNER") {
        effectiveRole = "ADMIN";
      }

      return {
        id: m.workspace.id,
        name: m.workspace.name,
        role: effectiveRole,
        slug: m.workspace.slug,
        active: m.workspace.id === currentUser.workspaceId
      };
    });
  } catch (error) {
    return [];
  }
}

/**
 * Search users by name or email.
 * Excludes current workspace members.
 */
export async function searchUsers(query: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.workspaceId) return [];

    const workspaceMembers = await prisma.workspaceMember.findMany({
      where: { workspaceId: currentUser.workspaceId },
      select: { userId: true }
    });
    const memberIds = workspaceMembers.map(m => m.userId);

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query } },
              { email: { contains: query } }
            ]
          },
          { id: { notIn: memberIds } }
        ]
      },
      select: { id: true, name: true, email: true, role: true },
      take: 10
    });

    return users;
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
}

/**
 * Fetch discoverable workspaces for the join screen.
 * Limit to top 20 for now.
 */
export async function getDiscoverableWorkspaces() {
  try {
    const workspaces = await prisma.workspace.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { members: true }
        }
      }
    });

    return workspaces;
  } catch (error) {
    console.error("Fetch Workspaces Error:", error);
    return [];
  }
}

/**
 * Invite a user to the current workspace.
 * Creates an Invitation record.
 */
export async function inviteUser(targetUserId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.workspaceId || (currentUser.role !== "owner" && currentUser.role !== "admin")) {
      return { success: false, message: "Unauthorized." };
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) return { success: false, message: "User not found." };

    // Check if already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: targetUserId, workspaceId: currentUser.workspaceId } }
    });
    if (existingMember) return { success: false, message: "User is already a member." };

    // Check for existing pending invitation
    const existingInvite = await prisma.invitation.findFirst({
      where: { email: targetUser.email, workspaceId: currentUser.workspaceId }
    });
    if (existingInvite) return { success: false, message: "Invitation already sent." };

    // Determine Workspace Role based on Global Role
    // Global ADMIN -> Workspace ADMIN
    // Global RADIOLOGIST -> Workspace DOCTOR
    // If not set, default to DOCTOR
    let workspaceRole = "DOCTOR";
    if (targetUser.role === "ADMIN") workspaceRole = "ADMIN";

    // Create Invitation
    await prisma.invitation.create({
      data: {
        email: targetUser.email,
        workspaceId: currentUser.workspaceId,
        role: workspaceRole,
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    return { success: true, message: "Invitation sent." };
  } catch (error) {
    console.error("Invite Error:", error);
    return { success: false, message: "Failed to invite user." };
  }
}

/**
 * Get pending invitations for the current user (by email).
 */
export async function getMyInvitations() {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    const invites = await prisma.invitation.findMany({
      where: { email: user.email },
      include: { workspace: true }
    });

    return invites.map(i => ({
      id: i.id,
      workspaceName: i.workspace.name,
      role: i.role,
      sentAt: i.expiresAt // Actually we don't store sentAt, using expiresAt for now or just ID
    }));
  } catch (error) {
    return [];
  }
}

/**
 * Accept an invitation.
 */
export async function acceptInvitation(invitationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated." };

    const invite = await prisma.invitation.findUnique({ where: { id: invitationId } });
    if (!invite) return { success: false, message: "Invitation not found." };

    if (invite.email !== user.email) return { success: false, message: "This invitation is not for you." };

    await prisma.$transaction(async (tx) => {
      // Create Member
      await tx.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: invite.workspaceId,
          role: invite.role
        }
      });
      // Delete Invitation
      await tx.invitation.delete({ where: { id: invitationId } });
    });

    return { success: true, message: "Invitation accepted." };
  } catch (error) {
    console.error("Accept Invite Error:", error);
    return { success: false, message: "Failed to join workspace." };
  }
}

/**
 * Reject an invitation.
 */
export async function rejectInvitation(invitationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated." };

    const invite = await prisma.invitation.findUnique({ where: { id: invitationId } });
    if (!invite) return { success: false, message: "Invitation not found." };

    if (invite.email !== user.email) return { success: false, message: "Unauthorized." };

    await prisma.invitation.delete({ where: { id: invitationId } });
    return { success: true, message: "Invitation rejected." };
  } catch (error) {
    return { success: false, message: "Failed to reject invitation." };
  }
}

/**
 * Update Workspace Name (Owner Only)
 */
export async function updateWorkspace(workspaceId: string, newName: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated." };

    // Verify membership and role
    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId } }
    });

    if (!member || member.role !== "OWNER") {
      return { success: false, message: "Unauthorized. Only Owners can update workspace settings." };
    }

    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: newName }
    });

    return { success: true, message: "Workspace updated." };
  } catch (error) {
    console.error("Update Workspace Error:", error);
    return { success: false, message: "Failed to update workspace." };
  }
}

/**
 * Delete Workspace (Owner Only)
 */
export async function deleteWorkspace(workspaceId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, message: "Not authenticated." };

    // Verify membership and role
    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: user.id, workspaceId } }
    });

    if (!member || member.role !== "OWNER") {
      return { success: false, message: "Unauthorized. Only Owners can delete workspaces." };
    }

    await prisma.workspace.delete({
      where: { id: workspaceId }
    });

    // Check if we are deleting the CURRENT active workspace from the session
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (token) {
      const { payload } = await jwtVerify(token, secret);
      if (payload.workspaceId === workspaceId) {
        // We are deleting the active workspace.
        // We must update the session to remove workspaceId and role.

        // Keep 'sub' (userId)
        const newPayload = {
          sub: payload.sub,
          // workspaceId: removed
          // role: removed (will fallback to default or we can set to "DOCTOR" explicitly if needed but undefined is handled)
        };

        const alg = "HS256";
        const newJwt = await new SignJWT(newPayload)
          .setProtectedHeader({ alg })
          .setIssuedAt()
          .setExpirationTime("15m")
          .sign(secret);

        cookieStore.set("session", newJwt, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 15,
          path: "/",
          sameSite: "lax",
        });
      }
    }

    return { success: true, message: "Workspace deleted." };

  } catch (error) {
    console.error("Delete Workspace Error:", error);
    return { success: false, message: "Failed to delete workspace." };
  }
}


/**
 * Switch active workspace session.
 */
export async function switchWorkspace(workspaceId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return { success: false, message: "Not authenticated." };
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.sub as string;

    // Verify membership
    const member = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } }
    });

    if (!member) return { success: false, message: "Not a member of this workspace." };

    // Create new session
    const sessionPayload = { sub: userId, workspaceId, role: member.role };
    const alg = "HS256";
    const jwt = await new SignJWT(sessionPayload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(secret);

    cookieStore.set("session", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 15,
      path: "/",
      sameSite: "lax",
    });

    return { success: true };

  } catch (error) {
    console.error("Switch Workspace Error:", error);
    return { success: false, message: "Failed to switch workspace." };
  }
}