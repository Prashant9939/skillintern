"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/set-state-in-effect */
import { supabase } from "./client";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email/sendWelcomeEmail";

// Use Web Crypto API for legacy hash compatibility
// IMPORTANT: This salt MUST match the original value used when passwords were first hashed.
// Do NOT change this — it would break login for all existing users with legacy SHA-256 hashes.
// New passwords use bcrypt and are not affected by this salt.
const SALT = "ugintern-secure-salt-2026";

async function legacyHashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.length === 64 && !hash.startsWith("$2")) {
    const enteredHash = await legacyHashPassword(password);
    return enteredHash === hash;
  }
  return bcrypt.compare(password, hash);
}

// -------------------------------------------------------------
// SIGN UP — always creates a student, never an admin
// -------------------------------------------------------------
// react-doctor-disable-next-line react-doctor/server-auth-actions
export async function serverSignUpUser(
  email: string,
  password: string,
  fullName: string,
  phoneNumber: string,
  college: string,
  university: string,
  course: string,
  semester: string,
  address: string,
  documentId: string,
  departmentStream: string,
  batch: string,
  rollNumber: string,
  registrationNumber: string,
  emergencyContactName: string,
  emergencyContactNumber: string,
  emergencyContactRelation: string,
  agreedTerms: boolean,
  agreedUpdates: boolean,
  dateOfBirth: string
) {
  if (!supabase) throw new Error("Supabase is not configured.");

  // Enforce password size to minimum 7 characters
  if (!password || password.length < 7) {
    throw new Error("Password must be at least 7 characters.");
  }

  // 1. Block the reserved admin email from public sign-up
  if (email.toLowerCase() === "admin@iqintern.com") {
    throw new Error("This email address is reserved. Please use a different email.");
  }

  // 2. Check if email already exists
  const { data: existingEmailUser, error: emailCheckErr } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", email.trim())
    .maybeSingle();

  if (emailCheckErr) throw new Error(`Database error: ${emailCheckErr.message}`);

  // 3. Check if phone number already exists
  const { data: existingPhoneUser, error: phoneCheckErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone_number", phoneNumber)
    .maybeSingle();

  if (phoneCheckErr) throw new Error(`Database error: ${phoneCheckErr.message}`);

  if (existingEmailUser && existingPhoneUser) {
    throw new Error("Both your email and phone number already exist in the database.");
  } else if (existingEmailUser) {
    throw new Error("Your email already exists in the database.");
  } else if (existingPhoneUser) {
    throw new Error("Your phone number already exists in the database.");
  }

  // 4. Hash password & insert — role is always 'student'
  const passwordHash = await hashPassword(password);
  const { data: newUser, error } = await supabase
    .from("profiles")
    .insert({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      phone_number: phoneNumber,
      college_name: college,
      university_name: university,
      degree: course,
      semester: semester,
      academic_session: batch,
      department_stream: departmentStream,
      roll_number: rollNumber,
      registration_number: registrationNumber,
      full_address: address,
      document_id: documentId,
      emergency_contact_name: emergencyContactName,
      emergency_contact_number: emergencyContactNumber,
      emergency_contact_relation: emergencyContactRelation,
      agreed_terms: agreedTerms,
      agreed_updates: agreedUpdates,
      date_of_birth: dateOfBirth,
      role: "student",
      profile_completed: true,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Registration failed: ${error.message}`);

  // Trigger welcome email in the background (non-blocking)
  sendWelcomeEmail({
    email,
    fullName,
    userId: newUser?.id
  }).catch((err) => {
    console.error("Welcome email background task failed:", err);
  });

  return { success: true };
}

// -------------------------------------------------------------
// LOGIN
// -------------------------------------------------------------
// react-doctor-disable-next-line react-doctor/server-auth-actions
export async function serverLoginUser(emailOrPhone: string, password: string) {
  if (!supabase) throw new Error("Supabase is not configured.");

  let query = supabase.from("profiles").select("*");
  if (emailOrPhone.includes("@")) {
    query = query.ilike("email", emailOrPhone.trim());
  } else {
    query = query.eq("phone_number", emailOrPhone.trim());
  }

  const { data: user, error: fetchErr } = await query.maybeSingle();

  if (fetchErr) throw new Error(`Database error: ${fetchErr.message}`);
  if (!user) throw new Error("Invalid email/phone number or password.");

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) throw new Error("Invalid email/phone number or password.");

  // Auto-upgrade legacy hash to bcrypt in the Supabase database
  if (user.password_hash.length === 64 && !user.password_hash.startsWith("$2")) {
    try {
      const bcryptHash = await hashPassword(password);
      await supabase
        .from("profiles")
        .update({ password_hash: bcryptHash })
        .eq("id", user.id);
    } catch (upgradeErr) {
      console.warn("Failed to auto-upgrade legacy password to bcrypt:", upgradeErr);
    }
  }

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
    // 1a. Migrate from original skillintern.com email
    const { data: oldAdminSkillintern } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", "admin@skillintern.com")
      .maybeSingle();

    if (oldAdminSkillintern) {
      const passwordHash = await hashPassword("Shiwam@99");
      const { error } = await supabase
        .from("profiles")
        .update({
          email: "admin@iqintern.com",
          password_hash: passwordHash,
          full_name: "Super Admin",
          phone_number: "0000000000",
          department_stream: "Platform Administration",
          role: "admin",
          profile_completed: true,
        })
        .eq("id", oldAdminSkillintern.id);

      if (error) throw new Error(error.message);
      return { success: true, message: "Admin account migrated from skillintern successfully." };
    }

    // 1b. Migrate from intermediate ugintern.com email
    const { data: oldAdminUgintern } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", "admin@ugintern.com")
      .maybeSingle();

    if (oldAdminUgintern) {
      const passwordHash = await hashPassword("Shiwam@99");
      const { error } = await supabase
        .from("profiles")
        .update({
          email: "admin@iqintern.com",
          password_hash: passwordHash,
          full_name: "Super Admin",
          phone_number: "0000000000",
          department_stream: "Platform Administration",
          role: "admin",
          profile_completed: true,
        })
        .eq("id", oldAdminUgintern.id);

      if (error) throw new Error(error.message);
      return { success: true, message: "Admin account migrated from ugintern successfully." };
    }

    // 2. Check if new admin email already exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", "admin@iqintern.com")
      .maybeSingle();

    if (existing) return { success: true, message: "Admin already exists." };

    // 3. Create fresh admin account
    const passwordHash = await hashPassword("Shiwam@99");
    const { error } = await supabase.from("profiles").insert({
      email: "admin@iqintern.com",
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

  // Enforce password size to minimum 7 characters
  if (!password || password.length < 7) {
    throw new Error("Password must be at least 7 characters.");
  }

  // Verify caller is admin via the email param (no cookie dependency)
  const { data: callerProfile, error: callerErr } = await supabase
    .from("profiles")
    .select("role")
    .ilike("email", callerEmail.trim())
    .maybeSingle();

  if (callerErr || !callerProfile || callerProfile.role !== "admin") {
    throw new Error("Unauthorized: Only admins can create admin accounts.");
  }

  // Check if target email already exists
  const { data: existing, error: chkErr } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", newEmail.trim())
    .maybeSingle();

  if (chkErr) throw new Error(`Database error: ${chkErr.message}`);
  if (existing) throw new Error("An account with this email already exists.");

  const passwordHash = await hashPassword(password);
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

// -------------------------------------------------------------
// FORGOT PASSWORD VERIFICATION & RESET (SERVER ACTIONS)
// -------------------------------------------------------------
// react-doctor-disable-next-line react-doctor/server-auth-actions
export async function serverVerifyEmailAndPhone(email: string, phoneNumber: string) {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data: user, error: fetchErr } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", email.trim())
    .eq("phone_number", phoneNumber.trim())
    .maybeSingle();

  if (fetchErr) throw new Error(`Database error: ${fetchErr.message}`);
  if (!user) throw new Error("Incorrect email or phone number.");

  return { success: true, userId: user.id };
}

// react-doctor-disable-next-line react-doctor/server-auth-actions
export async function serverResetPassword(userId: string, newPassword: string) {
  if (!supabase) throw new Error("Supabase is not configured.");

  // Enforce password size to minimum 7 characters
  if (!newPassword || newPassword.length < 7) {
    throw new Error("Password must be at least 7 characters.");
  }

  const passwordHash = await hashPassword(newPassword);
  const { error } = await supabase
    .from("profiles")
    .update({ password_hash: passwordHash })
    .eq("id", userId);

  if (error) throw new Error(`Failed to reset password: ${error.message}`);
  return { success: true };
}

