"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { loginUser } from "@/lib/supabase/auth";
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await loginUser(email, password);
      setSuccess("Logged in successfully! Redirecting...");
      
      setTimeout(() => {
        if (res.user.role === "admin") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/student/dashboard";
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="absolute inset-0 radial-fade pointer-events-none" />

      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-md glass-panel rounded-3xl p-8 relative overflow-hidden">
          {/* Neon side blur */}
          <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Welcome Back</h2>
            <p className="mt-2 text-sm text-zinc-500 font-light">
              Enter credentials to access your dashboard
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-600">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-zinc-200 focus:border-indigo-500/50 rounded-xl outline-none text-zinc-800 transition-colors"
                  placeholder="student@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 text-sm bg-white border border-zinc-200 focus:border-indigo-500/50 rounded-xl outline-none text-zinc-800 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
                Admin login (email: <span className="text-indigo-600 font-bold">admin@skillintern.com</span>, password: <span className="text-indigo-600 font-bold">Shiwam@99</span>)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/10 transition-all active:scale-95 disabled:opacity-50 cursor-pointer mt-4"
            >
              {loading ? "Verifying..." : "Sign In"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 pt-6 border-t border-zinc-200/60 text-center text-xs">
            <span className="text-zinc-500">New to SkillIntern? </span>
            <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
              Create an Account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
