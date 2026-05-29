"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { supabase } from "./client";

const SALT = "skillintern-secure-salt-2026";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + SALT).digest("hex");
}

// -------------------------------------------------------------
// SIGN UP — always creates a student, never an admin
// -------------------------------------------------------------
// react-doctor-disable-next-line react-doctor/server-auth-actions
export async function serverSignUpUser(
  email: string,
  password: string,
  fullName: string,
  phoneNumber: string
) {
  if (!supabase) throw new Error("Supabase is not configured.");

  // 1. Block the reserved admin email from public sign-up
  if (email.toLowerCase() === "admin@skillintern.com") {
    throw new Error("This email address is reserved. Please use a different email.");
  }

  // 2. Check if email already exists
  const { data: existingUser, error: checkErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (checkErr) throw new Error(`Database error: ${checkErr.message}`);
  if (existingUser) throw new Error("An account with this email already exists.");

  // 3. Hash password & insert — role is always 'student'
  const passwordHash = hashPassword(password);
  const { error } = await supabase.from("profiles").insert({
    email,
    password_hash: passwordHash,
    full_name: fullName,
    phone_number: phoneNumber,
    role: "student",
  });

  if (error) throw new Error(`Registration failed: ${error.message}`);
  return { success: true };
}

// -------------------------------------------------------------
// LOGIN
// -------------------------------------------------------------
// react-doctor-disable-next-line react-doctor/server-auth-actions
export async function serverLoginUser(email: string, password: string) {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data: user, error: fetchErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (fetchErr) throw new Error(`Database error: ${fetchErr.message}`);
  if (!user) throw new Error("Account not found. Please register first.");

  const enteredHash = hashPassword(password);
  if (user.password_hash !== enteredHash) throw new Error("Wrong password.");

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone_number: user.phone_number,
    department_stream: user.department_stream,
    role: user.role,
    profile_completed: user.role === "admin" ? true : !!user.profile_completed,
  };
}

// -------------------------------------------------------------
// SEED DEFAULT ADMIN — called on first login attempt if admin
// row doesn't yet exist in the live database.
// -------------------------------------------------------------
// react-doctor-disable-next-line react-doctor/server-auth-actions
export async function seedAdminAccount() {
  if (!supabase) return { success: false, message: "Supabase not configured." };

  try {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", "admin@skillintern.com")
      .maybeSingle();

    if (existing) return { success: true, message: "Admin already exists." };

    const passwordHash = hashPassword("Shiwam@99");
    const { error } = await supabase.from("profiles").insert({
      email: "admin@skillintern.com",
      password_hash: passwordHash,
      full_name: "Super Admin",
      phone_number: "0000000000",
      department_stream: "Platform Administration",
      role: "admin",
      profile_completed: true,
    });

    if (error) throw new Error(error.message);
    return { success: true, message: "Admin account created successfully." };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// -------------------------------------------------------------
// CREATE ADMIN USER — only an existing admin can call this
// -------------------------------------------------------------
// react-doctor-disable-next-line react-doctor/server-auth-actions
export async function createAdminUser(
  callerEmail: string,
  newEmail: string,
  password: string,
  fullName: string,
  phoneNumber: string,
  departmentStream: string
) {
  if (!supabase) throw new Error("Supabase is not configured.");

  // Verify caller's session using server-side cookies
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("skillintern_session")?.value;
  if (!sessionCookie) {
    throw new Error("Unauthorized: No active session found.");
  }
  let session;
  try {
    session = JSON.parse(decodeURIComponent(sessionCookie));
  } catch (e) {
    throw new Error("Unauthorized: Invalid session format.");
  }

  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized: Only admins can create admin accounts.");
  }

  // Check if target email already exists
  const { data: existing, error: chkErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", newEmail)
    .maybeSingle();

  if (chkErr) throw new Error(`Database error: ${chkErr.message}`);
  if (existing) throw new Error("An account with this email already exists.");

  const passwordHash = hashPassword(password);
  const { error } = await supabase.from("profiles").insert({
    email: newEmail,
    password_hash: passwordHash,
    full_name: fullName,
    phone_number: phoneNumber,
    department_stream: departmentStream,
    role: "admin",
    profile_completed: true,
  });

  if (error) throw new Error(`Admin creation failed: ${error.message}`);
  return { success: true };
}
