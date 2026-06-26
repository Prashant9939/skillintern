"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, UserSession } from "@/lib/supabase/auth";
import {
  getSupportTickets,
  updateSupportTicket,
  SupportTicket
} from "@/lib/supabase/db";
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  User,
  ChevronRight,
  RefreshCw,
  FolderOpen
} from "lucide-react";

export default function AdminSupportPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyLoading, setReplyLoading] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Selected Ticket state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState("");
  const [updateStatusVal, setUpdateStatusVal] = useState<"open" | "in_progress" | "resolved">("resolved");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadTickets = async () => {
    setLoading(true);
    try {
      const list = await getSupportTickets();
      setTickets(list);
      
      // Keep selected ticket in sync if open
      if (selectedTicket) {
        const updated = list.find((t) => t.id === selectedTicket.id);
        if (updated) {
          setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error("Error loading tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function initPage() {
      const u = await getCurrentUser();
      setUser(u);
      await loadTickets();
    }
    initPage();
  }, []);

  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setAdminReplyText(ticket.admin_reply || "");
    setUpdateStatusVal(ticket.status === "open" ? "in_progress" : ticket.status);
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!adminReplyText.trim()) {
      setErrorMsg("Please enter a reply message.");
      return;
    }

    setReplyLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await updateSupportTicket(selectedTicket.id, {
        admin_reply: adminReplyText.trim(),
        status: updateStatusVal
      });

      setSuccessMsg("Support response submitted and ticket updated!");
      
      // Reload tickets and keep this ticket selected
      const list = await getSupportTickets();
      setTickets(list);
      const updated = list.find((t) => t.id === selectedTicket.id);
      if (updated) {
        setSelectedTicket(updated);
      }
    } catch (err) {
      console.error("Failed to submit reply:", err);
      setErrorMsg("Failed to update ticket. Please try again.");
    } finally {
      setReplyLoading(false);
    }
  };

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 text-zinc-800 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6.5 w-6.5 text-indigo-500" />
            Support Inquiries Desk
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-light mt-1">
            Review technical issues, verify payment discrepancies, clarify certificate disputes, and reply to students.
          </p>
        </div>
        <button
          onClick={loadTickets}
          className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 active:scale-95 transition-all text-xs font-semibold rounded-xl cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 text-zinc-500" />
          Refresh Panel
        </button>
      </div>

      {/* Main Grid: Left side is ticket list, right side is reply panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Tickets List - 5 Columns */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Search &amp; Filters</h2>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search subject, student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl pl-9 pr-4 py-2 text-xs transition-all focus-visible:ring-indigo-500"
              />
            </div>

            {/* Filter selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl px-2.5 py-1.5 text-xs transition-all cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl px-2.5 py-1.5 text-xs transition-all cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="Technical">Technical</option>
                  <option value="Payment">Payment</option>
                  <option value="Certificate">Certificate</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ticket Listing Card */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Tickets ({filteredTickets.length})</h2>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-2" />
                <p className="text-xs text-zinc-400">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-zinc-150 rounded-xl">
                <FolderOpen className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 font-semibold">No inquiries match filters</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredTickets.map((t) => {
                  const statusColors = {
                    open: "bg-blue-50 text-blue-700 border-blue-200",
                    in_progress: "bg-amber-50 text-amber-700 border-amber-200",
                    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200"
                  };
                  const isSelected = selectedTicket?.id === t.id;

                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTicket(t)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50/40 border-indigo-350 shadow-xs ring-1 ring-indigo-400/20"
                          : "bg-white border-zinc-150 hover:bg-slate-50"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase ${statusColors[t.status]}`}>
                            {t.status.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-semibold">{t.category}</span>
                        </div>
                        <h3 className="font-bold text-xs text-zinc-800 truncate">{t.subject}</h3>
                        <p className="text-[10px] text-zinc-400 flex items-center gap-1 font-light">
                          <User className="h-3 w-3 shrink-0" />
                          {t.student_name}
                        </p>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-zinc-400 shrink-0 self-center transition-transform ${isSelected ? "translate-x-1 text-indigo-500" : ""}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Ticket Review & Reply - 7 Columns */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-6">
              
              {/* Ticket Details */}
              <div className="border-b border-zinc-100 pb-5 space-y-3">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 font-semibold">Category: <strong>{selectedTicket.category}</strong></span>
                      <span className="h-1.5 w-1.5 bg-zinc-200 rounded-full" />
                      <span className="text-xs text-zinc-400">Opened {new Date(selectedTicket.created_at).toLocaleString()}</span>
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900">{selectedTicket.subject}</h2>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase shrink-0 ${
                    selectedTicket.status === "open" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    selectedTicket.status === "in_progress" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}>
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-zinc-150 rounded-xl w-fit">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {selectedTicket.student_name?.substring(0, 1) || "S"}
                  </div>
                  <span className="text-xs font-semibold text-zinc-700">{selectedTicket.student_name}</span>
                </div>
              </div>

              {/* Student Issue Description */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Student Description</h3>
                <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-2xl">
                  <p className="text-sm text-zinc-750 whitespace-pre-line leading-relaxed">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Admin Reply & Action Form */}
              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5 text-indigo-500" />
                  Respond to Ticket
                </h3>

                {successMsg && (
                  <div className="flex items-start gap-2.5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSendReply} className="space-y-4">
                  <div>
                    <label htmlFor="replyText" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Response Message</label>
                    <textarea
                      id="replyText"
                      required
                      rows={5}
                      placeholder="Type your official platform response here. Provide answers, request attachments, or confirm verification status updates."
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl px-4 py-2.5 text-sm transition-all focus-visible:ring-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <label htmlFor="updateStatus" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Update status to:</label>
                      <select
                        id="updateStatus"
                        value={updateStatusVal}
                        onChange={(e) => setUpdateStatusVal(e.target.value as any)}
                        className="bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl px-2.5 py-1.5 text-xs transition-all cursor-pointer font-bold"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={replyLoading}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer shrink-0"
                    >
                      {replyLoading ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Submitting Reply...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Submit Response
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center shadow-xs flex flex-col justify-center items-center h-full min-h-[350px]">
              <MessageSquare className="h-16 w-16 text-zinc-250 mb-4" />
              <h2 className="text-zinc-650 font-bold text-sm">No ticket selected</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">Select a support ticket from the list panel to review details, update status, and draft reply messages.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
