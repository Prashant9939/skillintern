"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { getInternships, Internship } from "@/lib/supabase/db";
import { getCurrentUser, UserSession } from "@/lib/supabase/auth";
import { Search, Briefcase, Clock, Tag, ArrowUpRight, HelpCircle } from "lucide-react";
import Link from "next/link";

const getTrackTheme = (trackId: string) => {
  const cleanId = trackId.toLowerCase();
  if (cleanId.includes("web-dev") || cleanId.includes("webdev")) {
    return {
      borderClass: "border-l-emerald-550",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md shadow-emerald-600/10",
      icon: "🌐"
    };
  } else if (cleanId.includes("frontend")) {
    return {
      borderClass: "border-l-sky-500",
      badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
      btnClass: "bg-sky-600 hover:bg-sky-700 text-white shadow-sm hover:shadow-md shadow-sky-600/10",
      icon: "🎨"
    };
  } else if (cleanId.includes("python")) {
    return {
      borderClass: "border-l-indigo-500",
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
      btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md shadow-indigo-600/10",
      icon: "🐍"
    };
  } else if (cleanId.includes("data") || cleanId.includes("analytics") || cleanId.includes("datasci")) {
    return {
      borderClass: "border-l-amber-500",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow-md shadow-amber-600/10",
      icon: "📊"
    };
  } else if (cleanId.includes("ai") || cleanId.includes("ml") || cleanId.includes("artificial")) {
    return {
      borderClass: "border-l-violet-500",
      badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
      btnClass: "bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow-md shadow-violet-600/10",
      icon: "🤖"
    };
  } else if (cleanId.includes("cyber") || cleanId.includes("security")) {
    return {
      borderClass: "border-l-red-500",
      badgeClass: "bg-red-50 text-red-700 border-red-205",
      btnClass: "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md shadow-red-600/10",
      icon: "🔒"
    };
  } else if (cleanId.includes("cloud")) {
    return {
      borderClass: "border-l-cyan-500",
      badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-205",
      btnClass: "bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm hover:shadow-md shadow-cyan-600/10",
      icon: "☁️"
    };
  } else if (cleanId.includes("hr")) {
    return {
      borderClass: "border-l-pink-500",
      badgeClass: "bg-pink-50 text-pink-700 border-pink-205",
      btnClass: "bg-pink-600 hover:bg-pink-700 text-white shadow-sm hover:shadow-md shadow-pink-600/10",
      icon: "🤝"
    };
  } else {
    return {
      borderClass: "border-l-indigo-500",
      badgeClass: "bg-indigo-50 text-indigo-755 border-indigo-200",
      btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md shadow-indigo-600/10",
      icon: "📈"
    };
  }
};

export default function Internships() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function loadData() {
      try {
        const list = await getInternships();
        setInternships(list);
        const currUser = await getCurrentUser();
        setUser(currUser);
      } catch (err) {
        console.error("Failed to load internships", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = ["All", ...Array.from(new Set(internships.map((i) => i.category)))];

  const filtered = internships.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || i.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="absolute inset-0 radial-fade pointer-events-none" />

      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 pt-28 pb-16 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">Available Tracks</span>
          <h1 className="text-4xl font-extrabold text-zinc-900 mt-5 tracking-tight">
            Professional Internship Pathways
          </h1>
          <p className="mt-4 text-zinc-600 font-light">
            Select an internship track, review the checklist requirements, and attempt the assessment to gain your official certification.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-sm">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search internships..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-zinc-200 hover:border-zinc-300 focus:border-indigo-500/50 rounded-xl text-zinc-800 outline-none transition-all placeholder:text-zinc-400"
            />
          </div>

          {/* Categories Tab */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                    : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-zinc-200 rounded-3xl bg-white shadow-sm">
            <Briefcase className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
            <p className="text-zinc-600 font-semibold">No internship tracks found.</p>
            <p className="text-zinc-400 text-sm mt-1">Try resetting your search query or selecting another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const theme = getTrackTheme(item.id);
              return (
                <div 
                  key={item.id} 
                  className={`bg-white border border-zinc-200 hover:border-zinc-300 rounded-3xl p-6 flex flex-col justify-between h-full group relative overflow-hidden border-l-4 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 ${theme.borderClass}`}
                >
                  <div className="absolute right-4 top-4 text-2xl opacity-20 group-hover:opacity-40 transition-opacity">
                    {theme.icon}
                  </div>
                  <div>
                    {/* Category & Duration */}
                    <div className="flex items-center justify-between mb-4 pr-8">
                      <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${theme.badgeClass}`}>
                        <Tag className="h-3 w-3" />
                        {item.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-400 font-bold font-mono">
                        <Clock className="h-3 w-3 text-zinc-300" />
                        {item.duration}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-zinc-900 group-hover:text-indigo-650 transition-colors mb-2 tracking-tight">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-zinc-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4 font-normal font-sans">
                      {item.description}
                    </p>

                    {/* Requirements list */}
                    {item.requirements && item.requirements.length > 0 && (
                      <div className="mb-6 pt-3 border-t border-zinc-100">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-2">Checklist Requirements:</span>
                        <ul className="space-y-1.5">
                          {item.requirements.slice(0, 3).map((req, idx) => (
                            <li key={idx} className="text-xs text-zinc-500 flex items-start gap-1.5 font-normal">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                              <span className="line-clamp-1">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Card Action */}
                  <div className="mt-auto pt-4 border-t border-zinc-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>10 Questions • 40% to Pass</span>
                    </div>
                    
                    {user ? (
                      <Link
                        href="/student/dashboard"
                        className={`inline-flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${theme.btnClass}`}
                      >
                        Apply & Test
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href="/auth/register"
                        className={`inline-flex items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${theme.btnClass}`}
                      >
                        Apply & Test
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
