"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, signOut, UserSession, devToggleRole } from "@/lib/supabase/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import { 
  Shield, 
  LayoutDashboard, 
  Briefcase, 
  HelpCircle, 
  Users, 
  LogOut,
  Menu,
  X,
  RefreshCw,
  Award,
  GraduationCap,
  CreditCard,
  ChevronDown,
  Settings,
  Megaphone,
  BarChart3,
  MessageSquare
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const u = await getCurrentUser();
      if (!u) {
        window.location.href = "/auth/login";
        return;
      }
      if (u.role !== "admin") {
        window.location.href = "/student/dashboard";
        return;
      }
      setUser(u);
      setLoading(false);
    }
    checkAdmin();
  }, [pathname]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const menuItems = [
    { name: "Analytics Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Student Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Manage Internships", href: "/admin/internships", icon: Briefcase },
    { name: "Manage MCQs", href: "/admin/questions", icon: HelpCircle },
    { name: "Registered Students", href: "/admin/students", icon: Users },
    { name: "Manage Colleges", href: "/admin/colleges", icon: GraduationCap },
    { name: "Document Templates", href: "/admin/templates", icon: Award },
    { name: "Support Tickets", href: "/admin/support", icon: MessageSquare },
  ];

  const secondaryMenuItems = [
    { name: "Reports & Analytics", href: "/admin/reports", icon: BarChart3 },
    { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { name: "Platform Settings", href: "/admin/settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#FAFAFC] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto mb-4" />
          <p className="text-zinc-555 text-sm font-medium">Authorizing admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const logoHref = user.role === "admin" ? "/admin/dashboard" : "/student/dashboard";

  return (
    <div className="h-[100dvh] bg-[#FAFAFC] text-zinc-800 relative flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-800 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Full Screen Top Header */}
      <header className="hidden md:flex h-18 items-center justify-between px-8 border-b border-zinc-155/85 bg-white shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href={logoHref} className="flex items-center gap-2.5 group">
            <img 
              src="/logo-icon.png" 
              className="h-9 w-auto object-contain group-hover:scale-105 transition-all" 
            />
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-zinc-650 text-xs bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full">
            <Shield className="h-3.5 w-3.5 text-[#5B5FF7]" />
            <span className="font-semibold text-zinc-850">Authenticated Administrator</span>
          </div>

          <div className="h-5 w-[1px] bg-zinc-200" />

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-zinc-150"
            >
              <div className="h-9 w-9 rounded-full bg-[#5B5FF7]/10 flex items-center justify-center text-[#5B5FF7] font-bold text-sm border border-[#5B5FF7]/20 shrink-0">
                A
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-zinc-900 leading-tight">Admin User</p>
                <p className="text-[10px] text-zinc-400 font-semibold leading-tight">{user.email}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-white border border-zinc-200/80 rounded-xl shadow-lg py-1.5 z-50 animate-fade-in">
                <button
                  onClick={() => {
                    devToggleRole();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors text-left"
                >
                  Switch to Student View
                </button>
                <div className="h-[1px] bg-zinc-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sticky Header */}
      <header className="sticky top-0 z-30 md:hidden flex h-16 w-full items-center justify-between border-b border-zinc-200/80 bg-white/95 backdrop-blur px-4 shadow-sm shrink-0">
        <Link href={logoHref} className="flex items-center gap-2 font-bold text-zinc-900">
          <img 
            src="/logo-icon.png" 
            className="h-10 w-auto object-contain" 
          />
        </Link>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-xl text-zinc-550 hover:bg-zinc-100 hover:text-zinc-800 transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Navigation Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-205 bg-white transition-transform duration-300 ease-in-out shadow-lg
        md:hidden
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-200/60 shrink-0">
          <Link href={logoHref} className="flex items-center gap-2 font-bold text-zinc-800" onClick={() => setMobileMenuOpen(false)}>
            <img 
              src="/logo-icon.png" 
              className="h-9 w-auto object-contain" 
            />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-[#5B5FF7] to-[#7B7FFA] text-white border-transparent shadow-md shadow-[#5B5FF7]/15"
                    : "text-zinc-650 hover:bg-indigo-50/75 hover:text-indigo-700 active:bg-indigo-100/80 active:scale-95 border-transparent"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            );
          })}

          <div className="h-[1px] bg-zinc-200/60 my-3" />

          {secondaryMenuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-[#5B5FF7] to-[#7B7FFA] text-white border-transparent shadow-md shadow-[#5B5FF7]/15"
                    : "text-zinc-650 hover:bg-indigo-50/75 hover:text-indigo-700 active:bg-indigo-100/80 active:scale-95 border-transparent"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer controls on Mobile */}
        <div className="p-4 border-t border-zinc-200/60 mt-auto shrink-0 bg-white">
          <button
            onClick={() => {
              devToggleRole();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-500 hover:text-white active:bg-amber-650 active:scale-95 py-2.5 text-xs font-bold text-amber-700 transition-all mb-3 cursor-pointer shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Switch to Student View
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white hover:bg-red-500 hover:text-white active:bg-red-650 active:scale-95 py-2.5 text-xs font-bold text-red-600 transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Layout (Full Screen) */}
      <div className="w-full flex-1 flex min-h-0 overflow-hidden">
        
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden md:flex w-[260px] flex-col border-r border-zinc-150/85 bg-white shrink-0 justify-between p-6 sticky top-18 h-[calc(100vh-4.5rem)] overflow-y-auto">
          
          {/* Sidebar Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-[14px] font-semibold rounded-xl transition-all cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-[#5B5FF7] to-[#7B7FFA] text-white shadow-md shadow-[#5B5FF7]/10"
                      : "text-zinc-550 hover:bg-slate-50 hover:text-zinc-800 transition-colors border-transparent"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.name}
                </Link>
              );
            })}

            <div className="h-[1px] bg-zinc-200/60 my-3" />

            {secondaryMenuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-[14px] font-semibold rounded-xl transition-all cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-[#5B5FF7] to-[#7B7FFA] text-white shadow-md shadow-[#5B5FF7]/10"
                      : "text-zinc-550 hover:bg-slate-50 hover:text-zinc-800 transition-colors border-transparent"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Quick switcher & Log out at bottom */}
          <div className="space-y-3 mt-6">
            <button
              onClick={() => {
                devToggleRole();
              }}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-500 hover:text-white active:bg-amber-650 active:scale-95 py-2.5 text-xs font-bold text-amber-700 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Switch to Student View
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white hover:bg-red-50 hover:text-red-650 active:scale-95 py-2.5 text-xs font-bold text-red-500 transition-all cursor-pointer shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>

        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-[#FAFAFC] relative min-w-0 overflow-y-auto">
          <div className="flex-grow p-6 sm:p-8 pb-12 relative z-10">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
