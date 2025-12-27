"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

// --- SCHEMAS ---
const SignupSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.email("Invalid email address"),
  workspaceName: z.string().min(3, "Workspace name must be at least 3 chars"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["radiologist", "admin"]),
  licenseId: z.string().optional(),
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
    workspaceName: rawData.workspaceName,
    password: rawData.password,
    role: rawData.role,
    licenseId: rawData.licenseId,
  });

  if (!validated.success) {
    return {
      message: validated.error.issues[0].message,
    };
  }

  const { email, password, firstName, lastName, role, licenseId, workspaceName } = validated.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { message: "Email already registered." };
  }

  // Generate slug from workspace name (simple slugify)
  const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const existingSlug = await prisma.workspace.findUnique({ where: { slug } });
  if (existingSlug) {
    return { message: "Workspace name already taken. Please choose another." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          medicalLicenseId: licenseId || null,
        },
      });

      // 2. Create Workspace
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug,
          ownerId: user.id
        }
      });

      // 3. Create Membership (OWNER since they created it)
      await tx.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: "OWNER" // The creator is the owner
        }
      });
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

  // --- WORKSPACE LOGIC ---
  if (!user.memberships || user.memberships.length === 0) {
    return { message: "No workspace found. Please contact support." };
  }

  // For MVP, default to the first workspace found
  // In a real app, we might ask them to select one if they have multiple
  const defaultMembership = user.memberships[0];

  const alg = "HS256";
  const jwt = await new SignJWT({
    sub: user.id,
    workspaceId: defaultMembership.workspaceId,
    role: defaultMembership.role
  })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);

  const cookieStore = await cookies();

  cookieStore.set("session", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 15, // 15 minutes
    path: "/",
    sameSite: "lax",
  });

  // Redirect based on role in that workspace
  const role = defaultMembership.role;
  if (role === "OWNER" || role === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/doctor");
  }
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