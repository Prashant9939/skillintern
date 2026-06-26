/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, UserSession } from "@/lib/supabase/auth";
import { getInternships, getTestResults, getPaidInternshipIds, getStudentPayments, getPlatformSettings, PlatformSettings, Internship, TestResult, Payment } from "@/lib/supabase/db";
import { 
  Briefcase, 
  Clock, 
  Award, 
  AlertCircle, 
  CheckCircle, 
  Play, 
  Search, 
  HelpCircle, 
  XCircle, 
  X,
  ChevronRight,
  BookOpen,
  CreditCard,
  Lock
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";

export default function AvailableInternships() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [paidTracks, setPaidTracks] = useState<string[]>([]);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptHtml, setReceiptHtml] = useState("");
  const [settings, setSettings] = useState<PlatformSettings>({ assessment_fee: 150, payments_enabled: true });

  // Modal State
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);

  useEffect(() => {
    async function loadInternshipsData() {
      try {
        const u = await getCurrentUser();
        setUser(u);
        const [ints, stg] = await Promise.all([
          getInternships(),
          getPlatformSettings()
        ]);
        setInternships(ints);
        setSettings(stg);
        if (u) {
          const [res, paidIds, pays] = await Promise.all([
            getTestResults(u.id),
            getPaidInternshipIds(u.id),
            getStudentPayments(u.id)
          ]);
          setResults(res);
          setPaidTracks(paidIds);
          setPayments(pays);
        }
      } catch (err) {
        console.error("Error loading internships route data", err);
      } finally {
        setLoading(false);
      }
    }
    loadInternshipsData();
  }, []);

  const handlePrintReceipt = (pay: Payment, internshipTitle: string) => {
    const formattedDate = pay.created_at ? new Date(pay.created_at).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }) : new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const receiptNo = pay.razorpay_order_id ? `REC-${pay.razorpay_order_id.replace("order_", "")}` : `REC-MOCK-${Math.floor(Math.random() * 1000000)}`;

    const htmlTpl = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Payment Receipt</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; background-color: #f9f9f9; margin: 0; }
    .invoice-box { max-width: 800px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .header-table td { vertical-align: top; }
    .company-details { text-align: right; font-size: 13px; color: #64748b; line-height: 1.5; }
    .company-name { font-size: 20px; font-weight: bold; color: #4f46e5; margin-bottom: 5px; }
    .invoice-title { font-size: 28px; font-weight: 850; color: #1e293b; text-transform: uppercase; letter-spacing: -0.5px; }
    .meta-details { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
    .meta-details td { padding: 10px; border: 1px solid #f1f5f9; }
    .meta-details td.label { font-weight: bold; background: #f8fafc; color: #475569; width: 150px; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
    .items-table th { background: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: left; padding: 12px; font-weight: bold; color: #475569; }
    .items-table td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; }
    .items-table tr.total-row td { font-weight: bold; background: #faf5ff; border-top: 2px solid #ddd6fe; color: #4f46e5; }
    .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    .print-btn { display: block; margin: 30px auto 0 auto; padding: 12px 24px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; transition: all 0.2s; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.15); }
    .print-btn:hover { background: #4338ca; transform: translateY(-1px); }
    @media print { .print-btn { display: none; } body { padding: 0; background: none; } .invoice-box { border: none; box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="invoice-box">
    <table class="header-table">
      <tr>
        <td>
          <div class="invoice-title">Payment Receipt</div>
          <div style="font-size: 13px; color: #64748b; margin-top: 5px;">Receipt ID: ${receiptNo}</div>
        </td>
        <td class="company-details">
          <div class="company-name">IQ Intern</div>
          <div>IQ Intern Vocational Training Pvt. Ltd.</div>
          <div>Optimark Tech Hub, Sector 62, Noida, UP</div>
          <div>Email: billing@iqintern.com</div>
          <div>GSTIN: 09AAECS8274M1Z5 (Mock)</div>
        </td>
      </tr>
    </table>

    <table class="meta-details">
      <tr>
        <td class="label">Candidate Name</td>
        <td>${user?.full_name || "N/A"}</td>
        <td class="label">Date</td>
        <td>${formattedDate}</td>
      </tr>
      <tr>
        <td class="label">Email</td>
        <td>${user?.email || "N/A"}</td>
        <td class="label">Phone</td>
        <td>${user?.phone_number || "N/A"}</td>
      </tr>
      <tr>
        <td class="label">Razorpay Order</td>
        <td>${pay.razorpay_order_id || "N/A"}</td>
        <td class="label">Razorpay Payment</td>
        <td>${pay.razorpay_payment_id || "N/A"}</td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center; width: 60px;">Qty</th>
          <th style="text-align: right; width: 100px;">Rate</th>
          <th style="text-align: right; width: 100px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>IQ Intern Internship Evaluation Assessment Fee</strong><br />
            <span style="font-size: 11px; color: #64748b;">Track: ${internshipTitle}</span>
          </td>
          <td style="text-align: center;">1</td>
          <td style="text-align: right;">₹${(pay.amount / 100).toFixed(2)}</td>
          <td style="text-align: right;">₹${(pay.amount / 100).toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3" style="text-align: right;">Total Amount Paid:</td>
          <td style="text-align: right;">₹${(pay.amount / 100).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <p>This is a computer-generated transaction receipt verified under the Razorpay Payment Gateway API.</p>
      <p style="margin-top: 5px; font-weight: 500; color: #4f46e5;">Thank you for using IQ Intern vocational evaluation services!</p>
    </div>

    <button class="print-btn" onclick="window.print()">Print Receipt</button>
  </div>
</body>
</html>
    `;

    setReceiptHtml(htmlTpl);
    setShowReceiptModal(true);
  };

  const handlePayAndStart = async (track: Internship) => {
    if (!user) return;
    setPayingId(track.id);
    try {
      // 1. Create order on the backend
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internshipId: track.id,
          studentId: user.id
        }),
      });

      const orderData = await res.json();

      if (!res.ok || orderData.error) {
        throw new Error(orderData.error || "Failed to initiate payment. Please try again.");
      }

      // 2. Open Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SvZr486cWgXNIQ",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "IQ Intern",
        description: `Assessment Fee for ${track.title}`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            // 3. Verify payment signature on the backend
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              const completedPayment: Payment = {
                id: `pay-${Math.random().toString(36).substr(2, 9)}`,
                student_id: user.id,
                internship_id: track.id,
                amount: settings.assessment_fee * 100,
                status: "completed",
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                created_at: new Date().toISOString(),
              };

              // Always write to client local storage mock as a mirror/fallback
              if (typeof window !== "undefined") {
                const mockPayments = JSON.parse(localStorage.getItem("mock_payments") || "[]");
                if (!mockPayments.some((p: any) => p.razorpay_order_id === response.razorpay_order_id)) {
                  mockPayments.push(completedPayment);
                  localStorage.setItem("mock_payments", JSON.stringify(mockPayments));
                }
              }

              // Update state
              setPaidTracks((prev) => [...prev, track.id]);
              setPayments((prev) => [completedPayment, ...prev]);
              alert("Payment successful! Assessment unlocked.");
            } else {
              alert(verifyData.error || "Payment verification failed.");
            }
          } catch (verifyError: any) {
            console.error("Verification error:", verifyError);
            alert("Error verifying payment signature. Please contact support.");
          } finally {
            setPayingId(null);
          }
        },
        prefill: {
          name: user.full_name,
          email: user.email,
          contact: user.phone_number || "",
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function () {
            setPayingId(null);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed: " + response.error.description);
        setPayingId(null);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Payment setup error:", err);
      alert(err.message || "Failed to load payment portal.");
      setPayingId(null);
    }
  };

  const handleSelectInternship = async (internshipId: string) => {
    if (!user) return;
    const confirmLock = window.confirm(`Are you sure you want to lock your payment to this internship? You will not be able to change this later.`);
    if (!confirmLock) return;

    setPayingId(internshipId);
    try {
      const res = await fetch("/api/select-internship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internshipId, studentId: user.id })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to select internship.");
      }

      setPaidTracks(prev => {
        const newTracks = prev.filter(t => t !== "general_credit_unused");
        return [...newTracks, internshipId];
      });

      setPayments(prev => {
        const updated = prev.map(p => {
          if (p.internship_id === "general_credit_unused") {
            return { ...p, internship_id: internshipId };
          }
          return p;
        });
        if (typeof window !== "undefined") {
          localStorage.setItem("mock_payments", JSON.stringify(updated));
        }
        return updated;
      });

      alert("Internship locked successfully! We've also sent you a confirmation email. You can now start the assessment.");
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setPayingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  // Get unique categories for filtering
  const categories = ["All", ...Array.from(new Set(internships.map((i) => i.category)))];

  // Filtering Logic
  const filteredInternships = internships.filter((track) => {
    const matchesSearch = 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.category.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === "All" || track.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 relative z-10 animate-fade-in pb-16 text-zinc-800 bg-white">
      
      {/* Banner */}
      <div className="glass-panel bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200/50 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md hover:shadow-lg hover:border-indigo-300 transition-all duration-300">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-200/10 to-violet-200/10 blur-2xl pointer-events-none" />
        <div className="space-y-1.5">
          <span className="text-indigo-650 text-xs font-extrabold uppercase tracking-wider block">Career Paths</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">Available Internships</h1>
          <p className="text-zinc-700 text-xs sm:text-sm font-semibold leading-relaxed max-w-xl">
            Choose an internship track, review the requirements, and pass the assessment to unlock your official Offer Letter, Project Report, and Certificate.
          </p>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-[color,background-color,border-color,box-shadow] duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white border-transparent shadow-md shadow-indigo-550/15"
                  : "bg-white border-zinc-200 text-zinc-600 hover:bg-indigo-50/60 hover:text-indigo-600 hover:border-indigo-150"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tracks, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-zinc-205 focus:border-indigo-500 rounded-xl outline-none text-zinc-800 transition-colors animate-fade-in"
          />
        </div>
      </div>

      {/* Internships Grid */}
      {filteredInternships.length === 0 ? (
        <div className="text-center py-20 border border-zinc-200 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all duration-300">
          <Briefcase className="h-10 w-10 mx-auto text-zinc-400 mb-3" />
          <p className="text-sm text-zinc-700 font-bold">No internship tracks match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInternships.map((track) => {
            // Check status of this track
            const trackResults = results.filter((r) => r.internship_id === track.id);
            const passed = trackResults.some((r) => r.passed);
            const latestAttempt = trackResults[0];

            return (
              <div 
                key={track.id}
                className={`glass-card bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden border-l-4 hover:shadow-lg hover:border-zinc-350 hover:scale-[1.005] ${
                  passed 
                    ? "border-l-emerald-500 hover:border-l-emerald-600" 
                    : latestAttempt 
                      ? "border-l-red-500 hover:border-l-red-600" 
                      : "border-l-indigo-500 hover:border-l-indigo-600"
                }`}
              >
                {/* Visual Status Indicator Glow */}
                {passed && (
                  <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-emerald-500/5 blur-lg pointer-events-none" />
                )}

                <div className="space-y-4">
                  {/* Category & Status */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-bold text-indigo-650 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      {track.category}
                    </span>
                    
                    {passed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[10px] font-bold text-emerald-700 font-mono">
                        Passed
                      </span>
                    ) : latestAttempt ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-250 px-3 py-1 text-[10px] font-bold text-red-650 font-mono">
                        Failed ({latestAttempt.percentage}%)
                      </span>
                    ) : null}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 group-hover:text-indigo-650 transition-colors tracking-tight">
                      {track.title}
                    </h3>
                    <p className="text-zinc-700 text-xs mt-2 leading-relaxed font-semibold font-sans">
                      {track.description}
                    </p>
                  </div>

                  {/* Track Duration Details */}
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-650 bg-indigo-50 border border-indigo-150 p-2.5 rounded-xl w-fit">
                    <Clock className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Duration: <span className="text-zinc-900 font-extrabold">{track.duration || "3 Months"}</span></span>
                  </div>

                  {/* Requirements List */}
                  {track.requirements && track.requirements.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-zinc-150">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">Requirements:</span>
                      <ul className="grid grid-cols-1 gap-1.5">
                        {track.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[11px] text-zinc-800 leading-relaxed font-semibold font-sans">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-350 mt-1.5 shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-6 mt-6 border-t border-zinc-150 flex items-center justify-between gap-4">
                  {passed ? (
                    <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" />
                      Certificates Unlocked
                    </div>
                  ) : (
                    <div className="text-[10px] text-zinc-700 font-bold">
                      Requires passing threshold of 40%
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedInternship(track)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
                      passed
                        ? "bg-white border border-zinc-200 text-zinc-700 hover:bg-slate-50 hover:border-zinc-300"
                        : "bg-indigo-600 text-white hover:bg-indigo-750 shadow-md shadow-indigo-650/10"
                    }`}
                  >
                    <Play className="h-3.5 w-3.5" />
                    {passed ? "Retake Assessment" : "Take Assessment"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* GUIDELINES RULES MODAL */}
      {selectedInternship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

            <div className="flex items-start gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-indigo-650 font-bold uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-150">{selectedInternship.category}</span>
                <h3 className="text-xl font-bold text-zinc-900 mt-2">{selectedInternship.title}</h3>
                <p className="text-xs text-zinc-700 font-semibold mt-1">Assessment Code Guidelines & Testing Rules</p>
              </div>
            </div>

            {/* Rules list */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-zinc-200/80 text-xs sm:text-sm text-zinc-700 leading-relaxed mb-6 font-semibold">
              <div className="flex gap-2 items-start">
                <Clock className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Duration:</strong> You have exactly <strong>5 minutes</strong> to solve the multiple-choice questions.</span>
              </div>
              <div className="flex gap-2 items-start">
                <Award className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Evaluation:</strong> Passing threshold is <strong>40%</strong>.</span>
              </div>
              <div className="flex gap-2 items-start">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Anti-Cheating:</strong> Do NOT switch tabs or minimize the test screen. Tab changes will be monitored.</span>
              </div>
              <div className="flex gap-2 items-start">
                <CheckCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Submission:</strong> Leaving the screen or timer completion will trigger auto-submission instantly.</span>
              </div>
            </div>

            {(() => {
              const payObj = payments.find((p) => p.internship_id === selectedInternship.id && p.status === "completed");
              let isEligible = true;
              let remainingDays = 0;
              if (payObj) {
                const payDate = new Date(payObj.created_at);
                const diffTime = Date.now() - payDate.getTime();
                const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                if (daysPassed < 28) {
                  isEligible = false;
                  remainingDays = 28 - daysPassed;
                }
              }
              const hasPaid = !settings.payments_enabled || paidTracks.includes(selectedInternship.id);
              const hasUnusedCredit = paidTracks.includes("general_credit_unused");

              return (
                <>
                  {!isEligible && (
                    <div className="w-full flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-250 rounded-2xl text-xs text-amber-800 font-bold mb-4 animate-pulse">
                      <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Internship lock active: You will be eligible to take this assessment in <strong>{remainingDays} days</strong> (Minimum duration: 28 days from enrollment date).</span>
                    </div>
                  )}

                  <div className="flex gap-3 justify-end items-center flex-wrap w-full">
                    <button
                      onClick={() => setSelectedInternship(null)}
                      className="rounded-xl border border-zinc-200 bg-white hover:bg-slate-100 active:scale-95 px-5 py-2.5 text-xs font-bold text-zinc-700 hover:text-zinc-900 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    {(hasPaid || !settings.payments_enabled) ? (
                      <>
                        {hasPaid && (
                          <button
                            type="button"
                            onClick={() => {
                              const pObj = payments.find((p) => p.internship_id === selectedInternship.id && p.status === "completed");
                              if (pObj) {
                                handlePrintReceipt(pObj, selectedInternship.title);
                              } else {
                                alert("Receipt details not found for this transaction.");
                              }
                            }}
                            className="rounded-xl border border-zinc-200 bg-white hover:bg-indigo-50/70 active:scale-95 px-5 py-2.5 text-xs font-bold text-zinc-700 hover:text-indigo-700 transition-all cursor-pointer flex items-center gap-1.5 font-sans"
                          >
                            <CreditCard className="h-3.5 w-3.5 text-indigo-555" />
                            Print Receipt
                          </button>
                        )}
                        {isEligible ? (
                          <Link
                            href={`/student/test/${selectedInternship.id}`}
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-755 text-white active:scale-95 px-6 py-2.5 text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/10"
                          >
                            Start Assessment
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="rounded-xl bg-slate-100 border border-zinc-200 text-zinc-500 px-6 py-2.5 text-xs font-bold transition-all text-center cursor-not-allowed flex items-center justify-center gap-1.5"
                          >
                            Locked: {remainingDays} days left
                            <Clock className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    ) : hasUnusedCredit ? (
                      <button
                        onClick={() => handleSelectInternship(selectedInternship.id)}
                        disabled={payingId !== null}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 px-6 py-2.5 text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                      >
                        {payingId === selectedInternship.id ? "Processing..." : "Lock & Unlock Internship"}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePayAndStart(selectedInternship)}
                        disabled={payingId !== null}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 px-6 py-2.5 text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                      >
                        {payingId === selectedInternship.id ? "Processing..." : `Pay ₹${settings.assessment_fee} & Start`}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl bg-white border border-zinc-250/80 rounded-3xl p-6 relative overflow-hidden shadow-2xl max-h-[90vh] flex flex-col text-zinc-800">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-405 hover:text-zinc-750 bg-white cursor-pointer hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold mb-4 px-2">Payment Receipt Preview</h3>
            <div className="flex-grow overflow-y-auto px-2 pb-4">
              <iframe
                srcDoc={receiptHtml}
                className="w-full h-[60vh] border border-zinc-200 rounded-2xl bg-white shadow-inner"
                title="Receipt Preview"
              />
            </div>
          </div>
        </div>
      )}

      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

    </div>
  );
}
