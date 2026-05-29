"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { forgotPassword } from "@/lib/supabase/auth";
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await forgotPassword(email);
      setSuccess("Password reset instructions have been sent to your email!");
      setEmail("");
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
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
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight font-sans">Reset Password</h2>
            <p className="mt-2 text-sm text-zinc-500 font-light">
              Enter your email to receive recovery instructions
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

          <form onSubmit={handleForgotPassword} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/10 transition-all active:scale-95 disabled:opacity-50 cursor-pointer mt-4"
            >
              {loading ? "Processing..." : "Send Reset Link"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-zinc-200/60 text-center text-xs">
            <Link
              href="/auth/login"
              className="text-zinc-500 hover:text-indigo-600 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
