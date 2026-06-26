"use client";

import { useEffect, useState } from "react";
import {
  Megaphone,
  Plus,
  Calendar,
  AlertCircle,
  Info,
  CheckCircle,
  X,
} from "lucide-react";
import {
  getAnnouncements,
  saveAnnouncement,
  deleteAnnouncementDb,
  Announcement,
} from "@/lib/supabase/db";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newType, setNewType] = useState<"info" | "warning" | "success">("info");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");

  const fetchAnnouncements = async () => {
    try {
      const data = await getAnnouncements(false);
      setAnnouncements(data);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    // Supabase real-time updates
    if (isSupabaseConfigured() && supabase) {
      const channel = supabase
        .channel("admin-announcements-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "announcements" },
          () => {
            fetchAnnouncements();
          }
        )
        .subscribe();
      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }

    // Storage event for mock sync across tabs
    const handleStorageChange = () => {
      fetchAnnouncements();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      alert("Please fill in both title and message.");
      return;
    }
    try {
      await saveAnnouncement({
        title: newTitle.trim(),
        description: newMessage.trim(),
        type: newType,
        priority: newPriority,
        active: true,
      });
      setNewTitle("");
      setNewMessage("");
      setNewType("info");
      setNewPriority("medium");
      setShowCreateForm(false);
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to save announcement.");
    }
  };

  const toggleActive = async (id: string) => {
    const ann = announcements.find((a) => a.id === id);
    if (!ann) return;
    try {
      await saveAnnouncement({
        ...ann,
        active: !ann.active,
      });
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to update announcement.");
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteAnnouncementDb(id);
      fetchAnnouncements();
    } catch (err) {
      alert("Failed to delete announcement.");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "warning":
        return AlertCircle;
      case "success":
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-amber-500/10 text-amber-500 border-amber-200";
      case "success":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-200";
      default:
        return "bg-[#5B5FF7]/10 text-[#5B5FF7] border-[#5B5FF7]/20";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5B5FF7] border-t-transparent mx-auto" />
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-zinc-800 pb-10">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div>
          <span className="text-[#5B5FF7] text-xs font-bold uppercase tracking-wider">Communication</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">Announcements</h2>
          <p className="text-zinc-500 text-sm mt-2 font-light leading-relaxed max-w-xl">
            Create and manage platform-wide announcements visible to all students.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 bg-[#5B5FF7] hover:bg-[#4A4EE6] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md shadow-[#5B5FF7]/15 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Announcement
        </button>
      </section>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border border-zinc-150/80 rounded-[20px] p-6 shadow-xs animate-fade-in">
          <h3 className="text-sm font-bold text-zinc-900 mb-4">Create New Announcement</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-600 block mb-1.5">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Announcement title..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#5B5FF7]/20 focus:border-[#5B5FF7]/40 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-600 block mb-1.5">Message</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write the announcement message..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#5B5FF7]/20 focus:border-[#5B5FF7]/40 transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-600 block mb-1.5">Type</label>
                <div className="flex gap-3">
                  {(["info", "warning", "success"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewType(type)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer capitalize ${
                        newType === type
                          ? "bg-[#5B5FF7] text-white border-[#5B5FF7]"
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-[#5B5FF7]/30"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-600 block mb-1.5">Priority</label>
                <div className="flex gap-3">
                  {(["low", "medium", "high"] as const).map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setNewPriority(priority)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer capitalize ${
                        newPriority === priority
                          ? priority === "high"
                            ? "bg-rose-500 text-white border-rose-500"
                            : priority === "medium"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-[#5B5FF7] text-white border-[#5B5FF7]"
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-[#5B5FF7]/30"
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCreate}
                className="bg-[#5B5FF7] hover:bg-[#4A4EE6] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Publish Announcement
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-white border border-zinc-200 text-zinc-600 text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-zinc-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-20 border border-zinc-200 rounded-[20px] bg-white shadow-xs">
            <Megaphone className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
            <p className="text-sm text-zinc-800 font-bold">No announcements yet</p>
            <p className="text-xs text-zinc-500 font-medium mt-1">Create your first announcement to notify students.</p>
          </div>
        ) : (
          announcements.map((ann) => {
            const TypeIcon = getTypeIcon(ann.type);
            const typeColor = getTypeColor(ann.type);
            return (
              <div
                key={ann.id}
                className={`bg-white border border-zinc-150/80 rounded-[20px] p-6 shadow-xs hover:shadow-md transition-all duration-300 ${
                  !ann.active ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={`h-10 w-10 rounded-xl ${typeColor} flex items-center justify-center shrink-0 border`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-zinc-900 leading-snug">{ann.title}</h3>
                        <div className="flex gap-1.5">
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              ann.active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                            }`}
                          >
                            {ann.active ? "Active" : "Inactive"}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              ann.priority === "high"
                                ? "bg-rose-100 text-rose-700"
                                : ann.priority === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-750"
                            }`}
                          >
                            {ann.priority}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 font-light leading-relaxed">{ann.description}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-zinc-400 font-bold">
                        <Calendar className="h-3 w-3" />
                        {formatDate(ann.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleActive(ann.id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-slate-50 transition-all cursor-pointer text-zinc-600"
                    >
                      {ann.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="p-1.5 rounded-lg border border-zinc-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all cursor-pointer text-zinc-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
