"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; // <--- Import remains the same
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

// --- SCHEMAS ---
const SignupSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["radiologist", "admin"]),
  licenseId: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// --- ACTIONS ---
export async function registerUser(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  const validated = SignupSchema.safeParse({
    firstName: rawData.firstName,
    lastName: rawData.lastName,
    email: rawData.email,
    password: rawData.password,
    role: rawData.role,
    licenseId: rawData.licenseId,
  });

  if (!validated.success) {
    return {
      message: validated.error.issues[0].message,
    };
  }

  const { email, password, firstName, lastName, role, licenseId } = validated.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { message: "Email already registered." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        role: role === "radiologist" ? "DOCTOR" : "ADMIN",
        medicalLicenseId: licenseId || null,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return { message: "Database error. Please try again." };
  }

  redirect("/login?success=true");
}

export async function loginUser(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  const validated = LoginSchema.safeParse(rawData);
  if (!validated.success) {
    return { message: "Invalid email or password format." };
  }

  const { email, password } = validated.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: "Invalid credentials." };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { message: "Invalid credentials." };
  }

  const alg = "HS256";
  const jwt = await new SignJWT({ sub: user.id, role: user.role })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("15m") // <--- FIX 1: Expires in 15 minutes
    .sign(secret);

  const cookieStore = await cookies();

  cookieStore.set("session", jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 15, // 15 minutes
    path: "/",
    sameSite: "lax",
  });

  if (user.role === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/doctor");
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();

  // Destroy the session cookie
  cookieStore.delete("session");

  redirect("/login");
}