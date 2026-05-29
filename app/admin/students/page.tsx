"use client";

import { useEffect, useState, useRef } from "react";
import { getAllProfiles, getTestResults, TestResult } from "@/lib/supabase/db";
import { getCurrentUser, createAdminUser, UserSession } from "@/lib/supabase/auth";
import {
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Search,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Shield,
  ShieldCheck,
  UserPlus,
  X,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import Link from "next/link";

export default function RegisteredStudents() {
  const currentUserRef = useRef<UserSession | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profiles" | "results">("profiles");
  const [searchQuery, setSearchQuery] = useState("");

  // Add Admin modal state
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    departmentStream: "Platform Administration",
    password: "",
  });
  const [showAdminPwd, setShowAdminPwd] = useState(false);
  const [adminCreating, setAdminCreating] = useState(false);
  const [adminMsg, setAdminMsg] = useState("");
  const [adminMsgType, setAdminMsgType] = useState<"success" | "error">("success");

  useEffect(() => {
    async function loadData() {
      try {
        const [user, profileList, testLogs] = await Promise.all([
          getCurrentUser(),
          getAllProfiles(),
          getTestResults(),
        ]);
        currentUserRef.current = user;
        setProfiles(profileList);
        setResults(testLogs);
      } catch (err) {
        console.error("Failed to load student logs", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserRef.current) return;
    setAdminCreating(true);
    setAdminMsg("");
    try {
      await createAdminUser(
        currentUserRef.current.email,
        adminForm.email,
        adminForm.password,
        adminForm.fullName,
        adminForm.phone,
        adminForm.departmentStream
      );
      setAdminMsg("Admin account created successfully.");
      setAdminMsgType("success");
      setAdminForm({ fullName: "", email: "", phone: "", departmentStream: "Platform Administration", password: "" });
      // Refresh profiles
      const updated = await getAllProfiles();
      setProfiles(updated);
      setTimeout(() => setShowAddAdmin(false), 1500);
    } catch (err: any) {
      setAdminMsg(err.message || "Failed to create admin.");
      setAdminMsgType("error");
    } finally {
      setAdminCreating(false);
    }
  };

  const students = profiles.filter((p) => p.role === "student");
  const admins   = profiles.filter((p) => p.role === "admin");

  const filteredProfiles = profiles.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department_stream?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResults = results.filter(
    (r) =>
      r.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.internship_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reference_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 relative z-10 text-zinc-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            User Registry &amp; Activity
          </h1>
          <p className="text-zinc-505 text-xs sm:text-sm font-light mt-1">
            All registered accounts, test performance logs, and admin management.
          </p>
        </div>

        {/* Add Admin button */}
        <button
          onClick={() => { setShowAddAdmin(true); setAdminMsg(""); }}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/10 transition-all active:scale-95 cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Add Admin Account
        </button>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Registrations", value: profiles.length, icon: Users, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
          { label: "Students", value: students.length, icon: GraduationCap, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { label: "Admins", value: admins.length, icon: Shield, color: "text-violet-600 bg-violet-50 border-violet-100" },
          { label: "Test Submissions", value: results.length, icon: FileText, color: "text-amber-600 bg-amber-50 border-amber-100" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel bg-white border border-zinc-200/85 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg font-extrabold text-zinc-900">{loading ? "..." : stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-md">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => { setActiveTab("profiles"); setSearchQuery(""); }}
            className={`flex-grow sm:flex-grow-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              activeTab === "profiles"
                ? "bg-indigo-50 text-indigo-600 border-indigo-150 shadow-sm"
                : "bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900 shadow-sm"
            }`}
          >
            All Accounts ({profiles.length})
          </button>
          <button
            onClick={() => { setActiveTab("results"); setSearchQuery(""); }}
            className={`flex-grow sm:flex-grow-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              activeTab === "results"
                ? "bg-indigo-50 text-indigo-600 border-indigo-150 shadow-sm"
                : "bg-zinc-50 border-zinc-200 text-zinc-655 hover:bg-zinc-100 hover:text-zinc-900 shadow-sm"
            }`}
          >
            Test Logs ({results.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder={activeTab === "profiles" ? "Search name, email, role..." : "Search student, track, ref no..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-zinc-205 focus:border-indigo-500/50 rounded-xl outline-none text-zinc-800"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : activeTab === "profiles" ? (
        filteredProfiles.length === 0 ? (
          <div className="text-center py-20 border border-zinc-200 rounded-3xl bg-white shadow-sm">
            <Users className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
            <p className="text-sm text-zinc-500 font-bold">No accounts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 shadow-sm bg-white">
            <table className="w-full text-left text-xs text-zinc-600 border-collapse">
              <thead className="text-[10px] text-zinc-400 uppercase tracking-wider bg-zinc-50 border-b border-zinc-200/80">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Course / Department</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                          profile.role === "admin"
                            ? "bg-violet-50 border border-violet-100 text-violet-600"
                            : "bg-indigo-50 border border-indigo-100 text-indigo-600"
                        }`}>
                          {profile.full_name?.charAt(0)}
                        </div>
                        <span className="font-bold text-zinc-900 whitespace-nowrap">{profile.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-indigo-550 shrink-0" />
                        {profile.email}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-indigo-550 shrink-0" />
                        {profile.phone_number || "N/A"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-550 shrink-0" />
                        <span className="max-w-[160px] truncate font-medium">{profile.department_stream || "N/A"}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {profile.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700 border border-violet-100">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-650 border border-indigo-100">
                          <GraduationCap className="h-3.5 w-3.5" />
                          Student
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* RESULTS TAB */
        filteredResults.length === 0 ? (
          <div className="text-center py-20 border border-zinc-200 rounded-3xl bg-white shadow-sm">
            <FileText className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
            <p className="text-sm text-zinc-550 font-bold">No test performance logs recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 shadow-sm bg-white">
            <table className="w-full text-left text-xs text-zinc-650 border-collapse">
              <thead className="text-[10px] text-zinc-400 uppercase tracking-wider bg-zinc-50 border-b border-zinc-200/80">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Internship Track</th>
                  <th className="px-6 py-4">Reference No.</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Percentage</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Attempt Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredResults.map((res) => (
                  <tr key={res.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900">{res.student_name}</td>
                    <td className="px-6 py-4 font-semibold text-zinc-700">{res.internship_title}</td>
                    <td className="px-6 py-4">
                      {res.reference_number ? (
                        <span className="inline-flex items-center font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg px-2.5 py-1 tracking-wide select-all">
                          {res.reference_number}
                        </span>
                      ) : (
                        <span className="text-zinc-350 text-[10px] italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{res.score} / {res.total_questions}</td>
                    <td className="px-6 py-4 text-indigo-650 font-bold">{res.percentage}%</td>
                    <td className="px-6 py-4">
                      {res.passed ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-150">
                          <CheckCircle className="h-3 w-3" /> Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-650 border border-red-155">
                          <XCircle className="h-3 w-3" /> Fail
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{new Date(res.completed_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/student/results/${res.id}`}
                        target="_blank"
                        className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
                      >
                        Inspect Result
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Add Admin Modal */}
      {showAddAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-violet-50 border border-violet-100">
                  <Shield className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-zinc-900">Create Admin Account</h2>
                  <p className="text-[10px] text-zinc-400">Only admins can create other admins</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddAdmin(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label htmlFor="admin-fullName" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  id="admin-fullName"
                  type="text"
                  required
                  value={adminForm.fullName}
                  onChange={(e) => setAdminForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-205 focus:border-violet-500/50 rounded-xl outline-none text-zinc-800 placeholder-zinc-400 transition-colors"
                  placeholder="e.g. Admin User"
                />
              </div>

              <div>
                <label htmlFor="admin-email" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={(e) => setAdminForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-205 focus:border-violet-500/50 rounded-xl outline-none text-zinc-800 placeholder-zinc-400 transition-colors"
                  placeholder="admin@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="admin-phone" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Phone</label>
                  <input
                    id="admin-phone"
                    type="tel"
                    required
                    value={adminForm.phone}
                    onChange={(e) => setAdminForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-205 focus:border-violet-500/50 rounded-xl outline-none text-zinc-800 placeholder-zinc-400 transition-colors"
                    placeholder="10-digit number"
                  />
                </div>
                <div>
                  <label htmlFor="admin-dept" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Department</label>
                  <input
                    id="admin-dept"
                    type="text"
                    required
                    value={adminForm.departmentStream}
                    onChange={(e) => setAdminForm((f) => ({ ...f, departmentStream: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-zinc-205 focus:border-violet-500/50 rounded-xl outline-none text-zinc-800 placeholder-zinc-400 transition-colors"
                    placeholder="Platform Administration"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-pwd" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-455" />
                  <input
                    id="admin-pwd"
                    type={showAdminPwd ? "text" : "password"}
                    required
                    value={adminForm.password}
                    onChange={(e) => setAdminForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-zinc-205 focus:border-violet-500/50 rounded-xl outline-none text-zinc-800 placeholder-zinc-400 transition-colors"
                    placeholder="Min 8 chars, uppercase + symbol + number"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPwd((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                  >
                    {showAdminPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {adminMsg && (
                <div className={`p-3 rounded-xl text-[11px] border font-medium ${
                  adminMsgType === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}>
                  {adminMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={adminCreating}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-650 hover:from-violet-650 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-violet-500/10 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                {adminCreating ? "Creating Admin..." : "Create Admin Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
