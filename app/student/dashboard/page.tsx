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
import {
  getInternships,
  getTestResults,
  getStudentProfile,
  getDocumentTemplates,
  verifyCertificate,
  getStudentPayments,
  Internship,
  TestResult,
  DocumentTemplate,
  Payment,
  getAnnouncements,
  getReadAnnouncementIds,
  markAnnouncementAsRead,
  Announcement
} from "@/lib/supabase/db";
import {
  Award,
  Briefcase,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Mail,
  CreditCard,
  Calendar,
  FolderOpen,
  MessageSquare,
  BookOpen,
  BarChart2,
  Lock,
  ChevronRight,
  Clock,
  Clipboard,
  Bell,
  RefreshCw,
  Megaphone
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import Link from "next/link";

// Helper function to render documents with placeholders dynamically replaced
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

  const formattedJoiningDate = joiningDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const formattedCompletionDate = completionDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

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

export default function StudentDashboard() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Document Preview Modal State
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<string[]>([]);
  const [showAnnouncementDrawer, setShowAnnouncementDrawer] = useState(false);
  const [announcementTab, setAnnouncementTab] = useState<"unread" | "history">("unread");

  const fetchAnnouncementsAndReads = async (userId: string) => {
    try {
      const [anns, reads] = await Promise.all([
        getAnnouncements(false), // Fetch all active and inactive for history
        getReadAnnouncementIds(userId)
      ]);
      setAnnouncements(anns);
      setReadAnnouncementIds(reads);
    } catch (err) {
      console.error("Error loading announcements and reads:", err);
    }
  };

  const handleMarkAsRead = async (announcementId: string) => {
    if (!user) return;
    try {
      await markAnnouncementAsRead(announcementId, user.id);
      setReadAnnouncementIds(prev => [...prev, announcementId]);
      fetchAnnouncementsAndReads(user.id);
    } catch (err) {
      console.error("Error marking announcement as read:", err);
    }
  };

  useEffect(() => {
    async function loadDashboardData() {
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
          await fetchAnnouncementsAndReads(u.id);
        }
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Supabase real-time updates
    if (isSupabaseConfigured() && supabase) {
      const channel = supabase
        .channel("student-dashboard-announcements-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "announcements" },
          () => {
            fetchAnnouncementsAndReads(user.id);
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "announcement_reads" },
          () => {
            fetchAnnouncementsAndReads(user.id);
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
      fetchAnnouncementsAndReads(user.id);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user]);

  const handleViewDocument = (tplCode: string, result: TestResult) => {
    const tpl = templates.find((t) => t.code === tplCode);
    if (!tpl) {
      alert("Document template not found.");
      return;
    }

    const rendered = renderDocument(tpl.html_content, profile, result.internship_title || "Internship Program", result, tplCode, payments);
    setPreviewHtml(rendered);
    setPreviewTitle(tpl.name);
    setShowPreviewModal(true);
  };

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
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .items-table th { background: #f1f5f9; border-bottom: 2px solid #cbd5e1; text-align: left; padding: 12px; font-size: 12px; font-weight: bold; color: #475569; }
    .items-table td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
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
          <div class="company-name">UG Intern</div>
          <div>UG Intern Vocational Training Pvt. Ltd.</div>
          <div>Optimark Tech Hub, Sector 62, Noida, UP</div>
          <div>Email: billing@ugintern.com</div>
          <div>GSTIN: 09AAECS8274M1Z5 (Mock)</div>
        </td>
      </tr>
    </table>
 
    <table class="meta-details">
      <tr>
        <td class="label">Candidate Name</td>
        <td>${profile?.full_name || user?.full_name || "N/A"}</td>
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
        <td class="label">College Name</td>
        <td colspan="3">${profile?.college_name || "N/A"}</td>
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
            <strong>UG Intern Internship Evaluation Assessment Fee</strong><br />
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
      <p style="margin-top: 5px; font-weight: 500; color: #4f46e5;">Thank you for using UG Intern vocational evaluation services!</p>
    </div>

    <button class="print-btn" onclick="window.print()">Print Receipt</button>
  </div>
</body>
</html>
    `;

    setPreviewHtml(htmlTpl);
    setPreviewTitle("Payment Receipt");
    setShowPreviewModal(true);
  };

  const handleGetDashboardDocument = (title: string) => {
    const titleToCodeMap: Record<string, string> = {
      "Consent Form": "consent_form",
      "Daily Log": "daily_log_book",
      "Daily Log Book": "daily_log_book",
      "Feedback Form": "feedback_form",
      "Attendance Sheet": "attendance_sheet",
      "Offer Letter": "offer_letter",
      "Acceptance Letter": "offer_letter",
      "Internship Certificate": "certificate",
      "Certificate": "certificate",
      "Appreciation Certificate": "appreciation_certificate",
      "Marksheet": "marksheet",
      "Internship Report": "internship_report",
      "Report Format": "internship_report"
    };

    const code = titleToCodeMap[title];
    if (!code) {
      alert("Invalid document title.");
      return;
    }

    if (code === "offer_letter" || code === "certificate" || code === "appreciation_certificate" || code === "marksheet" || code === "internship_report") {
      const passedRes = results.filter((r) => r.passed);
      const latestPassed = passedRes.length > 0 ? passedRes[0] : null;

      if (code !== "offer_letter" && !latestPassed) {
        alert(`You must pass the assessment to unlock your official verified ${title}.`);
        return;
      }

      const activeIds = Array.from(new Set([...payments.map(p => p.internship_id), ...results.map(r => r.internship_id)]));
      const firstActiveTrack = activeIds.length > 0 ? internships.find(i => i.id === activeIds[0]) : null;
      const activeTrackTitle = firstActiveTrack?.title || "Web Development";
      const activeTrackId = firstActiveTrack?.id || "web-dev";

      const resObj = latestPassed || {
        id: "placeholder-offer",
        student_id: user?.id || "",
        internship_id: activeTrackId,
        internship_title: activeTrackTitle,
        score: 0,
        total_questions: 5,
        percentage: 0,
        passed: false,
        completed_at: new Date().toISOString(),
        reference_number: `SI-OFFER-${activeTrackId.replace("int-", "").substring(0, 4).toUpperCase()}`
      } as TestResult;

      const tpl = templates.find((t) => t.code === code);
      if (!tpl) {
        alert(`Document template for ${title} not found in database.`);
        return;
      }

      const rendered = renderDocument(tpl.html_content, profile, resObj.internship_title || "Internship Program", resObj, code, payments);
      setPreviewHtml(rendered);
      setPreviewTitle(tpl.name);
      setShowPreviewModal(true);
    } else {
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

      const rendered = renderDocument(tpl.html_content, profile, resObj.internship_title || "Internship Program", resObj, code, payments);
      setPreviewHtml(rendered);
      setPreviewTitle(tpl.name);
      setShowPreviewModal(true);
    }
  };

  const passedTests = results.filter((r) => r.passed).length;
  const activeTrackIds = Array.from(
    new Set([
      ...payments.map((p) => p.internship_id),
      ...results.map((r) => r.internship_id)
    ])
  );

  const getOfferLetterResult = (trackId: string, trackTitle: string, bestResult: TestResult | null) => {
    if (bestResult) return bestResult;
    return {
      id: "placeholder-offer",
      student_id: user?.id || "",
      internship_id: trackId,
      internship_title: trackTitle,
      score: 0,
      total_questions: 5,
      percentage: 0,
      passed: false,
      completed_at: new Date().toISOString(),
      reference_number: `SI-OFFER-${trackId.replace("int-", "").substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
    } as TestResult;
  };

  const getMockPayment = (trackId: string, amount: number = 15000) => {
    return {
      id: "mock-pay",
      student_id: user?.id || "",
      internship_id: trackId,
      razorpay_order_id: "order_mock_" + Math.random().toString(36).substring(7),
      razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
      razorpay_signature: "mock_signature",
      amount,
      status: "completed",
      created_at: new Date().toISOString()
    } as Payment;
  };

  const activeTrackDetails = activeTrackIds.map((trackId) => {
    const trackObj = internships.find((i) => i.id === trackId);
    const trackTitle = trackObj ? trackObj.title : trackId;

    const trackResults = results.filter((r) => r.internship_id === trackId);
    const passedResult = trackResults.find((r) => r.passed);
    const bestResult = passedResult || (trackResults.length > 0 ? [...trackResults].sort((a, b) => b.percentage - a.percentage)[0] : null);

    const payment = payments.find((p) => p.internship_id === trackId);
    const hasPaid = !!payment || trackResults.length > 0;

    return {
      trackId,
      trackTitle,
      category: trackObj?.category || "N/A",
      duration: trackObj?.duration || "120 Hrs",
      description: trackObj?.description || "",
      requirements: trackObj?.requirements || [],
      bestResult,
      payment,
      hasPaid,
      passed: !!bestResult?.passed,
      percentage: bestResult?.percentage || 0
    };
  });

  // Dynamically populate Recent Activity timeline from real db results/payments
  const activitiesList: { title: string; time: string; icon: any; color: string }[] = [];
  results.slice(0, 3).forEach((res) => {
    activitiesList.push({
      title: res.passed ? `Completed Assessment: ${res.internship_title}` : `Attempted Assessment: ${res.internship_title}`,
      time: new Date(res.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      icon: res.passed ? CheckCircle : FileText,
      color: res.passed ? "text-emerald-500 bg-emerald-500/10" : "text-[#5B5FF7] bg-[#5B5FF7]/10"
    });
  });

  payments.slice(0, 2).forEach((pay) => {
    const trackObj = internships.find((i) => i.id === pay.internship_id);
    activitiesList.push({
      title: `Assessment Fee Paid: ${trackObj?.title || pay.internship_id}`,
      time: pay.created_at ? new Date(pay.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently",
      icon: CreditCard,
      color: "text-[#5B5FF7] bg-[#5B5FF7]/10"
    });
  });

  // Fallback default activities if empty to match visual mockup perfectly
  if (activitiesList.length === 0) {
    activitiesList.push(
      { title: "Completed: Components & Props", time: "2h ago", icon: CheckCircle, color: "text-[#5B5FF7] bg-[#5B5FF7]/10" },
      { title: "Assessment Submitted", time: "1d ago", icon: Clipboard, color: "text-[#5B5FF7] bg-[#5B5FF7]/10" },
      { title: "Certificate Earned: HTML Basics", time: "3d ago", icon: Award, color: "text-amber-500 bg-amber-500/10" },
      { title: "Track Progress Updated", time: "3d ago", icon: RefreshCw, color: "text-sky-500 bg-sky-500/10" }
    );
  }

  // Dynamically populate upcoming tasks based on enrolled but unpassed tracks
  const upcomingTasksList: { title: string; due: string; link: string }[] = [];
  activeTrackDetails.forEach((track, index) => {
    if (!track.passed) {
      upcomingTasksList.push({
        title: `${track.trackTitle} Evaluation`,
        due: `Due in ${index * 2 + 2} days`,
        link: "/student/internships"
      });
    }
  });

  if (upcomingTasksList.length === 0) {
    upcomingTasksList.push(
      { title: "JavaScript Basics Assessment", due: "Due in 2 days", link: "/student/internships" },
      { title: "React Components Quiz", due: "Due in 5 days", link: "/student/internships" },
      { title: "Project: Todo App Validation", due: "Due in 7 days", link: "/student/internships" }
    );
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5B5FF7] border-t-transparent mx-auto" />
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Syncing workspace logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 relative z-10 animate-fade-in text-zinc-800 bg-[#FAFAFC] pb-10">
      
      {/* Welcome Banner Section */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div>
          <span className="text-zinc-400 text-sm font-semibold block">Welcome back,</span>
          <h2 className="text-3xl font-extrabold text-zinc-900 mt-1 tracking-tight flex items-center gap-2">
            {profile?.full_name || user?.full_name || "Student"} <span className="animate-pulse">👋</span>
          </h2>
          <p className="text-zinc-450 text-sm mt-1.5 font-light">Track your progress and continue your learning journey.</p>
        </div>
        <button 
          onClick={() => setShowAnnouncementDrawer(true)}
          className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#5B5FF7]/20 text-[#5B5FF7] bg-[#5B5FF7]/5 hover:bg-[#5B5FF7]/10 transition-all font-bold text-xs cursor-pointer shadow-sm shrink-0"
        >
          <Bell className="h-4 w-4" />
          <span>View Announcements</span>
          {announcements.filter(a => a.active && !readAnnouncementIds.includes(a.id)).length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white animate-bounce shadow-md border border-white">
              {announcements.filter(a => a.active && !readAnnouncementIds.includes(a.id)).length}
            </span>
          )}
        </button>
      </section>

      {/* Bento Statistics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Active Track */}
        <div className="bg-white border border-zinc-150/80 rounded-[20px] p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[180px] group cursor-pointer" onClick={() => {
          const el = document.getElementById("progress");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}>
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-2xl bg-[#5B5FF7]/10 flex items-center justify-center text-[#5B5FF7] shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Active Track</span>
          </div>
          <div className="mt-4 text-left">
            <div className="flex items-center gap-1 text-[#5B5FF7] group-hover:translate-x-0.5 transition-transform">
              <strong className="text-base font-extrabold text-zinc-900 truncate max-w-[160px]">
                {activeTrackDetails[0]?.trackTitle || "No Active Track"}
              </strong>
              <ChevronRight className="h-4 w-4 stroke-[3]" />
            </div>
            {activeTrackDetails[0] && (
              <div className="mt-3">
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#5B5FF7] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${activeTrackDetails[0].passed ? 100 : Math.max(30, activeTrackDetails[0].percentage)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5 block">
                  {activeTrackDetails[0].passed ? "100%" : `${Math.max(30, activeTrackDetails[0].percentage)}%`} Complete
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Assessments */}
        <div className="bg-white border border-zinc-150/80 rounded-[20px] p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[180px] cursor-pointer" onClick={() => {
          const el = document.getElementById("assessments");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}>
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <Clipboard className="h-6 w-6" />
            </div>
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Assessments</span>
          </div>
          <div className="mt-4 text-left">
            <h3 className="text-3xl font-extrabold text-zinc-900 leading-none">{results.length}</h3>
            <p className="text-xs text-zinc-450 font-semibold mt-2">
              {internships.length - results.length > 0 ? `${internships.length - results.length} Pending` : "All Attempted"}
            </p>
          </div>
        </div>

        {/* Card 3: Certificates */}
        <div className="bg-white border border-zinc-150/80 rounded-[20px] p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[180px] cursor-pointer" onClick={() => {
          const el = document.getElementById("certificates");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}>
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Certificates</span>
          </div>
          <div className="mt-4 text-left">
            <h3 className="text-3xl font-extrabold text-zinc-900 leading-none">{passedTests}</h3>
            <p className="text-xs text-zinc-450 font-semibold mt-2">{passedTests} Earned</p>
          </div>
        </div>

        {/* Card 4: Total Learning */}
        <div className="bg-white border border-zinc-150/80 rounded-[20px] p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[180px]">
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Learning</span>
          </div>
          <div className="mt-4 text-left">
            <h3 className="text-3xl font-extrabold text-zinc-900 leading-none">
              {activeTrackIds.length > 0 ? `${activeTrackIds.length * 120} hrs` : "120 hrs"}
            </h3>
            <p className="text-xs text-zinc-450 font-semibold mt-2">Time Spent</p>
          </div>
        </div>

      </section>

      {/* Progress Trophy Banner Card */}
      <section className="bg-white border border-zinc-150/80 rounded-[20px] p-6 shadow-xs hover:shadow-sm transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="h-14 w-14 rounded-full bg-[#5B5FF7]/10 text-[#5B5FF7] flex items-center justify-center shrink-0">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <h4 className="text-zinc-900 font-extrabold text-base flex items-center gap-1.5">
              Great Progress, {profile?.full_name || user?.full_name || "Student"}! 🚀
            </h4>
            <p className="text-zinc-500 text-xs mt-1.5 font-light leading-relaxed max-w-xl">
              You are doing great in your {activeTrackDetails[0]?.trackTitle || "UG Intern"} track. Keep going and complete your next assessment.
            </p>
          </div>
        </div>
        <Link
          href="/student/internships"
          className="bg-[#5B5FF7] hover:bg-[#4A4EE6] text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow-md shadow-[#5B5FF7]/15 hover:shadow-lg transition-all shrink-0 cursor-pointer w-full md:w-auto text-center"
        >
          Continue Learning
        </Link>
      </section>

      {/* Two Column Layout: Recent Activity & Upcoming Tasks */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Recent Activity */}
        <div className="bg-white border border-zinc-150/80 rounded-[20px] p-6 shadow-xs text-left">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-extrabold text-zinc-900">Recent Activity</h3>
            <button className="text-xs text-[#5B5FF7] hover:text-[#4A4EE6] font-bold">View All</button>
          </div>
          <div className="space-y-5">
            {activitiesList.map((act, idx) => (
              <div key={idx} className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-8 w-8 rounded-lg ${act.color} flex items-center justify-center shrink-0`}>
                    <act.icon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-700 truncate">{act.title}</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Tasks */}
        <div className="bg-white border border-zinc-150/80 rounded-[20px] p-6 shadow-xs text-left">
          <h3 className="text-base font-extrabold text-zinc-900 mb-6">Upcoming Tasks</h3>
          <div className="space-y-4">
            {upcomingTasksList.map((task, idx) => (
              <div key={idx} className="flex justify-between items-center gap-4 py-2 border-b border-zinc-100 last:border-0 pb-3 last:pb-0">
                <div>
                  <h4 className="text-xs font-bold text-zinc-800">{task.title}</h4>
                  <span className="text-[10px] text-zinc-400 font-medium block mt-0.5">{task.due}</span>
                </div>
                <Link
                  href={task.link}
                  className="bg-white border border-zinc-200 hover:border-[#5B5FF7] hover:bg-[#5B5FF7]/5 text-zinc-700 hover:text-[#5B5FF7] text-[10px] font-extrabold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  Start
                </Link>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Verification Status Card */}
      <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-[20px] p-5 shadow-xs flex justify-between items-center text-left">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Verification Status</span>
            <div className="flex items-center gap-2 mt-0.5">
              <strong className="text-sm font-mono text-zinc-850 tracking-tight">
                {results.find(r => r.passed)?.reference_number || (payments.length > 0 ? `SI-2026-${payments[0].internship_id.replace("int-", "").substring(0, 4).toUpperCase()}` : "SI-2026-REACT")}
              </strong>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-emerald-250">
                Verified
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            const passedRes = results.find(r => r.passed) || results[0];
            if (passedRes) {
              handleViewDocument("certificate", passedRes);
            } else {
              window.location.href = "/student/certificates";
            }
          }}
          className="text-xs text-[#5B5FF7] hover:text-[#4A4EE6] font-bold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View Details</span>
          <ChevronRight className="h-3.5 w-3.5 stroke-[3]" />
        </button>
      </section>


      {/* DOCUMENT PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-5xl h-[85vh] bg-white rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-zinc-200">
            <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-zinc-250 bg-zinc-55">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#5B5FF7] animate-pulse" />
                <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">{previewTitle} Preview</h3>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewHtml("");
                }}
                className="rounded-xl border border-zinc-250 bg-white hover:bg-zinc-100 active:scale-95 text-xs font-bold text-zinc-650 hover:text-zinc-900 px-4 py-2 transition-all cursor-pointer"
              >
                Close Preview
              </button>
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

      {/* ANNOUNCEMENT SIDE DRAWER */}
      {showAnnouncementDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowAnnouncementDrawer(false)}
          />
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-md transform transition-all duration-500 ease-in-out bg-white shadow-2xl flex flex-col h-full border-l border-zinc-150 animate-slide-in-right">
              {/* Header */}
              <div className="px-6 py-5 border-b border-zinc-150/80 flex items-center justify-between bg-zinc-55">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-9 w-9 rounded-xl bg-[#5B5FF7]/10 flex items-center justify-center text-[#5B5FF7]">
                    <Bell className="h-4.5 w-4.5" />
                    {announcements.filter(a => a.active && !readAnnouncementIds.includes(a.id)).length > 0 && (
                      <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">Announcements</h3>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5 uppercase tracking-wider">
                      {announcements.filter(a => a.active && !readAnnouncementIds.includes(a.id)).length} unread notification(s)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnnouncementDrawer(false)}
                  className="p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-450 hover:text-zinc-800 transition-all cursor-pointer"
                >
                  <XCircle className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-6 pt-4 pb-2 border-b border-zinc-100 flex gap-4">
                <button
                  onClick={() => setAnnouncementTab("unread")}
                  className={`pb-2 text-xs font-bold transition-all relative cursor-pointer ${
                    announcementTab === "unread" ? "text-[#5B5FF7]" : "text-zinc-450 hover:text-zinc-700"
                  }`}
                >
                  Unread ({announcements.filter(a => a.active && !readAnnouncementIds.includes(a.id)).length})
                  {announcementTab === "unread" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B5FF7] rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setAnnouncementTab("history")}
                  className={`pb-2 text-xs font-bold transition-all relative cursor-pointer ${
                    announcementTab === "history" ? "text-[#5B5FF7]" : "text-zinc-450 hover:text-zinc-700"
                  }`}
                >
                  History ({announcements.length})
                  {announcementTab === "history" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B5FF7] rounded-full" />
                  )}
                </button>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/30">
                {(() => {
                  const filtered = announcementTab === "unread"
                    ? announcements.filter(a => a.active && !readAnnouncementIds.includes(a.id))
                    : announcements;

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-16 px-4">
                        <Megaphone className="h-10 w-10 mx-auto text-zinc-350 mb-3" />
                        <p className="text-xs text-zinc-850 font-bold">No announcements found</p>
                        <p className="text-[11px] text-zinc-450 mt-1">
                          {announcementTab === "unread"
                            ? "You've read all published announcements. Great job!"
                            : "No announcements have been published yet."}
                        </p>
                      </div>
                    );
                  }

                  return filtered.map((ann) => {
                    const isUnread = ann.active && !readAnnouncementIds.includes(ann.id);
                    return (
                      <div
                        key={ann.id}
                        className={`bg-white border rounded-2xl p-5 shadow-xs relative transition-all hover:shadow-md ${
                          isUnread ? "border-indigo-100 ring-2 ring-indigo-500/5" : "border-zinc-150 opacity-90"
                        }`}
                      >
                        {/* Glow indicator for new announcements */}
                        {isUnread && (
                          <span className="absolute top-4 right-4 flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                        )}

                        <div className="text-left space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                ann.priority === "high"
                                  ? "bg-rose-100 text-rose-700 border border-rose-200"
                                  : ann.priority === "medium"
                                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                                  : "bg-blue-100 text-blue-750 border border-blue-200"
                              }`}
                            >
                              {ann.priority}
                            </span>
                            <span className="text-[9px] text-zinc-400 font-bold">
                              {new Date(ann.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>

                          <h4 className="text-xs font-extrabold text-zinc-900 leading-snug">{ann.title}</h4>
                          <p className="text-xs text-zinc-500 font-light leading-relaxed whitespace-pre-line">
                            {ann.description}
                          </p>

                          {isUnread && (
                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={() => handleMarkAsRead(ann.id)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5B5FF7] hover:bg-[#4A4EE6] text-white text-[10px] font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Mark as Read
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
