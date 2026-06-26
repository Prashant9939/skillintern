"use client";

import { useState, useEffect } from "react";
import { loginUser } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { 
  Mail, Lock, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff, 
  GraduationCap, ShieldCheck, Building2, Globe, Check 
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    setIsMockMode(!isSupabaseConfigured());
  }, []);

  const handleClearMockData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mock_profiles");
      localStorage.removeItem("ugintern_session");
      sessionStorage.removeItem("ugintern_session");
      document.cookie = "ugintern_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      alert("Local mock database cleared successfully! Reloading page...");
      window.location.reload();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reason") === "timeout") {
        setError("You have been logged out due to inactivity.");
      }
    }
  }, []);

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

  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.15, ease: "easeIn" as const } }
  };

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col md:flex-row bg-[#F8FAFC]">
      
      {/* LEFT SECTION (Branding - 40%) */}
      <div className="hidden md:flex md:w-2/5 md:h-full relative bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white overflow-hidden flex-col justify-between p-8 lg:p-10 shrink-0 select-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        
        {/* Ambient Gradient Blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "2s" }}></div>
        
        {/* Header Branding Box */}
        <div className="relative z-10 w-full max-w-sm shrink-0">
          <div className="bg-slate-950/25 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl">
            <Link href="/" className="flex items-center gap-2 font-bold text-white mb-1.5">
              <img 
                src="/logo-icon.png" 
                className="h-14 w-auto object-contain" 
              />
            </Link>
            <p className="text-indigo-100/90 font-medium text-[11px] tracking-wide">Empowering Students, Shaping Future</p>
          </div>
        </div>

        {/* Central Illustration and Floating Cards */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center w-full py-4">
          <div className="relative w-full h-64 flex items-center justify-center">
            
            {/* Center Illustration */}
            <div className="relative w-52 h-52 z-10">
              <Image 
                src="/student_internship_branding.png" 
                alt="Students" 
                fill
                priority
                className="object-contain drop-shadow-2xl"
              />
            </div>
            
            {/* Floating Certificate Card */}
            <motion.div 
              className="absolute top-0 left-4 z-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shadow-2xl flex items-center gap-2.5 w-44"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <div className="h-8 w-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                <GraduationCap className="h-4.5 w-4.5 text-amber-300" />
              </div>
              <div className="text-left">
                <div className="text-[9px] font-bold text-indigo-200 uppercase tracking-wider">Certified Intern</div>
                <div className="text-[11px] font-extrabold text-white">Placement Ready</div>
              </div>
            </motion.div>

            {/* Floating Offer Letter Preview Card */}
            <motion.div 
              className="absolute bottom-0 right-4 z-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shadow-2xl flex items-center gap-2.5 w-48"
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
            >
              <div className="h-8 w-8 rounded-full bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-300" />
              </div>
              <div className="text-left">
                <div className="text-[9px] font-bold text-indigo-200 uppercase tracking-wider">Verified Offer</div>
                <div className="text-[11px] font-extrabold text-white flex items-center gap-1">
                  <span>UG Intern Ltd.</span>
                  <span className="text-[8px] text-emerald-300 font-bold px-1.5 py-0.5 bg-emerald-500/20 rounded-full">Active</span>
                </div>
              </div>
            </motion.div>

            {/* Interactive Sparks */}
            <motion.div 
              className="absolute top-10 right-16 z-20"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <div className="h-6 w-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 text-xs shadow-md">✦</div>
            </motion.div>
            <motion.div 
              className="absolute bottom-10 left-16 z-20"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1.5 }}
            >
              <div className="h-5.5 w-5.5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-indigo-300 text-xs shadow-md">★</div>
            </motion.div>
          </div>
        </div>

        {/* Feature & Three Stats Cards */}
        <div className="relative z-10 w-full mt-auto shrink-0">
          <div className="space-y-2 mb-6 hidden lg:block">
            {["Industry-recognized Certificates", "Real Project Experience", "Placement Assistance", "24×7 Student Support"].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-indigo-50 font-medium text-xs">
                <div className="h-4.5 w-4.5 rounded-full bg-emerald-400/20 border border-emerald-400/50 flex items-center justify-center shrink-0">
                  <Check className="h-2.5 w-2.5 text-emerald-300 stroke-[3]" />
                </div>
                {feature}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-xl flex flex-col items-center text-center">
              <div className="h-7 w-7 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mb-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-indigo-300" />
              </div>
              <div className="text-base font-black text-white">5000+</div>
              <div className="text-[8px] font-bold text-indigo-200 uppercase tracking-wider">Students</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-xl flex flex-col items-center text-center">
              <div className="h-7 w-7 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center mb-1.5">
                <Building2 className="h-3.5 w-3.5 text-purple-300" />
              </div>
              <div className="text-base font-black text-white">100+</div>
              <div className="text-[8px] font-bold text-indigo-200 uppercase tracking-wider">Colleges</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-xl flex flex-col items-center text-center">
              <div className="h-7 w-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-1.5">
                <Globe className="h-3.5 w-3.5 text-emerald-300" />
              </div>
              <div className="text-base font-black text-white">50+</div>
              <div className="text-[8px] font-bold text-indigo-200 uppercase tracking-wider">Domains</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION (Form - 60%) */}
      <div className="w-full md:w-3/5 md:h-full flex flex-col overflow-y-auto md:overflow-hidden min-h-screen md:min-h-0 bg-[#F8FAFC]">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-5 bg-white border-b border-zinc-200 shrink-0">
           <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900">
            <img 
              src="/logo-icon.png" 
              className="h-10 w-auto object-contain" 
            />
          </Link>
          <Link href="/auth/register" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            Register
          </Link>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex justify-end p-4 shrink-0">
           <span className="text-xs font-medium text-zinc-500 mr-2">New to UG Intern?</span>
           <Link href="/auth/register" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
             Create an Account here →
           </Link>
        </div>

        {/* Form Container */}
        <div className="flex-grow flex items-center justify-center py-4 px-4 sm:px-8 md:overflow-hidden relative">
          <div className="w-full max-w-[460px] flex flex-col shrink-0">
            
            {/* Card */}
            <div className="bg-white border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[24px] p-6 sm:p-8 flex flex-col w-full relative">
              <form onSubmit={handleLogin} className="flex flex-col space-y-4">
                
                {/* Form Title */}
                <div className="pb-4 border-b border-zinc-100 mb-2 shrink-0 text-left">
                  <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-[11px] text-zinc-550 font-medium mt-0.5">
                    Enter credentials to access your dashboard
                  </p>
                </div>
 
                {/* Mock Mode Development Helper Banner */}
                {isMockMode && (
                  <div className="mb-2 flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 text-xs text-amber-800 font-medium shrink-0">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <strong className="font-bold block text-amber-900">Developer Mock Mode Active</strong>
                        <span className="text-[11px] text-amber-700 leading-relaxed block mt-0.5">
                          The client is running in Mock Mode because Supabase credentials are not loaded in your browser. Restart your local Next.js dev server after adding `.env.local` to connect to Supabase.
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                      <button
                        type="button"
                        onClick={handleClearMockData}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm shadow-amber-600/10 active:scale-95 transition-all cursor-pointer"
                      >
                        Clear Mock DB
                      </button>
                    </div>
                  </div>
                )}

                {/* Error/Success Messages Inside Card */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div key="error-message" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-650 font-semibold shrink-0">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div key="success-message" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-600 font-semibold shrink-0">
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="flex flex-col gap-1 text-left">
                    <label htmlFor="email" className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider ml-1">Email Address or Phone Number *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400" />
                      <input 
                        id="email"
                        type="text" 
                        required 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="w-full pl-11 pr-4 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:bg-white focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 placeholder:text-zinc-400 focus-visible:ring-indigo-500" 
                        placeholder="Enter email address or phone number" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <div className="flex justify-between items-center px-1 mb-0.5">
                      <label htmlFor="password" className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Password *</label>
                      <Link href="/auth/forgot-password" className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold uppercase tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-zinc-400" />
                      <input 
                        id="password"
                        type={showPassword ? "text" : "password"} 
                        required 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="w-full pl-11 pr-11 h-[56px] text-sm bg-zinc-50 border border-zinc-300 focus:bg-white focus:border-[#7C3AED] focus:ring-[4px] focus:ring-[#7C3AED]/15 rounded-[14px] outline-none text-zinc-800 transition-all duration-200 placeholder:text-zinc-400 focus-visible:ring-indigo-500" 
                        placeholder="••••••••" 
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 transition-colors cursor-pointer focus:outline-none focus-visible:text-indigo-600">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 shrink-0">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 h-[56px] rounded-[14px] bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338ca] hover:to-[#6d28d9] px-6 text-sm font-extrabold text-white shadow-md shadow-indigo-650/15 active:scale-95 disabled:opacity-50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {loading ? "Verifying Session..." : "Sign In"}
                    <ArrowRight className="h-4.5 w-4.5 stroke-[3.5]" />
                  </button>
                </div>
              </form>

              {/* Mobile Footer Link */}
              <div className="mt-5 pt-4 border-t border-zinc-100 text-center text-xs md:hidden shrink-0">
                <span className="text-zinc-500 font-medium">New to UG Intern? </span>
                <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-750 font-bold transition-colors">
                  Create an Account
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
