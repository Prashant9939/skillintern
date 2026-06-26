/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, UserSession } from "@/lib/supabase/auth";
import {
  getInternships,
  getTestResults,
  getStudentProfile,
  getDocumentTemplates,
  getStudentPayments,
  Internship,
  TestResult,
  DocumentTemplate,
  Payment
} from "@/lib/supabase/db";
import {
  FileText,
  BookOpen,
  MessageSquare,
  Calendar,
  FolderOpen,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

function renderDocument(templateHtml: string, profile: any, internshipTitle: string, result: TestResult, templateCode: string, payments: Payment[]) {
  if (!templateHtml) return "";

  const pct = result?.percentage || 0;
  let grade = "F";
  if (pct >= 90) grade = "A+";
  else if (pct >= 80) grade = "A";
  else if (pct >= 70) grade = "B+";
  else if (pct >= 60) grade = "B";
  else if (pct >= 50) grade = "C";
  else if (pct >= 40) grade = "D";

  const scoreFormatted = `${pct}%`;
  const verificationId = result?.reference_number || "SI-MOCK-ID";

  const payment = payments.find(
    (p) => p.internship_id === result?.internship_id && p.status === "completed"
  );

  let joiningDate = new Date();
  if (payment) {
    joiningDate = new Date(payment.created_at);
  } else if (result?.completed_at) {
    joiningDate = new Date(result.completed_at);
    joiningDate.setDate(joiningDate.getDate() - 28);
  } else {
    joiningDate.setDate(joiningDate.getDate() - 28);
  }

  const completionDate = new Date(joiningDate.getTime() + 28 * 24 * 60 * 60 * 1000);

  const formattedJoiningDate = joiningDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  const formattedCompletionDate = completionDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

  const values: Record<string, string> = {
    "{{STUDENT_NAME}}": profile?.full_name || "",
    "{{NAME}}": profile?.full_name || "",
    "{{ROLL_NUMBER}}": profile?.roll_number || "N/A",
    "{{roll_number}}": profile?.roll_number || "N/A",
    "{{COLLEGE_NAME}}": profile?.college_name || "N/A",
    "{{DEPARTMENT}}": profile?.department_stream || "N/A",
    "{{SEMESTER}}": profile?.semester || "N/A",
    "{{COURSE}}": profile?.department_stream || "N/A",
    "{{INTERNSHIP_TITLE}}": internshipTitle || "",
    "{{SCORE}}": scoreFormatted,
    "{{GRADE}}": grade,
    "{{COMPLETION_DATE}}": templateCode === "offer_letter" ? formattedJoiningDate : formattedCompletionDate,
    "{{JOINING_DATE}}": formattedJoiningDate,
    "{{VERIFICATION_ID}}": verificationId,
    "{{DURATION}}": "120 Hrs"
  };

  let output = templateHtml;
  for (const [placeholder, val] of Object.entries(values)) {
    const regex = new RegExp(placeholder, "g");
    output = output.replace(regex, val);
  }
  return output;
}

export default function DocumentsPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeTemplateCode, setActiveTemplateCode] = useState<string>("");
  const [activeInternshipId, setActiveInternshipId] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      try {
        const u = await getCurrentUser();
        setUser(u);
        if (u) {
          const [ints, res, prof, tpls, pays] = await Promise.all([
            getInternships(),
            getTestResults(u.id),
            getStudentProfile(u.id),
            getDocumentTemplates(),
            getStudentPayments(u.id)
          ]);
          setInternships(ints);
          setResults(res);
          setProfile(prof);
          setTemplates(tpls);
          setPayments(pays);
        }
      } catch (err) {
        console.error("Error loading documents data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleGetDashboardDocument = (title: string) => {
    const titleToCodeMap: Record<string, string> = {
      "Consent Form": "consent_form",
      "Daily Log Book": "daily_log_book",
      "Feedback Form": "feedback_form",
      "Attendance Sheet": "attendance_sheet",
    };

    const code = titleToCodeMap[title];
    if (!code) {
      alert("Invalid document title.");
      return;
    }

    const activeIds = Array.from(new Set([...payments.map(p => p.internship_id), ...results.map(r => r.internship_id)]));
    const firstActiveTrack = activeIds.length > 0 ? internships.find(i => i.id === activeIds[0]) : null;
    const activeTrackTitle = firstActiveTrack?.title || "Web Development";
    const activeTrackId = firstActiveTrack?.id || "web-dev";

    const resObj = {
      id: "placeholder-utility",
      student_id: user?.id || "",
      internship_id: activeTrackId,
      internship_title: activeTrackTitle,
      score: 0,
      total_questions: 5,
      percentage: 0,
      passed: false,
      completed_at: new Date().toISOString(),
      reference_number: `SI-UTIL-${activeTrackId.replace("int-", "").substring(0, 4).toUpperCase()}`
    } as TestResult;

    const tpl = templates.find((t) => t.code === code);
    if (!tpl) {
      alert(`Document template for ${title} not found in database.`);
      return;
    }

    setActiveTemplateCode(code);
    setActiveInternshipId(resObj.internship_id);
    const rendered = renderDocument(tpl.html_content, profile, resObj.internship_title || "Internship Program", resObj, code, payments);
    setPreviewHtml(rendered);
    setPreviewTitle(tpl.name);
    setShowPreviewModal(true);
  };

  const handlePrintReceipt = (pay: Payment, internshipTitle: string) => {
    const formattedDate = pay.created_at ? new Date(pay.created_at).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    const receiptNo = pay.razorpay_order_id ? `REC-${pay.razorpay_order_id.replace("order_", "")}` : `REC-MOCK-${Math.floor(Math.random() * 1000000)}`;

    const htmlTpl = `<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>Payment Receipt</title><style>body{font-family:'Helvetica Neue',Arial,sans-serif;padding:40px;color:#333;line-height:1.6;background-color:#f9f9f9;margin:0}.invoice-box{max-width:800px;margin:auto;padding:40px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;box-shadow:0 4px 6px rgba(0,0,0,.05)}.header-table{width:100%;border-collapse:collapse;margin-bottom:30px}.header-table td{vertical-align:top}.company-details{text-align:right;font-size:13px;color:#64748b;line-height:1.5}.company-name{font-size:20px;font-weight:bold;color:#4f46e5;margin-bottom:5px}.invoice-title{font-size:28px;font-weight:850;color:#1e293b;text-transform:uppercase;letter-spacing:-.5px}.meta-details{width:100%;border-collapse:collapse;margin-bottom:30px;font-size:13px}.meta-details td{padding:10px;border:1px solid #f1f5f9}.meta-details td.label{font-weight:bold;background:#f8fafc;color:#475569;width:150px}.items-table{width:100%;border-collapse:collapse;margin-bottom:30px}.items-table th{background:#f1f5f9;border-bottom:2px solid #cbd5e1;text-align:left;padding:12px;font-size:12px;font-weight:bold;color:#475569}.items-table td{padding:14px 12px;border-bottom:1px solid #f1f5f9;font-size:13px}.items-table tr.total-row td{font-weight:bold;background:#faf5ff;border-top:2px solid #ddd6fe;color:#4f46e5}.footer{text-align:center;margin-top:40px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:20px}.print-btn{display:block;margin:30px auto 0;padding:12px 24px;background:#4f46e5;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;font-size:13px}@media print{.print-btn{display:none}body{padding:0;background:none}.invoice-box{border:none;box-shadow:none;padding:0}}</style></head><body><div class="invoice-box"><table class="header-table"><tr><td><div class="invoice-title">Payment Receipt</div><div style="font-size:13px;color:#64748b;margin-top:5px;">Receipt ID: ${receiptNo}</div></td><td class="company-details"><div class="company-name">UG Intern</div><div>UG Intern Vocational Training Pvt. Ltd.</div><div>Email: billing@ugintern.com</div></td></tr></table><table class="meta-details"><tr><td class="label">Candidate Name</td><td>${profile?.full_name || user?.full_name || "N/A"}</td><td class="label">Date</td><td>${formattedDate}</td></tr><tr><td class="label">Email</td><td>${user?.email || "N/A"}</td><td class="label">Phone</td><td>${user?.phone_number || "N/A"}</td></tr><tr><td class="label">Razorpay Order</td><td>${pay.razorpay_order_id || "N/A"}</td><td class="label">Razorpay Payment</td><td>${pay.razorpay_payment_id || "N/A"}</td></tr></table><table class="items-table"><thead><tr><th>Description</th><th style="text-align:center;width:60px;">Qty</th><th style="text-align:right;width:100px;">Rate</th><th style="text-align:right;width:100px;">Amount</th></tr></thead><tbody><tr><td><strong>UG Intern Assessment Fee</strong><br/><span style="font-size:11px;color:#64748b;">Track: ${internshipTitle}</span></td><td style="text-align:center;">1</td><td style="text-align:right;">₹${(pay.amount / 100).toFixed(2)}</td><td style="text-align:right;">₹${(pay.amount / 100).toFixed(2)}</td></tr><tr class="total-row"><td colspan="3" style="text-align:right;">Total Amount Paid:</td><td style="text-align:right;">₹${(pay.amount / 100).toFixed(2)}</td></tr></tbody></table><div class="footer"><p>Computer-generated receipt verified under Razorpay Payment Gateway.</p></div><button class="print-btn" onclick="window.print()">Print Receipt</button></div></body></html>`;

    setActiveTemplateCode("receipt");
    setPreviewHtml(htmlTpl);
    setPreviewTitle("Payment Receipt");
    setShowPreviewModal(true);
  };

  const activeTrackIds = Array.from(new Set([...payments.map(p => p.internship_id), ...results.map(r => r.internship_id)]));

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5B5FF7] border-t-transparent mx-auto" />
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-zinc-800 pb-10">
      {/* Page Header */}
      <section className="text-left">
        <span className="text-[#5B5FF7] text-xs font-bold uppercase tracking-wider">Resource Center</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">Documents & Templates</h2>
        <p className="text-zinc-500 text-sm mt-2 font-light leading-relaxed max-w-2xl">
          Access and print your program utility templates, logbooks, and payment receipts.
        </p>
      </section>

      {/* Program Utility Templates */}
      {activeTrackIds.length > 0 && (
        <div className="bg-white border border-zinc-150/80 rounded-[24px] p-6 sm:p-8 shadow-xs text-left">
          <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <FolderOpen className="h-4.5 w-4.5 text-[#5B5FF7]" />
            Program Utility Templates & Logbooks
          </h3>
          <p className="text-zinc-500 text-xs mb-5 font-light leading-relaxed">
            The following reference logs and forms are required to be printed, signed, and submitted to your college coordinator during your internship program:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { code: "consent_form", title: "Consent Form", icon: FileText, color: "text-indigo-600" },
              { code: "daily_log_book", title: "Daily Log Book", icon: BookOpen, color: "text-violet-600" },
              { code: "feedback_form", title: "Feedback Form", icon: MessageSquare, color: "text-rose-500" },
              { code: "attendance_sheet", title: "Attendance Sheet", icon: Calendar, color: "text-sky-500" }
            ].filter((item) => templates.find((t) => t.code === item.code)?.is_visible !== false)
             .map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => handleGetDashboardDocument(item.title)}
                className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 bg-white hover:scale-[1.01] hover:bg-[#5B5FF7]/5 hover:border-[#5B5FF7]/20 hover:shadow-xs active:scale-95 transition-all text-left cursor-pointer group h-full w-full min-h-[72px]"
              >
                <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-150 shrink-0 flex items-center justify-center">
                  <item.icon className={`h-4.5 w-4.5 ${item.color} shrink-0`} />
                </div>
                <div className="min-w-0 flex-grow">
                  <span className="text-xs font-bold text-zinc-900 block truncate">{item.title}</span>
                  <span className="text-[9px] text-zinc-400 font-semibold block mt-0.5">Click to Print</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Payment History & Invoices */}
      {payments.length > 0 && (
        <div className="bg-white border border-zinc-150/80 rounded-[24px] p-6 sm:p-8 shadow-xs text-left">
          <div className="mb-6">
            <span className="text-[#5B5FF7] text-xs font-bold uppercase tracking-wider">Transactions</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mt-1">Payment History & Invoices</h2>
            <p className="text-zinc-500 text-xs sm:text-sm mt-1.5 font-light leading-relaxed">
              Track your paid assessment transactions and print receipts with company invoice details.
            </p>
          </div>

          <div className="overflow-x-auto border border-zinc-200 rounded-2xl bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-slate-50 text-zinc-700 font-bold uppercase tracking-wider">
                  <th className="p-4">Internship Track</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Razorpay Payment ID</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150">
                {payments.map((pay) => {
                  const dateStr = pay.created_at ? new Date(pay.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A";
                  const trackObj = internships.find((i) => i.id === pay.internship_id);
                  const trackTitle = trackObj ? trackObj.title : (pay.internship_id === "general" ? "One-Time Admission & Platform Fee" : pay.internship_id);

                  return (
                    <tr key={pay.id} className="hover:bg-slate-50 transition-colors text-zinc-700">
                      <td className="p-4 font-bold text-zinc-900">{trackTitle}</td>
                      <td className="p-4 font-semibold text-zinc-650">{dateStr}</td>
                      <td className="p-4 font-bold text-[#5B5FF7]">₹{(pay.amount / 100).toFixed(2)}</td>
                      <td className="p-4 font-mono font-bold text-zinc-700">{pay.razorpay_payment_id || "N/A"}</td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handlePrintReceipt(pay, trackTitle)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-250 bg-white hover:bg-[#5B5FF7]/5 hover:text-[#5B5FF7] hover:border-[#5B5FF7]/20 active:scale-95 px-3.5 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer text-zinc-700"
                        >
                          <CreditCard className="h-3.5 w-3.5 text-[#5B5FF7]" />
                          Print Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeTrackIds.length === 0 && payments.length === 0 && (
        <div className="text-center py-20 border border-zinc-200 rounded-[20px] bg-white shadow-xs">
          <FolderOpen className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
          <p className="text-sm text-zinc-800 font-bold">No documents available yet</p>
          <p className="text-xs text-zinc-500 font-medium mt-1">Enroll in an internship track to access your program documents and templates.</p>
        </div>
      )}

      {/* Document Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-5xl h-[85vh] bg-white rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-zinc-200">
            <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-zinc-250 bg-zinc-55">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#5B5FF7] animate-pulse" />
                <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">{previewTitle} Preview</h3>
              </div>
              <div className="flex gap-2">
                {activeTemplateCode !== "receipt" && (
                  <a
                    href={`/api/documents/download?templateType=${activeTemplateCode}&studentId=${user?.id}&internshipId=${activeInternshipId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 text-xs font-bold px-4 py-2 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm shadow-indigo-600/10"
                  >
                    Download PDF
                  </a>
                )}
                <button
                  onClick={() => { setShowPreviewModal(false); setPreviewHtml(""); }}
                  className="rounded-xl border border-zinc-250 bg-white hover:bg-zinc-100 active:scale-95 text-xs font-bold text-zinc-650 hover:text-zinc-900 px-4 py-2 transition-all cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
            <div className="flex-grow bg-zinc-100 p-4 flex items-center justify-center overflow-hidden">
              <iframe
                title="Document Preview"
                srcDoc={previewHtml}
                className="w-full h-full border border-zinc-200 bg-white rounded-2xl shadow-inner"
                sandbox="allow-modals allow-scripts allow-same-origin allow-downloads"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
