"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, UserSession } from "@/lib/supabase/auth";
import {
  getSupportTickets,
  createSupportTicket,
  SupportTicket
} from "@/lib/supabase/db";
import {
  HelpCircle,
  Mail,
  Phone,
  Clock,
  Send,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle,
  FileText,
  CreditCard,
  Settings
} from "lucide-react";

// Categorized FAQs for EdTech Platform
const FAQS = [
  {
    category: "Technical & Portal Support",
    icon: Settings,
    questions: [
      {
        q: "The portal runs slowly or isn't loading assessments. What should I do?",
        a: "Ensure you are using a modern browser (Chrome or Firefox are recommended). Clear your browser cache and cookies, or try loading in an Incognito window. Make sure your internet connection is stable."
      },
      {
        q: "Can I take the assessment on my mobile device?",
        a: "While the dashboard is mobile responsive, coding exercises and technical assessments require a desktop/laptop for a stable development environment and screen space."
      }
    ]
  },
  {
    category: "Payments & Invoices",
    icon: CreditCard,
    questions: [
      {
        q: "My payment went through, but my track is still locked.",
        a: "Payments are usually credited instantly. If your track remains locked, check the 'Documents' page to see if your payment was successfully registered. If not, please open a support ticket with your transaction ID."
      },
      {
        q: "How can I request a refund for a payment?",
        a: "Refund requests are processed according to our Refund Policy. Open a support ticket under the 'Payment' category within 7 days of purchase, attaching your receipt."
      }
    ]
  },
  {
    category: "Certificate & Reports",
    icon: FileText,
    questions: [
      {
        q: "When will I receive my internship completion certificate?",
        a: "Certificates are automatically generated upon scoring a passing grade on all mandatory track assessments. You can verify and print your certificates immediately from the 'Certificates' tab."
      },
      {
        q: "My name on the certificate is spelled incorrectly. How can I fix it?",
        a: "The certificate uses the full name specified in your profile. Go to the 'Settings' tab to update your profile name, and your certificates will automatically regenerate with the updated spelling."
      }
    ]
  }
];

export default function HelpSupportPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form states
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Technical");
  const [description, setDescription] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // FAQ state
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserAndTickets() {
      try {
        const u = await getCurrentUser();
        setUser(u);
        if (u) {
          const list = await getSupportTickets(u.id);
          setTickets(list);
        }
      } catch (err) {
        console.error("Error loading help & support details", err);
      } finally {
        setLoading(false);
      }
    }
    loadUserAndTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!subject.trim() || !description.trim()) {
      setErrorMsg("Please fill out all fields.");
      return;
    }

    setSubmitLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await createSupportTicket({
        student_id: user.id,
        subject: subject.trim(),
        description: description.trim(),
        category
      });
      setSuccessMsg("Support ticket created successfully! Our team will reply shortly.");
      setSubject("");
      setDescription("");
      setCategory("Technical");
      
      // Refresh tickets list
      const list = await getSupportTickets(user.id);
      setTickets(list);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to create ticket. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleFaq = (catIdx: number, qIdx: number) => {
    const idx = `${catIdx}-${qIdx}`;
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  // Filter FAQs based on search
  const filteredFaqs = FAQS.map((cat, catIdx) => {
    const questions = cat.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
        q.a.toLowerCase().includes(faqSearch.toLowerCase())
    );
    return { ...cat, questions, catIdx };
  }).filter((cat) => cat.questions.length > 0);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto mb-3" />
          <p className="text-zinc-500 text-sm font-medium">Loading Support Desk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-zinc-800">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2.5">
          <HelpCircle className="h-7 w-7 text-indigo-500" />
          Help &amp; Support Center
        </h1>
        <p className="text-zinc-500 text-sm mt-1 max-w-2xl font-normal">
          Get fast support, search frequently asked questions, create new help tickets, or view the statuses of past inquiries.
        </p>
      </div>

      {/* Grid of Contact Info & Ticket Creation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Contact & SLA Info */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-50/50 blur-2xl pointer-events-none" />
            <h2 className="text-base font-bold text-zinc-900 mb-4">Direct Contact</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email Support</p>
                  <a href="mailto:support@iqintern.com" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-0.5">
                    support@iqintern.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">WhatsApp Support</p>
                  <p className="text-sm font-bold text-zinc-800">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Support Hours</p>
                  <p className="text-sm font-bold text-zinc-800">Monday — Saturday</p>
                  <p className="text-xs text-zinc-500">10:00 AM — 6:00 PM IST</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-100">
              <h3 className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider mb-2">Our Response SLA</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                We review support tickets sequentially. Standard response time is less than <strong className="font-semibold text-zinc-700">24 business hours</strong>. Payment disputes are prioritized.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Creation Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-zinc-900 mb-1 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              Create a Support Ticket
            </h2>
            <p className="text-xs text-zinc-400 mb-6">Describe your issue in detail, and a platform support agent will assist you shortly.</p>

            {successMsg && (
              <div className="mb-6 flex items-start gap-2.5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 flex items-start gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="subject" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Ticket Subject</label>
                  <input
                    id="subject"
                    type="text"
                    required
                    placeholder="e.g. Certificate name error / Payment pending"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl px-4 py-2.5 text-sm transition-all focus-visible:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl px-4 py-2.5 text-sm transition-all focus-visible:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Payment">Payment</option>
                    <option value="Certificate">Certificate</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Issue Description</label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  placeholder="Describe your issue here. Please include transaction IDs or test assessment details if applicable."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl px-4 py-2.5 text-sm transition-all focus-visible:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                >
                  {submitLoading ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating Ticket...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Create Support Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Ticket History Section */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-zinc-900 mb-1">Your Support Tickets</h2>
        <p className="text-xs text-zinc-400 mb-6">Track and view resolutions for all tickets submitted by you.</p>

        {tickets.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-zinc-200 rounded-xl">
            <MessageSquare className="h-10 w-10 text-zinc-350 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm font-bold">No support tickets created yet</p>
            <p className="text-xs text-zinc-400 mt-1">Submit the form above to log a support request.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((t) => {
              const statusColors = {
                open: "bg-blue-50 text-blue-700 border-blue-200",
                in_progress: "bg-amber-50 text-amber-700 border-amber-200",
                resolved: "bg-emerald-50 text-emerald-700 border-emerald-200"
              };
              const statusLabels = {
                open: "Open",
                in_progress: "In Progress",
                resolved: "Resolved"
              };

              return (
                <div key={t.id} className="border border-zinc-150 rounded-xl overflow-hidden shadow-xs hover:border-zinc-200 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-zinc-50/50 gap-2 border-b border-zinc-100">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-sm text-zinc-800">{t.subject}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${statusColors[t.status] || "bg-zinc-100 text-zinc-700"}`}>
                          {statusLabels[t.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-400 mt-1 flex-wrap">
                        <span>Category: <strong className="text-zinc-500 font-semibold">{t.category}</strong></span>
                        <span>Opened on {new Date(t.created_at).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Your Issue</p>
                      <p className="text-sm text-zinc-655 whitespace-pre-line leading-relaxed">{t.description}</p>
                    </div>

                    {t.admin_reply && (
                      <div className="p-3.5 bg-indigo-50/30 border border-indigo-100/50 rounded-xl space-y-1.5">
                        <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />
                          Support Response
                        </p>
                        <p className="text-sm text-zinc-700 whitespace-pre-line leading-relaxed font-normal">{t.admin_reply}</p>
                        <p className="text-[10px] text-zinc-400 text-right mt-1.5">Replied on {new Date(t.updated_at).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAQ Accordion Section */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Frequently Asked Questions</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Quickly resolve common queries using our documentation.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none rounded-xl pl-9 pr-4 py-2 text-sm transition-all focus-visible:ring-indigo-500"
            />
          </div>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm">No FAQ entries match your search query.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredFaqs.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.category} className="space-y-3">
                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    {cat.category}
                  </h3>
                  
                  <div className="space-y-2">
                    {cat.questions.map((faq, qIdx) => {
                      const faqId = `${cat.catIdx}-${qIdx}`;
                      const isOpen = openFaqIndex === faqId;
                      return (
                        <div key={faq.q} className="border border-zinc-100 rounded-xl overflow-hidden bg-white">
                          <button
                            onClick={() => toggleFaq(cat.catIdx, qIdx)}
                            className="w-full flex items-center justify-between p-4 bg-zinc-50/20 text-left hover:bg-slate-50 transition-colors focus:outline-none focus-visible:bg-slate-50 cursor-pointer"
                          >
                            <span className="text-sm font-semibold text-zinc-800 pr-4">{faq.q}</span>
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="p-4 border-t border-zinc-100 bg-white animate-fade-in">
                              <p className="text-sm text-zinc-500 leading-relaxed font-light">{faq.a}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
