/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { 
  getInternships, 
  getTestResults, 
  getStudentProfiles,
  getAllProfiles,
  seedDatabase,
  getPlatformSettings,
  savePlatformSettings
} from "@/lib/supabase/db";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { 
  Users, 
  Briefcase, 
  Award, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  BarChart2
} from "lucide-react";
import dynamic from "next/dynamic";

const AnalyticsCharts = dynamic(() => import("@/components/AnalyticsCharts"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Registration Trend Skeleton */}
      <div className="glass-panel bg-white border border-zinc-200/80 rounded-3xl p-6 flex flex-col h-[350px] shadow-sm">
        <h3 className="text-sm font-bold text-zinc-800 mb-6 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
          Registration Trend (Monthly Growth)
        </h3>
        <div className="flex-grow w-full bg-zinc-50 animate-pulse rounded-2xl border border-zinc-200" />
      </div>

      {/* Certifications distribution skeleton */}
      <div className="glass-panel bg-white border border-zinc-200/80 rounded-3xl p-6 flex flex-col h-[350px] shadow-sm">
        <h3 className="text-sm font-bold text-zinc-800 mb-6 flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-indigo-600" />
          Pass vs Fail Ratios By Track
        </h3>
        <div className="flex-grow w-full bg-zinc-50 animate-pulse rounded-2xl border border-zinc-200" />
      </div>
    </div>
  )
});

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInternships: 0,
    totalAttempts: 0,
    passRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const [seedStatus, setSeedStatus] = useState<"success" | "error" | "">("");
  const [dbEmpty, setDbEmpty] = useState(false);

  const [settings, setSettings] = useState({
    assessment_fee: 150,
    payments_enabled: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg("");
    try {
      await savePlatformSettings(settings);
      setSettingsMsg("Settings updated successfully!");
      setTimeout(() => setSettingsMsg(""), 3000);
    } catch (err: any) {
      setSettingsMsg(err.message || "Failed to update settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg("");
    setSeedStatus("");
    try {
      const res = await seedDatabase();
      if (res.success) {
        setSeedStatus("success");
        setSeedMsg(res.message);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setSeedStatus("error");
        setSeedMsg(res.message);
      }
    } catch (err: any) {
      setSeedStatus("error");
      setSeedMsg(err.message || "Seeding failed.");
    } finally {
      setSeeding(false);
    }
  };

  // Mock charts data
  const registrationTrend = [
    { name: "Jan", Students: 40 },
    { name: "Feb", Students: 65 },
    { name: "Mar", Students: 98 },
    { name: "Apr", Students: 120 },
    { name: "May", Students: 185 },
  ];

  const certificationDistribution = [
    { name: "Frontend React", Pass: 42, Fail: 18 },
    { name: "Backend Node", Pass: 28, Fail: 22 },
    { name: "UI/UX Product", Pass: 35, Fail: 10 },
  ];

  useEffect(() => {
    setMounted(true);
    async function loadStats() {
      try {
        const [allUsers, students, internships, results, platformSettings] = await Promise.all([
          getAllProfiles(),
          getStudentProfiles(),
          getInternships(),
          getTestResults(),
          getPlatformSettings(),
        ]);

        const passCount = results.filter((r) => r.passed).length;
        const rate = results.length > 0 ? Math.round((passCount / results.length) * 100) : 0;

        const supabaseActive = isSupabaseConfigured();
        if (supabaseActive && internships.length === 0) {
          setDbEmpty(true);
        }

        // Student count: prefer student-only list; fall back to allUsers minus admins
        const studentCount =
          students.length > 0
            ? students.length
            : allUsers.filter((u: any) => u.role === "student").length;

        setStats({
          totalStudents: studentCount,
          totalInternships: internships.length,
          totalAttempts: results.length,
          passRate: rate,
        });
        if (platformSettings) {
          setSettings(platformSettings);
        }
      } catch (err) {
        console.error("Error loading admin stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { label: "Total Registrations", value: stats.totalStudents, icon: Users, color: "text-indigo-600 bg-indigo-50 border-indigo-150" },
    { label: "Internships Listed", value: stats.totalInternships, icon: Briefcase, color: "text-violet-600 bg-violet-50 border-violet-150" },
    { label: "Total Test Attempts", value: stats.totalAttempts, icon: BarChart2, color: "text-emerald-600 bg-emerald-50 border-emerald-150" },
    { label: "Global Pass Rate", value: `${stats.passRate}%`, icon: CheckCircle, color: "text-amber-600 bg-amber-50 border-amber-150" },
  ];

  return (
    <div className="space-y-8 relative z-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Platform Analytics</h1>
        <p className="text-zinc-500 text-xs sm:text-sm font-light mt-1">Live tracking database statistics and assessment performance rates.</p>
      </div>

      {/* Database Seeding/Syncing Utility */}
      <div className="p-5 rounded-2xl border border-indigo-150 bg-indigo-50/40 text-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-500/[0.03] blur-xl pointer-events-none" />
        <div>
          <h4 className="text-sm font-extrabold text-indigo-950 mb-1">Database Sync & Management</h4>
          <p className="text-xs text-zinc-550 font-light">
            Synchronize the database to ensure all 11 default internship tracks, their corresponding 110 evaluation questions, and the latest certificate document templates are loaded and up-to-date.
          </p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="shrink-0 bg-indigo-600 hover:bg-indigo-700 px-4.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-650/10 active:scale-95"
        >
          {seeding ? "Syncing..." : "Sync Database"}
        </button>
      </div>

      {seedMsg && (
        <div className={`p-4 rounded-xl text-xs border ${
          seedStatus === "success" 
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}>
          {seedMsg}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="glass-panel bg-white border border-zinc-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:border-zinc-300 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{c.label}</span>
                <div className={`p-2 rounded-xl border ${c.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
                {loading ? "..." : c.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <AnalyticsCharts 
        registrationTrend={registrationTrend} 
        certificationDistribution={certificationDistribution} 
      />

      {/* Assessment Pricing Management */}
      <div className="glass-panel bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-zinc-900 mb-2 flex items-center gap-2">
          Assessment Pricing Management
        </h3>
        <p className="text-zinc-550 text-xs font-light mb-6">
          Configure the evaluation fee paid by students and toggle payment gateway functionality.
        </p>

        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Assessment Fee (INR)
              </label>
              <input
                type="number"
                min="0"
                value={settings.assessment_fee}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    assessment_fee: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-4 py-3 text-sm bg-white border border-zinc-200 focus:border-indigo-500/50 rounded-xl outline-none text-zinc-800 transition-colors font-semibold"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Payment Collection Status
              </label>
              <div className="flex items-center gap-3 h-[46px]">
                <input
                  type="checkbox"
                  id="payments_enabled"
                  checked={settings.payments_enabled}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      payments_enabled: e.target.checked,
                    }))
                  }
                  className="h-4.5 w-4.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label
                  htmlFor="payments_enabled"
                  className="text-xs font-bold text-zinc-700 cursor-pointer select-none"
                >
                  {settings.payments_enabled
                    ? "Payments Enabled (Active)"
                    : "Payments Disabled (Skip)"}
                </label>
              </div>
            </div>
          </div>

          {settingsMsg && (
            <div className="p-3.5 rounded-xl text-xs bg-indigo-50 border border-indigo-150 text-indigo-700 font-medium">
              {settingsMsg}
            </div>
          )}

          <div className="flex justify-start">
            <button
              type="submit"
              disabled={savingSettings}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-sm shadow-indigo-650/10 active:scale-95"
            >
              {savingSettings ? "Saving Settings..." : "Save Platform Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
