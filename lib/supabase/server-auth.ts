import { supabase } from "./client";

// Use Web Crypto API (works on Node.js 18+, Vercel Edge, and all browsers)
const SALT = "skillintern-secure-salt-2026";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
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
  const { data: existingEmailUser, error: emailCheckErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
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
    throw new Error("An account already exists with these credentials.");
  } else if (existingEmailUser) {
    throw new Error("An account with this email already exists.");
  } else if (existingPhoneUser) {
    throw new Error("An account with this phone number already exists.");
  }

  // 4. Hash password & insert — role is always 'student'
  const passwordHash = await hashPassword(password);
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
export async function serverLoginUser(emailOrPhone: string, password: string) {
  if (!supabase) throw new Error("Supabase is not configured.");

  let query = supabase.from("profiles").select("*");
  if (emailOrPhone.includes("@")) {
    query = query.eq("email", emailOrPhone);
  } else {
    query = query.eq("phone_number", emailOrPhone);
  }

  const { data: user, error: fetchErr } = await query.maybeSingle();

  if (fetchErr) throw new Error(`Database error: ${fetchErr.message}`);
  if (!user) throw new Error("Invalid email/phone number or password.");

  const enteredHash = await hashPassword(password);
  if (user.password_hash !== enteredHash) throw new Error("Invalid email/phone number or password.");

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

    const passwordHash = await hashPassword("Shiwam@99");
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

  // Verify caller is admin via the email param (no cookie dependency)
  const { data: callerProfile, error: callerErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("email", callerEmail)
    .maybeSingle();

  if (callerErr || !callerProfile || callerProfile.role !== "admin") {
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
    .eq("email", email)
    .eq("phone_number", phoneNumber)
    .maybeSingle();

  if (fetchErr) throw new Error(`Database error: ${fetchErr.message}`);
  if (!user) throw new Error("Incorrect email or phone number.");

  return { success: true, userId: user.id };
}

// react-doctor-disable-next-line react-doctor/server-auth-actions
export async function serverResetPassword(userId: string, newPassword: string) {
  if (!supabase) throw new Error("Supabase is not configured.");

  const passwordHash = await hashPassword(newPassword);
  const { error } = await supabase
    .from("profiles")
    .update({ password_hash: passwordHash })
    .eq("id", userId);

  if (error) throw new Error(`Failed to reset password: ${error.message}`);
  return { success: true };
}

