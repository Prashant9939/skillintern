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
  Award,
  Mail,
  CreditCard,
  Lock,
  ShieldCheck,
  FileSpreadsheet,
  BarChart2,
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

export default function CertificatesPage() {
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
        console.error("Error loading certificates data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleViewDocument = (tplCode: string, result: TestResult) => {
    const tpl = templates.find((t) => t.code === tplCode);
    if (!tpl) {
      alert("Document template not found.");
      return;
    }
    setActiveTemplateCode(tplCode);
    setActiveInternshipId(result.internship_id);
    const rendered = renderDocument(tpl.html_content, profile, result.internship_title || "Internship Program", result, tplCode, payments);
    setPreviewHtml(rendered);
    setPreviewTitle(tpl.name);
    setShowPreviewModal(true);
  };

  const activeTrackIds = Array.from(
    new Set([
      ...payments.map((p) => p.internship_id),
      ...results.map((r) => r.internship_id)
    ])
  );

  const activeTrackDetails = activeTrackIds.map((trackId) => {
    const trackObj = internships.find((i) => i.id === trackId);
    const trackTitle = trackObj ? trackObj.title : trackId;
    const trackResults = results.filter((r) => r.internship_id === trackId);
    const passedResult = trackResults.find((r) => r.passed);
    const bestResult = passedResult || (trackResults.length > 0 ? [...trackResults].sort((a, b) => b.percentage - a.percentage)[0] : null);
    const payment = payments.find((p) => p.internship_id === trackId);

    return {
      trackId,
      trackTitle,
      category: trackObj?.category || "N/A",
      duration: trackObj?.duration || "120 Hrs",
      description: trackObj?.description || "",
      bestResult,
      payment,
      passed: !!bestResult?.passed,
      percentage: bestResult?.percentage || 0
    };
  });

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

  const passedTests = results.filter((r) => r.passed).length;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5B5FF7] border-t-transparent mx-auto" />
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-zinc-800 pb-10">
      {/* Page Header */}
      <section className="text-left">
        <span className="text-[#5B5FF7] text-xs font-bold uppercase tracking-wider">Academic Credentials</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">My Certificates & Documents</h2>
        <p className="text-zinc-500 text-sm mt-2 font-light leading-relaxed max-w-2xl">
          View and print your program credentials. Offer Letters are available immediately upon payment, while Certificates, Project Reports, Marksheets, and Appreciation Certificates unlock upon successfully passing the assessment.
        </p>
      </section>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-150/80 rounded-[20px] p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-zinc-900">{passedTests}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Certificates Earned</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-zinc-150/80 rounded-[20px] p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#5B5FF7]/10 flex items-center justify-center text-[#5B5FF7]">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-zinc-900">{activeTrackIds.length}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Offer Letters</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-zinc-150/80 rounded-[20px] p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-zinc-900">{activeTrackDetails.length}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Active Tracks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      {activeTrackIds.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {activeTrackDetails.map((track) => {
            const certVisible = templates.find((t) => t.code === "certificate")?.is_visible !== false;
            const offerVisible = templates.find((t) => t.code === "offer_letter")?.is_visible !== false;
            const reportVisible = templates.find((t) => t.code === "project_report" || t.code === "internship_report")?.is_visible !== false;
            const marksheetVisible = templates.find((t) => t.code === "marksheet")?.is_visible !== false;
            const appreciationVisible = templates.find((t) => t.code === "appreciation_certificate")?.is_visible !== false;

            return (
              <div
                key={track.trackId}
                className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col gap-4 border-l-4 border-l-[#5B5FF7] hover:shadow-md hover:border-zinc-300 hover:border-l-[#4a4ee6] transition-all duration-300 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-150 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">{track.trackTitle}</h3>
                    <p className="text-[11px] text-zinc-450 font-bold mt-0.5">
                      Track ID: <span className="font-mono text-zinc-800 font-bold">{track.trackId}</span>
                    </p>
                  </div>
                  <div>
                    {track.passed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 font-mono">
                        Passed ({track.percentage}%)
                      </span>
                    ) : track.bestResult ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 font-mono">
                        Attempted - Not Passed ({track.percentage}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-[#5B5FF7] font-mono">
                        Paid &amp; Registered
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 border border-zinc-150/80 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-bold text-[#5B5FF7]">
                    <span>Category: <span className="text-zinc-700">{track.category}</span></span>
                    <span>•</span>
                    <span>Duration: <span className="text-zinc-700">{track.duration}</span></span>
                  </div>
                  {track.description && (
                    <p className="text-zinc-500 font-light leading-relaxed mt-1">{track.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {/* Offer Letter */}
                  {offerVisible && (
                    <button
                      type="button"
                      onClick={() => {
                        const res = getOfferLetterResult(track.trackId, track.trackTitle, track.bestResult);
                        handleViewDocument("offer_letter", res);
                      }}
                      className="flex flex-col items-center justify-center text-center p-4 rounded-xl border border-zinc-200 bg-white hover:bg-[#5B5FF7]/5 hover:text-[#5B5FF7] hover:border-[#5B5FF7]/20 hover:shadow-xs active:scale-95 transition-all cursor-pointer group"
                    >
                      <Mail className="h-5 w-5 text-zinc-400 mb-1.5 group-hover:scale-105 transition-transform" />
                      <span className="text-[11px] font-bold text-zinc-800 font-sans">Offer Letter</span>
                      <span className="text-[9px] text-emerald-600 font-extrabold mt-1 uppercase tracking-wider">Unlocked</span>
                    </button>
                  )}

                  {/* Fee Receipt */}
                  <button
                    type="button"
                    onClick={() => {
                      const pay = track.payment;
                      if (pay) {
                        handleViewDocument("certificate", { ...track.bestResult!, internship_title: track.trackTitle } as TestResult);
                      }
                    }}
                    className="flex flex-col items-center justify-center text-center p-4 rounded-xl border border-zinc-200 bg-white hover:bg-[#5B5FF7]/5 hover:text-[#5B5FF7] hover:border-[#5B5FF7]/20 hover:shadow-xs active:scale-95 transition-all cursor-pointer group"
                  >
                    <CreditCard className="h-5 w-5 text-zinc-400 mb-1.5 group-hover:scale-105 transition-transform" />
                    <span className="text-[11px] font-bold text-zinc-800 font-sans">Fee Receipt</span>
                    <span className="text-[9px] text-emerald-600 font-extrabold mt-1 uppercase tracking-wider">Unlocked</span>
                  </button>

                  {/* Certificate */}
                  {certVisible && (
                    <div className="relative group overflow-hidden rounded-xl">
                      {!track.passed && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[0.5px] flex items-center justify-center z-10 pointer-events-none">
                          <Lock className="h-4 w-4 text-zinc-400" />
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={!track.passed}
                        onClick={() => {
                          if (track.bestResult) handleViewDocument("certificate", track.bestResult);
                        }}
                        className={`w-full flex flex-col items-center justify-center text-center p-4 rounded-xl border transition-all h-full ${
                          track.passed
                            ? "border-zinc-200 bg-white hover:bg-[#5B5FF7]/5 hover:text-[#5B5FF7] hover:border-[#5B5FF7]/20 hover:shadow-xs active:scale-95 cursor-pointer"
                            : "border-zinc-200 bg-white text-zinc-500 cursor-not-allowed opacity-70"
                        }`}
                      >
                        <Award className={`h-5 w-5 mb-1.5 transition-transform ${track.passed ? "text-[#5B5FF7]" : "text-zinc-400"}`} />
                        <span className="text-[11px] font-bold">Certificate</span>
                        <span className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${track.passed ? "text-emerald-600" : "text-zinc-500"}`}>
                          {track.passed ? "Unlocked" : "Locked"}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Project Report */}
                  {reportVisible && (
                    <div className="relative group overflow-hidden rounded-xl">
                      {!track.passed && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[0.5px] flex items-center justify-center z-10 pointer-events-none">
                          <Lock className="h-4 w-4 text-zinc-400" />
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={!track.passed}
                        onClick={() => {
                          if (track.bestResult) handleViewDocument("internship_report", track.bestResult);
                        }}
                        className={`w-full flex flex-col items-center justify-center text-center p-4 rounded-xl border transition-all h-full ${
                          track.passed
                            ? "border-zinc-200 bg-white hover:bg-[#5B5FF7]/5 hover:text-[#5B5FF7] hover:border-[#5B5FF7]/20 hover:shadow-xs active:scale-95 cursor-pointer"
                            : "border-zinc-200 bg-white text-zinc-500 cursor-not-allowed opacity-70"
                        }`}
                      >
                        <FileSpreadsheet className={`h-5 w-5 mb-1.5 transition-transform ${track.passed ? "text-emerald-500" : "text-zinc-400"}`} />
                        <span className="text-[11px] font-bold">Project Report</span>
                        <span className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${track.passed ? "text-emerald-600" : "text-zinc-500"}`}>
                          {track.passed ? "Unlocked" : "Locked"}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Marksheet */}
                  {marksheetVisible && (
                    <div className="relative group overflow-hidden rounded-xl">
                      {!track.passed && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[0.5px] flex items-center justify-center z-10 pointer-events-none">
                          <Lock className="h-4 w-4 text-zinc-400" />
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={!track.passed}
                        onClick={() => {
                          if (track.bestResult) handleViewDocument("marksheet", track.bestResult);
                        }}
                        className={`w-full flex flex-col items-center justify-center text-center p-4 rounded-xl border transition-all h-full ${
                          track.passed
                            ? "border-zinc-200 bg-white hover:bg-[#5B5FF7]/5 hover:text-[#5B5FF7] hover:border-[#5B5FF7]/20 hover:shadow-xs active:scale-95 cursor-pointer"
                            : "border-zinc-200 bg-white text-zinc-500 cursor-not-allowed opacity-70"
                        }`}
                      >
                        <BarChart2 className={`h-5 w-5 mb-1.5 transition-transform ${track.passed ? "text-violet-500" : "text-zinc-400"}`} />
                        <span className="text-[11px] font-bold">Marksheet</span>
                        <span className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${track.passed ? "text-emerald-600" : "text-zinc-500"}`}>
                          {track.passed ? "Unlocked" : "Locked"}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Appreciation */}
                  {appreciationVisible && (
                    <div className="relative group overflow-hidden rounded-xl">
                      {!track.passed && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[0.5px] flex items-center justify-center z-10 pointer-events-none">
                          <Lock className="h-4 w-4 text-zinc-400" />
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={!track.passed}
                        onClick={() => {
                          if (track.bestResult) handleViewDocument("appreciation_certificate", track.bestResult);
                        }}
                        className={`w-full flex flex-col items-center justify-center text-center p-4 rounded-xl border transition-all h-full ${
                          track.passed
                            ? "border-zinc-200 bg-white hover:bg-[#5B5FF7]/5 hover:text-[#5B5FF7] hover:border-[#5B5FF7]/20 hover:shadow-xs active:scale-95 cursor-pointer"
                            : "border-zinc-200 bg-white text-zinc-500 cursor-not-allowed opacity-70"
                        }`}
                      >
                        <Award className={`h-5 w-5 mb-1.5 transition-transform ${track.passed ? "text-rose-500" : "text-zinc-400"}`} />
                        <span className="text-[11px] font-bold">Appreciation</span>
                        <span className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${track.passed ? "text-emerald-600" : "text-zinc-500"}`}>
                          {track.passed ? "Unlocked" : "Locked"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 border border-zinc-200 rounded-[20px] bg-white shadow-xs">
          <Award className="h-12 w-12 mx-auto text-zinc-300 mb-4" />
          <p className="text-sm text-zinc-800 font-bold">No certificates yet</p>
          <p className="text-xs text-zinc-500 font-medium mt-1">Enroll in an internship track and pass the assessment to earn your certificates.</p>
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
                <a
                  href={`/api/documents/download?templateType=${activeTemplateCode}&studentId=${user?.id}&internshipId=${activeInternshipId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 text-xs font-bold px-4 py-2 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm shadow-indigo-600/10"
                >
                  Download PDF
                </a>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewHtml("");
                  }}
                  className="rounded-xl border border-zinc-250 bg-white hover:bg-zinc-100 active:scale-95 text-xs font-bold text-zinc-655 hover:text-zinc-900 px-4 py-2 transition-all cursor-pointer"
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
