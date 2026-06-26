/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getCurrentUser,
  signOut,
  UserSession,
  devToggleRole
} from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Menu, X, ShieldAlert, LogOut, LayoutDashboard, Briefcase, Info, Mail, LogIn, UserPlus } from "lucide-react";
import { BRANDING } from "@/config/branding";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);

  useEffect(() => {
    // Check user state on load
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
    setSupabaseConfigured(isSupabaseConfigured());
  }, [pathname]);

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    window.location.href = "/";
  };

  const navLinks = [
    { name: "Home", href: "/", icon: null },
    { name: "About", href: "/about", icon: Info },
    { name: "Internships", href: "/internships", icon: Briefcase },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-7xl">
      <nav className="glass-navbar rounded-2xl relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link
                href={user ? (user.role === "admin" ? "/admin/dashboard" : "/student/dashboard") : "/"}
                className="group flex items-center gap-2"
              >
                <img
                  src={BRANDING.logoIcon}
                  className="h-12 w-auto object-contain group-hover:scale-105 transition-all"
                />
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors hover:text-indigo-600 relative py-1.5 px-1 ${isActive(link.href) ? "text-indigo-600 font-bold" : "text-zinc-650"
                    }`}
                >
                  {link.name}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-indigo-600 rounded-full animate-fade-in" />
                  )}
                </Link>
              ))}
            </div>

            {/* User Controls / Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Developer Mode Role Toggle */}
              {!supabaseConfigured && user && (
                <button
                  onClick={devToggleRole}
                  title="Mock Mode: Click to switch Admin / Student role"
                  className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                  Role: {user.role === "admin" ? "Admin" : "Student"}
                </button>
              )}

              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href={user.role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
                    className="flex items-center gap-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/60 border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-zinc-850 transition-all shadow-sm"
                  >
                    <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-xl border border-red-200 hover:border-red-300 hover:bg-red-50/50 px-4 py-2 text-sm font-semibold text-red-500 hover:text-red-650 transition-all cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-1.5 text-sm font-semibold text-zinc-650 hover:text-indigo-600 transition-colors"
                  >
                    <LogIn className="h-4.5 w-4.5" />
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-650 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-98 transition-all"
                  >
                    <UserPlus className="h-4.5 w-4.5" />
                    Register Now
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-xl p-2 text-zinc-550 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Floating Card */}
        {isMobileMenuOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 md:hidden glass-panel border border-zinc-200/70 p-4 space-y-3 rounded-2xl shadow-xl z-50 bg-white/95">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block rounded-xl px-4 py-2.5 text-base font-semibold transition-colors ${isActive(link.href) ? "bg-indigo-500/5 text-indigo-600" : "text-zinc-660 hover:bg-zinc-50 hover:text-indigo-600"
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-zinc-200/60 pt-3 space-y-3">
              {/* Developer Mode Role Toggle */}
              {!supabaseConfigured && user && (
                <button
                  onClick={() => {
                    devToggleRole();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-sm font-bold text-amber-700 hover:bg-amber-100 transition-all"
                >
                  <ShieldAlert className="h-4 w-4 text-amber-400" />
                  Change Role (Currently: {user.role})
                </button>
              )}

              {user ? (
                <div className="space-y-2">
                  <Link
                    href={user.role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 border border-indigo-100 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 hover:border-red-300 hover:bg-red-50 py-2.5 text-sm font-bold text-red-500 transition-all cursor-pointer shadow-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 text-sm font-semibold text-zinc-650 hover:text-zinc-850 transition-colors"
                  >
                    <LogIn className="h-4.5 w-4.5" />
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/10"
                  >
                    <UserPlus className="h-4.5 w-4.5" />
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
